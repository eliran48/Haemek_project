
import React, { useState } from 'react';
import { INITIAL_PHASES, INITIAL_TASKS, TEAM_MEMBERS } from './constants';
import { ProjectPhase, Task, TaskStatus } from './types';
import { Dashboard } from './components/Dashboard';
import { TaskBoard } from './components/TaskBoard';
import { ProjectScope } from './components/ProjectScope';
import { MeetingNotes } from './components/MeetingNotes';
import { TeamResources } from './components/TeamResources';
import { LayoutDashboard, CheckSquare, FileText, Settings, Menu, X, Users } from 'lucide-react';

type View = 'dashboard' | 'tasks' | 'scope' | 'notes' | 'team';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [phases, setPhases] = useState<ProjectPhase[]>(INITIAL_PHASES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  
  // Helper to add task from MeetingNotes
  const handleAddTaskFromNote = (title: string) => {
    const newTask: Task = {
        id: Date.now().toString(),
        title: title,
        assigneeId: TEAM_MEMBERS[0].id, // Default to PM
        status: TaskStatus.TODO,
        dueDate: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [...prev, newTask]);
  };

  const NavItem = ({ view, label, icon: Icon }: { view: View; label: string; icon: any }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center z-20 relative">
        <h1 className="font-bold text-xl text-slate-800">מוזיאון העמק</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 right-0 w-64 bg-white border-l border-slate-200 z-10 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:shadow-none'}
      `}>
        <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    M
                </div>
                <div>
                    <h1 className="font-bold text-lg text-slate-800 leading-tight">מוזיאון העמק</h1>
                    <p className="text-xs text-slate-400">ניהול פרויקט</p>
                </div>
            </div>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          <NavItem view="dashboard" label="לוח בקרה" icon={LayoutDashboard} />
          <NavItem view="tasks" label="משימות" icon={CheckSquare} />
          <NavItem view="notes" label="סיכומי פגישות" icon={FileText} />
          <NavItem view="team" label="צוות ומשאבים" icon={Users} />
          <NavItem view="scope" label="פרטי הצעה" icon={Settings} />
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
                <img src="https://picsum.photos/seed/eliran/100" alt="Profile" className="w-9 h-9 rounded-full bg-slate-200" />
                <div>
                    <p className="text-sm font-bold text-slate-700">אלירן אור</p>
                    <p className="text-xs text-slate-500">מנהל פרויקט</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen">
        <header className="hidden md:flex justify-between items-center px-8 py-5 bg-white/50 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-slate-800">
                {currentView === 'dashboard' && 'לוח בקרה'}
                {currentView === 'tasks' && 'ניהול משימות'}
                {currentView === 'notes' && 'סיכומי פגישות ומשימות'}
                {currentView === 'scope' && 'תכולת פרויקט'}
                {currentView === 'team' && 'צוות ומשאבים'}
            </h2>
            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                תאריך עדכון: 24.11.2025
            </div>
        </header>
        
        <div className="animate-fade-in">
            {currentView === 'dashboard' && <Dashboard phases={phases} tasks={tasks} />}
            {currentView === 'tasks' && <TaskBoard tasks={tasks} setTasks={setTasks} />}
            {currentView === 'notes' && <MeetingNotes onAddTask={handleAddTaskFromNote} />}
            {currentView === 'team' && <TeamResources />}
            {currentView === 'scope' && <ProjectScope />}
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/20 z-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;
