import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, Content, Part } from "@google/genai";
import { Bot, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { Task, MeetingNote, ProjectPhase, TaskStatus } from '../types';
import { TEAM_MEMBERS } from '../constants';

interface SmartAgentProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  notes: MeetingNote[];
  phases: ProjectPhase[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isError?: boolean;
}

export const SmartAgent: React.FC<SmartAgentProps> = ({ tasks, setTasks, notes, phases }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'היי! אני העוזר החכם של הפרויקט (מופעל ע"י Gemini). אני יכול לעבור על סיכומי הפגישות, לייצר משימות ולענות על שאלות. איך אפשר לעזור?' }
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

  // --- Tools Definition (Gemini Format) ---

  const createTaskTool: FunctionDeclaration = {
    name: "createTask",
    description: "Create a new task in the project management system.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The title of the task" },
        description: { type: Type.STRING, description: "Details about the task" },
        assigneeName: { type: Type.STRING, description: "The first name of the team member to assign (e.g., Eliran, Rafael, Yossi)" },
        dueDate: { type: Type.STRING, description: "Due date in YYYY-MM-DD format. If not specified, use today." }
      },
      required: ["title"]
    }
  };

  const updateTaskStatusTool: FunctionDeclaration = {
    name: "updateTaskStatus",
    description: "Update the status of an existing task.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskId: { type: Type.STRING, description: "The ID of the task to update" },
        status: { type: Type.STRING, enum: ["TODO", "IN_PROGRESS", "DONE"], description: "The new status" }
      },
      required: ["taskId", "status"]
    }
  };

  // --- API Interaction ---

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue('');
    
    // Update UI immediately with user message
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Initialize Gemini client using process.env.API_KEY
apiKey: import.meta.env.VITE_GEMINI_API_KEY
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

      // Prepare conversation history
      const contents: Content[] = newMessages
        .filter(m => !m.isError && m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      const modelName = 'gemini-2.5-flash';
      const tools = [{ functionDeclarations: [createTaskTool, updateTaskStatusTool] }];

      let response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: systemContext,
          tools: tools,
        },
      });

      // Handle Function Calls
      const functionCalls = response.functionCalls;
      let finalContent = response.text;

      if (functionCalls && functionCalls.length > 0) {
        // We need to keep the history consistent for the model to understand the tool output
        // Add the model's tool call turn to history
        const modelTurn = response.candidates?.[0]?.content;
        const newHistory = [...contents];
        if (modelTurn) {
            newHistory.push(modelTurn);
        }

        const functionResponseParts: Part[] = [];

        for (const call of functionCalls) {
          const functionArgs = call.args as any;
          let functionResult = "";

          if (call.name === 'createTask') {
            const assignee = TEAM_MEMBERS.find(m => 
              m.name.includes(functionArgs.assigneeName) || 
              m.name.split(' ')[0] === functionArgs.assigneeName
            ) || TEAM_MEMBERS[0];
            
            const newTask: Task = {
              id: Date.now().toString() + Math.random().toString().slice(2, 5),
              title: functionArgs.title,
              description: functionArgs.description || '',
              assigneeId: assignee.id,
              status: TaskStatus.TODO,
              dueDate: functionArgs.dueDate || new Date().toISOString().split('T')[0]
            };
            
            setTasks(prev => [...prev, newTask]);
            functionResult = JSON.stringify({ success: true, message: `Task "${newTask.title}" created with ID ${newTask.id}` });
          } 
          else if (call.name === 'updateTaskStatus') {
             const statusMap: Record<string, TaskStatus> = {
              'TODO': TaskStatus.TODO,
              'IN_PROGRESS': TaskStatus.IN_PROGRESS,
              'DONE': TaskStatus.DONE
            };
            
            let updated = false;
            setTasks(prev => prev.map(t => {
                if (t.id === functionArgs.taskId) {
                    updated = true;
                    return { ...t, status: statusMap[functionArgs.status] || t.status };
                }
                return t;
            }));
            
            functionResult = JSON.stringify({ success: updated, message: updated ? "Status updated" : "Task not found" });
          }

          functionResponseParts.push({
             functionResponse: {
                name: call.name,
                response: { result: functionResult }
             }
          });
        }

        // Add function response turn
        newHistory.push({
            role: 'tool',
            parts: functionResponseParts
        });

        // Get final response from model after tools execution
        const secondResponse = await ai.models.generateContent({
          model: modelName,
          contents: newHistory,
          config: {
            systemInstruction: systemContext,
            tools: tools
          },
        });

        finalContent = secondResponse.text;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: finalContent || 'בוצע.' }]);

    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || 'שגיאה לא ידועה';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `סליחה, נתקלתי בשגיאה בתקשורת עם השרת (Gemini). \nשגיאה: ${errorMessage}`, 
        isError: true 
      }]);
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
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 group"
        >
          <Bot size={28} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium pr-2">
            התייעץ איתי
          </span>
          <div className="absolute -top-1 -right-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[350px] md:w-[400px] flex flex-col overflow-hidden border border-slate-200 animate-fade-in-up" style={{ height: '550px', maxHeight: '80vh' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold">Wise Agent (Gemini)</h3>
                <p className="text-xs text-green-100">מחובר למערכת הפרויקט</p>
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
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-none'
                  } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-green-500" />
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
                className="w-full bg-slate-100 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-12"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute left-2 p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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