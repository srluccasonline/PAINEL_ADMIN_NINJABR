import React, { useState } from 'react';
import { Shield, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState('');

  const handleSave = () => {
      if (newPass !== confirmPass) {
          setMsg('As novas senhas não coincidem.');
          return;
      }
      if (!currentPass) {
          setMsg('Digite a senha atual.');
          return;
      }
      setMsg('Senha atualizada com sucesso (Mock).');
      setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
       <h2 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Configurações Admin</h2>
       
       <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
           <div className="flex items-center gap-4 mb-6">
               <div className="p-4 bg-orange-600 rounded-full text-white">
                   <Shield size={32} />
               </div>
               <div>
                   <h3 className="text-xl font-bold text-white">Segurança</h3>
                   <p className="text-zinc-400 text-sm">Gerencie seu acesso administrativo</p>
               </div>
           </div>

           <div className="space-y-4">
               <div>
                   <label className="block text-sm text-zinc-400 mb-1">Senha Atual</label>
                   <input 
                    type="password" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                   />
               </div>
               <div>
                   <label className="block text-sm text-zinc-400 mb-1">Nova Senha</label>
                   <input 
                    type="password" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                   />
               </div>
               <div>
                   <label className="block text-sm text-zinc-400 mb-1">Confirmar Nova Senha</label>
                   <input 
                    type="password" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                   />
               </div>
           </div>

           {msg && (
               <div className={`text-sm font-medium ${msg.includes('sucesso') ? 'text-green-500' : 'text-red-500'}`}>
                   {msg}
               </div>
           )}

           <button onClick={handleSave} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold w-full py-3 rounded-lg transition-colors">
               <Save size={18} /> Atualizar Credenciais
           </button>
       </div>
    </div>
  );
};