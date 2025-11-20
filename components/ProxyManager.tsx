
import React, { useState } from 'react';
import { ProxyItem, ProxyType } from '../types';
import { Plus, Trash2, Globe, Server, Edit2, Wifi, WifiOff, RefreshCw, Activity, Loader2 } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ProxyManagerProps {
  proxies: ProxyItem[];
  setProxies: React.Dispatch<React.SetStateAction<ProxyItem[]>>;
}

export const ProxyManager: React.FC<ProxyManagerProps> = ({ proxies, setProxies }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [proxyForm, setProxyForm] = useState<Partial<ProxyItem>>({ type: ProxyType.HTTP });
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  const handleOpenModal = (proxy?: ProxyItem) => {
      if (proxy) {
          setEditingId(proxy.id);
          setProxyForm({ ...proxy });
      } else {
          setEditingId(null);
          setProxyForm({ type: ProxyType.HTTP });
      }
      setIsModalOpen(true);
  };

  const handleSaveProxy = () => {
    if (!proxyForm.name || !proxyForm.ip || !proxyForm.port) return;
    
    if (editingId) {
        setProxies(prev => prev.map(p => p.id === editingId ? { ...p, ...proxyForm } as ProxyItem : p));
    } else {
        const item: ProxyItem = {
            id: Date.now().toString(),
            name: proxyForm.name,
            ip: proxyForm.ip,
            port: proxyForm.port,
            type: proxyForm.type || ProxyType.HTTP,
            username: proxyForm.username,
            password: proxyForm.password,
            status: 'unknown'
        };
        setProxies(prev => [...prev, item]);
    }

    setIsModalOpen(false);
    setProxyForm({ type: ProxyType.HTTP });
  };

  const handleDelete = (id: string) => {
    if(confirm("Tem certeza que deseja excluir este proxy?")) {
        setProxies(prev => prev.filter(p => p.id !== id));
    }
  };

  // Mock Ping Function
  const checkProxy = async (id: string) => {
      // Set status to checking
      setProxies(prev => prev.map(p => p.id === id ? { ...p, status: 'checking' } : p));

      // Simulate network delay (500ms to 2000ms)
      const delay = Math.floor(Math.random() * 1500) + 500;
      
      return new Promise<void>(resolve => {
          setTimeout(() => {
              // 80% chance of success for mock
              const isOnline = Math.random() > 0.2;
              const latency = isOnline ? Math.floor(Math.random() * 300) + 20 : undefined;

              setProxies(prev => prev.map(p => p.id === id ? { 
                  ...p, 
                  status: isOnline ? 'online' : 'offline',
                  latency: latency,
                  lastCheck: new Date().toISOString()
              } : p));
              resolve();
          }, delay);
      });
  };

  const handleCheckAll = async () => {
      setIsCheckingAll(true);
      const promises = proxies.map(p => checkProxy(p.id));
      await Promise.all(promises);
      setIsCheckingAll(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Gerenciamento de Proxy</h2>
            <p className="text-zinc-400 text-sm mt-1">Gerencie seus gateways de conexão</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleCheckAll}
                disabled={isCheckingAll || proxies.length === 0}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors border border-zinc-700"
            >
                {isCheckingAll ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />} 
                {isCheckingAll ? 'Testando...' : 'Testar Todos'}
            </button>
            <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
            <Plus size={18} /> Adicionar Proxy
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proxies.map(proxy => (
          <div key={proxy.id} className="bg-zinc-900 border border-zinc-800 rounded-xl relative group hover:border-orange-500/50 transition-all flex flex-col">
             {/* Header do Card */}
             <div className="p-5 pb-3">
                <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => checkProxy(proxy.id)} disabled={proxy.status === 'checking'} className="p-1 text-zinc-500 hover:text-blue-400 bg-zinc-950/50 rounded hover:bg-zinc-800 transition-colors" title="Testar Conexão">
                        <RefreshCw size={16} className={proxy.status === 'checking' ? 'animate-spin' : ''} />
                    </button>
                    <div className="w-px h-6 bg-zinc-800 mx-1"></div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(proxy)} className="p-1 text-zinc-500 hover:text-orange-500 hover:bg-zinc-800 rounded transition-colors">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(proxy.id)} className="p-1 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-zinc-800 rounded-lg text-orange-500">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white max-w-[150px] truncate" title={proxy.name}>{proxy.name}</h3>
                        <span className="text-xs font-mono text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                            {proxy.type}
                        </span>
                    </div>
                </div>

                <div className="space-y-1 text-sm text-zinc-400 font-mono bg-black/20 p-3 rounded-lg border border-zinc-800/50">
                    <div className="flex justify-between">
                        <span>IP:</span> <span className="text-zinc-300">{proxy.ip}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Porta:</span> <span className="text-zinc-300">{proxy.port}</span>
                    </div>
                    {proxy.username && (
                        <div className="flex justify-between">
                            <span>User:</span> <span className="text-zinc-500">{proxy.username}</span>
                        </div>
                    )}
                </div>
             </div>

             {/* Footer do Status */}
             <div className="mt-auto border-t border-zinc-800 p-3 bg-zinc-950/30 rounded-b-xl">
                 <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        {proxy.status === 'checking' && (
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Loader2 size={14} className="animate-spin" />
                                <span>Verificando...</span>
                            </div>
                        )}
                        {proxy.status === 'online' && (
                            <div className="flex items-center gap-2 text-green-500">
                                <Wifi size={14} />
                                <span className="font-bold">Online</span>
                                <span className="text-zinc-500 font-mono">({proxy.latency}ms)</span>
                            </div>
                        )}
                        {proxy.status === 'offline' && (
                            <div className="flex items-center gap-2 text-red-500">
                                <WifiOff size={14} />
                                <span className="font-bold">Offline</span>
                            </div>
                        )}
                        {proxy.status === 'unknown' && (
                             <div className="flex items-center gap-2 text-zinc-500">
                                <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                                <span>Não testado</span>
                             </div>
                        )}
                    </div>
                    {proxy.lastCheck && (
                        <span className="text-zinc-600 text-[10px]">
                            {new Date(proxy.lastCheck).toLocaleTimeString()}
                        </span>
                    )}
                 </div>
             </div>
          </div>
        ))}

        {proxies.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl">
                <Server size={48} className="mb-4 opacity-50" />
                <p>Nenhum proxy adicionado ainda.</p>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Proxy" : "Adicionar Novo Proxy"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Proxy <span className="text-red-500">*</span></label>
            <input 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="ex: US - Residencial 1"
                value={proxyForm.name || ''}
                onChange={e => setProxyForm({...proxyForm, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Endereço IP <span className="text-red-500">*</span></label>
                <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 font-mono"
                    placeholder="192.168.1.1"
                    value={proxyForm.ip || ''}
                    onChange={e => setProxyForm({...proxyForm, ip: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Porta <span className="text-red-500">*</span></label>
                <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 font-mono"
                    placeholder="8080"
                    value={proxyForm.port || ''}
                    onChange={e => setProxyForm({...proxyForm, port: e.target.value})}
                />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-zinc-400 mb-1">Protocolo</label>
             <select 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                value={proxyForm.type}
                onChange={e => setProxyForm({...proxyForm, type: e.target.value as ProxyType})}
             >
                 {Object.values(ProxyType).map(t => (
                     <option key={t} value={t}>{t}</option>
                 ))}
             </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Usuário (Opcional)</label>
                <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                    value={proxyForm.username || ''}
                    onChange={e => setProxyForm({...proxyForm, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Senha (Opcional)</label>
                <input 
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                    value={proxyForm.password || ''}
                    onChange={e => setProxyForm({...proxyForm, password: e.target.value})}
                />
              </div>
          </div>

          <button 
             className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-lg mt-4 transition-colors"
             onClick={handleSaveProxy}
          >
              {editingId ? "Salvar Alterações" : "Salvar Proxy"}
          </button>
        </div>
      </Modal>
    </div>
  );
};