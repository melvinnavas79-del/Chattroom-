import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebRTC } from '@/hooks/useWebRTC';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RoomView = ({ currentUser, API }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [gifts, setGifts] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);
  const [userCoins, setUserCoins] = useState(currentUser?.coins || 0);
  
  // WebRTC Audio Hook
  const { isMuted, isConnected, speakingUsers, toggleMute } = useWebRTC(roomId, currentUser, API);

  useEffect(() => {
    loadRoomData();
    loadGifts();
    loadUserCoins();
  }, [roomId]);

  const loadUserCoins = async () => {
    try {
      const response = await axios.get(`${API}/users/${currentUser.id}`);
      setUserCoins(response.data.coins);
    } catch (error) {
      console.error('Error loading user coins:', error);
    }
  };

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

  const loadGifts = async () => {
    try {
      const response = await axios.get(`${API}/gifts`);
      setGifts(response.data);
    } catch (error) {
      console.error('Error loading gifts:', error);
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
    // Si ya está en un asiento, primero salir
    const currentSeatIndex = room?.seats?.findIndex(s => s?.user_id === currentUser.id);
    if (currentSeatIndex !== -1 && currentSeatIndex !== seatIndex) {
      await handleLeaveSeat();
    }
    
    try {
      const response = await axios.post(`${API}/rooms/${roomId}/join?user_id=${currentUser.id}&seat_index=${seatIndex}`);
      setRoom(response.data);
    } catch (error) {
      console.error('Error joining seat:', error);
      alert(error.response?.data?.detail || 'No se pudo tomar el asiento');
    }
  };

  const handleLeaveSeat = async () => {
    try {
      const response = await axios.post(`${API}/rooms/${roomId}/leave?user_id=${currentUser.id}`);
      setRoom(response.data);
    } catch (error) {
      console.error('Error leaving seat:', error);
    }
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const handleToggleSpeaker = () => {
    // Mutear/desmutear todos los audios remotos
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = !audio.muted;
    });
  };
      
      seats[seatIndex].is_muted = !seats[seatIndex].is_muted;
      
      try {
        await axios.post(`${API}/rooms/${roomId}/join?user_id=${currentUser.id}&seat_index=${seatIndex}`);
        setRoom({ ...room, seats });
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  };

  const handleSendGift = async (gift) => {
    if (userCoins < gift.price) {
      alert('¡No tienes suficientes monedas!');
      return;
    }

    // Find room owner or first seated user as receiver
    const receiver = room.seats.find(s => s !== null);
    if (!receiver) {
      alert('No hay nadie para recibir el regalo');
      return;
    }

    try {
      await axios.post(`${API}/gifts/send`, {
        sender_id: currentUser.id,
        receiver_id: receiver.user_id,
        gift_id: gift.id,
        room_id: roomId
      });

      // Update coins
      setUserCoins(userCoins - gift.price);
      
      // Reload messages to show gift
      const messagesRes = await axios.get(`${API}/rooms/${roomId}/messages`);
      setMessages(messagesRes.data);
      
      setSelectedGift(null);
    } catch (error) {
      console.error('Error sending gift:', error);
      alert('Error al enviar el regalo');
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

  const getSeatPosition = (index) => {
    const centerX = 50;
    const centerY = 50;
    const radius = 35;
    const angle = (index * (360 / 9) - 90) * (Math.PI / 180);
    
    return {
      left: `${centerX + radius * Math.cos(angle)}%`,
      top: `${centerY + radius * Math.sin(angle)}%`
    };
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${room.background})`
      }}
    >
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-sm border-b border-pink-500/30 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:text-pink-400"
          >
            ← Volver
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              {room.name}
            </h1>
            <p className="text-gray-300 text-sm">{room.topic}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/50">
              <span className="text-yellow-400 font-bold">💰 {userCoins.toLocaleString()}</span>
            </div>
            <div className="text-white flex items-center gap-2">
              <span className={`${isConnected ? 'text-green-400' : 'text-red-400'} animate-pulse`}>●</span>
              {room.active_users} en línea {isConnected && '🎤'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
        
        {/* Seats Section - Circle Layout */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/60 backdrop-blur-sm border-pink-500/30 p-6 h-full relative">
            <div className="absolute top-4 left-4 z-10">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                🎤 Asientos de Voz
              </h2>
            </div>

            {/* Circle of Seats */}
            <div className="relative w-full h-full min-h-[500px]">
              {room.seats.map((seat, index) => {
                const position = getSeatPosition(index);
                const isSpeaking = speakingUsers.has(index);
                const isMuted = seat?.is_muted || false;
                
                const userIsSpeaking = seat && speakingUsers.has(seat.user_id);
              
              return (
                  <div
                    key={index}
                    onClick={() => !seat && handleJoinSeat(index)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: position.left, top: position.top }}
                  >
                    <div className={`relative ${!seat && 'cursor-pointer'}`}>
                      {/* Seat Container */}
                      <div
                        className={`
                          ${seat
                            ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-pink-500'
                            : 'bg-slate-800/60 border-slate-600 hover:border-pink-500/50 hover:bg-slate-700/60'
                          }
                          border-2 rounded-2xl p-3 w-24 h-24 flex flex-col items-center justify-center
                          transition-all duration-300
                          ${userIsSpeaking ? 'ring-4 ring-green-400 ring-opacity-75 animate-pulse' : ''}
                        `}
                      >
                        {seat ? (
                          <>
                            {/* Avatar with speaking animation */}
                            <div className={`relative ${userIsSpeaking ? 'animate-pulse' : ''}`}>
                              <img
                                src={seat.avatar}
                                alt={seat.username}
                                className={`w-12 h-12 rounded-full border-2 ${
                                  userIsSpeaking ? 'border-green-400' : 'border-pink-400'
                                }`}
                              />
                              {userIsSpeaking && (
                                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
                              )}
                            </div>
                            
                            {/* Username */}
                            <span className="text-white text-xs font-semibold mt-1 truncate w-full text-center">
                              {seat.username.substring(0, 8)}
                            </span>
                            
                            {/* Microphone Icon */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMute(index);
                              }}
                              className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                seat.is_muted 
                                  ? 'bg-red-500 hover:bg-red-600' 
                                  : 'bg-green-500 hover:bg-green-600'
                              }`}
                            >
                              {seat.is_muted ? '🔇' : '🎤'}
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl mb-1">🪑</div>
                            <span className="text-gray-400 text-xs">Asiento {index + 1}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Center decoration */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-pink-500/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">☔</div>
                    <div className="text-white text-xs font-bold">Lluvia Live</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Section */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/60 backdrop-blur-sm border-pink-500/30 p-4 h-full flex flex-col">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              💬 Chat
            </h2>
            
            {/* Gift Buttons */}
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-pink-500/30">
              <p className="text-white text-sm font-bold mb-2">🎁 Enviar Regalo</p>
              <div className="flex gap-2 flex-wrap">
                {gifts.slice(0, 4).map((gift) => (
                  <Button
                    key={gift.id}
                    onClick={() => handleSendGift(gift)}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-xs p-2"
                    disabled={userCoins < gift.price}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg">{gift.emoji}</span>
                      <span className="text-xs">{gift.price}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 mb-4 pr-4">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-2 ${
                      msg.type === 'gift'
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50'
                        : 'bg-slate-800/50'
                    }`}
                  >
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
                    <p className="text-white text-sm ml-8">
                      {msg.type === 'gift' && <span className="text-xl mr-2">🎁</span>}
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
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
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                ✉️
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomView;
