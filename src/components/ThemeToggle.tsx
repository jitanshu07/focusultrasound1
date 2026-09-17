import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      id="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-all cursor-pointer select-none
        ${isDark 
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 shadow-xs' 
          : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs hover:text-blue-600'}
        ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun size={17} className="text-amber-400 transition-transform hover:rotate-45" />
        ) : (
          <Moon size={17} className="text-slate-700 transition-transform hover:-rotate-12" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-bold tracking-wide">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
