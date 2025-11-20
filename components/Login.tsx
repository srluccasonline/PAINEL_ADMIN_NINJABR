import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      onLogin();
    } else {
      setError('Credenciais inválidas. Tente admin / 1234');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-900/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md p-8 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Ninja<span className="text-orange-600">BR</span>
          </h1>
          <p className="text-zinc-500">Painel MultiLogin Seguro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Usuário</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <User size={18} />
              </div>
              <input
                type="text"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600 transition-all"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600 transition-all"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-orange-900/20"
          >
            Entrar no Painel
          </button>

          <div className="text-center mt-4">
            <span className="text-zinc-600 text-sm">Padrão: admin / 1234</span>
          </div>
        </form>
      </div>
    </div>
  );
};