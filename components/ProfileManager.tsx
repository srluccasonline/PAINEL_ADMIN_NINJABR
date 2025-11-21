
import React, { useState } from 'react';
import { Profile, AppItem, Tag } from '../types';
import { Plus, Save, Loader2, Edit2, Trash2, Ban, ShieldAlert, LayoutGrid, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { TagManager } from './TagManager';

interface ProfileManagerProps {
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  proxies: any[];
  apps: AppItem[];
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ profiles, setProfiles, apps, tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  // Removed Group/Category State
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bannerUrl, setBannerUrl] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Confirmation Modal
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
          setSelectedTags(profile.tags);
          setBannerUrl(profile.banner || '');
          setSelectedAppIds(profile.appIds || []);
      } else {
          resetForm();
          setEditingId(null);
      }
      setIsModalOpen(true);
  };

  const resetForm = () => {
      setName('');
      setSelectedTags([]);
      setBannerUrl('');
      setSelectedAppIds([]);
  };

  const handleSaveProfile = () => {
    if (!name) return;
    
    const profileData: Partial<Profile> = {
        name,
        tags: selectedTags,
        banner: bannerUrl,
        appIds: selectedAppIds
    };

    if (editingId) {
        setProfiles(prev => prev.map(p => p.id === editingId ? { ...p, ...profileData } as Profile : p));
    } else {
        const newProfile: Profile = {
            id: Date.now().toString(),
            status: 'criado',
            ...profileData as any
        };
        setProfiles(prev => [...prev, newProfile]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteClick = (id: string) => {
      setConfirmModal({
          isOpen: true,
          title: 'Excluir Grupo',
          message: 'ATENÇÃO: Ao apagar este grupo, todos os usuários vinculados a ele perderão o acesso a este pacote de apps. Deseja continuar?',
          isDanger: true,
          action: () => {
             setProfiles(prev => prev.filter(p => p.id !== id));
             setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleDisableClick = (id: string, currentStatus: string) => {
      if (currentStatus === 'desabilitado') {
          setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'salvo' } : p));
          return;
      }

      setConfirmModal({
        isOpen: true,
        title: 'Desabilitar Grupo',
        message: 'Usuários vinculados não conseguirão acessar os apps deste grupo. Confirmar?',
        isDanger: false,
        action: () => {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'desabilitado' } : p));
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const toggleTag = (tagId: string) => {
      setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };
  
  const toggleApp = (appId: string) => {
      setSelectedAppIds(prev => prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]);
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Grupos</h2>
                <p className="text-zinc-400 text-sm mt-1">Organize seus apps em pacotes para distribuir aos usuários</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <Plus size={18} /> Novo Grupo
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map(profile => {
                const isDisabled = profile.status === 'desabilitado';
                const profileApps = apps.filter(a => profile.appIds?.includes(a.id));

                return (
                    <div key={profile.id} className={`bg-zinc-900 border ${isDisabled ? 'border-red-900/30 opacity-75' : 'border-zinc-800 hover:border-zinc-700'} rounded-xl overflow-hidden flex flex-col transition-all relative group shadow-lg`}>
                        
                        {/* Banner */}
                        <div className="h-24 bg-zinc-800 relative overflow-hidden">
                            {profile.banner ? (
                                <img src={profile.banner} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-zinc-800 to-zinc-900 flex items-center justify-center">
                                    <LayoutGrid className="text-zinc-700" size={40} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded bg-black/50 backdrop-blur text-white uppercase border border-white/10`}>
                                    {profile.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className={`text-xl font-bold ${isDisabled ? 'text-zinc-500 line-through' : 'text-white'}`}>{profile.name}</h3>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {profile.tags.map(tagId => {
                                    const t = tags.find(mt => mt.id === tagId);
                                    return t ? <span key={tagId} className={`text-[10px] px-2 py-0.5 rounded border ${t.color}`}>{t.label}</span> : null;
                                })}
                            </div>

                            {/* Apps Preview */}
                            <div className="mb-4 flex-1">
                                <p className="text-xs text-zinc-500 mb-2 font-bold uppercase">Apps Incluídos ({profileApps.length})</p>
                                <div className="flex flex-wrap gap-2">
                                    {profileApps.slice(0, 5).map(app => (
                                        <div key={app.id} className="bg-zinc-950 border border-zinc-800 p-1.5 rounded-md flex items-center gap-2" title={app.name}>
                                            {app.icon ? (
                                                <img src={app.icon} className="w-4 h-4 rounded-sm object-cover" alt=""/>
                                            ) : (
                                                <div className="w-4 h-4 bg-zinc-800 rounded-sm flex items-center justify-center text-[8px] font-bold text-zinc-500">
                                                    {app.name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="text-xs text-zinc-300 truncate max-w-[80px]">{app.name}</span>
                                        </div>
                                    ))}
                                    {profileApps.length > 5 && (
                                        <div className="bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-md text-xs text-zinc-500 flex items-center">
                                            +{profileApps.length - 5}
                                        </div>
                                    )}
                                    {profileApps.length === 0 && <span className="text-xs text-zinc-600 italic">Nenhum app selecionado.</span>}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end mt-auto">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleOpenModal(profile)} className="p-2 text-zinc-500 hover:text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDisableClick(profile.id, profile.status)} className={`p-2 transition-colors bg-zinc-950 hover:bg-zinc-800 rounded-lg ${isDisabled ? 'text-green-500' : 'text-zinc-500 hover:text-yellow-500'}`}>
                                        <Ban size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(profile.id)} className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Grupo" : "Novo Grupo"}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Grupo <span className="text-red-500">*</span></label>
                    <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Farm Facebook - Manhã" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Banner URL (Opcional)</label>
                    <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 text-xs" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="https://..." />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                        {tags.map(tag => (
                            <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedTags.includes(tag.id) ? `${tag.color} border-current` : 'bg-zinc-900 border-zinc-700 text-zinc-500 grayscale hover:grayscale-0'}`}>
                                {tag.label}
                            </button>
                        ))}
                        {tags.length === 0 && <span className="text-xs text-zinc-500">Nenhuma tag disponível.</span>}
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Selecione os Apps</label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {apps.map(app => {
                            const isSelected = selectedAppIds.includes(app.id);
                            return (
                                <div key={app.id} onClick={() => toggleApp(app.id)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-orange-500/10 border-orange-500' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-800 rounded overflow-hidden flex items-center justify-center border border-zinc-700">
                                            {app.icon ? (
                                                <img src={app.icon} className="w-full h-full object-cover" alt=""/>
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-500">{app.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{app.name}</p>
                                            <p className="text-xs text-zinc-600">{app.url}</p>
                                        </div>
                                    </div>
                                    {isSelected && <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                                </div>
                            );
                        })}
                        {apps.length === 0 && <p className="text-zinc-500 text-xs italic">Nenhum app criado. Vá na aba 'Meus Apps' primeiro.</p>}
                    </div>
                </div>

                <button onClick={handleSaveProfile} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2">
                    <Save size={18} /> {editingId ? "Salvar Alterações" : "Criar Grupo"}
                </button>
            </div>
        </Modal>

        <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} title={confirmModal.title}>
            <div className="text-center p-4">
                <ShieldAlert size={48} className={`mx-auto mb-4 ${confirmModal.isDanger ? 'text-red-500' : 'text-yellow-500'}`} />
                <p className="text-zinc-300 mb-6">{confirmModal.message}</p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 bg-zinc-800 py-2 rounded-lg text-white">Cancelar</button>
                    <button onClick={confirmModal.action} className={`flex-1 py-2 rounded-lg text-white font-bold ${confirmModal.isDanger ? 'bg-red-600' : 'bg-orange-600'}`}>Confirmar</button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
