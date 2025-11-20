
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, RefreshCw, Copy, Key, Cast, ShieldCheck, ShieldAlert, Clock, Shield } from 'lucide-react';
import { Modal } from './ui/Modal';

export const ApiSync: React.FC = () => {
  // State for API Key
  const [apiKey, setApiKey] = useState('nj_live_8x92m29384m2938472938472398472398');
  const [showKey, setShowKey] = useState(false);
  const [confirmRegenModal, setConfirmRegenModal] = useState(false);

  // State for Remote Config (Admin ID)
  const [remoteAdminId, setRemoteAdminId] = useState('');
  const [showAdminId, setShowAdminId] = useState(false); // Added state to hide ID
  const [adminIdExpiry, setAdminIdExpiry] = useState<number>(0); // Timestamp
  const [rotationTimerDisplay, setRotationTimerDisplay] = useState('24:00:00');
  const [confirmNewIdModal, setConfirmNewIdModal] = useState(false);

  // State for PIN
  const [pin, setPin] = useState('0000');
  const [pinTimeLeft, setPinTimeLeft] = useState(60);

  // --- Logic Functions ---

  const generateLongRemoteId = useCallback(() => {
      const prefix = 'ninja_admin_';
      // Generate a longer, more complex hex string (32 chars)
      const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const newId = `${prefix}${randomHex}`;
      
      setRemoteAdminId(newId);
      // Set expiry to 24 hours from now
      setAdminIdExpiry(Date.now() + 24 * 60 * 60 * 1000);
  }, []);

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

  const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      // Could add a toast here
  };

  // --- Effects ---

  useEffect(() => {
    generateNewPin();
    generateLongRemoteId();
  }, [generateLongRemoteId]);

  // PIN Countdown
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

  // Admin ID Rotation Countdown
  useEffect(() => {
      const timer = setInterval(() => {
          if (adminIdExpiry > 0) {
              const timeLeft = adminIdExpiry - Date.now();
              if (timeLeft <= 0) {
                  generateLongRemoteId(); // Auto rotate
              } else {
                  setRotationTimerDisplay(formatTime(timeLeft));
              }
          }
      }, 1000);
      return () => clearInterval(timer);
  }, [adminIdExpiry, generateLongRemoteId]);


  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
            <h2 className="text-3xl font-bold text-white">API & Sincronização</h2>
            <p className="text-zinc-400 text-sm mt-1">Conecte o NinjaBR a aplicações externas e ao Navegador</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: API Key & Remote ID */}
            <div className="space-y-8">
                {/* API Key Section */}
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

                {/* Remote Admin ID Section */}
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield size={120} className="text-blue-500" />
                    </div>
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                        <Cast className="text-blue-500" size={20} /> Acesso Remoto (Browser)
                    </h3>
                    <div className="relative z-10">
                        <p className="text-zinc-400 text-sm mb-6">
                            O ID Administrativo deve ser inserido no campo <strong>Login</strong> do navegador NinjaBR. Mantenha este ID protegido.
                        </p>
                        
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                             <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-zinc-500 uppercase">ID Administrativo</label>
                                <div className="flex items-center gap-1.5 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                    <Clock size={10} />
                                    <span className="font-mono tracking-wide">Renova em: {rotationTimerDisplay}</span>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-2 bg-black/50 rounded border border-zinc-800">
                                 <input 
                                    type={showAdminId ? "text" : "password"}
                                    value={remoteAdminId}
                                    readOnly
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono text-sm p-3"
                                 />
                                 <button onClick={() => setShowAdminId(!showAdminId)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                                     {showAdminId ? <EyeOff size={18} /> : <Eye size={18} />}
                                 </button>
                                 <div className="w-px h-6 bg-zinc-800"></div>
                                 <button onClick={() => copyToClipboard(remoteAdminId)} className="p-3 text-zinc-400 hover:text-white transition-colors" title="Copiar ID">
                                    <Copy size={18} />
                                 </button>
                             </div>
                        </div>

                         <div className="mt-4 flex justify-end">
                            <button 
                                onClick={() => setConfirmNewIdModal(true)}
                                className="text-xs text-zinc-500 hover:text-white font-medium flex items-center gap-1 transition-colors"
                            >
                                <RefreshCw size={12} /> Gerar novo ID manualmente
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Right Column: Pairing Password */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
                 {/* Decorative background */}
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-zinc-900/0 to-zinc-900/0"></div>

                 <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-zinc-950 shadow-xl relative">
                        <Key size={36} className="text-white" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Senha de Pareamento</h3>
                    <p className="text-zinc-400 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
                        O ID Administrativo (ao lado) vai no campo <strong>Login</strong>, e esta Senha de Pareamento deve ser inserida no campo <strong>Senha</strong> do navegador NinjaBR.
                    </p>
                 </div>

                 <div className="relative z-10 my-6">
                     <div className="text-8xl font-black tracking-widest text-white font-mono bg-zinc-950 px-10 py-8 rounded-2xl border border-zinc-800 shadow-2xl select-all flex gap-2 items-center justify-center">
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
                            className={`h-full transition-all duration-1000 ease-linear ${pinTimeLeft < 10 ? 'bg-red-500' : 'bg-orange-500'}`}
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
                     <ShieldCheck size={14} className="text-green-500" /> Conexão Segura Ativa
                 </div>
            </div>
        </div>

        {/* Regenerate API Key Modal */}
        <Modal isOpen={confirmRegenModal} onClose={() => setConfirmRegenModal(false)} title="Renovar Chave de API">
            <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert size={24} />
                </div>
                <p className="text-zinc-300 mb-6">
                    Ao gerar uma nova chave, todas as integrações API pararão de funcionar até serem atualizadas.
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmRegenModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg">Cancelar</button>
                    <button onClick={regenerateApiKey} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold">Gerar Nova Chave</button>
                </div>
            </div>
        </Modal>

        {/* Regenerate Remote ID Modal */}
        <Modal isOpen={confirmNewIdModal} onClose={() => setConfirmNewIdModal(false)} title="Novo ID de Administrador">
            <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <RefreshCw size={24} />
                </div>
                <p className="text-zinc-300 mb-6">
                    Isso invalidará o ID atual. Você precisará atualizar o ID no navegador NinjaBR para reconectar.
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmNewIdModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg">Cancelar</button>
                    <button onClick={() => { generateLongRemoteId(); setConfirmNewIdModal(false); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold">Gerar Novo ID</button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
