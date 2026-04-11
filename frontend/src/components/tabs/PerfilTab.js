import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PerfilTab = ({ API, currentUser, onLogout }) => {
  const vipLevelColors = {
    normal: 'bg-gray-500',
    vip: 'bg-green-500',
    svip: 'bg-blue-500',
    aristocrat: 'bg-purple-500'
  };

  const stats = [
    { label: 'Nivel', value: currentUser.level, icon: '⭐' },
    { label: 'Monedas', value: currentUser.coins, icon: '💰' },
    { label: 'Diamantes', value: currentUser.diamonds, icon: '💎' },
    { label: 'Total Gastado', value: currentUser.total_spent, icon: '💸' },
    { label: 'Total Recibido', value: currentUser.total_received, icon: '🎁' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-white text-3xl font-bold mb-2">{currentUser.username}</h2>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge className={`${vipLevelColors[currentUser.vip_level]} text-white`}>
                👑 {currentUser.vip_level.toUpperCase()}
              </Badge>
              {currentUser.verified && (
                <Badge className="bg-blue-500 text-white">
                  ✔️ Verificado
                </Badge>
              )}
              {currentUser.badges.map((badge, index) => (
                <Badge key={index} className="bg-yellow-500 text-white">
                  {badge}
                </Badge>
              ))}
            </div>
            <p className="text-white/80 mt-2 text-sm">
              Miembro desde {new Date(currentUser.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 border-pink-500/20 p-4 text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
            <p className="text-white font-bold text-lg">{stat.value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card className="bg-slate-800/50 border-pink-500/20 p-6">
        <h3 className="text-white text-xl font-bold mb-4">🎯 Configuración</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Modo Fantasma</span>
            <Badge className={currentUser.ghost_mode ? 'bg-green-500' : 'bg-gray-500'}>
              {currentUser.ghost_mode ? 'Activado' : 'Desactivado'}
            </Badge>
          </div>
          
          {currentUser.clan_id && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Clan</span>
              <Badge className="bg-purple-500">🛡️ Miembro de Clan</Badge>
            </div>
          )}

          {currentUser.cp_partner_id && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">CP Partner</span>
              <Badge className="bg-pink-500">❤️ Nivel {currentUser.cp_level}</Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1 border-pink-500/50 text-white hover:bg-pink-500/20"
        >
          ⚙️ Editar Perfil
        </Button>
        <Button
          onClick={onLogout}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white"
        >
          🚪 Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default PerfilTab;
