
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Islamic Wisdom Generator. All rights reserved.</p>
        <p className="text-sm mt-1">Generated content is for informational purposes. Please consult a scholar for deeper understanding.</p>
      </div>
    </footer>
  );
};
