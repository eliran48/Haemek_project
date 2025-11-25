import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { FunctionDeclaration, Part } from "@google/genai";
import { Bot, X, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { Task, MeetingNote, ProjectPhase, TeamMember, TaskStatus } from '../types';
import { TEAM_MEMBERS } from '../constants';

interface SmartAgentProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  notes: MeetingNote[];
  phases: ProjectPhase[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export const SmartAgent: React.FC<SmartAgentProps> = ({ tasks, setTasks, notes, phases }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'היי! אני העוזר החכם של הפרויקט. אני יכול לעבור על סיכומי הפגישות, לייצר משימות ולענות על שאלות. איך אפשר לעזור?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // --- Tools Definition ---

  const createTaskTool: FunctionDeclaration = {
    name: 'createTask',
    description: 'Create a new task in the project management system.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'The title of the task' },
        description: { type: Type.STRING, description: 'Details about the task' },
        assigneeName: { type: Type.STRING, description: 'The first name of the team member to assign (e.g., Eliran, Rafael, Yossi)' },
        dueDate: { type: Type.STRING, description: 'Due date in YYYY-MM-DD format. If not specified, use today.' }
      },
      required: ['title']
    }
  };

  const updateTaskStatusTool: FunctionDeclaration = {
    name: 'updateTaskStatus',
    description: 'Update the status of an existing task.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskId: { type: Type.STRING, description: 'The ID of the task to update' },
        status: { type: Type.STRING, description: 'The new status: "TODO", "IN_PROGRESS", or "DONE"' }
      },
      required: ['taskId', 'status']
    }
  };

  // --- API Interaction ---

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemContext = `
        You are a smart Project Manager Assistant for the "Valley Museum" project.
        
        CURRENT PROJECT STATE:
        - Team Members: ${JSON.stringify(TEAM_MEMBERS.map(m => ({ id: m.id, name: m.name, role: m.role })))}
        - Tasks: ${JSON.stringify(tasks)}
        - Meeting Notes: ${JSON.stringify(notes)}
        - Project Phases: ${JSON.stringify(phases)}

        Your capabilities:
        1. Answer questions about the project status, meeting notes, and risks.
        2. Create new tasks using the 'createTask' tool. Try to find the correct assignee ID based on the name provided.
        3. Update task status using 'updateTaskStatus' tool.
        
        When creating tasks from meeting notes, analyze the action items in the notes and create relevant tasks.
        Always reply in Hebrew unless requested otherwise.
        Keep responses concise and professional.
      `;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemContext,
          tools: [{ functionDeclarations: [createTaskTool, updateTaskStatusTool] }],
        }
      });

      const historyText = messages.slice(1).map(m => `${m.role === 'user' ? 'User' : 'Model'}: ${m.text}`).join('\n');
      const fullPrompt = historyText ? `${historyText}\n\nUser: ${userMsg}` : userMsg;

      const result = await chat.sendMessage({ message: fullPrompt });
      
      // Handle Function Calls
      const calls = result.functionCalls;
      let finalResponseText = result.text || '';

      if (calls && calls.length > 0) {
        const toolParts: Part[] = [];
        
        for (const call of calls) {
          if (call.name === 'createTask') {
            const args = call.args as any;
            // Find assignee ID
            const assignee = TEAM_MEMBERS.find(m => m.name.includes(args.assigneeName) || m.name.split(' ')[0] === args.assigneeName) || TEAM_MEMBERS[0];
            
            const newTask: Task = {
              id: Date.now().toString() + Math.random().toString().slice(2, 5),
              title: args.title,
              description: args.description || '',
              assigneeId: assignee.id,
              status: TaskStatus.TODO,
              dueDate: args.dueDate || new Date().toISOString().split('T')[0]
            };
            
            setTasks(prev => [...prev, newTask]);
            
            toolParts.push({
                functionResponse: {
                    name: call.name,
                    id: call.id,
                    response: { result: `Task "${newTask.title}" created successfully with ID ${newTask.id}` }
                }
            });
          }
          else if (call.name === 'updateTaskStatus') {
            const args = call.args as any;
            const statusMap: Record<string, TaskStatus> = {
              'TODO': TaskStatus.TODO,
              'IN_PROGRESS': TaskStatus.IN_PROGRESS,
              'DONE': TaskStatus.DONE
            };
            
            setTasks(prev => prev.map(t => {
                if (t.id === args.taskId) {
                    return { ...t, status: statusMap[args.status] || t.status };
                }
                return t;
            }));

            toolParts.push({
                functionResponse: {
                    name: call.name,
                    id: call.id,
                    response: { result: `Task ${args.taskId} status updated.` }
                }
            });
          }
        }

        // Send function execution results back to the model using sendMessage with parts
        if (toolParts.length > 0) {
          const responseWithTools = await chat.sendMessage({ message: toolParts as any });
          finalResponseText = responseWithTools.text || '';
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: finalResponseText }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'סליחה, נתקלתי בשגיאה בתקשורת עם השרת. אנא נסה שוב.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 group"
        >
          <Bot size={28} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium pr-2">
            התייעץ איתי
          </span>
          <div className="absolute -top-1 -right-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[350px] md:w-[400px] flex flex-col overflow-hidden border border-slate-200 animate-fade-in-up" style={{ height: '550px', maxHeight: '80vh' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold">Wise Agent</h3>
                <p className="text-xs text-blue-100">מחובר למערכת הפרויקט</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 chat-scroll">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-none'
                  } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  <span className="text-xs text-slate-500">חושב...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="כתוב הודעה... (למשל: צור משימה מהפגישה האחרונה)"
                className="w-full bg-slate-100 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-12"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute left-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} className={isLoading ? 'opacity-0' : 'opacity-100'} />
                {isLoading && <span className="absolute inset-0 flex items-center justify-center"><Loader2 size={12} className="animate-spin" /></span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};