import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users?admin_id=${currentUser.id}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleGiveCoins = async (userId, amount) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/coins?admin_id=${currentUser.id}&amount=${amount}`);
      alert(`✅ ${amount > 0 ? 'Agregadas' : 'Quitadas'} ${Math.abs(amount)} monedas`);
      loadUsers();
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.detail || 'No se pudo modificar'));
    }
  };

  const handleGiveVerification = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/badges?admin_id=${currentUser.id}&badge=✓ Verificado`);
      alert('✅ Verificación otorgada');
      loadUsers();
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.detail || 'No se pudo verificar'));
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/role?admin_id=${currentUser.id}&new_role=${newRole}`);
      alert(`✅ Rol cambiado a ${newRole}`);
      loadUsers();
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.detail || 'No se pudo cambiar rol'));
    }
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Razón del baneo:');
    if (!reason) return;
    
    try {
      await axios.post(`${API}/admin/users/${userId}/ban?admin_id=${currentUser.id}&reason=${reason}`);
      alert('✅ Usuario baneado');
      loadUsers();
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.detail || 'No se pudo banear'));
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/unban?admin_id=${currentUser.id}`);
      alert('✅ Usuario desbaneado');
      loadUsers();
    } catch (error) {
      alert('❌ Error al desbanear');
    }
  };

  const handleGiveAristocracy = async (userId, level) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/aristocracy?admin_id=${currentUser.id}&level=${level}`);
      alert(`✅ Aristocracia ${level} otorgada`);
      loadUsers();
    } catch (error) {
      alert('❌ Error al dar aristocracia');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser.role !== 'super_owner' && currentUser.role !== 'admin') {
    return <div className="p-8 text-center">⛔ No tienes permisos de administrador</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">👑 Mi Oficina - Panel de Control</h1>
          <div className="text-sm bg-white px-4 py-2 rounded-full shadow">
            Super Owner: {currentUser.username}
          </div>
        </div>

        {/* Buscador */}
        <Card className="p-4 mb-6">
          <Input
            placeholder="🔍 Buscar usuario por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-lg"
          />
        </Card>

        {/* Lista de Usuarios */}
        <ScrollArea className="h-[70vh]">
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{user.username}</h3>
                        {user.badges?.includes('✓ Verificado') && <span className="text-blue-500">✓</span>}
                        {user.protected && <span className="text-yellow-500">🔒</span>}
                      </div>
                      <p className="text-sm text-gray-600">ID: {user.id}</p>
                      <p className="text-sm">💰 {user.coins?.toLocaleString()} monedas | 💎 Aristocracia {user.aristocrat_level}</p>
                      <p className="text-sm">🎭 Rol: <span className="font-semibold">{user.role}</span></p>
                      {user.banned && <p className="text-red-600 text-sm">⛔ BANEADO: {user.ban_reason}</p>}
                    </div>
                  </div>

                  {/* Botones de Control */}
                  {!user.protected && (
                    <div className="flex flex-col gap-2">
                      {/* Dar Monedas */}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => {
                          const amount = prompt('¿Cuántas monedas? (negativo para quitar)');
                          if (amount) handleGiveCoins(user.id, parseInt(amount));
                        }}>
                          💰 Dar Oro
                        </Button>
                        
                        {/* Dar Verificación */}
                        {!user.badges?.includes('✓ Verificado') && (
                          <Button size="sm" variant="outline" onClick={() => handleGiveVerification(user.id)}>
                            ✓ Verificar
                          </Button>
                        )}
                      </div>

                      {/* Dar Aristocracia */}
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        onChange={(e) => handleGiveAristocracy(user.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">💎 Dar Aristocracia</option>
                        {[1,2,3,4,5,6,7,8,9].map(level => (
                          <option key={level} value={level}>Nivel {level}</option>
                        ))}
                      </select>

                      {/* Cambiar Rol */}
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">👤 Cambiar Rol</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderador</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="user">Usuario Normal</option>
                      </select>

                      {/* Banear/Desbanear */}
                      {user.banned ? (
                        <Button size="sm" variant="outline" onClick={() => handleUnbanUser(user.id)}>
                          ✅ Desbanear
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => handleBanUser(user.id)}>
                          ⛔ Banear
                        </Button>
                      )}
                    </div>
                  )}

                  {user.protected && (
                    <div className="bg-yellow-100 px-4 py-2 rounded text-sm">
                      🔒 Usuario Protegido (Super Owner)
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminPanel;
