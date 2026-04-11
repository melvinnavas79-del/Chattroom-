import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SalasTab = ({ API, currentUser }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('popular'); // popular o nuevo

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, usersRes] = await Promise.all([
        axios.get(`${API}/rooms`),
        axios.get(`${API}/rankings/users?limit=20`)
      ]);
      setRooms(roomsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryFlag = (index) => {
    const flags = ['🇨🇴', '🇦🇷', '🇲🇽', '🇪🇸', '🇺🇸', '🇧🇷', '🇵🇪', '🇨🇱'];
    return flags[index % flags.length];
  };

  const getBadge = (user) => {
    if (user.vip_level === 'aristocrat') return { text: 'FRIENDS', color: 'from-yellow-400 to-orange-500' };
    if (user.vip_level === 'svip') return { text: 'EL MANICOMIO', color: 'from-orange-400 to-red-500' };
    return { text: 'FRIENDS', color: 'from-yellow-400 to-orange-500' };
  };

  return (
    <div className="space-y-4">
      {/* Banner Principal */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-lg">
        <div className="relative h-48 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-600 rounded-full blur-3xl"></div>
          </div>
          <div className="relative text-center z-10">
            <div className="text-6xl mb-2">🦁</div>
            <h2 className="text-3xl font-bold text-yellow-400 drop-shadow-lg" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,215,0,0.5)'
            }}>
              Weekly Family Star
            </h2>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="px-4 grid grid-cols-3 gap-3">
        {/* Lista Card */}
        <div className="gradient-cyan-light rounded-xl p-3 card-shadow-hover cursor-pointer">
          <div className="text-center">
            <h3 className="text-gray-800 font-bold mb-2">lista</h3>
            <div className="flex justify-center items-center gap-1 mb-2">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-yellow-400 overflow-hidden">
                <img src={users[0]?.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white border-2 border-yellow-400 overflow-hidden -ml-3 z-10">
                <img src={users[1]?.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white border-2 border-yellow-400 overflow-hidden -ml-3">
                <img src={users[2]?.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-xs flex items-center justify-center gap-1">
              <span>👑</span>
              <span className="text-yellow-600 font-bold">TOP 3</span>
              <span>👑</span>
            </div>
          </div>
        </div>

        {/* Pareja Card */}
        <div className="gradient-pink-light rounded-xl p-3 card-shadow-hover cursor-pointer">
          <div className="text-center">
            <h3 className="text-gray-800 font-bold mb-2">Pareja</h3>
            <div className="flex justify-center items-center gap-1 mb-2">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-pink-400 overflow-hidden">
                <img src={users[0]?.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="text-xl">💖</div>
              <div className="w-10 h-10 rounded-full bg-white border-2 border-pink-400 overflow-hidden">
                <img src={users[1]?.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-xs flex items-center justify-center gap-1">
              <span>👑</span>
              <span className="text-pink-600 font-bold">PAREJA</span>
              <span>👑</span>
            </div>
          </div>
        </div>

        {/* Clan Card */}
        <div className="gradient-blue-light rounded-xl p-3 card-shadow-hover cursor-pointer">
          <div className="text-center">
            <h3 className="text-gray-800 font-bold mb-2">Clan</h3>
            <div className="flex justify-center items-center gap-1 mb-2">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-400 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🦁
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-400 overflow-hidden -ml-3 z-10">
                <img src={users[0]?.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-400 overflow-hidden -ml-3">
                <img src={users[1]?.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-xs flex items-center justify-center gap-1">
              <span>👑</span>
              <span className="text-blue-600 font-bold">TOP 2</span>
              <span>👑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular / Nuevo Tabs */}
      <div className="px-4">
        <div className="flex items-center gap-6 border-b border-gray-200">
          <button
            onClick={() => setViewMode('popular')}
            className={`pb-2 text-lg font-bold relative ${
              viewMode === 'popular' ? 'text-gray-900 tab-active' : 'text-gray-400'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setViewMode('nuevo')}
            className={`pb-2 text-lg font-bold ${
              viewMode === 'nuevo' ? 'text-gray-900 tab-active' : 'text-gray-400'
            }`}
          >
            Nuevo
          </button>
        </div>
      </div>

      {/* User/Room List */}
      <div className="px-4 space-y-3 pb-4">
        {users.slice(0, 10).map((user, index) => {
          const badge = getBadge(user);
          const viewers = Math.floor(Math.random() * 1000) + 100;
          
          return (
            <div
              key={user.id}
              onClick={() => rooms[0] && navigate(`/room/${rooms[0].id}`)}
              className="bg-white rounded-xl p-3 flex items-center gap-3 card-shadow-hover cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Name and Badge */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs">🦋</span>
                  <h3 className="font-bold text-gray-900 text-sm truncate">
                    {user.username}
                  </h3>
                  <span className="text-xs">🦋</span>
                  <span className={`badge-friends bg-gradient-to-r ${badge.color} text-white px-2 py-0.5 rounded text-xs font-bold`}>
                    {badge.text}
                  </span>
                </div>

                {/* Country and Medals */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getCountryFlag(index)}</span>
                  <span className="text-lg">🏆</span>
                  <span className="text-lg">👑</span>
                </div>

                {/* Bio/Description */}
                <p className="text-gray-500 text-xs truncate">
                  {index % 3 === 0 && "Nunca hagas cosas que después se..."}
                  {index % 3 === 1 && "Mis Preciosos Hijos Zamy- BB Pollit..."}
                  {index % 3 === 2 && "Bienvenidos a mi sala ✨"}
                </p>
              </div>

              {/* Viewers Count */}
              <div className="flex items-center gap-1 text-cyan-500 flex-shrink-0">
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
                  <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                  <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
                </div>
                <span className="font-bold text-sm">{viewers}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Banner */}
      <div className="mx-4 mb-6 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-orange-200 via-orange-100 to-orange-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <h3 className="font-bold text-gray-900">Sala Top por Hora</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-yellow-400">
                  <img src={users[0]?.avatar} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-3 py-1 rounded-lg shadow-lg">
              <div className="text-lg font-bold">🎁 24H</div>
            </div>
            <div className="bg-green-800 text-white text-xs px-2 py-1 rounded mt-1 font-bold">
              1 Días
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalasTab;
