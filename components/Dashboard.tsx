
import React from 'react';
import { ProjectPhase, Task, TaskStatus } from '../types';
import { Activity, Clock, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  phases: ProjectPhase[];
  tasks: Task[];
}

export const Dashboard: React.FC<DashboardProps> = ({ phases, tasks }) => {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const activePhase = phases.find(p => p.status === 'active') || phases[0] || { name: 'טוען...', id: 0 };

  const taskData = [
    { name: 'בוצע', value: completedTasks, color: '#4ade80' },
    { name: 'בתהליך', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#facc15' },
    { name: 'לביצוע', value: tasks.filter(t => t.status === TaskStatus.TODO).length, color: '#f87171' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">מבט על - פרויקט מוזיאון העמק</h2>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">שלב נוכחי</p>
            <h3 className="font-bold text-slate-800 text-lg">{activePhase.name}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">התקדמות משימות</p>
            <h3 className="font-bold text-slate-800 text-lg">{progress}% הושלמו</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">ימי עבודה (משוער)</p>
            <h3 className="font-bold text-slate-800 text-lg">60 ימי עסקים</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline / Phases */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-6">ציר זמן הפרויקט</h3>
          <div className="relative space-y-8 before:absolute before:inset-0 before:mr-2 before:h-full before:w-0.5 before:bg-slate-200 before:content-[''] pr-4">
            {phases.map((phase, index) => {
              const isCompleted = phase.status === 'completed';
              const isActive = phase.status === 'active';
              
              return (
                <div key={phase.id} className="relative flex items-start gap-4">
                  <div className={`absolute -right-6 mt-1.5 h-4 w-4 rounded-full border-2 ${isActive ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-100' : isCompleted ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>{phase.name}</h4>
                      <span className="text-xs font-medium text-slate-400">שלב {index + 1}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{phase.description}</p>
                    {isActive && (
                       <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                         <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${phase.percentage}%` }}></div>
                       </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks Chart */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col justify-between">
            <h3 className="font-bold text-lg text-slate-800 mb-4">סטטוס משימות</h3>
            <div className="h-48 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
             <div className="flex justify-center gap-4 text-xs mt-4">
                {taskData.map(d => (
                    <div key={d.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                        <span>{d.name}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
