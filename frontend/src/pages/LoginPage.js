import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginPage = ({ onLogin, API }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-6xl mb-8 animate-bounce">
        ☔
      </div>

      {/* Title */}
      <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
        Lluvia Live
      </h1>
      
      <p className="text-gray-300 text-lg mb-12">
        Conecta, Chatea, Vive
      </p>

      {/* Login Form */}
      <div className="w-full max-w-md space-y-4">
        <Input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          className="bg-slate-800/50 border-pink-500/50 text-white placeholder:text-gray-400 h-14 text-lg"
          disabled={loading}
        />
        
        <Button
          onClick={handleLogin}
          disabled={loading || !username.trim()}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          🚀 Ingresar
        </Button>
      </div>

      {/* Welcome Message */}
      <p className="text-yellow-300 text-sm mt-8">
        ✨ ¡Bienvenido a Lluvia Live! ✨
      </p>
    </div>
  );
};

export default LoginPage;
