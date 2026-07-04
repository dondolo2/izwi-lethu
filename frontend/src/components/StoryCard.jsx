import React from 'react';
import { Headphones, Clock, Tag, Mic } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const StoryCard = ({ story }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`
      w-full max-w-md mx-auto rounded-2xl shadow-sm border overflow-hidden mb-4 transition-all duration-300
      ${isDark 
        ? 'bg-[#1a1a2e] border-[#1e293b] hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]' 
        : 'bg-white border-gray-100 hover:shadow-md'
      }
    `}>
      <div className="p-4">
        {/* Header: Language + Cluster */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 bg-blue-50 text-blue-600">
            <Mic size={12} />
            {story.language || 'Unknown'}
          </span>
          <span className="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 bg-orange-100 text-orange-700">
            <Tag size={12} />
            {story.cluster_label?.replace(/\s/g, '') || 'Story'}
          </span>
        </div>

        {/* Text Content */}
        <h3 className="text-md font-bold line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
          {story.translated_text?.substring(0, 60) || 'Untitled Story'}...
        </h3>
        <p className="text-xs italic mb-3 line-clamp-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <Headphones size={12} />
          {story.original_text?.substring(0, 80)}...
        </p>

        {/* Audio Player */}
        <div className="flex items-center justify-between mt-1">
          <audio controls className="h-8 w-3/4">
            <source src={story.audio_url} type="audio/mpeg" />
          </audio>
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Clock size={12} />
            {new Date(story.created_at).toLocaleDateString('en-ZA')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;