import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SalasTab = ({ API, currentUser }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [reels, setReels] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, reelsRes, photosRes] = await Promise.all([
        axios.get(`${API}/rooms`),
        axios.get(`${API}/reels`),
        axios.get(`${API}/photos`)
      ]);
      setRooms(roomsRes.data);
      setReels(reelsRes.data);
      setPhotos(photosRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: '🏠', label: 'My Room', action: () => {} },
    { icon: '💬', label: 'Quick Join', action: () => {} },
    { icon: '🎬', label: 'Reels', action: () => {} },
    { icon: '📸', label: 'Galería', action: () => {} },
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder="🔍 Buscar Personas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/50 border-pink-500/30 text-white h-12 pl-4"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
            🏆
          </div>
          <img
            src={currentUser.avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-pink-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
          >
            <div className="text-4xl">{action.icon}</div>
            <span className="text-white text-sm font-semibold">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Banner */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 p-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">🎉 Encuentra tu Vibra</h2>
            <p className="text-white/90">Unete a salas de streaming en vivo</p>
          </div>
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl"></div>
        </div>
      </Card>

      {/* Rooms List */}
      <div>
        <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
          🔑 Salas Activas
        </h3>
        <div className="space-y-4">
          {rooms.map((room) => (
            <Card
              key={room.id}
              onClick={() => navigate(`/room/${room.id}`)}
              className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                <div
                  className="w-20 h-20 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${room.background})` }}
                ></div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg">{room.name}</h4>
                  <p className="text-gray-400 text-sm">{room.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {room.is_live && (
                      <span className="text-red-500 text-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        EN VIVO
                      </span>
                    )}
                    <span className="text-gray-400 text-sm">
                      👥 {room.active_users} personas
                    </span>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  Entrar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalasTab;
