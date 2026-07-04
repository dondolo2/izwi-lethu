import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-full transition-all duration-300
        ${isDark 
          ? 'bg-neon-500/20 text-neon-400 hover:bg-neon-500/30 hover:scale-110' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-110'
        }
        focus:outline-none focus:ring-2 focus:ring-neon-500/50
      `}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={22} strokeWidth={1.5} className="text-neon-400" />
      ) : (
        <Moon size={22} strokeWidth={1.5} />
      )}
      
      {/* Glow dot for dark mode */}
      {isDark && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-500 rounded-full animate-pulse-glow" />
      )}
    </button>
  );
};

export default ThemeToggle;