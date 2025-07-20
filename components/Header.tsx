
import React from 'react';
import { MoonStarIcon } from './icons/MoonStarIcon';
import { MenuIcon } from './icons/MenuIcon';
import type { ActiveView } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';

interface HeaderProps {
    onMenuToggle: () => void;
    onNavigate: (view: ActiveView) => void;
    activeView: ActiveView;
}

const NavButton: React.FC<{
    view: ActiveView;
    currentView: ActiveView;
    onClick: (view: ActiveView) => void;
    children: React.ReactNode;
    isIcon?: boolean;
}> = ({ view, currentView, onClick, children, isIcon = false }) => {
    const isActive = view === currentView;
    return (
        <button
            onClick={() => onClick(view)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center space-x-2 ${
                isActive
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-current={isActive ? 'page' : undefined}
        >
            {children}
        </button>
    );
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, onNavigate, activeView }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
             <MoonStarIcon className="h-8 w-8 text-teal-600 dark:text-teal-400 mr-3" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Islamic <span className="text-teal-600 dark:text-teal-400">Wisdom</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <NavButton view="home" currentView={activeView} onClick={onNavigate}>Home</NavButton>
            <NavButton view="quran" currentView={activeView} onClick={onNavigate}>Quran</NavButton>
            <NavButton view="hadith" currentView={activeView} onClick={onNavigate}>Hadith</NavButton>
            <NavButton view="stories" currentView={activeView} onClick={onNavigate}>Stories</NavButton>
            <NavButton view="calendar" currentView={activeView} onClick={onNavigate}>
                <CalendarIcon className="h-5 w-5 mr-1" />
                <span>Calendar</span>
            </NavButton>
          </div>
          <div className="md:hidden">
            <button
                onClick={onMenuToggle}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Open navigation menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
