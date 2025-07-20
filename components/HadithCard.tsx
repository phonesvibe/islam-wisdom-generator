
import React from 'react';
import type { HadithType } from '../types';
import { ImageIcon } from './icons/ImageIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface HadithCardProps {
  hadith: HadithType;
  onGeneratePost: (hadith: HadithType) => void;
  onSchedule: (hadith: HadithType) => void;
}

export const HadithCard: React.FC<HadithCardProps> = ({ hadith, onGeneratePost, onSchedule }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
      aria-label={`Content card for hadith: ${hadith.source}`}
    >
      <div className="p-6 flex-grow">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          "{hadith.text_english}"
        </p>
        <p dir="rtl" className="font-arabic text-right text-gray-600 dark:text-gray-400 mb-4">
          {hadith.text_urdu}
        </p>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{hadith.narrator}</p>
          <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">{hadith.source}</p>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800/50 p-2 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
        <button
          onClick={() => onSchedule(hadith)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Schedule hadith ${hadith.source}`}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Schedule</span>
        </button>
        <button
          onClick={() => onGeneratePost(hadith)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          aria-label={`Create post for hadith ${hadith.source}`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Create Post</span>
        </button>
      </div>
    </div>
  );
};
