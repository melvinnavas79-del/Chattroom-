import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const RoomView = ({ currentUser, API }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  const loadRoomData = async () => {
    try {
      const [roomRes, messagesRes] = await Promise.all([
        axios.get(`${API}/rooms/${roomId}`),
        axios.get(`${API}/rooms/${roomId}/messages`)
      ]);
      setRoom(roomRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error loading room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`${API}/rooms/${roomId}/messages`, {
        user_id: currentUser.id,
        username: currentUser.username,
        user_avatar: currentUser.avatar,
        user_vip: currentUser.vip_level,
        message: newMessage,
        type: 'text'
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleJoinSeat = async (seatIndex) => {
    try {
      const response = await axios.post(`${API}/rooms/${roomId}/join?user_id=${currentUser.id}&seat_index=${seatIndex}`);
      setRoom(response.data);
    } catch (error) {
      console.error('Error joining seat:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando sala...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Sala no encontrada</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${room.background})`
      }}
    >
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-pink-500/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white"
          >
            ← Volver
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{room.name}</h1>
            <p className="text-gray-300 text-sm">{room.topic}</p>
          </div>
          <div className="text-white">
            <span className="text-green-400">•</span> {room.active_users} en línea
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-100px)]">
        {/* Seats Section */}
        <div className="md:col-span-2">
          <Card className="bg-slate-900/50 backdrop-blur-sm border-pink-500/20 p-6 h-full">
            <h2 className="text-white text-xl font-bold mb-4">Asientos</h2>
            <div className="grid grid-cols-3 gap-4">
              {room.seats.map((seat, index) => (
                <div
                  key={index}
                  onClick={() => !seat && handleJoinSeat(index)}
                  className={`${
                    seat
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                      : 'bg-slate-800/50 cursor-pointer hover:bg-slate-700/50'
                  } border border-pink-500/30 rounded-lg p-4 flex flex-col items-center justify-center aspect-square`}
                >
                  {seat ? (
                    <>
                      <img
                        src={seat.avatar}
                        alt={seat.username}
                        className="w-16 h-16 rounded-full border-2 border-pink-500 mb-2"
                      />
                      <span className="text-white text-sm font-semibold">{seat.username}</span>
                      {seat.is_muted && <span className="text-gray-400 text-xs">🔇 Muted</span>}
                    </>
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-3xl mb-2">🪑</div>
                      <span className="text-xs">Asiento {index + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Section */}
        <div className="md:col-span-1">
          <Card className="bg-slate-900/50 backdrop-blur-sm border-pink-500/20 p-4 h-full flex flex-col">
            <h2 className="text-white text-xl font-bold mb-4">Chat</h2>
            
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-slate-800/50 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={msg.user_avatar}
                        alt={msg.username}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-pink-400 text-sm font-semibold">
                        {msg.username}
                      </span>
                      {msg.user_vip !== 'normal' && (
                        <span className="text-yellow-400 text-xs">👑</span>
                      )}
                    </div>
                    <p className="text-white text-sm ml-8">{msg.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe un mensaje..."
                className="bg-slate-800 border-pink-500/50 text-white"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-pink-500 to-purple-500"
              >
                Enviar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomView;
