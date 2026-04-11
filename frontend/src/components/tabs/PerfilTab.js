import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAristocratInfo } from '@/lib/aristocrat';

const PerfilTab = ({ API, currentUser, onLogout }) => {
  const [userInfo, setUserInfo] = useState(currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const response = await axios.get(`${API}/users/${currentUser.id}`);
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error loading user info:', error);
      setUserInfo(currentUser);
    } finally {
      setLoading(false);
    }
  };

  const aristocratInfo = getAristocratInfo(userInfo?.aristocrat_level || 0);
  
  const vipLevelColors = {
    normal: 'bg-gray-500',
    vip: 'bg-green-500',
    svip: 'bg-blue-500',
    aristocrat: `bg-gradient-to-r ${aristocratInfo.bgGradient}`
  };

  const stats = [
    { label: 'Nivel', value: userInfo?.level || 1, icon: '⭐' },
    { label: 'Monedas', value: (userInfo?.coins || 0).toLocaleString(), icon: '💰' },
    { label: 'Diamantes', value: (userInfo?.diamonds || 0).toLocaleString(), icon: '💎' },
    { label: 'Total Gastado', value: (userInfo?.total_spent || 0).toLocaleString(), icon: '💸' },
    { label: 'Total Recibido', value: (userInfo?.total_received || 0).toLocaleString(), icon: '🎁' },
  ];

  if (loading) {
    return <div className="p-6 text-center">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 bg-white">
      <Card className="bg-gradient-to-br from-cyan-400 via-pink-400 to-purple-400 border-0 p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={userInfo?.avatar || currentUser.avatar}
            alt={userInfo?.username || currentUser.username}
            className="w-32 h-32 rounded-full border-4 border-white shadow-2xl"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-white text-3xl font-bold mb-2">{userInfo?.username || currentUser.username}</h2>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge className={`${vipLevelColors[userInfo?.vip_level || 'normal']} text-white px-3 py-1`}>
                {(userInfo?.vip_level || 'normal').toUpperCase()}
                {userInfo?.aristocrat_level > 0 && ` ${userInfo.aristocrat_level}`}
              </Badge>
              {userInfo?.aristocrat_level > 0 && (
                <Badge className={`bg-gradient-to-r ${aristocratInfo.bgGradient} text-white px-3 py-1 font-bold shadow-lg`}>
                  {aristocratInfo.icon} {aristocratInfo.name}
                </Badge>
              )}
              {userInfo?.verified && (
                <Badge className="bg-blue-500 text-white">
                  Verificado
                </Badge>
              )}
              {(userInfo?.badges || []).map((badge, index) => (
                <Badge key={index} className="bg-yellow-500 text-white">
                  {badge}
                </Badge>
              ))}
            </div>
            <p className="text-white/90 mt-2 text-sm">
              Miembro desde {new Date(userInfo?.created_at || currentUser.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white border-2 border-gray-200 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-gray-600 text-xs mb-1 font-medium">{stat.label}</p>
            <p className="text-gray-900 font-bold text-lg">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-white border-2 border-gray-200 p-6 shadow-sm">
        <h3 className="text-gray-900 text-xl font-bold mb-4">Configuracion</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Modo Fantasma</span>
            <Badge className={userInfo?.ghost_mode ? 'bg-green-500' : 'bg-gray-400'}>
              {userInfo?.ghost_mode ? 'Activado' : 'Desactivado'}
            </Badge>
          </div>
          
          {userInfo?.clan_id && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Clan</span>
              <Badge className="bg-purple-500 text-white">Miembro de Clan</Badge>
            </div>
          )}

          {userInfo?.role && userInfo.role !== 'user' && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Rol Especial</span>
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold">
                {userInfo.role === 'admin' && '👑 Dueño'}
                {userInfo.role === 'supervisor' && 'Supervisor'}
                {userInfo.role === 'moderator' && 'Moderador'}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1 border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-50 font-semibold"
        >
          Editar Perfil
        </Button>
        <Button
          onClick={onLogout}
          className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold"
        >
          Cerrar Sesion
        </Button>
      </div>
    </div>
  );
};

export default PerfilTab;
