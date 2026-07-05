import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { X, Plus, MapPin as MapPinIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const StoryMap = ({ stories, onMapInteraction }) => {
  const [selected, setSelected] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const center = [-26.2041, 28.0473];
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  const handleInteraction = () => {
    if (onMapInteraction) onMapInteraction();
  };

  return (
    <div className="w-full h-screen relative">
      <MapContainer
        center={center}
        zoom={6}
        className="w-full h-full"
        whenReady={({ target }) => {
          target.on('click', handleInteraction);
          target.on('dragstart', handleInteraction);
          target.on('zoomstart', handleInteraction);
          target.on('touchstart', handleInteraction);
          target.on('mousedown', handleInteraction);
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url={isDark 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />

      <button
        onClick={() => setShowLocationPicker(true)}
        className={`
          absolute bottom-24 right-4 z-[1000] p-3 rounded-full shadow-lg transition hover:scale-105
          bg-neon-500 text-white hover:bg-neon-600
        `}
      >
        <Plus size={24} strokeWidth={2} />
      </button>

        {stories.map((story) => (
          <Marker
            key={story.id}
            position={[story.lat || -26, story.lng || 28]}
            eventHandlers={{ 
              click: () => {
                setSelected(story);
                handleInteraction();
              }
            }}
          />
        ))}
      </MapContainer>

      {/* Mobile Bottom Sheet */}
      {selected && (
        <div className={`
          absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl p-5 max-h-64 overflow-y-auto animate-slide-up z-[1000] transition-all duration-300
          ${isDark ? 'bg-[#1a1a2e] border-t border-[#1e293b]' : 'bg-white'}
        `}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <MapPinIcon size={18} className="text-neon-500" strokeWidth={1.5} />
              {selected.cluster_label}
            </h3>
            <button 
              onClick={() => setSelected(null)} 
              className="p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-[#1e293b]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            {selected.translated_text}
          </p>
          <audio controls className="w-full h-10">
            <source src={selected.audio_url} />
          </audio>
        </div>
      )}
    </div>
  );
};

export default StoryMap;