import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutList, MapPin, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BottomNav = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`
      flex justify-around items-center py-2 px-4 shadow-lg border-t transition-all duration-300
      ${isDark 
        ? 'bg-[#16213e] border-[#1e293b] shadow-[0_-4px_30px_rgba(0,0,0,0.3)]' 
        : 'bg-white border-gray-200'
      }
    `}>
      <NavLink to="/" className={({ isActive }) => `
        flex flex-col items-center text-xs transition-colors duration-200
        ${isActive 
          ? 'text-neon-500' 
          : isDark ? 'text-gray-400 hover:text-neon-400' : 'text-gray-400 hover:text-neon-500'
        }
      `}>
        <LayoutList size={24} strokeWidth={1.5} />
        <span className="mt-0.5">Feed</span>
      </NavLink>
      <NavLink to="/map" className={({ isActive }) => `
        flex flex-col items-center text-xs transition-colors duration-200
        ${isActive 
          ? 'text-neon-500' 
          : isDark ? 'text-gray-400 hover:text-neon-400' : 'text-gray-400 hover:text-neon-500'
        }
      `}>
        <MapPin size={24} strokeWidth={1.5} />
        <span className="mt-0.5">Map</span>
      </NavLink>
      <NavLink to="/analytics" className={({ isActive }) => `
        flex flex-col items-center text-xs transition-colors duration-200
        ${isActive 
          ? 'text-neon-500' 
          : isDark ? 'text-gray-400 hover:text-neon-400' : 'text-gray-400 hover:text-neon-500'
        }
      `}>
        <BarChart3 size={24} strokeWidth={1.5} />
        <span className="mt-0.5">Insights</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;