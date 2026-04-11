import { useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RecargasTab = ({ API, currentUser, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);

  const paquetes = [
    { id: 1, coins: 1000, price: 0.99, emoji: '💰' },
    { id: 2, coins: 5000, price: 4.99, emoji: '💎', bonus: 500 },
    { id: 3, coins: 10000, price: 9.99, emoji: '🏆', bonus: 2000 },
    { id: 4, coins: 50000, price: 49.99, emoji: '👑', bonus: 15000 },
    { id: 5, coins: 100000, price: 99.99, emoji: '💸', bonus: 50000 },
  ];

  const handleComprar = async (paquete) => {
    setLoading(true);
    try {
      const totalCoins = paquete.coins + (paquete.bonus || 0);
      
      // Simular compra (en producción integrarías Stripe, PayPal, etc.)
      await axios.put(`${API}/users/${currentUser.id}`, {
        coins: currentUser.coins + totalCoins
      });

      alert(`✅ ¡Recarga exitosa! +${totalCoins.toLocaleString()} monedas`);
      
      if (onUpdateUser) {
        onUpdateUser();
      }
    } catch (error) {
      console.error('Error al recargar:', error);
      alert('❌ Error en la recarga. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <h1 className="text-gray-900 text-3xl font-bold mb-2">💰 Recargas</h1>
          <p className="text-gray-600">Recarga monedas y disfruta de todas las funciones premium</p>
          
          <div className="mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm">Tu saldo actual:</p>
                <p className="text-gray-900 text-2xl font-bold">{currentUser?.coins?.toLocaleString()} 💰</p>
              </div>
              <div className="text-4xl">🪙</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paquetes.map((paquete) => (
            <Card key={paquete.id} className={`bg-white border-2 p-6 hover:shadow-xl transition-all ${
              paquete.bonus ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-white' : 'border-gray-200'
            }`}>
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{paquete.emoji}</div>
                <h3 className="text-gray-900 text-2xl font-bold mb-1">
                  {paquete.coins.toLocaleString()} Monedas
                </h3>
                {paquete.bonus && (
                  <div className="inline-block bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-2">
                    🎁 +{paquete.bonus.toLocaleString()} BONUS
                  </div>
                )}
                <p className="text-gray-500 text-sm">
                  Total: {(paquete.coins + (paquete.bonus || 0)).toLocaleString()} monedas
                </p>
              </div>

              <div className="text-center mb-4">
                <span className="text-gray-900 text-3xl font-bold">${paquete.price}</span>
                <span className="text-gray-500 text-sm ml-1">USD</span>
              </div>

              <Button
                onClick={() => handleComprar(paquete)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 text-lg"
              >
                {loading ? 'Procesando...' : 'Comprar Ahora'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-blue-900 font-bold text-lg mb-2">ℹ️ Información</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>✅ Pagos seguros y encriptados</li>
            <li>✅ Monedas disponibles inmediatamente</li>
            <li>✅ Soporte 24/7 para cualquier problema</li>
            <li>✅ Los paquetes con bonus son por tiempo limitado</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecargasTab;
