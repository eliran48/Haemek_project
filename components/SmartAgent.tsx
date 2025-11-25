import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { Task, MeetingNote, ProjectPhase, TaskStatus } from '../types';
import { TEAM_MEMBERS } from '../constants';

interface SmartAgentProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  notes: MeetingNote[];
  phases: ProjectPhase[];
  setNotes?: React.Dispatch<React.SetStateAction<MeetingNote[]>>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

export const SmartAgent: React.FC<SmartAgentProps> = ({ tasks, setTasks, notes, phases, setNotes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'היי! אני העוזר החכם של הפרויקט. אני יכול:\n\n✅ לנתח תמלילי פגישות וליצור משימות אוטומטית\n✅ לענות על שאלות על המשימות והצוות\n✅ לתת המלצות מקצועיות לניהול הפרויקט\n\nפשוט הדבק כאן תמליל פגישה או שאל אותי שאלה!' }
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

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error("חסר מפתח OpenAI API. אנא הגדר את VITE_OPENAI_API_KEY ב-Vercel");
      }

      // בניית ההקשר של הפרויקט
      const systemMessage = {
        role: 'system',
        content: `אתה מומחה בכיר לניהול פרויקטי בניית אתרים, עם ניסיון ספציפי בשיפוץ ושדרוג אתרים קיימים למוסדות תרבות ומוזיאונים. 

תפקידך הוא לסייע בניהול כל שלבי הפרויקט להקמת אתר חדש ומתקדם עבור 'מוזיאון העמק'.

הקשר הפרויקט:
- אתר קיים: https://pioneers.co.il/
- מטרת הפרויקט: בניית אתר חדיש ומתקדם שיחליף את הקיים
- מפרט טכני והצעת מחיר: https://eliran48.github.io/WiseGuys/Haemek2.html

שלושת השלבים המרכזיים:
1. איפיון (Planning & Scoping): הגדרת דרישות, מבנה אתר (Sitemap), פונקציונליות
2. עיצוב (Design): הנחיות עיצוביות, UX/UI מתאימות למוזיאון
3. פיתוח (Development): תכנון טכני, בחירת טכנולוגיות, פתרון בעיות

נתוני הפרויקט הנוכחיים:
- חברי צוות: ${TEAM_MEMBERS.map(m => `${m.name} (${m.role})`).join(', ')}
- סה"כ משימות: ${tasks.length}
- משימות פתוחות: ${tasks.filter(t => t.status === TaskStatus.TODO).length}
- משימות בביצוע: ${tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
- משימות שהושלמו: ${tasks.filter(t => t.status === TaskStatus.DONE).length}
- סה"כ הערות פגישות: ${notes.length}

סיכומי פגישות שמורים (זמינים בלשונית "סיכומי פגישות"):
${notes.length > 0 ? notes.map(note => `
  📅 ${note.title} (${note.date})
  תוכן: ${note.content}
`).join('\n') : 'אין עדיין סיכומי פגישות'}

יכולות מיוחדות - ניתוח פגישות ויצירת משימות:
כאשר המשתמש מעלה תמליל פגישה או מבקש לנתח שיחה, עליך:
1. לנתח את התוכן ולזהות משימות, החלטות והמלצות
2. להציע רשימת משימות מפורטת בפורמט JSON
3. להקצות כל משימה לאדם המתאים מהצוות (בהתבסס על תפקידו)
4. להציע תאריכי יעד הגיוניים
5. לספק סיכום מקיף של הפגישה

חשוב: כאשר יוצרים משימות, המשתמש יקבל הודעה שהמשימות נוספו למערכת, 
והסיכום נשמר בסעיף "סיכומי פגישות" באפליקציה.

פורמט JSON למשימות (השתמש בו כאשר מזהים משימות):
\`\`\`json
{
  "tasks": [
    {
      "title": "כותרת המשימה",
      "description": "תיאור מפורט",
      "assignee": "שם חבר צוות",
      "dueDate": "YYYY-MM-DD"
    }
  ],
  "summary": "סיכום הפגישה"
}
\`\`\`

כיצד לסייע:
1. ענה על שאלות בהתבסס על המפרט והנתונים הקיימים
2. תן המלצות מקצועיות לניהול הפרויקט
3. נתח פגישות וחלץ משימות אוטומטית בפורמט JSON
4. סייע בפתרון בעיות טכניות ועיצוביות
5. סכם פגישות והצע צעדים הבאים
6. התייחס לשלב הפרויקט הרלוונטי (איפיון/עיצוב/פיתוח)
7. שמור על פרספקטיבה של מוסד תרבותי ומוזיאון

תמיד תענה בעברית בצורה מקצועית, מפורטת ומעשית.`
      };

      // בניית היסטוריית השיחה
      const conversationHistory = [
        systemMessage,
        ...messages
          .filter(m => !m.isError)
          .slice(1)
          .map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          })),
        { role: 'user', content: userMsg }
      ];

      // קריאה ל-OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error('לא התקבלה תשובה מ-OpenAI');
      }

      // בדיקה אם התשובה מכילה JSON עם משימות
      const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1]);
          
          if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
            // יצירת המשימות אוטומטית
            const newTasks: Task[] = parsedData.tasks.map((task: any) => {
              const assignee = TEAM_MEMBERS.find(m => 
                m.name.includes(task.assignee) || 
                task.assignee.includes(m.name.split(' ')[0])
              ) || TEAM_MEMBERS[0];

              return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: task.title,
                description: task.description || '',
                assigneeId: assignee.id,
                status: TaskStatus.TODO,
                dueDate: task.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              };
            });

            setTasks(prev => [...prev, ...newTasks]);

            // הוספת הערת פגישה אם יש סיכום
            if (parsedData.summary && setNotes) {
              const newNote: MeetingNote = {
                id: Date.now().toString(),
                title: `ניתוח פגישה - ${new Date().toLocaleDateString('he-IL')}`,
                content: parsedData.summary,
                date: new Date().toISOString().split('T')[0],
                attendees: []
              };
              setNotes(prev => [...prev, newNote]);
            }

            // הודעה מותאמת למשתמש
            const tasksCreatedMsg = `✅ **נוצרו ${newTasks.length} משימות חדשות!**\n\nהמשימות נוספו למערכת והוקצו לחברי הצוות הרלוונטיים.\n\n${parsedData.summary && setNotes ? '📝 סיכום הפגישה נשמר ב**"סיכומי פגישות"**' : ''}`;
            
            const responseWithConfirmation = assistantMessage.replace(
              jsonMatch[0],
              tasksCreatedMsg
            );
            
            setMessages(prev => [...prev, { role: 'assistant', content: responseWithConfirmation }]);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
          }
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError);
          setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      }

    } catch (error: any) {
      console.error("OpenAI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `שגיאה: ${error.message}. ודא שהמפתח VITE_OPENAI_API_KEY מוגדר ב-Vercel.`, 
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
                <h3 className="font-bold">Wise Agent (ChatGPT)</h3>
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
                placeholder="כתוב הודעה, הדבק תמליל פגישה, או שאל שאלה..."
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