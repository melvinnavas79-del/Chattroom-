import { useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VIPTab = ({ API, currentUser, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);

  const vipLevels = [
    {
      id: 1,
      name: 'VIP Bronze',
      level: 'bronze',
      price: 4.99,
      emoji: '🥉',
      benefits: [
        '✨ Badge VIP Bronze',
        '🎁 500 monedas de bienvenida',
        '💬 Chat prioritario',
        '🎨 Avatar con marco dorado',
      ],
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 2,
      name: 'VIP Silver',
      level: 'silver',
      price: 9.99,
      emoji: '🥈',
      benefits: [
        '✨ Badge VIP Silver',
        '🎁 2,000 monedas de bienvenida',
        '💬 Chat prioritario',
        '🎨 Avatar con marco plateado',
        '🎤 Acceso a salas VIP',
        '👑 Nombre destacado',
      ],
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 3,
      name: 'VIP Gold',
      level: 'gold',
      price: 19.99,
      emoji: '🥇',
      benefits: [
        '✨ Badge VIP Gold',
        '🎁 5,000 monedas de bienvenida',
        '💬 Chat prioritario + moderación',
        '🎨 Avatar con marco dorado premium',
        '🎤 Acceso a salas VIP exclusivas',
        '👑 Nombre destacado con efecto',
        '🎮 Acceso anticipado a juegos',
        '⚡ Sin anuncios',
      ],
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 4,
      name: 'VIP Diamond',
      level: 'diamond',
      price: 49.99,
      emoji: '💎',
      benefits: [
        '✨ Badge VIP Diamond',
        '🎁 20,000 monedas de bienvenida',
        '💬 Control total del chat',
        '🎨 Avatar con animación especial',
        '🎤 Crear salas VIP privadas',
        '👑 Nombre con efecto arcoíris',
        '🎮 Todos los juegos desbloqueados',
        '⚡ Cero anuncios',
        '🏆 Soporte VIP 24/7',
        '🎁 Regalos mensuales',
      ],
      color: 'from-cyan-400 to-blue-600'
    },
  ];

  const handleComprarVIP = async (vipPlan) => {
    setLoading(true);
    try {
      // Simular compra VIP
      const bonusCoins = parseInt(vipPlan.benefits.find(b => b.includes('monedas')).match(/[\d,]+/)[0].replace(',', ''));
      
      await axios.put(`${API}/users/${currentUser.id}`, {
        vip_level: vipPlan.level,
        coins: currentUser.coins + bonusCoins,
        badges: [...(currentUser.badges || []), `VIP ${vipPlan.name}`]
      });

      alert(`🎉 ¡Bienvenido a ${vipPlan.name}! +${bonusCoins.toLocaleString()} monedas`);
      
      if (onUpdateUser) {
        onUpdateUser();
      }
    } catch (error) {
      console.error('Error al comprar VIP:', error);
      alert('❌ Error al activar VIP. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-white text-5xl font-bold mb-3">
            ✨ Membresías <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">VIP</span>
          </h1>
          <p className="text-gray-300 text-lg">Desbloquea beneficios exclusivos y destaca entre todos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vipLevels.map((vip) => (
            <Card key={vip.id} className="bg-gray-900/50 border-2 border-white/20 p-6 hover:scale-105 transition-transform">
              <div className="text-center mb-4">
                <div className={`text-7xl mb-3 ${vip.id === 4 ? 'animate-pulse' : ''}`}>{vip.emoji}</div>
                <h3 className={`text-2xl font-bold mb-2 bg-gradient-to-r ${vip.color} text-transparent bg-clip-text`}>
                  {vip.name}
                </h3>
              </div>

              <div className="mb-6 space-y-2">
                {vip.benefits.map((benefit, idx) => (
                  <div key={idx} className="text-gray-300 text-sm flex items-start">
                    <span className="mr-2">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="text-center mb-4">
                <span className="text-white text-4xl font-bold">${vip.price}</span>
                <span className="text-gray-400 text-sm">/mes</span>
              </div>

              <Button
                onClick={() => handleComprarVIP(vip)}
                disabled={loading || currentUser?.vip_level === vip.level}
                className={`w-full bg-gradient-to-r ${vip.color} hover:opacity-90 text-white font-bold py-3 text-lg`}
              >
                {currentUser?.vip_level === vip.level ? '✅ Activo' : loading ? 'Procesando...' : 'Obtener VIP'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-white font-bold text-xl mb-4">❓ Preguntas Frecuentes</h3>
          <div className="space-y-3 text-gray-300 text-sm">
            <div>
              <p className="font-bold text-white">¿Cuándo se activa mi VIP?</p>
              <p>Inmediatamente después del pago exitoso</p>
            </div>
            <div>
              <p className="font-bold text-white">¿Puedo cambiar de plan?</p>
              <p>Sí, puedes actualizar tu plan en cualquier momento</p>
            </div>
            <div>
              <p className="font-bold text-white">¿Se renueva automáticamente?</p>
              <p>Sí, pero puedes cancelar cuando quieras desde tu perfil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VIPTab;
