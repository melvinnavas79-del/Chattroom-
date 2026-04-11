import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import SalasTab from '@/components/tabs/SalasTab';
import JuegosTab from '@/components/tabs/JuegosTab';
import RankingsTab from '@/components/tabs/RankingsTab';
import ClanesTab from '@/components/tabs/ClanesTab';
import EventosTab from '@/components/tabs/EventosTab';
import PerfilTab from '@/components/tabs/PerfilTab';

const Dashboard = ({ currentUser, onLogout, API }) => {
  const [activeTab, setActiveTab] = useState('salas');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoins, setUserCoins] = useState(currentUser?.coins || 0);

  useEffect(() => {
    loadUserCoins();
  }, []);

  const loadUserCoins = async () => {
    try {
      const response = await axios.get(`${API}/users/${currentUser.id}`);
      setUserCoins(response.data.coins);
    } catch (error) {
      console.error('Error loading user coins:', error);
    }
  };

  const tabs = [
    { id: 'salas', label: '🏠 Salas', icon: '🏠' },
    { id: 'juegos', label: '🎮 Juegos', icon: '🎮' },
    { id: 'rankings', label: '🏆 Rankings', icon: '🏆' },
    { id: 'clanes', label: '🛡️ Clanes', icon: '🛡️' },
    { id: 'eventos', label: '🎉 Eventos', icon: '🎉' },
    { id: 'perfil', label: '👤 Perfil', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-pink-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">☔</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                Lluvia Live
              </span>
            </div>

            {/* Tabs Navigation */}
            <nav className="hidden md:flex gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </nav>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/50">
                <span className="text-yellow-400 font-bold">💰 {userCoins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{currentUser.username}</span>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-10 h-10 rounded-full border-2 border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                size="sm"
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className={`whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon} {tab.label.split(' ')[1]}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'salas' && <SalasTab API={API} currentUser={currentUser} />}
        {activeTab === 'juegos' && <JuegosTab API={API} currentUser={currentUser} />}
        {activeTab === 'rankings' && <RankingsTab API={API} />}
        {activeTab === 'clanes' && <ClanesTab API={API} currentUser={currentUser} />}
        {activeTab === 'eventos' && <EventosTab API={API} />}
        {activeTab === 'perfil' && <PerfilTab API={API} currentUser={currentUser} onLogout={onLogout} />}
      </main>
    </div>
  );
};

export default Dashboard;
