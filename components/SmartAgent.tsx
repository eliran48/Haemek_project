import React, { useState, useRef, useEffect } from 'react';
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

  // --- קריאה ישירה ל-Gemini API עם fetch ---
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("חסר מפתח API. אנא וודא שהגדרת את VITE_GEMINI_API_KEY ב-Vercel");
      }

      // בניית הקונטקסט
      const context = `
אתה עוזר חכם לניהול פרויקט "מוזיאון העמק".
נתונים נוכחיים:
- צוות: ${TEAM_MEMBERS.map(m => m.name).join(', ')}
- משימות פעילות: ${tasks.filter(t => t.status !== TaskStatus.DONE).length}
- משימות שהושלמו: ${tasks.filter(t => t.status === TaskStatus.DONE).length}
- סה"כ הערות פגישות: ${notes.length}

תענה בעברית בצורה ברורה וממוקדת.
`;

      const fullPrompt = `${context}\n\nשאלת המשתמש: ${userMsg}`;

      // רשימת endpoints לנסות (v1 במקום v1beta!)
      const modelsToTry = [
        { version: 'v1', model: 'gemini-1.5-flash' },
        { version: 'v1', model: 'gemini-1.5-pro' },
        { version: 'v1', model: 'gemini-pro' },
        { version: 'v1beta', model: 'gemini-1.5-flash' },
        { version: 'v1beta', model: 'gemini-pro' }
      ];

      let responseText = null;
      let lastError = null;

      for (const { version, model } of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: fullPrompt
                }]
              }]
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${response.status}: ${errorData.error?.message || 'Unknown error'}`);
          }

          const data = await response.json();
          
          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            responseText = data.candidates[0].content.parts[0].text;
            console.log(`✅ Success with ${version}/${model}`);
            break;
          }
          
        } catch (error: any) {
          lastError = error;
          console.log(`❌ Failed with ${version}/${model}:`, error.message);
          continue;
        }
      }

      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', content: responseText }]);
      } else {
        throw new Error(`כל המודלים נכשלו. שגיאה אחרונה: ${lastError?.message || 'לא ידוע'}`);
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `שגיאה: ${error.message}. ודא שהמפתח API תקין ושהפרויקט ב-Google AI Studio הוא "Gemini API".`, 
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

          <div className="p-3 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="כתוב הודעה... (למשל: מה המשימות הפתוחות?)"
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