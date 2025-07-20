
import React from 'react';
import type { ActiveView } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ActiveView) => void;
  activeView: ActiveView;
}

const NavLink: React.FC<{
    view: ActiveView;
    currentView: ActiveView;
    onClick: (view: ActiveView) => void;
    children: React.ReactNode;
}> = ({ view, currentView, onClick, children }) => {
    const isActive = view === currentView;
    return (
        <button
            onClick={() => onClick(view)}
            className={`w-full text-left px-4 py-3 text-lg font-medium rounded-md transition-colors duration-200 flex items-center space-x-3 ${
                isActive
                ? 'bg-teal-600 text-white'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
             aria-current={isActive ? 'page' : undefined}
        >
            {children}
        </button>
    );
};

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, onClose, onNavigate, activeView }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
        >
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
            
            <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-teal-600 dark:text-teal-400">Menu</h2>
                    <button onClick={onClose} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close menu">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    <NavLink view="home" currentView={activeView} onClick={onNavigate}><span>Home</span></NavLink>
                    <NavLink view="quran" currentView={activeView} onClick={onNavigate}><span>Quran</span></NavLink>
                    <NavLink view="hadith" currentView={activeView} onClick={onNavigate}><span>Hadith</span></NavLink>
                    <NavLink view="stories" currentView={activeView} onClick={onNavigate}><span>Stories</span></NavLink>
                    <NavLink view="calendar" currentView={activeView} onClick={onNavigate}><CalendarIcon className="h-6 w-6"/><span>Calendar</span></NavLink>
                </nav>
            </div>
        </div>
    );
};
