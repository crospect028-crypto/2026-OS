import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Target, CheckSquare, Square, TrendingUp, Leaf, Trophy } from 'lucide-react';
import { PlannerData, PlannerLevel, ProductivityHistory, DayRecord, Achievement } from '../types';

interface YearlyPlannerProps {
  plannerData: PlannerData;
  setPlannerData: React.Dispatch<React.SetStateAction<PlannerData>>;
  productivityHistory: ProductivityHistory;
  achievements: Achievement[];
}

export const YearlyPlanner: React.FC<YearlyPlannerProps> = ({ plannerData, setPlannerData, productivityHistory, achievements }) => {
  const [currentLevel, setCurrentLevel] = useState<PlannerLevel>('year');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getDateForPlannerDay = (month: number, week: number, dayIndex: number): string | null => {
      const year = 2026;
      const startDay = (week - 1) * 7 + 1;
      const endDay = Math.min(startDay + 6, new Date(year, month, 0).getDate());

      for (let day = startDay; day <= endDay; day++) {
          const date = new Date(year, month - 1, day);
          let jsDay = date.getDay();
          let adjustedDayIndex = jsDay === 0 ? 6 : jsDay - 1; 

          if (adjustedDayIndex === dayIndex) {
              return formatDate(date);
          }
      }
      return null;
  };

  // Helper to extract score and type from history entry
  const getHistoryData = (date: string): DayRecord | null => {
    const entry = productivityHistory[date];
    if (entry === undefined) return null;
    if (typeof entry === 'number') return { score: entry, isNature: false }; // Backwards compatibility
    return entry;
  };

  const getAverageScore = (level: PlannerLevel, month?: number, week?: number, dayIndex?: number) => {
    let total = 0;
    let count = 0;
    let natureCount = 0;
    
    // For specific day, we return the exact object
    if (level === 'day' && month !== undefined && week !== undefined && dayIndex !== undefined) {
         const dateStr = getDateForPlannerDay(month, week, dayIndex);
         if (dateStr) {
             const data = getHistoryData(dateStr);
             if (data) return data;
         }
         return null;
    }

    // For aggregate levels (Week, Month, Year)
    const dates = Object.keys(productivityHistory);
    let relevantDates: string[] = [];

    if (level === 'year') {
        relevantDates = dates.filter(d => d.startsWith('2026-'));
    } else if (level === 'month' && month !== undefined) {
        const prefix = `2026-${month.toString().padStart(2, '0')}`;
        relevantDates = dates.filter(d => d.startsWith(prefix));
    } else if (level === 'week' && month !== undefined && week !== undefined) {
        const startDay = (week - 1) * 7 + 1;
        const endDay = startDay + 6;
        const monthStr = month.toString().padStart(2, '0');
        relevantDates = dates.filter(d => {
            if (!d.startsWith(`2026-${monthStr}`)) return false;
            const day = parseInt(d.split('-')[2]);
            return day >= startDay && day <= endDay;
        });
    }

    relevantDates.forEach(date => {
        const data = getHistoryData(date);
        if (data) {
            if (data.isNature) {
                total += 100; // Treat Nature days as full productivity for average
                natureCount++;
            } else {
                total += data.score;
            }
            count++;
        }
    });

    if (count === 0) return null;
    return { score: Math.round(total / count), isNature: natureCount === count && count > 0 }; 
  };

  const hasAchievementInPeriod = (level: PlannerLevel, month?: number, week?: number, dayIndex?: number): Achievement[] => {
    if (level === 'day' && month !== undefined && week !== undefined && dayIndex !== undefined) {
        const dateStr = getDateForPlannerDay(month, week, dayIndex);
        if (dateStr) {
            return achievements.filter(a => a.date === dateStr);
        }
        return [];
    }

    if (level === 'year') {
        return achievements.filter(a => a.date.startsWith('2026-'));
    } else if (level === 'month' && month !== undefined) {
        const prefix = `2026-${month.toString().padStart(2, '0')}`;
        return achievements.filter(a => a.date.startsWith(prefix));
    } else if (level === 'week' && month !== undefined && week !== undefined) {
        const startDay = (week - 1) * 7 + 1;
        const endDay = startDay + 6;
        const monthStr = month.toString().padStart(2, '0');
        return achievements.filter(a => {
            if (!a.date.startsWith(`2026-${monthStr}`)) return false;
            const day = parseInt(a.date.split('-')[2]);
            return day >= startDay && day <= endDay;
        });
    }
    return [];
  };

  const getScoreColor = (data: { score: number, isNature: boolean } | null) => {
    if (data === null) return 'bg-slate-700/50 text-slate-500';
    if (data.isNature) return 'bg-teal-900/50 text-teal-300 border-teal-700 shadow-[0_0_10px_rgba(45,212,191,0.3)]';
    if (data.score < 30) return 'bg-red-900/50 text-red-300 border-red-700';
    if (data.score < 70) return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
    return 'bg-emerald-900/50 text-emerald-300 border-emerald-700';
  };

  const getContextId = () => {
    if (currentLevel === 'year') return '2026';
    if (currentLevel === 'month' && selectedMonth !== null) return `2026-${selectedMonth.toString().padStart(2, '0')}`;
    if (currentLevel === 'week' && selectedMonth !== null && selectedWeek !== null) return `2026-${selectedMonth.toString().padStart(2, '0')}-W${selectedWeek}`;
    if (currentLevel === 'day' && selectedMonth !== null && selectedWeek !== null && selectedDay !== null) return `2026-${selectedMonth.toString().padStart(2, '0')}-W${selectedWeek}-D${selectedDay}`;
    return '2026';
  };

  const contextId = getContextId();
  const currentGoals = plannerData[contextId] || [];
  const [newGoalText, setNewGoalText] = useState('');

  const handleDrillDown = (index: number) => {
    if (currentLevel === 'year') {
      setSelectedMonth(index + 1);
      setCurrentLevel('month');
    } else if (currentLevel === 'month') {
      setSelectedWeek(index + 1);
      setCurrentLevel('week');
    } else if (currentLevel === 'week') {
      setSelectedDay(index + 1);
      setCurrentLevel('day');
    }
  };

  const handleGoBack = () => {
    if (currentLevel === 'day') {
      setSelectedDay(null);
      setCurrentLevel('week');
    } else if (currentLevel === 'week') {
      setSelectedWeek(null);
      setCurrentLevel('month');
    } else if (currentLevel === 'month') {
      setSelectedMonth(null);
      setCurrentLevel('year');
    }
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal = { id: crypto.randomUUID(), text: newGoalText, completed: false };
    setPlannerData(prev => ({ ...prev, [contextId]: [...(prev[contextId] || []), newGoal] }));
    setNewGoalText('');
  };

  const toggleGoal = (goalId: string) => {
    setPlannerData(prev => ({
      ...prev,
      [contextId]: prev[contextId].map(g => g.id === goalId ? { ...g, completed: !g.completed } : g)
    }));
  };

  const deleteGoal = (goalId: string) => {
     setPlannerData(prev => ({ ...prev, [contextId]: prev[contextId].filter(g => g.id !== goalId) }));
  };

  const renderBreadcrumbs = () => (
    <div className="flex items-center text-sm text-slate-400 mb-6 gap-2 overflow-x-auto whitespace-nowrap">
      <button onClick={() => { setCurrentLevel('year'); setSelectedMonth(null); setSelectedWeek(null); setSelectedDay(null); }} className={`hover:text-violet-400 ${currentLevel === 'year' ? 'text-violet-400 font-bold' : ''}`}>2026</button>
      {selectedMonth && (
        <>
          <ChevronRight size={14} />
          <button onClick={() => { setCurrentLevel('month'); setSelectedWeek(null); setSelectedDay(null); }} className={`hover:text-violet-400 ${currentLevel === 'month' ? 'text-violet-400 font-bold' : ''}`}>{months[selectedMonth - 1]}</button>
        </>
      )}
      {selectedWeek && (
        <>
          <ChevronRight size={14} />
          <button onClick={() => { setCurrentLevel('week'); setSelectedDay(null); }} className={`hover:text-violet-400 ${currentLevel === 'week' ? 'text-violet-400 font-bold' : ''}`}>Week {selectedWeek}</button>
        </>
      )}
      {selectedDay && (
        <>
          <ChevronRight size={14} />
          <span className="text-violet-400 font-bold">{daysOfWeek[selectedDay - 1]}</span>
        </>
      )}
    </div>
  );

  const renderSelectionGrid = () => {
    if (currentLevel === 'day') return null;

    let items: string[] = [];
    if (currentLevel === 'year') items = months;
    if (currentLevel === 'month') items = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
    if (currentLevel === 'week') items = daysOfWeek;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {items.map((item, index) => {
            let data: DayRecord | { score: number, isNature: boolean } | null = null;
            let periodAchievements: Achievement[] = [];

            if (currentLevel === 'year') {
                data = getAverageScore('month', index + 1);
                periodAchievements = hasAchievementInPeriod('month', index + 1);
            }
            if (currentLevel === 'month') {
                data = getAverageScore('week', selectedMonth!, index + 1);
                periodAchievements = hasAchievementInPeriod('week', selectedMonth!, index + 1);
            }
            if (currentLevel === 'week') {
                data = getAverageScore('day', selectedMonth!, selectedWeek!, index);
                periodAchievements = hasAchievementInPeriod('day', selectedMonth!, selectedWeek!, index);
            }

            let isDisabled = false;
            if (currentLevel === 'week') {
                const date = getDateForPlannerDay(selectedMonth!, selectedWeek!, index);
                if (!date) isDisabled = true;
            }

            return (
                <button
                    key={index}
                    onClick={() => !isDisabled && handleDrillDown(index)}
                    disabled={isDisabled}
                    className={`
                        relative border p-4 rounded-xl transition-all text-left group flex flex-col justify-between h-28 overflow-hidden
                        ${isDisabled ? 'opacity-30 border-slate-800 cursor-not-allowed bg-slate-900' : 'bg-slate-800/50 hover:bg-violet-900/20 hover:border-violet-500/50 border-slate-700'}
                    `}
                >
                    <div className="flex justify-between items-start w-full relative z-10">
                        <span className={`font-medium ${isDisabled ? 'text-slate-600' : 'text-slate-400 group-hover:text-violet-300'}`}>
                            {item}
                        </span>
                        
                        <div className="flex flex-col items-end gap-1">
                            {data !== null && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${getScoreColor(data)}`}>
                                    {data.isNature && <Leaf size={10} />}
                                    {data.score}%
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {periodAchievements.length > 0 && (
                        <div className="absolute top-2 left-2 z-20">
                             <Trophy size={16} className="text-amber-400 fill-amber-400/20 drop-shadow-md animate-pulse" />
                        </div>
                    )}
                    
                    {!isDisabled && (
                         <div className="text-xs text-slate-600 mt-2 relative z-10">
                            {currentLevel === 'week' ? getDateForPlannerDay(selectedMonth!, selectedWeek!, index) : 'View Plan'}
                         </div>
                    )}
                </button>
            );
        })}
      </div>
    );
  };

  const getTitleInfo = () => {
    let title = "";
    let data: DayRecord | { score: number, isNature: boolean } | null = null;
    let periodAchievements: Achievement[] = [];

    if (currentLevel === 'year') {
        title = "2026 Master Plan";
        data = getAverageScore('year');
        periodAchievements = hasAchievementInPeriod('year');
    } else if (currentLevel === 'month') {
        title = `${months[selectedMonth! - 1]} Objectives`;
        data = getAverageScore('month', selectedMonth!);
        periodAchievements = hasAchievementInPeriod('month', selectedMonth!);
    } else if (currentLevel === 'week') {
        title = `Week ${selectedWeek} Targets`;
        data = getAverageScore('week', selectedMonth!, selectedWeek!);
        periodAchievements = hasAchievementInPeriod('week', selectedMonth!, selectedWeek!);
    } else if (currentLevel === 'day') {
        const date = getDateForPlannerDay(selectedMonth!, selectedWeek!, selectedDay!);
        title = date ? `${date} Schedule` : `${daysOfWeek[selectedDay! - 1]} Schedule`;
        data = getAverageScore('day', selectedMonth!, selectedWeek!, selectedDay!);
        periodAchievements = hasAchievementInPeriod('day', selectedMonth!, selectedWeek!, selectedDay!);
    }
    return { title, data, periodAchievements };
  };

  const { title, data, periodAchievements } = getTitleInfo();

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto p-4 md:p-8 animate-in slide-in-from-right-8 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            {currentLevel !== 'year' && (
            <button onClick={handleGoBack} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                <ChevronLeft size={20} />
            </button>
            )}
            <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-3">
                <Calendar className="text-violet-500" />
                {title}
            </h2>
            </div>
        </div>
        
        {/* Context Average Score Display */}
        {data !== null && (
            <div className="flex flex-col items-end animate-in fade-in zoom-in">
                <div className={`text-3xl font-black ${data.isNature ? 'text-teal-400' : data.score < 50 ? 'text-slate-500' : 'text-emerald-400'}`}>
                    {data.score}%
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    {data.isNature ? <><Leaf size={12}/> Nature Mode</> : <><TrendingUp size={12} /> Productivity</>}
                </div>
            </div>
        )}
      </div>

      {renderBreadcrumbs()}
      {renderSelectionGrid()}

      {/* Day Level Specific Displays */}
      {currentLevel === 'day' && (
          <div className="space-y-4 mb-6">
              {/* Nature Note */}
              {data && data.isNature && (data as any).note && (
                <div className="bg-teal-950/30 border border-teal-900 rounded-xl p-6 animate-in slide-in-from-top-4">
                    <h3 className="text-teal-400 font-bold flex items-center gap-2 mb-2">
                        <Leaf size={18} /> Day Reflection Log
                    </h3>
                    <p className="text-slate-300 italic">
                        "{(data as any).note}"
                    </p>
                </div>
              )}
              
              {/* Achievement Note */}
              {periodAchievements.length > 0 && periodAchievements.map(ach => (
                <div key={ach.id} className="bg-amber-950/30 border border-amber-900 rounded-xl p-6 animate-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10">
                        <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-2">
                            <Trophy size={18} className="fill-amber-400/20" /> Victory Logged: {ach.title}
                        </h3>
                        <p className="text-slate-300 font-light whitespace-pre-wrap">
                            {ach.story}
                        </p>
                    </div>
                </div>
              ))}
          </div>
      )}

      {/* Goal Section */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm flex flex-col">
        <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Target size={18} className="text-violet-400"/>
            Goals for this Period
        </h3>

        <form onSubmit={addGoal} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder={`Add a new goal for ${currentLevel === 'year' ? '2026' : 'this period'}...`}
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder-slate-600"
          />
          <button 
            type="submit"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 rounded-lg transition-colors"
          >
            Add
          </button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {currentGoals.length === 0 ? (
            <p className="text-slate-600 italic text-center mt-8">No goals set for this specific period yet.</p>
          ) : (
            currentGoals.map(goal => (
              <div key={goal.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all">
                 <button onClick={() => toggleGoal(goal.id)} className="text-slate-500 hover:text-violet-400 transition-colors">
                    {goal.completed ? <CheckSquare className="text-violet-500" /> : <Square />}
                 </button>
                 <span className={`flex-1 text-slate-200 ${goal.completed ? 'line-through text-slate-500' : ''}`}>
                    {goal.text}
                 </span>
                 <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1">
                    Delete
                 </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};