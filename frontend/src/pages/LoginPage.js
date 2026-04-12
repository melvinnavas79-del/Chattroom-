import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginPage = ({ onLogin, API }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear any old session data on mount
  useEffect(() => {
    localStorage.removeItem('lluvia_user');
    localStorage.removeItem('lluvia_login_at');
  }, []);

  const handleLogin = async () => {
    if (!username.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/users/login?username=${encodeURIComponent(username)}`);
      onLogin(response.data);
    } catch (error) {
      console.error('Login error:', error);
      alert('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-pink-100 to-white flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-pink-400 flex items-center justify-center shadow-2xl mb-4 mx-auto">
          <span className="text-5xl">☔</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold mb-2 text-center">
        <span className="bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent">
          Lluvia Live
        </span>
      </h1>
      
      <p className="text-gray-600 text-lg mb-12 text-center">
        Conecta, Chatea, Vive
      </p>

      {/* Login Form */}
      <div className="w-full max-w-sm space-y-4">
        <Input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          className="bg-white border-2 border-cyan-200 focus:border-cyan-400 text-gray-900 placeholder:text-gray-400 h-14 text-lg rounded-xl shadow-sm"
          disabled={loading}
        />
        
        <Button
          onClick={handleLogin}
          disabled={loading || !username.trim()}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-400 to-pink-400 hover:from-cyan-500 hover:to-pink-500 text-white rounded-xl shadow-lg"
        >
          {loading ? 'Entrando...' : '🚀 Ingresar'}
        </Button>
      </div>

      {/* Welcome Message */}
      <div className="mt-12 text-center">
        <p className="text-cyan-500 font-semibold text-sm">
          ✨ ¡Bienvenido a Lluvia Live! ✨
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Únete a miles de personas en salas de voz
        </p>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-10 left-10 w-20 h-20 bg-cyan-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
    </div>
  );
};

export default LoginPage;
