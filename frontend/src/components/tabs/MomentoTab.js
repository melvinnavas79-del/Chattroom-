import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const MomentoTab = ({ API, currentUser }) => {
  const [reels, setReels] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('reels');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [reelsRes, photosRes] = await Promise.all([
        axios.get(`${API}/reels`),
        axios.get(`${API}/photos`)
      ]);
      setReels(reelsRes.data);
      setPhotos(photosRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeReel = async (reelId) => {
    try {
      await axios.post(`${API}/reels/${reelId}/like`);
      setReels(reels.map(r => r.id === reelId ? { ...r, likes: r.likes + 1 } : r));
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleLikePhoto = async (photoId) => {
    try {
      await axios.post(`${API}/photos/${photoId}/like`);
      setPhotos(photos.map(p => p.id === photoId ? { ...p, likes: p.likes + 1 } : p));
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h1 className="text-white text-3xl font-bold mb-4 flex items-center gap-3">
            ⏰ Momento <span className="text-pink-400">Live</span>
          </h1>
          <div className="flex gap-4">
            <Button onClick={() => setActiveView('reels')} className={`${activeView === 'reels' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-700'} text-white`}>
              🎬 Reels
            </Button>
            <Button onClick={() => setActiveView('photos')} className={`${activeView === 'photos' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-700'} text-white`}>
              📸 Fotos
            </Button>
          </div>
        </div>
        {activeView === 'reels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reels.map((reel) => (
              <Card key={reel.id} className="bg-gray-800/50 border-pink-500/30 overflow-hidden hover:scale-105 transition-transform">
                <div className="relative">
                  <img src={reel.thumbnail_url} alt={reel.caption} className="w-full h-80 object-cover" />
                  <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    <img src={reel.user_avatar} alt={reel.username} className="w-6 h-6 rounded-full" />
                    {reel.username}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                    👁️ {reel.views.toLocaleString()}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white mb-3">{reel.caption}</p>
                  <div className="flex items-center gap-4">
                    <Button onClick={() => handleLikeReel(reel.id)} className="bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center gap-2">
                      ❤️ {reel.likes.toLocaleString()}
                    </Button>
                    <Button className="bg-gray-700 text-white flex items-center gap-2">
                      💬 {reel.comments}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {activeView === 'photos' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="bg-gray-800/50 border-cyan-500/30 overflow-hidden hover:scale-105 transition-transform">
                <div className="relative">
                  <img src={photo.photo_url} alt={photo.caption} className="w-full h-64 object-cover" />
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <img src={photo.user_avatar} alt={photo.username} className="w-5 h-5 rounded-full" />
                    {photo.username}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-white text-sm mb-2">{photo.caption}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <button onClick={() => handleLikePhoto(photo.id)} className="text-pink-400 font-bold flex items-center gap-1">
                      ❤️ {photo.likes.toLocaleString()}
                    </button>
                    <span className="text-gray-400">💬 {photo.comments}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentoTab;
