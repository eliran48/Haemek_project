
import React, { useState } from 'react';
import { MeetingNote } from '../types';
import { FileText, Plus, CheckSquare, Save, Trash, ArrowLeftCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface MeetingNotesProps {
  notes: MeetingNote[];
  onAddTask?: (title: string) => void;
}

export const MeetingNotes: React.FC<MeetingNotesProps> = ({ notes, onAddTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');

  const parseActionItems = (text: string) => {
    const lines = text.split('\n');
    const items: { text: string; isDone: boolean }[] = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        items.push({ text: trimmed.substring(1).trim(), isDone: false });
      }
    });
    return items;
  };

  const handleSave = async () => {
    if (!currentTitle || !currentContent) return;

    try {
        const newNote = {
            date: new Date().toISOString().split('T')[0],
            title: currentTitle,
            content: currentContent,
            actionItems: parseActionItems(currentContent)
        };
        await addDoc(collection(db, 'notes'), newNote);
        
        setIsEditing(false);
        setCurrentTitle('');
        setCurrentContent('');
    } catch (error) {
        console.error("Error saving note:", error);
    }
  };

  const toggleItem = async (noteId: string, itemIndex: number) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const newItems = [...note.actionItems];
    newItems[itemIndex].isDone = !newItems[itemIndex].isDone;

    try {
        await updateDoc(doc(db, 'notes', noteId), { actionItems: newItems });
    } catch (error) {
        console.error("Error updating checklist:", error);
    }
  };

  const deleteNote = async (id: string) => {
    if (window.confirm("האם למחוק סיכום זה?")) {
        try {
            await deleteDoc(doc(db, 'notes', id));
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    }
  };

  const handleConvertToTask = (text: string) => {
    if (onAddTask) {
      onAddTask(text);
      alert(`המשימה "${text}" נוצרה בהצלחה בלוח המשימות!`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">סיכומי פגישות ומשימות</h2>
           <p className="text-slate-500 text-sm mt-1">תיעוד פגישות, המרת סיכומים למשימות ומעקב</p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>סיכום חדש</span>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-8 animate-fade-in">
          <h3 className="font-bold text-lg mb-4 text-blue-800">הוספת סיכום חדש</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="נושא הפגישה..."
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="relative">
              <textarea
                placeholder="הכנס תוכן כאן... התחל שורה עם - או * כדי ליצור משימה לביצוע אוטומטית"
                value={currentContent}
                onChange={(e) => setCurrentContent(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none font-sans"
              />
              <div className="absolute bottom-3 left-3 text-xs text-slate-400 bg-white px-2 rounded border border-slate-100 shadow-sm">
                טיפ: שורות שמתחילות ב (-) יהפכו לצ'ק ליסט
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ביטול
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={18} />
                <span>שמור סיכום</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map(note => (
          <div key={note.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <FileText size={12}/>
                    {note.date}
                </div>
                <h3 className="font-bold text-lg text-slate-800">{note.title}</h3>
              </div>
              <button onClick={() => deleteNote(note.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash size={16} />
              </button>
            </div>

            <div className="mb-6 text-slate-600 text-sm whitespace-pre-line border-l-2 border-slate-100 pl-3 ml-1 flex-1">
              {note.content}
            </div>

            {note.actionItems && note.actionItems.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4 mt-auto">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckSquare size={14} />
                  משימות לביצוע
                </h4>
                <div className="space-y-3">
                  {note.actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                        <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center mt-0.5">
                            <input
                            type="checkbox"
                            checked={item.isDone}
                            onChange={() => toggleItem(note.id, idx)}
                            className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded bg-white checked:bg-blue-500 checked:border-blue-500 transition-colors"
                            />
                            <CheckSquare size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5 top-0.5" />
                        </div>
                        <span className={`text-sm transition-all ${item.isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {item.text}
                        </span>
                        </label>
                        {!item.isDone && onAddTask && (
                            <button 
                                onClick={() => handleConvertToTask(item.text)}
                                className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="צור משימה בלוח המשימות"
                            >
                                <ArrowLeftCircle size={12} />
                                ללוח
                            </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
