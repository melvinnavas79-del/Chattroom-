import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import SalasTab from '@/components/tabs/SalasTab';
import JuegosTab from '@/components/tabs/JuegosTab';
import RankingsTab from '@/components/tabs/RankingsTab';
import ClanesTab from '@/components/tabs/ClanesTab';
import EventosTab from '@/components/tabs/EventosTab';
import PerfilTab from '@/components/tabs/PerfilTab';
import { getAristocratInfo } from '@/lib/aristocrat';

const Dashboard = ({ currentUser, onLogout, API }) => {
  const [activeTab, setActiveTab] = useState('popular');
  const [userCoins, setUserCoins] = useState(currentUser?.coins || 0);
  const [userInfo, setUserInfo] = useState(currentUser);

  useEffect(() => {
    loadUserCoins();
  }, []);

  const loadUserCoins = async () => {
    try {
      const response = await axios.get(`${API}/users/${currentUser.id}`);
      setUserCoins(response.data.coins);
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error loading user coins:', error);
    }
  };

  const aristocratInfo = getAristocratInfo(userInfo?.aristocrat_level || 0);

  const tabs = [
    { id: 'mio', label: 'Mío' },
    { id: 'popular', label: 'Popular' },
    { id: 'descubrir', label: 'Descubrir' },
    { id: 'eventos', label: 'Event' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-pink-50 to-white">
      {/* Status Bar */}
      <div className="bg-transparent px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-gray-600 font-semibold">
          {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">📶</span>
          <span className="text-gray-600">📡</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">🔋</span>
            <span className="text-gray-800 font-bold">{userCoins > 999 ? Math.floor(userCoins / 1000) + 'K' : userCoins}</span>
          </div>
          {userInfo?.aristocrat_level > 0 && (
            <div className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${aristocratInfo.bgGradient} text-white text-xs font-bold`}>
              {aristocratInfo.icon}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-base font-semibold transition-all relative ${
                activeTab === tab.id
                  ? 'text-gray-900 tab-active'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button className="text-gray-700 text-xl">🔍</button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20">
        {activeTab === 'mio' && <PerfilTab API={API} currentUser={currentUser} onLogout={onLogout} />}
        {activeTab === 'popular' && <SalasTab API={API} currentUser={currentUser} />}
        {activeTab === 'descubrir' && <RankingsTab API={API} />}
        {activeTab === 'eventos' && <EventosTab API={API} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around z-50">
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'popular' ? 'text-cyan-500' : 'text-gray-400'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            activeTab === 'popular' ? 'bg-cyan-500' : 'bg-gray-200'
          }`}>
            <span className={activeTab === 'popular' ? 'text-white text-xl' : 'text-gray-500 text-xl'}>
              🎤
            </span>
          </div>
          <span className="text-xs font-medium">por la sala</span>
        </button>

        <button
          onClick={() => setActiveTab('juegos')}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-xl">🎮</span>
          </div>
          <span className="text-xs font-medium">Juegos</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-xl">⏰</span>
          </div>
          <span className="text-xs font-medium">Momento</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 relative">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-xl">💬</span>
          </div>
          <span className="text-xs font-medium">Mensaje</span>
          <span className="absolute top-0 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            2
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mio')}
          className={`flex flex-col items-center gap-1 relative ${
            activeTab === 'mio' ? 'text-cyan-500' : 'text-gray-400'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img src={currentUser.avatar} alt="yo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-medium">yo</span>
          <span className="absolute top-0 right-2 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>
      </nav>

      {/* Juegos Tab Content */}
      {activeTab === 'juegos' && (
        <div className="px-4 py-6">
          <JuegosTab API={API} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
