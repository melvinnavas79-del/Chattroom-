import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RankingsTab = ({ API }) => {
  const [userRankings, setUserRankings] = useState([]);
  const [clanRankings, setClanRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const [usersRes, clansRes] = await Promise.all([
        axios.get(`${API}/rankings/users`),
        axios.get(`${API}/rankings/clans`)
      ]);
      setUserRankings(usersRes.data);
      setClanRankings(clansRes.data);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}️⃣`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white text-3xl font-bold text-center">🏆 Rankings</h2>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500">
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="clans" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500">
            Clanes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-2 mt-4">
          {userRankings.map((user, index) => (
            <Card key={user.id} className="bg-slate-800/50 border-pink-500/20 p-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getMedalEmoji(index)}</div>
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border-2 border-pink-500"
                />
                <div className="flex-1">
                  <h4 className="text-white font-bold">{user.username}</h4>
                  <p className="text-gray-400 text-sm">Nivel {user.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">💰 {user.coins}</p>
                  {user.vip_level !== 'normal' && (
                    <span className="text-purple-400 text-sm">👑 {user.vip_level}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="clans" className="space-y-2 mt-4">
          {clanRankings.map((clan, index) => (
            <Card key={clan.id} className="bg-slate-800/50 border-pink-500/20 p-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getMedalEmoji(index)}</div>
                <div className="text-4xl">{clan.logo}</div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{clan.name}</h4>
                  <p className="text-gray-400 text-sm">{clan.members.length} miembros</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">⭐ {clan.total_points}</p>
                  <p className="text-gray-400 text-sm">Nivel {clan.level}</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RankingsTab;
