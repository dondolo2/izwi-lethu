import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BookOpen, Loader2, BarChart3, Sparkles, MapPin } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import api from './api/axiosConfig';
import BottomNav from './components/BottomNav';
import StoryCard from './components/StoryCard';
import StoryMap from './components/StoryMap';
import ClusterChart from './components/ClusterChart';
import ThemeToggle from './components/ThemeToggle';
import LocationPicker from './components/LocationPicker';

// ==========================================
// LAYOUT COMPONENT
// ==========================================
const Layout = ({ children, showNavbar }) => {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {children}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out ${
        showNavbar ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <BottomNav />
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP CONTENT
// ==========================================
function AppContent() {
  const [stories, setStories] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const hideTimeoutRef = useRef(null);
  const location = useLocation();
  const { theme } = useTheme();

  // Auto-hide navbar after 10 seconds on map page
  useEffect(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (location.pathname === '/map') {
      setShowNavbar(true);
      hideTimeoutRef.current = setTimeout(() => {
        setShowNavbar(false);
      }, 10000);
    } else {
      setShowNavbar(true);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [location.pathname]);

  const handleMapInteraction = () => {
    setShowNavbar(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowNavbar(false);
    }, 10000);
  };

  const fetchData = async () => {
    try {
      const [storiesRes, clustersRes] = await Promise.all([
        api.get('/stories'),
        api.get('/clusters')
      ]);
      setStories(storiesRes.data);
      setClusters(clustersRes.data);
    } catch (e) {
      console.error('Error fetching data', e);
      setStories([
        { 
          id: 1, 
          audio_url: '#', 
          original_text: 'Mock story', 
          translated_text: 'Grandfather fled the war.', 
          cluster_label: 'Migration', 
          language: 'isiZulu', 
          lat: -26, 
          lng: 28, 
          created_at: new Date() 
        },
        { 
          id: 2, 
          audio_url: '#', 
          original_text: 'Mock story 2', 
          translated_text: 'The community resisted the pass laws.', 
          cluster_label: 'Resistance', 
          language: 'isiXhosa', 
          lat: -25.7, 
          lng: 28.2, 
          created_at: new Date() 
        }
      ]);
      setClusters([
        { name: 'Migration', value: 5 }, 
        { name: 'Land', value: 3 },
        { name: 'Resistance', value: 4 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle location selection
  const handleLocationSelect = (locationData) => {
    console.log('📍 Location selected:', locationData);
    // Here you can send this to your backend to associate with a story
    // For now, we'll just show a success message
    alert(`✅ Location saved: ${locationData[0].toFixed(6)}, ${locationData[1].toFixed(6)}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 size={40} className="animate-spin text-neon-500" strokeWidth={1.5} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading archive...</p>
      </div>
    );
  }

  return (
    <>
      <Layout showNavbar={showNavbar}>
        <Routes>
          <Route path="/" element={
            <div className="p-4 pb-20">
              {/* Header with Theme Toggle */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <BookOpen size={28} className="text-neon-500" strokeWidth={1.5} />
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Izwi Lethu
                  </h1>
                  <Sparkles size={16} className="text-neon-400 animate-pulse-glow" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-2">
                  {/* Add Location Button */}
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    className="p-2 rounded-full bg-neon-500/10 text-neon-500 hover:bg-neon-500/20 transition flex items-center gap-1 text-sm"
                  >
                    <MapPin size={16} strokeWidth={1.5} />
                    <span className="hidden sm:inline">Add Location</span>
                  </button>
                  <ThemeToggle />
                </div>
              </div>
              <p className="text-center text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Preserving South African oral histories
              </p>
              {stories.length === 0 ? (
                <div className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>
                  <p>No stories yet.</p>
                  <p className="text-sm">Send a voice note via WhatsApp!</p>
                </div>
              ) : (
                stories.map(s => <StoryCard key={s.id} story={s} />)
              )}
            </div>
          } />
          
          <Route path="/map" element={
            <StoryMap 
              stories={stories} 
              onMapInteraction={handleMapInteraction}
            />
          } />
          
          <Route path="/analytics" element={
            <div className="p-4 pb-20">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <BarChart3 size={24} className="text-neon-500" strokeWidth={1.5} />
                  Insights
                </h1>
                <ThemeToggle />
              </div>
              <ClusterChart data={clusters} />
            </div>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={[-26.2041, 28.0473]}
      />
    </>
  );
}

// ==========================================
// MAIN APP
// ==========================================
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;