

import React from 'react';
import type { StoryType } from '../types';
import { ImageIcon } from './icons/ImageIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface StoryCardProps {
  story: StoryType;
  onGeneratePost: (story: StoryType) => void;
  onSchedule: (story: StoryType) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onGeneratePost, onSchedule }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
      aria-label={`Content card for story: ${story.title}`}
    >
      <div className="p-6 flex-grow">
        <h4 className="text-xl font-bold text-teal-700 dark:text-teal-400 mb-3">{story.title}</h4>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {story.story}
        </p>
      </div>
       <div className="bg-gray-50 dark:bg-gray-800/50 p-2 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
        <button
          onClick={() => onSchedule(story)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Schedule story ${story.title}`}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>Schedule</span>
        </button>
        <button
          onClick={() => onGeneratePost(story)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          aria-label={`Create post for story ${story.title}`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Create Post</span>
        </button>
      </div>
    </div>
  );
};
