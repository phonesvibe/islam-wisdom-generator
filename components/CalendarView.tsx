
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getScheduledPosts, deleteScheduledPost } from '../services/supabaseService';
import type { ScheduledPost, PostableContent } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Spinner } from './Spinner';

interface CalendarViewProps {
  onAddEvent: (content: null, date: Date) => void;
  onEditEvent: (post: ScheduledPost) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onAddEvent, onEditEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    try {
      const scheduledPosts = await getScheduledPosts(firstDay.toISOString(), lastDay.toISOString());
      setPosts(scheduledPosts);
    } catch (error) {
      console.error("Failed to fetch scheduled posts:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
        try {
            await deleteScheduledPost(postId);
            fetchPosts(); // Refetch posts after deletion
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert("Could not delete the event. Please try again.");
        }
    }
  };

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Add empty cells for days before the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ key: `empty-${i}`, date: null });
    }
    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ key: `${year}-${month}-${i}`, date: new Date(year, month, i) });
    }
    return days;
  }, [currentDate]);

  const today = new Date();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Previous month">
            <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Next month">
            <ChevronRightIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
            <Spinner />
        </div>
      ) : (
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ key, date }) => {
          if (!date) return <div key={key} className="min-h-[7rem] sm:min-h-[8rem] rounded-lg bg-gray-50 dark:bg-gray-800/50"></div>;

          const dayPosts = posts.filter(p => new Date(p.scheduled_at).toDateString() === date.toDateString());
          const isToday = date.toDateString() === today.toDateString();

          return (
            <div key={key} className={`min-h-[7rem] sm:min-h-[8rem] p-1.5 flex flex-col rounded-lg border transition-all ${isToday ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
              <div className="flex justify-between items-center">
                <time dateTime={date.toISOString()} className={`text-xs font-bold ${isToday ? 'text-teal-600 dark:text-teal-300' : 'text-gray-600 dark:text-gray-300'}`}>
                  {date.getDate()}
                </time>
                 <button onClick={() => onAddEvent(null, date)} className="p-1 rounded-full hover:bg-teal-100 dark:hover:bg-teal-800/50" aria-label={`Add event for ${date.toDateString()}`}>
                    <PlusIcon className="h-4 w-4 text-teal-500" />
                </button>
              </div>
              <div className="mt-1 space-y-1 overflow-y-auto flex-grow">
                {dayPosts.map(post => (
                  <button key={post.id} onClick={() => onEditEvent(post)} className="w-full text-left group relative text-xs p-1 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800 cursor-pointer">
                    <p className="font-medium truncate">{post.title}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Delete event ${post.title}`}>
                        <TrashIcon className="h-3 w-3" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
