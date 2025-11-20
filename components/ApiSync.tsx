
import React, { useState, useEffect } from 'react';
import { RemoteConfig } from '../types';
import { Eye, EyeOff, RefreshCw, Copy, Save, Key, Cast, Smartphone, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Modal } from './ui/Modal';

export const ApiSync: React.FC = () => {
  // State for API Key
  const [apiKey, setApiKey] = useState('nj_live_8x92m29384m2938472938472398472398');
  const [showKey, setShowKey] = useState(false);
  const [confirmRegenModal, setConfirmRegenModal] = useState(false);

  // State for Remote Config
  const [remoteConfig, setRemoteConfig] = useState<Omit<RemoteConfig, 'apiKey'>>({
      remoteUser: 'admin_remote',
      remotePass: 'ninja_remote_pass_123'
  });
  const [showRemotePass, setShowRemotePass] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // State for PIN
  const [pin, setPin] = useState('0000');
  const [pinTimeLeft, setPinTimeLeft] = useState(60);

  // Effects
  useEffect(() => {
    // Initial PIN generation
    generateNewPin();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
        setPinTimeLeft((prev) => {
            if (prev <= 1) {
                generateNewPin();
                return 60;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [pin]);

  // Handlers
  const generateNewPin = () => {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      setPin(newPin);
      setPinTimeLeft(60);
  };

  const regenerateApiKey = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = 'nj_live_';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setApiKey(result);
      setConfirmRegenModal(false);
  };

  const handleSaveRemote = () => {
      setSaveMsg('Credenciais salvas com sucesso!');
      setTimeout(() => setSaveMsg(''), 3000);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      // Could add a toast here
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
            <h2 className="text-3xl font-bold text-white">API & Sincronização</h2>
            <p className="text-zinc-400 text-sm mt-1">Conecte o NinjaBR a aplicações externas e ao Navegador</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: API Key */}
            <div className="space-y-8">
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Key size={120} className="text-orange-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Key className="text-orange-500" size={20} /> Chave de API (Master)
                        </h3>
                        <p className="text-zinc-400 text-sm mb-4">
                            Use esta chave para autenticar requisições HTTP para a API do NinjaBR. Mantenha-a secreta.
                        </p>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-1 flex items-center">
                            <input 
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                readOnly
                                className="bg-transparent border-none focus:ring-0 flex-1 text-zinc-300 font-mono px-3 text-sm"
                            />
                            <button onClick={() => setShowKey(!showKey)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button onClick={() => copyToClipboard(apiKey)} className="p-2 text-zinc-500 hover:text-white transition-colors" title="Copiar">
                                <Copy size={18} />
                            </button>
                        </div>

                        <div className="mt-4">
                            <button 
                                onClick={() => setConfirmRegenModal(true)}
                                className="text-xs text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1"
                            >
                                <RefreshCw size={12} /> Gerar nova chave
                            </button>
                        </div>
                    </div>
                </section>

                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Cast className="text-blue-500" size={20} /> Credenciais de Acesso Remoto
                    </h3>
                    <p className="text-zinc-400 text-sm mb-6">
                        Logue com estas credenciais no seu navegador NinjaBR. O sistema identificará o acesso administrativo e solicitará o <strong>PIN de pareamento</strong> para iniciar a sincronização dos perfis.
                    </p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Administrador Remoto</label>
                            <input 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                value={remoteConfig.remoteUser}
                                onChange={e => setRemoteConfig({...remoteConfig, remoteUser: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Senha Remota</label>
                            <div className="relative">
                                <input 
                                    type={showRemotePass ? "text" : "password"}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 pr-10"
                                    value={remoteConfig.remotePass}
                                    onChange={e => setRemoteConfig({...remoteConfig, remotePass: e.target.value})}
                                />
                                <button 
                                    onClick={() => setShowRemotePass(!showRemotePass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                >
                                    {showRemotePass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                             <span className="text-sm text-green-500 font-medium">{saveMsg}</span>
                             <button 
                                onClick={handleSaveRemote}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                             >
                                 <Save size={16} /> Salvar Config
                             </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Right Column: Pairing PIN */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                 {/* Decorative background */}
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-zinc-900/0 to-zinc-900/0"></div>

                 <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-zinc-950 shadow-xl">
                        <Smartphone size={36} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Pareamento Rápido</h3>
                    <p className="text-zinc-400 max-w-xs mx-auto mt-2">
                        Digite este PIN quando solicitado no navegador para confirmar a conexão segura (WebSocket).
                    </p>
                 </div>

                 <div className="relative z-10 my-6">
                     <div className="text-7xl font-black tracking-widest text-white font-mono bg-zinc-950 px-8 py-6 rounded-2xl border border-zinc-800 shadow-2xl select-all">
                         {pin}
                     </div>
                 </div>

                 <div className="relative z-10 w-full max-w-xs">
                     <div className="flex justify-between text-xs text-zinc-500 mb-1 font-mono uppercase">
                         <span>Expira em</span>
                         <span>{pinTimeLeft}s</span>
                     </div>
                     <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-orange-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(pinTimeLeft / 60) * 100}%` }}
                         ></div>
                     </div>
                     <button 
                        onClick={generateNewPin}
                        className="mt-6 text-sm text-zinc-500 hover:text-white underline decoration-zinc-700 hover:decoration-white transition-all"
                     >
                         Gerar novo código agora
                     </button>
                 </div>

                 <div className="mt-12 flex items-center gap-2 text-xs text-zinc-600 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800">
                     <ShieldCheck size={14} className="text-green-500" /> Conexão Criptografada (TLS 1.3)
                 </div>
            </div>
        </div>

        {/* Regenerate Confirm Modal */}
        <Modal isOpen={confirmRegenModal} onClose={() => setConfirmRegenModal(false)} title="Renovar Chave de API">
            <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert size={24} />
                </div>
                <p className="text-zinc-300 mb-6">
                    Ao gerar uma nova chave, todas as aplicações conectadas atualmente pararão de funcionar até que sejam atualizadas com a nova chave.
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmRegenModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg">Cancelar</button>
                    <button onClick={regenerateApiKey} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold">Gerar Nova Chave</button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
