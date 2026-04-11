import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAristocratInfo } from '@/lib/aristocrat';

const AdminPanel = ({ API, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState('');
  const [coinsAmount, setCoinsAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/users?admin_id=${currentUser.id}`),
        axios.get(`${API}/admin/stats?admin_id=${currentUser.id}`)
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert('No tienes permisos de administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBadge = async (userId) => {
    if (!newBadge.trim()) return;
    try {
      await axios.post(`${API}/admin/users/${userId}/badges?admin_id=${currentUser.id}&badge=${encodeURIComponent(newBadge)}`);
      setNewBadge('');
      loadData();
      alert('Badge agregado correctamente');
    } catch (error) {
      alert('Error al agregar badge');
    }
  };

  const handleRemoveBadge = async (userId, badge) => {
    try {
      await axios.delete(`${API}/admin/users/${userId}/badges?admin_id=${currentUser.id}&badge=${encodeURIComponent(badge)}`);
      loadData();
      alert('Badge eliminado');
    } catch (error) {
      alert('Error al eliminar badge');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/role?admin_id=${currentUser.id}&new_role=${newRole}`);
      loadData();
      alert(`Rol cambiado a ${newRole}`);
    } catch (error) {
      alert('Error al cambiar rol');
    }
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Razón del ban:');
    if (!reason) return;
    try {
      await axios.post(`${API}/admin/users/${userId}/ban?admin_id=${currentUser.id}&reason=${encodeURIComponent(reason)}`);
      loadData();
      alert('Usuario baneado');
    } catch (error) {
      alert('Error al banear usuario');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/unban?admin_id=${currentUser.id}`);
      loadData();
      alert('Usuario desbaneado');
    } catch (error) {
      alert('Error al desbanear');
    }
  };

  const handleModifyCoins = async (userId) => {
    const amount = parseInt(coinsAmount);
    if (isNaN(amount)) return;
    try {
      await axios.post(`${API}/admin/users/${userId}/coins?admin_id=${currentUser.id}&amount=${amount}`);
      setCoinsAmount('');
      loadData();
      alert(`${amount > 0 ? 'Agregadas' : 'Quitadas'} ${Math.abs(amount)} monedas`);
    } catch (error) {
      alert('Error al modificar monedas');
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: '👑 Admin', color: 'from-red-500 to-pink-500' },
      supervisor: { label: '👮 Supervisor', color: 'from-blue-500 to-cyan-500' },
      moderator: { label: '🛡️ Moderador', color: 'from-green-500 to-emerald-500' },
      user: { label: '👤 Usuario', color: 'from-gray-400 to-gray-500' }
    };
    return roles[role] || roles.user;
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Cargando panel...</div>;
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">👑 Panel de Administración</h1>
        <p className="text-sm opacity-90">Gestiona usuarios, badges y roles</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-gray-200">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_users}</div>
            <div className="text-sm text-gray-600">Usuarios</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200">
            <div className="text-3xl mb-2">🏠</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_rooms}</div>
            <div className="text-sm text-gray-600">Salas</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200">
            <div className="text-3xl mb-2">💬</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_messages}</div>
            <div className="text-sm text-gray-600">Mensajes</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200">
            <div className="text-3xl mb-2">🚫</div>
            <div className="text-2xl font-bold text-red-600">{stats.banned_users}</div>
            <div className="text-sm text-gray-600">Baneados</div>
          </Card>
        </div>
      )}

      {/* Users List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Gestión de Usuarios</h2>
        <div className="space-y-3">
          {users.map((user) => {
            const roleBadge = getRoleBadge(user.role);
            const aristocratInfo = getAristocratInfo(user.aristocrat_level || 0);
            const isExpanded = selectedUser === user.id;

            return (
              <Card key={user.id} className="bg-white border border-gray-200 overflow-hidden">
                {/* User Header */}
                <div
                  onClick={() => setSelectedUser(isExpanded ? null : user.id)}
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-16 h-16 rounded-full border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{user.username}</h3>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge className={`bg-gradient-to-r ${roleBadge.color} text-white text-xs`}>
                        {roleBadge.label}
                      </Badge>
                      {user.aristocrat_level > 0 && (
                        <Badge className={`bg-gradient-to-r ${aristocratInfo.bgGradient} text-white text-xs`}>
                          {aristocratInfo.icon}
                        </Badge>
                      )}
                      {user.verified && <Badge className="bg-blue-500 text-white text-xs">✓</Badge>}
                      {user.banned && <Badge className="bg-red-600 text-white text-xs">🚫 Baneado</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Nivel {user.level}</div>
                    <div className="text-sm font-bold text-yellow-600">💰 {user.coins?.toLocaleString()}</div>
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                    {/* Badges Section */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🎖️ Badges:</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {user.badges?.map((badge, idx) => (
                          <Badge key={idx} className="bg-purple-500 text-white">
                            {badge}
                            <button
                              onClick={() => handleRemoveBadge(user.id, badge)}
                              className="ml-2 text-white hover:text-red-300"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newBadge}
                          onChange={(e) => setNewBadge(e.target.value)}
                          placeholder="Nuevo badge (ej: 🌟 Especial)"
                          className="text-sm"
                        />
                        <Button
                          onClick={() => handleAddBadge(user.id)}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>

                    {/* Role Section */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">👥 Cambiar Rol:</h4>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleChangeRole(user.id, 'user')}
                          size="sm"
                          variant={user.role === 'user' ? 'default' : 'outline'}
                        >
                          👤 Usuario
                        </Button>
                        <Button
                          onClick={() => handleChangeRole(user.id, 'moderator')}
                          size="sm"
                          variant={user.role === 'moderator' ? 'default' : 'outline'}
                        >
                          🛡️ Moderador
                        </Button>
                        <Button
                          onClick={() => handleChangeRole(user.id, 'supervisor')}
                          size="sm"
                          variant={user.role === 'supervisor' ? 'default' : 'outline'}
                        >
                          👮 Supervisor
                        </Button>
                        <Button
                          onClick={() => handleChangeRole(user.id, 'admin')}
                          size="sm"
                          variant={user.role === 'admin' ? 'default' : 'outline'}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          👑 Admin
                        </Button>
                      </div>
                    </div>

                    {/* Coins Section */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">💰 Modificar Monedas:</h4>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={coinsAmount}
                          onChange={(e) => setCoinsAmount(e.target.value)}
                          placeholder="Cantidad (+/-)"
                          className="text-sm"
                        />
                        <Button
                          onClick={() => handleModifyCoins(user.id)}
                          className="bg-yellow-500 hover:bg-yellow-600"
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>

                    {/* Ban Section */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🚫 Moderación:</h4>
                      {user.banned ? (
                        <div>
                          <p className="text-sm text-red-600 mb-2">Baneado: {user.ban_reason}</p>
                          <Button
                            onClick={() => handleUnbanUser(user.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Desbanear Usuario
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleBanUser(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Banear Usuario
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
