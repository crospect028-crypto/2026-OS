import React, { useState } from 'react';
import { Habit } from '../types';
import { Edit2, Check, X, Shield, Zap } from 'lucide-react';

interface ConsistencyTrackerProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

export const ConsistencyTracker: React.FC<ConsistencyTrackerProps> = ({ habits, setHabits }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Generate date array for 2026
  const days2026 = Array.from({ length: 365 }, (_, i) => {
    const d = new Date(2026, 0, 1);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Tri-state toggle: Done -> Missed -> Empty -> Done
  const toggleDay = (habitId: string, date: string, explicitStatus?: 'done' | 'missed') => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const newHistory = { ...h.history };
        
        if (explicitStatus) {
            newHistory[date] = explicitStatus;
        } else {
            // Cycle: Done -> Missed -> Empty
            if (newHistory[date] === 'done') {
                newHistory[date] = 'missed';
            } else if (newHistory[date] === 'missed') {
                delete newHistory[date];
            } else {
                newHistory[date] = 'done';
            }
        }
        
        return { ...h, history: newHistory };
      }
      return h;
    }));
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditTitle(habit.title);
  };

  const saveEdit = (habitId: string) => {
    setHabits(habits.map(h => h.id === habitId ? { ...h, title: editTitle } : h));
    setEditingId(null);
  };

  // Helper for color classes
  const getColorClasses = (color: string, status: 'done' | 'missed' | undefined) => {
    if (status === 'missed') return 'bg-red-900/40 border-red-900/50 opacity-50 shadow-none';
    if (!status) return 'bg-slate-900 border-slate-800 hover:border-slate-600';
    
    // Glowy effects for Done state
    if (color === 'rose') return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] border-rose-400';
    if (color === 'cyan') return 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] border-cyan-300';
    return 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)] border-violet-400';
  };

  const getContainerGlow = (color: string) => {
    if (color === 'rose') return 'shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)] border-rose-900/30';
    if (color === 'cyan') return 'shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)] border-cyan-900/30';
    return 'shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)] border-violet-900/30';
  };

  return (
    <div className="p-4 md:p-8 space-y-12 animate-in fade-in duration-700 pb-20">
       <div className="mb-8">
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
             <Shield className="text-slate-100 fill-slate-800" size={32} />
             Consistency Protocol
          </h2>
          <p className="text-slate-400 mt-2 font-light max-w-2xl">
             365 days of relentless execution. Green is victory. Red is defeat. Empty is stagnation.
          </p>
       </div>

       {habits.map((habit) => (
         <div key={habit.id} className={`bg-slate-950 rounded-3xl p-6 md:p-8 border relative overflow-hidden transition-all duration-500 ${getContainerGlow(habit.color)}`}>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
               <div className="flex items-center gap-4">
                  <div className={`w-3 h-12 rounded-full ${
                      habit.color === 'rose' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]' : 
                      habit.color === 'cyan' ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 
                      'bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.8)]'
                  }`}></div>
                  
                  {editingId === habit.id ? (
                    <div className="flex items-center gap-2">
                        <input 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white text-2xl font-bold px-3 py-1 rounded-lg focus:outline-none focus:border-white"
                            autoFocus
                        />
                        <button onClick={() => saveEdit(habit.id)} className="p-2 bg-green-600 rounded-lg text-white"><Check size={20}/></button>
                    </div>
                  ) : (
                    <h3 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
                        {habit.title}
                        {habit.id !== 'gym' && (
                            <button onClick={() => startEdit(habit)} className="text-slate-600 hover:text-white transition-colors">
                                <Edit2 size={16} />
                            </button>
                        )}
                    </h3>
                  )}
               </div>

               {/* Today's Quick Action */}
               <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-500 uppercase px-2">Today</span>
                    <button 
                        onClick={() => toggleDay(habit.id, new Date().toISOString().split('T')[0], 'done')}
                        className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-400 text-slate-400 hover:border-emerald-500/50 border border-transparent flex items-center justify-center transition-all group"
                        title="Mark Done"
                    >
                        <Check size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                        onClick={() => toggleDay(habit.id, new Date().toISOString().split('T')[0], 'missed')} 
                        className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-400 hover:border-red-500/50 border border-transparent flex items-center justify-center transition-all group"
                        title="Mark Missed"
                    >
                        <X size={20} className="group-hover:scale-110 transition-transform"/>
                    </button>
               </div>
            </div>

            {/* 365 Grid */}
            <div className="relative z-10">
                <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                    {days2026.map((date) => {
                        const status = habit.history[date]; // 'done' | 'missed' | undefined
                        
                        return (
                            <div 
                                key={date}
                                title={`${date}: ${status || 'empty'}`}
                                onClick={() => toggleDay(habit.id, date)}
                                className={`
                                    w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] border cursor-pointer transition-all duration-300
                                    ${getColorClasses(habit.color, status)}
                                `}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
         </div>
       ))}
    </div>
  );
};