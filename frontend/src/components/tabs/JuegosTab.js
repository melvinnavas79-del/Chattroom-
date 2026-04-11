import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const JuegosTab = ({ API, currentUser }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await axios.get(`${API}/games`);
      setGames(response.data);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-white text-3xl font-bold mb-4">🎮 Juegos</h2>
        <p className="text-gray-400">Los juegos estarán disponibles próximamente</p>
      </div>

      {games.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Card key={game.id} className="bg-slate-800/50 border-pink-500/20 p-6">
              <div className="text-6xl text-center mb-4">{game.icon}</div>
              <h3 className="text-white text-xl font-bold text-center mb-2">
                {game.name}
              </h3>
              <p className="text-gray-400 text-center text-sm mb-4">
                {game.description}
              </p>
              <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500">
                Jugar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JuegosTab;
