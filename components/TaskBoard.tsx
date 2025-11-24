import React, { useState } from 'react';
import { Task, TaskStatus, TeamMember } from '../types';
import { TEAM_MEMBERS } from '../constants';
import { Plus, Calendar, User, Trash2 } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, setTasks }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(TEAM_MEMBERS[0].id);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      assigneeId: selectedAssignee,
      status: TaskStatus.TODO,
      dueDate: new Date().toISOString().split('T')[0],
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const getMember = (id: string) => TEAM_MEMBERS.find(m => m.id === id);

  const Column = ({ status, title, colorClass }: { status: TaskStatus; title: string; colorClass: string }) => (
    <div className="flex-1 bg-slate-100 rounded-xl p-4 flex flex-col h-full min-h-[500px]">
      <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${colorClass}`}>
        <h3 className="font-bold text-slate-700">{title}</h3>
        <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-slate-500">
          {tasks.filter(t => t.status === status).length}
        </span>
      </div>
      
      <div className="space-y-3 overflow-y-auto flex-1">
        {tasks.filter(t => t.status === status).map(task => {
          const assignee = getMember(task.assigneeId);
          return (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-slate-800">{task.title}</p>
                <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
              
              {task.description && <p className="text-xs text-slate-500 mb-3">{task.description}</p>}
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                  {assignee && <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full" />}
                  <span className="text-xs text-slate-600 font-medium">{assignee?.name.split(' ')[0]}</span>
                </div>
                
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span>{task.dueDate.slice(5)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-1 justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                {status !== TaskStatus.TODO && (
                   <button onClick={() => updateTaskStatus(task.id, TaskStatus.TODO)} className="w-2 h-2 rounded-full bg-red-400 hover:scale-150 transition-transform" title="העבר ללביצוע"></button>
                )}
                {status !== TaskStatus.IN_PROGRESS && (
                   <button onClick={() => updateTaskStatus(task.id, TaskStatus.IN_PROGRESS)} className="w-2 h-2 rounded-full bg-yellow-400 hover:scale-150 transition-transform" title="העבר לבתהליך"></button>
                )}
                {status !== TaskStatus.DONE && (
                   <button onClick={() => updateTaskStatus(task.id, TaskStatus.DONE)} className="w-2 h-2 rounded-full bg-green-400 hover:scale-150 transition-transform" title="העבר לבוצע"></button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">לוח משימות</h2>
        
        <form onSubmit={handleAddTask} className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200 w-full md:w-auto">
          <input
            type="text"
            placeholder="משימה חדשה..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="bg-transparent outline-none px-2 py-1 text-sm w-full md:w-64"
          />
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-slate-50 text-sm border-none outline-none rounded px-2 py-1 text-slate-600"
          >
            {TEAM_MEMBERS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
            <Plus size={18} />
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        <Column status={TaskStatus.TODO} title="לביצוע" colorClass="border-red-400" />
        <Column status={TaskStatus.IN_PROGRESS} title="בתהליך" colorClass="border-yellow-400" />
        <Column status={TaskStatus.DONE} title="בוצע" colorClass="border-green-400" />
      </div>
    </div>
  );
};