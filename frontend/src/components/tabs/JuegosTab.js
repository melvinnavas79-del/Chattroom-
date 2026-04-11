import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const JuegosTab = ({ API, currentUser }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null);
  const [userCoins, setUserCoins] = useState(currentUser?.coins || 0);
  const [betAmount, setBetAmount] = useState(100);
  const [gameResult, setGameResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    loadGames();
    loadUserCoins();
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

  const loadUserCoins = async () => {
    try {
      const response = await axios.get(`${API}/users/${currentUser.id}`);
      setUserCoins(response.data.coins);
    } catch (error) {
      console.error('Error loading coins:', error);
    }
  };

  const playRuleta = () => {
    if (userCoins < betAmount) {
      alert('¡No tienes suficientes monedas!');
      return;
    }
    setSpinning(true);
    setGameResult(null);
    setTimeout(() => {
      const win = Math.random() > 0.5;
      const multiplier = win ? (Math.random() > 0.7 ? 3 : 2) : 0;
      const winAmount = betAmount * multiplier;
      const netGain = winAmount - betAmount;
      setUserCoins(userCoins + netGain);
      setGameResult({ win, amount: winAmount, netGain });
      setSpinning(false);
    }, 2000);
  };

  const playDados = () => {
    if (userCoins < betAmount) {
      alert('¡No tienes suficientes monedas!');
      return;
    }
    setSpinning(true);
    setGameResult(null);
    setTimeout(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;
      const win = total >= 7;
      const winAmount = win ? betAmount * 2 : 0;
      const netGain = winAmount - betAmount;
      setUserCoins(userCoins + netGain);
      setGameResult({ win, amount: winAmount, netGain, dice1, dice2, total });
      setSpinning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h1 className="text-white text-4xl font-bold mb-2 flex items-center gap-3">
            🎮 Casino Lluvia Live
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-yellow-500/20 border-2 border-yellow-500 px-6 py-3 rounded-xl">
              <span className="text-yellow-400 font-bold text-2xl">💰 {userCoins.toLocaleString()}</span>
            </div>
            <div className="bg-purple-500/20 border-2 border-purple-500 px-6 py-3 rounded-xl">
              <span className="text-purple-300 font-bold">Apuesta: </span>
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))} className="bg-transparent text-white font-bold w-24 outline-none" />
            </div>
          </div>
        </div>
        {!activeGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 border-2 border-pink-500/50 p-8 hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveGame(game)}>
                <div className="text-8xl text-center mb-6">{game.icon}</div>
                <h3 className="text-white text-3xl font-bold text-center mb-3">{game.name}</h3>
                <p className="text-gray-300 text-center mb-6">{game.description}</p>
                <div className="text-center text-sm text-gray-400 mb-4">
                  Apuesta Min: 💰 {game.min_bet} | Max: 💰 {game.max_bet}
                </div>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-xl py-6">
                  ▶️ JUGAR AHORA
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-purple-800/80 to-pink-800/80 border-2 border-pink-500/50 p-8">
            <Button onClick={() => { setActiveGame(null); setGameResult(null); }} className="mb-6 bg-gray-700 hover:bg-gray-600">
              ← Volver a Juegos
            </Button>
            <div className="text-center">
              <div className="text-9xl mb-6">{activeGame.icon}</div>
              <h2 className="text-white text-4xl font-bold mb-6">{activeGame.name}</h2>
              {activeGame.id === 'game-1' && (
                <div>
                  <div className={`text-8xl mb-8 ${spinning ? 'animate-spin' : ''}`}>🎰</div>
                  <Button onClick={playRuleta} disabled={spinning || userCoins < betAmount} className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold text-2xl px-12 py-6">
                    {spinning ? '🎰 GIRANDO...' : '🎰 GIRAR'}
                  </Button>
                </div>
              )}
              {activeGame.id === 'game-2' && (
                <div>
                  <div className="flex justify-center gap-4 mb-8">
                    <div className={`text-8xl ${spinning ? 'animate-bounce' : ''}`}>🎲</div>
                    <div className={`text-8xl ${spinning ? 'animate-bounce' : ''}`}>🎲</div>
                  </div>
                  {gameResult && gameResult.dice1 && (
                    <div className="text-white text-2xl mb-4">
                      Dados: {gameResult.dice1} + {gameResult.dice2} = {gameResult.total}
                    </div>
                  )}
                  <Button onClick={playDados} disabled={spinning || userCoins < betAmount} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-2xl px-12 py-6">
                    {spinning ? '🎲 LANZANDO...' : '🎲 LANZAR'}
                  </Button>
                </div>
              )}
              {gameResult && (
                <div className={`mt-8 p-6 rounded-2xl ${gameResult.win ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
                  <div className="text-6xl mb-4">{gameResult.win ? '🎉' : '😢'}</div>
                  <h3 className={`text-3xl font-bold mb-2 ${gameResult.win ? 'text-green-400' : 'text-red-400'}`}>
                    {gameResult.win ? '¡GANASTE!' : 'Perdiste'}
                  </h3>
                  <p className="text-white text-xl">
                    {gameResult.win ? `+${gameResult.netGain.toLocaleString()}` : `${gameResult.netGain.toLocaleString()}`} monedas
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JuegosTab;
