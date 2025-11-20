
import React, { useState } from 'react';
import { Profile, ProxyItem } from '../types';
import { MOCK_GROUPS, MOCK_TAGS, MOCK_USER_AGENTS } from '../constants';
import { Plus, Play, Save, Monitor, Loader2, Tag as TagIcon, Edit2, Trash2, Ban, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ProfileManagerProps {
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  proxies: ProxyItem[];
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ profiles, setProfiles, proxies }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState(MOCK_GROUPS[0].id);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userAgent, setUserAgent] = useState(MOCK_USER_AGENTS[0].value);
  const [selectedProxy, setSelectedProxy] = useState<string>('');

  // Simulation State
  const [runningProfileId, setRunningProfileId] = useState<string | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      action: () => void;
      isDanger?: boolean;
  }>({ isOpen: false, title: '', message: '', action: () => {}, isDanger: false });


  const handleOpenModal = (profile?: Profile) => {
      if (profile) {
          setEditingId(profile.id);
          setName(profile.name);
          setGroup(profile.group);
          setSelectedTags(profile.tags);
          setUserAgent(profile.userAgent);
          setSelectedProxy(profile.proxyId || '');
      } else {
          resetForm();
          setEditingId(null);
      }
      setIsModalOpen(true);
  };

  const handleSaveProfile = () => {
    if (!name) return;
    
    if (editingId) {
        setProfiles(prev => prev.map(p => p.id === editingId ? {
            ...p,
            name,
            group,
            tags: selectedTags,
            userAgent,
            proxyId: selectedProxy || undefined
        } : p));
    } else {
        const newProfile: Profile = {
            id: Date.now().toString(),
            name,
            group,
            tags: selectedTags,
            userAgent,
            proxyId: selectedProxy || undefined,
            status: 'criado'
        };
        setProfiles(prev => [...prev, newProfile]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteClick = (id: string) => {
      setConfirmModal({
          isOpen: true,
          title: 'Excluir Perfil',
          message: 'ATENÇÃO: Ao apagar este perfil, todos os usuários vinculados a ele perderão o acesso a esta sessão. Isso pode causar erros para os clientes. Deseja continuar mesmo assim?',
          isDanger: true,
          action: () => {
             setProfiles(prev => prev.filter(p => p.id !== id));
             setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleDisableClick = (id: string, currentStatus: string) => {
      if (currentStatus === 'desabilitado') {
          // Re-enable immediately
          setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'salvo' } : p));
          return;
      }

      setConfirmModal({
        isOpen: true,
        title: 'Desabilitar Perfil',
        message: 'Desabilitar este perfil impedirá que qualquer usuário vinculado o utilize. Deseja confirmar?',
        isDanger: false,
        action: () => {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'desabilitado' } : p));
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const resetForm = () => {
      setName('');
      setGroup(MOCK_GROUPS[0].id);
      setSelectedTags([]);
      setUserAgent(MOCK_USER_AGENTS[0].value);
      setSelectedProxy('');
  };

  const toggleTag = (tagId: string) => {
      if (selectedTags.includes(tagId)) {
          setSelectedTags(prev => prev.filter(t => t !== tagId));
      } else {
          setSelectedTags(prev => [...prev, tagId]);
      }
  };

  const runBrowserSimulation = (id: string) => {
      if (runningProfileId) return;
      
      setRunningProfileId(id);
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'rodando' } : p));

      setTimeout(() => {
          setProfiles(prev => prev.map(p => 
             p.id === id ? { 
                 ...p, 
                 status: 'salvo', 
                 lastSession: new Date().toISOString() 
             } : p
          ));
          setRunningProfileId(null);
      }, 3000);
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Central de Perfis</h2>
                <p className="text-zinc-400 text-sm mt-1">Crie e aqueça perfis de navegador</p>
            </div>
            <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
            <Plus size={18} /> Novo Perfil
            </button>
        </div>

        <div className="space-y-4">
            {profiles.map(profile => {
                const currentProxy = proxies.find(p => p.id === profile.proxyId);
                const groupLabel = MOCK_GROUPS.find(g => g.id === profile.group)?.label;
                const isDisabled = profile.status === 'desabilitado';
                
                return (
                    <div key={profile.id} className={`bg-zinc-900 border ${isDisabled ? 'border-red-900/30 opacity-75' : 'border-zinc-800 hover:border-zinc-700'} p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all relative group`}>
                        
                        {/* Info Section */}
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                                profile.status === 'rodando' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 
                                profile.status === 'salvo' ? 'bg-green-500/20 text-green-400' : 
                                isDisabled ? 'bg-red-500/10 text-red-500' :
                                'bg-zinc-800 text-zinc-400'
                            }`}>
                                {isDisabled ? <Ban size={24} /> : <Monitor size={24} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-lg font-bold ${isDisabled ? 'text-zinc-500 line-through' : 'text-white'}`}>{profile.name}</h3>
                                    <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{groupLabel}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.tags.map(tagId => {
                                        const t = MOCK_TAGS.find(mt => mt.id === tagId);
                                        return t ? (
                                            <span key={tagId} className={`text-xs px-2 py-0.5 rounded-full ${t.color} flex items-center gap-1`}>
                                                <TagIcon size={10} /> {t.label}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                                <div className="text-xs text-zinc-500 mt-2 font-mono">
                                    {currentProxy ? `Proxy: ${currentProxy.name} (${currentProxy.ip})` : 'Conexão Direta'}
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pl-0 lg:pl-4 lg:border-l border-zinc-800">
                            <div className="text-right mr-4 hidden lg:block">
                                <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Status</div>
                                <div className={`font-medium ${
                                    profile.status === 'salvo' ? 'text-green-500' : 
                                    isDisabled ? 'text-red-500' :
                                    'text-yellow-500'
                                }`}>
                                    {profile.status === 'rodando' ? 'Navegando...' : profile.status.toUpperCase()}
                                </div>
                                {profile.lastSession && (
                                    <div className="text-[10px] text-zinc-600">
                                        Último: {new Date(profile.lastSession).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => runBrowserSimulation(profile.id)}
                                    disabled={runningProfileId !== null || isDisabled}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                        profile.status === 'rodando' 
                                        ? 'bg-blue-600 text-white cursor-not-allowed' 
                                        : isDisabled 
                                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                                    }`}
                                    title={isDisabled ? "Perfil desabilitado" : "Abrir Navegador"}
                                >
                                    {profile.status === 'rodando' ? (
                                        <> <Loader2 size={18} className="animate-spin" /> Navegando... </>
                                    ) : (
                                        <> <Play size={18} className={isDisabled ? "text-zinc-600" : "text-orange-500"} /> Browser </>
                                    )}
                                </button>

                                <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-800">
                                    <button onClick={() => handleOpenModal(profile)} className="p-2 text-zinc-400 hover:text-orange-500 hover:bg-zinc-900 rounded-l-lg transition-colors" title="Editar">
                                        <Edit2 size={18} />
                                    </button>
                                    <div className="w-px h-4 bg-zinc-800"></div>
                                    <button onClick={() => handleDisableClick(profile.id, profile.status)} className={`p-2 transition-colors hover:bg-zinc-900 ${isDisabled ? 'text-green-500 hover:text-green-400' : 'text-zinc-400 hover:text-yellow-500'}`} title={isDisabled ? "Habilitar" : "Desabilitar"}>
                                        <Ban size={18} />
                                    </button>
                                    <div className="w-px h-4 bg-zinc-800"></div>
                                    <button onClick={() => handleDeleteClick(profile.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-900 rounded-r-lg transition-colors" title="Apagar">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {profiles.length === 0 && (
                <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                    Nenhum perfil encontrado. Crie um para começar.
                </div>
            )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Perfil" : "Criar Perfil"}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Perfil <span className="text-red-500">*</span></label>
                    <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" value={name} onChange={e => setName(e.target.value)} placeholder="Meu Perfil" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Grupo</label>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" value={group} onChange={e => setGroup(e.target.value)}>
                        {MOCK_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {MOCK_TAGS.map(tag => (
                            <button 
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                    selectedTags.includes(tag.id) 
                                    ? `${tag.color} border-current` 
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                }`}
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-medium text-zinc-400 mb-1">Proxy</label>
                     <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" value={selectedProxy} onChange={e => setSelectedProxy(e.target.value)}>
                        <option value="">Sem Proxy (Conexão Direta)</option>
                        {proxies.map(p => <option key={p.id} value={p.id}>{p.name} - {p.ip}</option>)}
                     </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">User Agent</label>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 text-xs truncate" value={userAgent} onChange={e => setUserAgent(e.target.value)}>
                        {MOCK_USER_AGENTS.map(ua => <option key={ua.id} value={ua.value}>{ua.label}</option>)}
                    </select>
                </div>

                <button onClick={handleSaveProfile} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2">
                    <Save size={18} /> {editingId ? "Salvar Alterações" : "Criar Perfil"}
                </button>
            </div>
        </Modal>

        {/* Confirmation Modal */}
        <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} title={confirmModal.title}>
          <div className="space-y-4 text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${confirmModal.isDanger ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  <ShieldAlert size={24} />
              </div>
              <p className="text-zinc-300">{confirmModal.message}</p>
              <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg transition-colors"
                  >
                      Cancelar
                  </button>
                  <button 
                    onClick={confirmModal.action}
                    className={`flex-1 text-white py-2 rounded-lg transition-colors ${confirmModal.isDanger ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'}`}
                  >
                      Confirmar
                  </button>
              </div>
          </div>
        </Modal>
    </div>
  );
};
