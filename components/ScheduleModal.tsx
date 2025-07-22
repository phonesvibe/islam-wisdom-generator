

import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { addScheduledPost, updateScheduledPost } from '../services/supabaseService';
import type { PostableContent, QuranVerseType, HadithType, StoryType, ScheduledPostInsert, ScheduledPost, ScheduledPostUpdate, Json } from '../types';

interface ScheduleModalProps {
  onClose: (didSave?: boolean) => void;
  contentToSchedule: PostableContent | null;
  initialDate?: Date;
  postToEdit: ScheduledPost | null;
}

const isQuran = (content: any): content is QuranVerseType => content && 'verse_arabic' in content;
const isHadith = (content: any): content is HadithType => content && 'narrator' in content;
const isStory = (content: any): content is StoryType => content && 'story' in content;

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  onClose,
  contentToSchedule,
  initialDate,
  postToEdit,
}) => {
  const isEditMode = !!postToEdit;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD format for <input type="date">
  const [time, setTime] = useState(''); // HH:MM format for <input type="time">
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && postToEdit) {
      setTitle(postToEdit.title);
      const scheduledDate = new Date(postToEdit.scheduled_at);
      setDate(scheduledDate.toISOString().split('T')[0]);
      setTime(scheduledDate.toTimeString().substring(0, 5));
    } else {
      let initialTitle = '';
      if (contentToSchedule) {
        if (isQuran(contentToSchedule)) initialTitle = contentToSchedule.verse_english.substring(0, 50) + '...';
        else if (isHadith(contentToSchedule)) initialTitle = contentToSchedule.source;
        else if (isStory(contentToSchedule)) initialTitle = contentToSchedule.title;
      }
      setTitle(initialTitle);

      const targetDate = initialDate || new Date();
      setDate(targetDate.toISOString().split('T')[0]);
      setTime(targetDate.toTimeString().substring(0, 5));
    }
  }, [postToEdit, contentToSchedule, initialDate, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      setError('Please fill out all fields.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const scheduled_at = new Date(`${date}T${time}`).toISOString();

    try {
      if (isEditMode && postToEdit) {
        const updatePayload: ScheduledPostUpdate = { title, scheduled_at };
        // In edit mode, we don't update the content itself, only title and time.
        // If content editing were needed, it would be added here.
        await updateScheduledPost(postToEdit.id, updatePayload);
      } else {
        let contentType: ScheduledPostInsert['content_type'] = 'custom';
        let content: ScheduledPostInsert['content'] = null;

        if (contentToSchedule) {
          content = contentToSchedule as unknown as Json; // Correctly assign the object
          if (isQuran(contentToSchedule)) contentType = 'quran';
          else if (isHadith(contentToSchedule)) contentType = 'hadith';
          else if (isStory(contentToSchedule)) contentType = 'story';
        }

        const postData: ScheduledPostInsert = {
          title,
          scheduled_at,
          content_type: contentType,
          content,
        };
        await addScheduledPost(postData);
      }
      onClose(true);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${isEditMode ? 'update' : 'schedule'} the event. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="schedule-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Event' : 'Schedule Post'}
          </h2>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close modal">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
