import React, { useState } from 'react';
import { Achievement } from '../types';
import { Trophy, Star, Plus, Calendar, Save } from 'lucide-react';

interface AchievementsLogProps {
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
}

export const AchievementsLog: React.FC<AchievementsLogProps> = ({ achievements, setAchievements }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTitle, setNewTitle] = useState('');
  const [newStory, setNewStory] = useState('');

  const addAchievement = () => {
    if (!newTitle.trim() || !newStory.trim()) return;
    
    const newItem: Achievement = {
      id: crypto.randomUUID(),
      date: newDate,
      title: newTitle,
      story: newStory
    };

    setAchievements([newItem, ...achievements]);
    setNewTitle('');
    setNewStory('');
    setIsAdding(false);
  };

  return (
    <div className="h-full p-4 md:p-8 animate-in fade-in duration-700 overflow-y-auto pb-20">
      
      {/* Hero Section */}
      <div className="mb-12 relative overflow-hidden rounded-3xl p-8 md:p-12 border border-amber-900/30 shadow-2xl bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950">
         <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 blur-[100px] rounded-full pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h2 className="text-4xl md:text-6xl font-black text-amber-100 tracking-tighter flex items-center gap-4 mb-2">
                    <Trophy className="text-amber-500" size={48} />
                    Hall of Victory
                </h2>
                <p className="text-amber-200/60 text-lg max-w-xl">
                    Document the wins. The small steps. The giant leaps. When you look back, this is the history of your conquest.
                </p>
            </div>
            
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2"
            >
                <Plus size={24} /> Log Victory
            </button>
         </div>
      </div>

      {isAdding && (
          <div className="mb-12 bg-slate-900/80 border border-amber-500/20 p-8 rounded-2xl animate-in slide-in-from-top-4">
              <h3 className="text-2xl font-bold text-amber-100 mb-6">New Achievement Entry</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                      <label className="block text-amber-500/50 text-xs font-bold uppercase tracking-wider mb-2">Date of Victory</label>
                      <input 
                          type="date" 
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50"
                      />
                  </div>
                  <div>
                      <label className="block text-amber-500/50 text-xs font-bold uppercase tracking-wider mb-2">Title</label>
                      <input 
                          type="text" 
                          placeholder="e.g. Completed First Marathon"
                          value={newTitle}
                          onChange={e => setNewTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50"
                      />
                  </div>
              </div>
              
              <div className="mb-6">
                  <label className="block text-amber-500/50 text-xs font-bold uppercase tracking-wider mb-2">The Story</label>
                  <textarea 
                      placeholder="Detail the struggle, the process, and the feeling of winning..."
                      value={newStory}
                      onChange={e => setNewStory(e.target.value)}
                      className="w-full h-32 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50"
                  />
              </div>

              <div className="flex justify-end gap-4">
                  <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-500 hover:text-slate-300">Cancel</button>
                  <button onClick={addAchievement} className="px-8 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-2">
                      <Save size={18} /> Save to Hall
                  </button>
              </div>
          </div>
      )}

      {/* Timeline / Grid */}
      <div className="grid grid-cols-1 gap-6">
          {achievements.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                  <Trophy size={64} className="mx-auto mb-4" />
                  <p className="text-xl">No victories recorded yet. Go make history.</p>
              </div>
          ) : (
              achievements.map((item) => (
                  <div key={item.id} className="group relative bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-amber-900/50 transition-all duration-300 hover:bg-slate-900/80">
                      {/* Decorative Line */}
                      <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-amber-500 to-transparent rounded-r-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 pl-4">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <span className="bg-amber-950/50 text-amber-400 border border-amber-900/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                      <Calendar size={12} /> {item.date}
                                  </span>
                                  <Star size={16} className="text-amber-500 fill-amber-500 animate-pulse" />
                              </div>
                              <h3 className="text-2xl font-bold text-slate-100 group-hover:text-amber-100 transition-colors">{item.title}</h3>
                          </div>
                      </div>
                      
                      <p className="text-slate-400 leading-relaxed pl-4 whitespace-pre-wrap font-light">
                          {item.story}
                      </p>
                  </div>
              ))
          )}
      </div>

    </div>
  );
};