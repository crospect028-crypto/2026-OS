import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, RefreshCcw, Save, CalendarCheck, Leaf, X } from 'lucide-react';
import { Task } from '../types';

interface DailyTrackerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onSaveProductivity: (date: string, score: number, isNature: boolean, note?: string) => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({ tasks, setTasks, onSaveProductivity }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWeight, setNewTaskWeight] = useState<string>('');
  
  // Date state for saving productivity
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [isNatureDay, setIsNatureDay] = useState(false);
  const [natureNote, setNatureNote] = useState('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Calculate total productivity score
  const totalScore = tasks.reduce((acc, task) => acc + (task.completed ? task.weight : 0), 0);
  const maxPossibleScore = tasks.reduce((acc, task) => acc + task.weight, 0);

  const addTask = () => {
    if (!newTaskTitle.trim() || !newTaskWeight) return;
    
    const weight = parseInt(newTaskWeight);
    if (isNaN(weight) || weight <= 0) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      weight: weight,
      completed: false
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskWeight('');
    setSaveStatus('idle'); // Reset save status on modification
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    setSaveStatus('idle');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setSaveStatus('idle');
  };

  const resetDay = () => {
    if(confirm("Start a new day? This will uncheck all tasks.")) {
       setTasks(tasks.map(t => ({ ...t, completed: false })));
       setIsNatureDay(false);
       setNatureNote('');
       setSaveStatus('idle');
    }
  };

  const initiateSave = () => {
    if (isNatureDay && !natureNote.trim()) {
        setIsNoteModalOpen(true);
        return;
    }
    handleSaveScore(natureNote);
  };

  const handleSaveScore = (finalNote?: string) => {
    onSaveProductivity(selectedDate, totalScore, isNatureDay, finalNote);
    setSaveStatus('saved');
    setIsNoteModalOpen(false);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  // Color interpolation for the score
  const getScoreColor = (score: number) => {
    if (isNatureDay) return 'text-teal-400';
    if (score < 30) return 'text-red-400';
    if (score < 70) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const handleNatureToggle = () => {
      if (!isNatureDay) {
          // Turning ON nature mode - require note
          setIsNoteModalOpen(true);
      } else {
          // Turning OFF nature mode
          setIsNatureDay(false);
          setNatureNote('');
      }
  };

  const confirmNatureMode = () => {
      if (!natureNote.trim()) {
          alert("You must provide an explanation for a Nature/Break day.");
          return;
      }
      setIsNatureDay(true);
      setIsNoteModalOpen(false);
      // We don't save yet, just enable the mode.
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 relative">
      
      {/* Header & Score */}
      <div className="relative group flex flex-col md:flex-row justify-between items-center bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-[0_0_40px_rgba(15,23,42,0.5)] backdrop-blur-sm overflow-hidden">
        {/* Glow Effect */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${isNatureDay ? 'from-teal-500/20' : 'from-indigo-500/10'} to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-colors duration-700`}></div>

        <div className="text-center md:text-left mb-6 md:mb-0 relative z-10">
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Daily Protocol</h2>
          <p className="text-slate-400 mt-2 font-light">Measure your output. Control your reality.</p>
        </div>
        
        <div className="flex flex-col items-center relative z-10">
            <div className={`text-6xl font-black ${getScoreColor(totalScore)} drop-shadow-2xl tracking-tighter transition-colors duration-500`}>
                {totalScore}%
            </div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                {isNatureDay ? (
                  <span className="text-teal-400 flex items-center gap-1"><Leaf size={12}/> Nature Recharge</span>
                ) : (
                  "Productivity Score"
                )}
            </div>
        </div>
      </div>

      {/* Save & Nature Control */}
      <div className="bg-slate-800/20 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-2 border border-slate-700">
              <CalendarCheck className="text-slate-400" size={20} />
              <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-slate-200 text-sm focus:outline-none"
              />
            </div>

            <button
              onClick={handleNatureToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                isNatureDay 
                ? 'bg-teal-900/30 border-teal-500/50 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <Leaf size={16} />
              {isNatureDay ? "Nature Mode Active" : "Mark as Nature/Break"}
            </button>
        </div>

        <button 
            onClick={initiateSave}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                saveStatus === 'saved' 
                ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/20'
            }`}
        >
            {saveStatus === 'saved' ? <CheckCircle size={18} /> : <Save size={18} />}
            {saveStatus === 'saved' ? 'Log Saved' : 'Log Day'}
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Activity Name</label>
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g. Heavy Deadlifts or Deep Coding"
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
          />
        </div>
        <div className="w-full md:w-32">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Value (%)</label>
          <input 
            type="number" 
            value={newTaskWeight}
            onChange={(e) => setNewTaskWeight(e.target.value)}
            placeholder="20"
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
          />
        </div>
        <button 
          onClick={addTask}
          className="w-full md:w-auto bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-600"
        >
          <Plus size={20} /> Add
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {tasks.length === 0 ? (
            <div className="text-center text-slate-600 py-12 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                    <Circle size={32} className="opacity-50"/>
                </div>
                <p>No activities defined yet.</p>
            </div>
        ) : (
            tasks.map(task => (
            <div 
                key={task.id} 
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                task.completed 
                    ? 'bg-emerald-950/20 border-emerald-900/50 opacity-75' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                }`}
            >
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleTask(task.id)}>
                <button className={`transition-colors ${task.completed ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    {task.completed ? <CheckCircle size={24} className="fill-emerald-950" /> : <Circle size={24} />}
                </button>
                <div>
                    <h3 className={`font-medium text-lg ${task.completed ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200'}`}>
                    {task.title}
                    </h3>
                </div>
                </div>
                
                <div className="flex items-center gap-4">
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                    task.completed 
                    ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                    {task.weight}%
                </span>
                <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-2 hover:bg-red-950/20 rounded-lg"
                >
                    <Trash2 size={18} />
                </button>
                </div>
            </div>
            ))
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-slate-500 text-sm">
        <span>Total Capacity: {maxPossibleScore}%</span>
        <button onClick={resetDay} className="flex items-center gap-2 hover:text-slate-300 transition-colors">
            <RefreshCcw size={14} /> Reset Day
        </button>
      </div>

      {/* Nature/Break Note Modal */}
      {isNoteModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Leaf className="text-teal-400" />
                          Protocol Break / Nature Mode
                      </h3>
                      <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-500 hover:text-white"><X /></button>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4">
                      To validate this day as a strategic break or nature reconnection, you must document the activities and value gained. This is not for laziness. It is for recovery.
                  </p>
                  
                  <textarea 
                      value={natureNote}
                      onChange={(e) => setNatureNote(e.target.value)}
                      placeholder="I hiked the north trail for 4 hours and reflected on..."
                      className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-6"
                  />
                  
                  <div className="flex justify-end gap-3">
                      <button 
                          onClick={() => setIsNoteModalOpen(false)}
                          className="px-4 py-2 text-slate-400 hover:text-white"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={isNatureDay ? () => handleSaveScore(natureNote) : confirmNatureMode}
                          className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg shadow-teal-900/20"
                      >
                          {isNatureDay ? "Save Record" : "Confirm Mode"}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};