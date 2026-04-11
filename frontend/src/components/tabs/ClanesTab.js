import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ClanesTab = ({ API, currentUser }) => {
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClans();
  }, []);

  const loadClans = async () => {
    try {
      const response = await axios.get(`${API}/clans`);
      setClans(response.data);
    } catch (error) {
      console.error('Error loading clans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClan = async (clanId) => {
    try {
      await axios.post(`${API}/clans/${clanId}/join?user_id=${currentUser.id}`);
      alert('¡Te has unido al clan exitosamente!');
      loadClans();
    } catch (error) {
      console.error('Error joining clan:', error);
      alert('Error al unirse al clan');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white text-3xl font-bold text-center">🛡️ Clanes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clans.map((clan) => (
          <Card key={clan.id} className="bg-slate-800/50 border-pink-500/20 p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{clan.logo}</div>
              <h3 className="text-white text-2xl font-bold mb-2">{clan.name}</h3>
              <p className="text-gray-400 mb-4">{clan.members.length} miembros</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Puntos Totales:</span>
                  <span className="text-yellow-400 font-bold">{clan.total_points}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Puntos Semanales:</span>
                  <span className="text-green-400 font-bold">{clan.weekly_points}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Nivel:</span>
                  <span className="text-purple-400 font-bold">{clan.level}</span>
                </div>
              </div>

              {currentUser.clan_id === clan.id ? (
                <Button disabled className="w-full bg-gray-600">
                  Ya eres miembro
                </Button>
              ) : (
                <Button
                  onClick={() => handleJoinClan(clan.id)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  Unirse al Clan
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClanesTab;
