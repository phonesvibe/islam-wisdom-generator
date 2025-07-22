
import React from 'react';
import type { QuranVerseType } from '../types';
import { ImageIcon } from './icons/ImageIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface QuranVerseCardProps {
  verse: QuranVerseType;
  onGeneratePost: (verse: QuranVerseType) => void;
  onSchedule: (verse: QuranVerseType) => void;
}

export const QuranVerseCard: React.FC<QuranVerseCardProps> = ({ verse, onGeneratePost, onSchedule }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
      aria-label={`Content card for verse: ${verse.reference}`}
    >
      <div className="p-6 flex-grow">
        <p dir="rtl" className="text-2xl md:text-3xl font-arabic text-right text-gray-900 dark:text-white leading-loose mb-4">
          {verse.verse_arabic}
        </p>
        <p className="text-gray-600 dark:text-gray-300 italic mb-4">
          "{verse.verse_english}"
        </p>
        <p dir="rtl" className="font-arabic text-right text-gray-600 dark:text-gray-400 mb-4">
          {verse.verse_urdu}
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800/50 p-2 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
        <button
          onClick={() => onSchedule(verse)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Schedule verse"
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Schedule</span>
        </button>
        <button
          onClick={() => onGeneratePost(verse)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          aria-label="Create post for verse"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Create Post</span>
        </button>
      </div>
    </div>
  );
};
