import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';

const MensajesTab = ({ API, currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    loadUsers();
    loadConversations();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API}/rankings/users?limit=50`);
      setUsers(response.data.filter(u => u.id !== currentUser.id));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadConversations = async () => {
    const mockConversations = users.slice(0, 5).map(user => ({
      id: user.id,
      user: user,
      lastMessage: '¡Hola! ¿Cómo estás?',
      timestamp: new Date().toISOString(),
      unread: Math.floor(Math.random() * 3)
    }));
    setConversations(mockConversations);
  };

  const startChat = (user) => {
    setSelectedChat(user);
    setMessages([
      {
        id: '1',
        sender_id: user.id,
        sender_name: user.username,
        message: '¡Hola! ¿Cómo estás?',
        timestamp: new Date().toISOString()
      }
    ]);
    setShowNewChat(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const msg = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      sender_name: currentUser.username,
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="h-screen bg-gradient-to-b from-cyan-50 to-white p-4">
      <div className="max-w-6xl mx-auto h-full flex gap-4">
        <Card className="w-80 bg-white border-2 border-gray-200 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 text-xl font-bold">💬 Mensajes</h2>
            <Button onClick={() => setShowNewChat(!showNewChat)} className="bg-gradient-to-r from-cyan-400 to-pink-400 text-white">
              ➕
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {showNewChat ? (
              <div className="space-y-2">
                <h3 className="text-gray-700 font-bold mb-2">Nuevo Chat</h3>
                {users.slice(0, 20).map(user => (
                  <div key={user.id} onClick={() => startChat(user)} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-cyan-50">
                    <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full border-2 border-cyan-400" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{user.username}</h4>
                      <p className="text-xs text-gray-500">Nivel {user.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {users.slice(0, 10).map((user, idx) => (
                  <div key={user.id} onClick={() => startChat(user)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${selectedChat?.id === user.id ? 'bg-cyan-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <div className="relative">
                      <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full border-2 border-cyan-400" />
                      {idx < 3 && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 truncate">{user.username}</h4>
                        <span className="text-xs text-gray-400">Ahora</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">¡Hola! ¿Cómo estás?</p>
                    </div>
                    {idx < 2 && <div className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{idx + 1}</div>}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
        <Card className="flex-1 bg-white border-2 border-gray-200 flex flex-col">
          {selectedChat ? (
            <>
              <div className="bg-gradient-to-r from-cyan-400 to-pink-400 p-4 flex items-center gap-3">
                <img src={selectedChat.avatar} alt={selectedChat.username} className="w-12 h-12 rounded-full border-2 border-white" />
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedChat.username}</h3>
                  <p className="text-white/80 text-sm">En línea</p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4 bg-gray-50">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender_id === currentUser.id ? 'bg-gradient-to-r from-cyan-400 to-pink-400 text-white' : 'bg-white border-2 border-gray-200 text-gray-900'}`}>
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === currentUser.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 bg-white border-t-2 border-gray-200">
                <div className="flex gap-2">
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe un mensaje..." className="flex-1 border-2 border-cyan-200 focus:border-cyan-400" />
                  <Button onClick={handleSendMessage} className="bg-gradient-to-r from-cyan-400 to-pink-400 text-white px-6">
                    ✉️ Enviar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-pink-50">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-gray-900 text-2xl font-bold mb-2">Mensajes Privados</h3>
                <p className="text-gray-600">Selecciona una conversación o inicia un nuevo chat</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MensajesTab;
