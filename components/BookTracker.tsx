import React, { useState } from 'react';
import { Book as BookIcon, Plus, Film, Loader2, X, Star, Trash2 } from 'lucide-react';
import { Book } from '../types';
import { getMovieReward } from '../services/geminiService';

interface BookTrackerProps {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}

export const BookTracker: React.FC<BookTrackerProps> = ({ books, setBooks }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', totalPages: '' });
  
  // Modal State for Reward
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [loadingReward, setLoadingReward] = useState(false);
  const [rewardContent, setRewardContent] = useState('');
  const [activeBookForReward, setActiveBookForReward] = useState<Book | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAddBook = () => {
    if (!newBook.title || !newBook.totalPages) return;
    
    const pages = parseInt(newBook.totalPages);
    if(isNaN(pages) || pages <= 0) return;

    const book: Book = {
      id: crypto.randomUUID(),
      title: newBook.title,
      author: newBook.author,
      totalPages: pages,
      currentPage: 0,
      isRewardUnlocked: false
    };

    setBooks([...books, book]);
    setNewBook({ title: '', author: '', totalPages: '' });
    setIsAdding(false);
  };

  const updateProgress = (id: string, pages: number) => {
    setBooks(prevBooks => prevBooks.map(b => {
      if (b.id === id) {
        const newPage = Math.min(Math.max(0, pages), b.totalPages);
        return { ...b, currentPage: newPage };
      }
      return b;
    }));
  };

  const handleDeleteClick = (id: string) => {
      if (deleteConfirmId === id) {
          // Second click: actually delete
          setBooks(books.filter(b => b.id !== id));
          setDeleteConfirmId(null);
      } else {
          // First click: activate confirmation
          setDeleteConfirmId(id);
      }
  };

  const cancelDelete = () => {
      setDeleteConfirmId(null);
  };

  const claimReward = async (book: Book) => {
    setActiveBookForReward(book);
    setShowRewardModal(true);

    if (book.rewardRecommendation) {
        setRewardContent(book.rewardRecommendation);
        return;
    }

    setLoadingReward(true);
    const recommendation = await getMovieReward(book.title, book.author);
    setRewardContent(recommendation);
    
    // Save recommendation to book so we don't fetch again
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, isRewardUnlocked: true, rewardRecommendation: recommendation } : b));
    setLoadingReward(false);
  };

  return (
    <div className="h-full max-w-6xl mx-auto p-4 md:p-8 animate-in zoom-in-95 duration-500" onClick={(e) => {
        // Close delete confirmation if clicking elsewhere (simple implementation)
        if (deleteConfirmId && !(e.target as Element).closest('.delete-btn-group')) {
            setDeleteConfirmId(null);
        }
    }}>
      
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <BookIcon className="text-blue-500" /> Library
            </h2>
            <p className="text-slate-400 mt-1">Read books, unlock mind-bending cinema.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} /> Add Book
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Add New Book</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              placeholder="Book Title" 
              value={newBook.title}
              onChange={e => setNewBook({...newBook, title: e.target.value})}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
            <input 
              placeholder="Author" 
              value={newBook.author}
              onChange={e => setNewBook({...newBook, author: e.target.value})}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
            <input 
              type="number"
              placeholder="Total Pages" 
              value={newBook.totalPages}
              onChange={e => setNewBook({...newBook, totalPages: e.target.value})}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white px-4 py-2">Cancel</button>
            <button onClick={handleAddBook} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium">Save Book</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {books.map(book => {
          const percentage = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
          const isFinished = percentage >= 80;
          const isDeleting = deleteConfirmId === book.id;

          return (
            <div key={book.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
              {/* Background Progress Bar Effect */}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000" 
                style={{ width: `${percentage}%` }}
              ></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 line-clamp-1" title={book.title}>{book.title}</h3>
                  <p className="text-slate-500 text-sm">{book.author}</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {isFinished && (
                        <div className="bg-amber-500/10 text-amber-400 p-2 rounded-full animate-in zoom-in spin-in-3">
                            <Star size={20} className="fill-amber-400" />
                        </div>
                    )}
                    
                    <button 
                        onClick={() => handleDeleteClick(book.id)}
                        className={`delete-btn-group p-2 rounded-lg transition-all ${
                            isDeleting 
                            ? 'bg-red-600 text-white w-auto px-3 text-xs font-bold animate-pulse' 
                            : 'text-slate-600 hover:bg-slate-800 hover:text-red-400'
                        }`}
                        title={isDeleting ? "Click again to confirm" : "Delete Book"}
                    >
                        {isDeleting ? "Confirm?" : <Trash2 size={18} />}
                    </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Progress</span>
                    <span className={`font-mono ${isFinished ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>{percentage}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={book.totalPages} 
                  value={book.currentPage}
                  onChange={(e) => updateProgress(book.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-2">
                    <span>0</span>
                    <span>{book.currentPage} / {book.totalPages} pages</span>
                </div>
              </div>

              {isFinished ? (
                <button 
                  onClick={() => claimReward(book)}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/20 animate-in fade-in slide-in-from-bottom-2"
                >
                  <Film size={18} /> {book.rewardRecommendation ? 'View Reward' : 'Unlock Movie Reward'}
                </button>
              ) : (
                <div className="text-center py-3 text-slate-500 text-sm font-medium border border-slate-800 rounded-lg bg-slate-900/50">
                    Reach 80% to unlock
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reward Modal */}
      {showRewardModal && activeBookForReward && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-8 relative shadow-2xl animate-in fade-in zoom-in-95">
                <button 
                    onClick={() => setShowRewardModal(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <Film size={48} className="mx-auto text-amber-500 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-100">Cinematic Intelligence</h3>
                    <p className="text-slate-400 text-sm mt-2">Because you finished <span className="text-blue-400">{activeBookForReward.title}</span></p>
                </div>

                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 min-h-[200px] flex items-center justify-center">
                    {loadingReward ? (
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                            <Loader2 className="animate-spin" size={32} />
                            <span>Consulting the Oracle...</span>
                        </div>
                    ) : (
                        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap font-light">
                            {rewardContent}
                        </div>
                    )}
                </div>
                
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setShowRewardModal(false)}
                        className="text-slate-400 hover:text-white text-sm font-medium"
                    >
                        Close Recommendation
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};