import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { X, MapPin, Check, Crosshair } from 'lucide-react';
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

// Custom draggable marker icon (orange)
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationPicker = ({ onLocationSelect, initialLocation, isOpen, onClose }) => {
  const [position, setPosition] = useState(initialLocation || [-26.2041, 28.0473]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Map click handler
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  // Drag marker handler
  const DraggableMarker = () => {
    const markerRef = React.useRef(null);
    const eventHandlers = React.useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            const pos = marker.getLatLng();
            setPosition([pos.lat, pos.lng]);
          }
        },
      }),
      []
    );

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
        icon={orangeIcon}
      />
    );
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please click on the map to select a location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please click on the map to select a location.');
    }
  };

  // Confirm location
  const confirmLocation = () => {
    onLocationSelect(position);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-end justify-center animate-fade-in">
      <div className={`
        w-full max-w-lg rounded-t-3xl shadow-2xl p-4 pb-6 max-h-[90vh] overflow-hidden
        ${isDark ? 'bg-[#1a1a2e] border-t border-[#1e293b]' : 'bg-white'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-neon-500" strokeWidth={1.5} />
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Select Location
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#1e293b] transition"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Click on the map or drag the marker to set the exact location
        </p>

        {/* Map */}
        <div className="rounded-xl overflow-hidden h-80 relative border border-gray-200 dark:border-[#1e293b]">
          <MapContainer
            center={position}
            zoom={13}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url={isDark 
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />
            <MapClickHandler />
            <DraggableMarker />
          </MapContainer>

          {/* Center crosshair overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neon-500 rounded-full opacity-50 animate-pulse" />
          </div>

          {/* Geolocation button */}
          <button
            onClick={getCurrentLocation}
            className={`
              absolute top-3 right-3 p-2 rounded-full shadow-lg transition hover:scale-105
              ${isDark ? 'bg-[#1a1a2e] text-neon-400 hover:bg-[#1e293b]' : 'bg-white text-neon-500 hover:bg-gray-50'}
            `}
          >
            <Crosshair size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Coordinates display */}
        <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
          <span className="text-neon-500">Drag marker to adjust</span>
        </div>

        {/* Confirm button */}
        <button
          onClick={confirmLocation}
          className="w-full mt-4 py-3 bg-neon-500 hover:bg-neon-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <Check size={18} strokeWidth={2} />
          Confirm Location
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;