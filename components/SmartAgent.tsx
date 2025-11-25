import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

export const SmartAgent: React.FC<SmartAgentProps> = ({ tasks, setTasks, notes, phases }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'היי! אני העוזר החכם של הפרויקט. אני יכול לעזור בניהול משימות, ניתוח פגישות ומעקב סטטוס. איך לעזור?' }
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

  // --- הגדרת הכלים (Tools) לשימוש המודל ---
  const toolsFunctions: Record<string, Function> = {
    createTask: (args: any) => {
      console.log("Creating task with args:", args);
      const assignee = TEAM_MEMBERS.find(m => 
        m.name.includes(args.assigneeName) || 
        m.name.split(' ')[0] === args.assigneeName
      ) || TEAM_MEMBERS[0];
      
      const newTask: Task = {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        title: args.title,
        description: args.description || '',
        assigneeId: assignee.id,
        status: TaskStatus.TODO,
        dueDate: args.dueDate || new Date().toISOString().split('T')[0]
      };
      
      setTasks(prev => [...prev, newTask]);
      return { success: true, message: `נוצרה משימה חדשה: "${newTask.title}" עבור ${assignee.name}` };
    },
    updateTaskStatus: (args: any) => {
      console.log("Updating task with args:", args);
      const statusMap: Record<string, TaskStatus> = {
        'TODO': TaskStatus.TODO,
        'IN_PROGRESS': TaskStatus.IN_PROGRESS,
        'DONE': TaskStatus.DONE
      };
      
      let updated = false;
      setTasks(prev => prev.map(t => {
          if (t.id === args.taskId) {
              updated = true;
              return { ...t, status: statusMap[args.status] || t.status };
          }
          return t;
      }));
      return { success: updated, message: updated ? "הסטטוס עודכן בהצלחה" : "לא נמצאה משימה עם המזהה הזה" };
    }
  };

  // --- פונקציית השליחה ל-API ---
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue('');
    
    // הוספת הודעת המשתמש למסך
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // 1. קבלת המפתח בצורה בטוחה
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("חסר מפתח API. אנא וודא שהגדרת את VITE_GEMINI_API_KEY ב-Vercel או ב-.env.local");
      }

      // 2. אתחול המודל (GenAI)
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        systemInstruction: `
          You are a smart Project Manager Assistant for the "Valley Museum" project.
          Current Data:
          - Team: ${JSON.stringify(TEAM_MEMBERS.map(m => ({ id: m.id, name: m.name })))}
          - Tasks: ${JSON.stringify(tasks)}
          - Notes: ${JSON.stringify(notes)}
          - Phases: ${JSON.stringify(phases)}
          
          Capabilities:
          1. Answer questions in Hebrew.
          2. Call 'createTask' to add tasks.
          3. Call 'updateTaskStatus' to change status.
          
          Important: When a function is called, simply confirm the action in Hebrew.
        `,
        tools: [{
          functionDeclarations: [
            {
              name: "createTask",
              description: "Create a new task",
              parameters: {
                type: "OBJECT" as any,
                properties: {
                  title: { type: "STRING" as any },
                  description: { type: "STRING" as any },
                  assigneeName: { type: "STRING" as any },
                  dueDate: { type: "STRING" as any }
                },
                required: ["title"]
              }
            },
            {
              name: "updateTaskStatus",
              description: "Update task status",
              parameters: {
                type: "OBJECT" as any,
                properties: {
                  taskId: { type: "STRING" as any },
                  status: { type: "STRING" as any, enum: ["TODO", "IN_PROGRESS", "DONE"] }
                },
                required: ["taskId", "status"]
              }
            }
          ]
        }]
      });

      // 3. יצירת היסטוריית שיחה ושליחה
      const chatHistory = messages
        .filter(m => !m.isError)
        .slice(1) // דילוג על הודעת הפתיחה של המודל
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));

      const chat = model.startChat({
        history: chatHistory,
      });

      const result = await chat.sendMessage(userMsg);
      const response = await result.response;

      // 4. טיפול בקריאות לפונקציה (Function Calls)
      const functionCalls = response.functionCalls();
      let finalText = "";

      if (functionCalls && functionCalls.length > 0) {
        // אם המודל ביקש להריץ פונקציה
        const functionResponses = functionCalls.map(call => {
          const apiFunction = toolsFunctions[call.name];
          const functionResult = apiFunction ? apiFunction(call.args) : { error: "Function not found" };
          
          return {
            functionResponse: {
              name: call.name,
              response: { name: call.name, content: functionResult }
            }
          };
        });

        // שליחת התוצאה חזרה למודל
        const finalResult = await chat.sendMessage(functionResponses);
        finalText = finalResult.response.text();
      } else {
        // אם זו סתם תשובה טקסטואלית
        finalText = response.text();
      }

      setMessages(prev => [...prev, { role: 'model', content: finalText }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage = error?.message || 'שגיאה לא ידועה';
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `שגיאה: ${errorMessage}`, 
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
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 group"
        >
          <Bot size={28} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium pr-2">
            התייעץ איתי
          </span>
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
                <h3 className="font-bold">Wise Agent (Gemini)</h3>
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
                  {msg.content}
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