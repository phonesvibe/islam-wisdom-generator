
import React from 'react';
import { Spinner } from './Spinner';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="flex rounded-lg shadow-lg overflow-hidden">
      <input
        type="text"
        placeholder="Enter a topic..."
        className="w-full px-5 py-3 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors duration-300 disabled:bg-teal-400 disabled:cursor-not-allowed"
      >
        {isLoading ? <Spinner /> : 'Generate'}
      </button>
    </div>
  );
};
