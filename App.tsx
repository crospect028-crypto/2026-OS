import React, { useState, useEffect } from 'react';
import { Activity, Calendar, BookOpen, BrainCircuit, Zap, Trophy } from 'lucide-react';
import { DailyTracker } from './components/DailyTracker';
import { YearlyPlanner } from './components/YearlyPlanner';
import { BookTracker } from './components/BookTracker';
import { ConsistencyTracker } from './components/ConsistencyTracker';
import { AchievementsLog } from './components/AchievementsLog';
import { AppView, Task, Book, PlannerData, ProductivityHistory, Habit, Achievement } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  // --- STATE ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('productivity_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('productivity_books');
    return saved ? JSON.parse(saved) : [];
  });

  const [plannerData, setPlannerData] = useState<PlannerData>(() => {
    const saved = localStorage.getItem('productivity_planner');
    return saved ? JSON.parse(saved) : {};
  });

  const [productivityHistory, setProductivityHistory] = useState<ProductivityHistory>(() => {
    const saved = localStorage.getItem('productivity_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('productivity_habits');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'gym', title: 'Gym / Physical', history: {}, color: 'rose' },
      { id: 'h2', title: 'Skill Mastery', history: {}, color: 'cyan' },
      { id: 'h3', title: 'Project X', history: {}, color: 'violet' }
    ];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('productivity_achievements');
    return saved ? JSON.parse(saved) : [];
  });

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('productivity_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('productivity_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('productivity_planner', JSON.stringify(plannerData)); }, [plannerData]);
  useEffect(() => { localStorage.setItem('productivity_history', JSON.stringify(productivityHistory)); }, [productivityHistory]);
  useEffect(() => { localStorage.setItem('productivity_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('productivity_achievements', JSON.stringify(achievements)); }, [achievements]);

  // --- HANDLERS ---
  const handleSaveDailyProductivity = (date: string, score: number, isNature: boolean, note?: string) => {
    setProductivityHistory(prev => ({
      ...prev,
      [date]: { score, isNature, note }
    }));
  };

  // --- NAVIGATION COMPONENT ---
  const NavButton = ({ view, icon: Icon, label, colorClass = "text-indigo-400" }: { view: AppView, icon: any, label: string, colorClass?: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 w-full md:w-auto relative group overflow-hidden ${
        currentView === view
          ? 'bg-slate-800 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-500/50'
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
      }`}
    >
      <div className={`absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${currentView === view ? 'translate-y-0' : ''}`} />
      <Icon size={20} className={`relative z-10 ${currentView === view ? colorClass : ''}`} />
      <span className="font-medium relative z-10">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-900 p-6 flex flex-col sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-10 px-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:shadow-[0_0_25px_rgba(79,70,229,0.8)] transition-all duration-500">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Life<span className="text-indigo-500">OS</span> 2026
          </h1>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          <NavButton view={AppView.DASHBOARD} icon={Activity} label="Daily Focus" />
          <NavButton view={AppView.CONSISTENCY} icon={Zap} label="Consistency" />
          <NavButton view={AppView.PLANNER} icon={Calendar} label="2026 Planner" />
          <NavButton view={AppView.ACHIEVEMENTS} icon={Trophy} label="Hall of Victory" colorClass="text-amber-400" />
          <NavButton view={AppView.LIBRARY} icon={BookOpen} label="Library" />
        </nav>

        <div className="mt-auto hidden md:block px-2 pt-6 border-t border-slate-900">
          <p className="text-xs text-slate-600 leading-relaxed font-light">
            "It's only after we've lost everything that we're free to do anything."
            <br/><span className="italic mt-1 block opacity-50">- Fight Club</span>
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
        <header className="p-8 pb-0 md:hidden">
            <h2 className="text-2xl font-bold text-white tracking-tight">
                {currentView === AppView.DASHBOARD && "Today's Focus"}
                {currentView === AppView.CONSISTENCY && "Relentless Consistency"}
                {currentView === AppView.PLANNER && "Future Architect"}
                {currentView === AppView.LIBRARY && "Mind Expansion"}
                {currentView === AppView.ACHIEVEMENTS && "Hall of Victory"}
            </h2>
        </header>

        <div className="h-full">
            {currentView === AppView.DASHBOARD && (
                <DailyTracker 
                  tasks={tasks} 
                  setTasks={setTasks} 
                  onSaveProductivity={handleSaveDailyProductivity}
                />
            )}
            {currentView === AppView.CONSISTENCY && (
                <ConsistencyTracker habits={habits} setHabits={setHabits} />
            )}
            {currentView === AppView.PLANNER && (
                <YearlyPlanner 
                  plannerData={plannerData} 
                  setPlannerData={setPlannerData} 
                  productivityHistory={productivityHistory}
                  achievements={achievements}
                />
            )}
            {currentView === AppView.ACHIEVEMENTS && (
                <AchievementsLog achievements={achievements} setAchievements={setAchievements} />
            )}
            {currentView === AppView.LIBRARY && (
                <BookTracker books={books} setBooks={setBooks} />
            )}
        </div>
      </main>

    </div>
  );
}

export default App;