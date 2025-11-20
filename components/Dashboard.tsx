import React from 'react';
import { User, Profile, ProxyItem } from '../types';
import { Users, Monitor, Globe, ShieldAlert, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  users: User[];
  profiles: Profile[];
  proxies: ProxyItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ users, profiles, proxies }) => {
  const activeUsers = users.filter(u => u.status === 'ativo').length;
  const activeProfiles = profiles.filter(p => p.status === 'salvo' || p.status === 'rodando').length;
  const totalProxies = proxies.length;

  const data = [
    { name: 'Usuários', value: users.length, color: '#f97316' },
    { name: 'Perfis', value: profiles.length, color: '#ea580c' },
    { name: 'Proxies', value: proxies.length, color: '#c2410c' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Visão Geral</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500">
            <Users size={32} />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-medium">Total de Usuários</p>
            <h3 className="text-2xl font-bold text-white">{users.length}</h3>
            <p className="text-xs text-green-500 mt-1">{activeUsers} Ativos</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
            <Monitor size={32} />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-medium">Perfis</p>
            <h3 className="text-2xl font-bold text-white">{profiles.length}</h3>
            <p className="text-xs text-blue-400 mt-1">{activeProfiles} Prontos/Em Uso</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
            <Globe size={32} />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-medium">Proxies</p>
            <h3 className="text-2xl font-bold text-white">{totalProxies}</h3>
            <p className="text-xs text-zinc-500 mt-1">IPs Disponíveis</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={20} className="text-orange-500"/> Atividade do Sistema
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-500"/> Alertas Recentes
            </h3>
            <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <div className="h-2 w-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                        <p className="text-sm text-white font-medium">Falha na Conexão Proxy</p>
                        <p className="text-xs text-zinc-400">192.168.1.10 não respondeu (2m atrás)</p>
                    </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                        <p className="text-sm text-white font-medium">Assinatura Expirando</p>
                        <p className="text-xs text-zinc-400">Usuário 'cliente1' expira em 30 dias</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};