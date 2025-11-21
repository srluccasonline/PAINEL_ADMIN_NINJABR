
import React, { useState } from 'react';
import { AppItem, ProxyItem, Tag } from '../types';
import { MOCK_USER_AGENTS } from '../constants';
import { Plus, Edit2, Trash2, Play, Monitor, Globe, Ban, Shield, Box, ExternalLink, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Modal } from './ui/Modal';
import { TagManager } from './TagManager';

interface AppManagerProps {
  apps: AppItem[];
  setApps: React.Dispatch<React.SetStateAction<AppItem[]>>;
  proxies: ProxyItem[];
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

type IconSource = 'none' | 'favicon' | 'custom';

export const AppManager: React.FC<AppManagerProps> = ({ apps, setApps, proxies, tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AppItem>>({
      userAgent: MOCK_USER_AGENTS[0].value,
      blockedElements: [],
      tags: []
  });
  const [tempBlockElement, setTempBlockElement] = useState('');
  
  // Icon Logic State
  const [iconSource, setIconSource] = useState<IconSource>('none');
  const [customIconUrl, setCustomIconUrl] = useState('');

  // Simulation
  const [launchingAppId, setLaunchingAppId] = useState<string | null>(null);

  const handleOpenModal = (app?: AppItem) => {
      if (app) {
          setEditingId(app.id);
          setFormData({ ...app });
          
          // Determine initial icon state based on existing data
          if (!app.icon) {
              setIconSource('none');
              setCustomIconUrl('');
          } else if (app.icon.includes('google.com/s2/favicons')) {
              setIconSource('favicon');
              setCustomIconUrl('');
          } else {
              setIconSource('custom');
              setCustomIconUrl(app.icon);
          }

      } else {
          setEditingId(null);
          setFormData({
              userAgent: MOCK_USER_AGENTS[0].value,
              blockedElements: [],
              tags: [],
              url: 'https://',
              name: ''
          });
          setIconSource('none');
          setCustomIconUrl('');
      }
      setIsModalOpen(true);
  };

  const getFaviconUrl = (url: string) => {
      try {
          const domain = new URL(url).hostname;
          return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
          return '';
      }
  };

  const getSafeHostname = (url: string | undefined) => {
    if (!url) return '...';
    try {
        return new URL(url).hostname;
    } catch {
        return 'URL Inválida';
    }
  };

  const handleSave = () => {
      if (!formData.name || !formData.url) return;

      // Resolve Icon
      let finalIcon = '';
      if (iconSource === 'favicon') {
          finalIcon = getFaviconUrl(formData.url);
      } else if (iconSource === 'custom') {
          finalIcon = customIconUrl;
      } else {
          finalIcon = ''; // None
      }

      if (editingId) {
          setApps(prev => prev.map(a => a.id === editingId ? { ...a, ...formData, icon: finalIcon } as AppItem : a));
      } else {
          const newApp: AppItem = {
              id: Date.now().toString(),
              name: formData.name!,
              url: formData.url!,
              icon: finalIcon,
              proxyId: formData.proxyId,
              userAgent: formData.userAgent || MOCK_USER_AGENTS[0].value,
              blockedElements: formData.blockedElements || [],
              tags: formData.tags || [],
              status: 'pronto'
          };
          setApps(prev => [...prev, newApp]);
      }
      setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if (confirm('Tem certeza que deseja excluir este App? Ele será removido de todos os perfis.')) {
          setApps(prev => prev.filter(a => a.id !== id));
      }
  };

  const addBlockedElement = () => {
      if (tempBlockElement && formData.blockedElements) {
          setFormData({
              ...formData,
              blockedElements: [...formData.blockedElements, tempBlockElement]
          });
          setTempBlockElement('');
      }
  };

  const removeBlockedElement = (index: number) => {
      if (formData.blockedElements) {
          const newDetails = [...formData.blockedElements];
          newDetails.splice(index, 1);
          setFormData({ ...formData, blockedElements: newDetails });
      }
  };

  const toggleTag = (tagId: string) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tagId)) {
        setFormData({ ...formData, tags: currentTags.filter(t => t !== tagId) });
    } else {
        setFormData({ ...formData, tags: [...currentTags, tagId] });
    }
  };

  const launchApp = (id: string) => {
      setLaunchingAppId(id);
      setTimeout(() => {
          setLaunchingAppId(null);
          // alert('App launched in simulation mode'); 
      }, 2000);
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Meus Apps</h2>
                <p className="text-zinc-400 text-sm mt-1">Configure sites, SaaS e plataformas para seus perfis</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} /> Novo App
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map(app => {
                const proxy = proxies.find(p => p.id === app.proxyId);
                return (
                    <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all flex flex-col group">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-700">
                                    {app.icon ? (
                                        <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-zinc-600">{app.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(app)} className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded hover:bg-zinc-700">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(app.id)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800 rounded hover:bg-zinc-700">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-white text-lg truncate" title={app.name}>{app.name}</h3>
                            <a href={app.url} target="_blank" rel="noreferrer" className="text-xs text-orange-500 hover:underline flex items-center gap-1 mb-4 truncate">
                                {app.url} <ExternalLink size={10} />
                            </a>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                                {app.tags?.map(tagId => {
                                    const t = tags.find(tg => tg.id === tagId);
                                    return t ? <span key={tagId} className={`text-[10px] px-1.5 py-0.5 rounded border ${t.color}`}>{t.label}</span> : null;
                                })}
                            </div>

                            <div className="space-y-2 text-xs text-zinc-400">
                                <div className="flex items-center gap-2 bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                                    <Globe size={12} className="text-blue-500" />
                                    <span className="truncate">{proxy ? proxy.name : 'Conexão Direta'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                                    <Monitor size={12} className="text-purple-500" />
                                    <span className="truncate">{MOCK_USER_AGENTS.find(u => u.value === app.userAgent)?.label || 'Padrão'}</span>
                                </div>
                                {app.blockedElements.length > 0 && (
                                    <div className="flex items-center gap-2 bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                                        <Ban size={12} className="text-red-500" />
                                        <span>{app.blockedElements.length} elementos bloqueados</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-3 border-t border-zinc-800 bg-zinc-950/30">
                            <button 
                                onClick={() => launchApp(app.id)}
                                disabled={launchingAppId === app.id}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-70"
                            >
                                {launchingAppId === app.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                                {launchingAppId === app.id ? 'Iniciando...' : 'Iniciar App'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar App" : "Novo App"}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do App <span className="text-red-500">*</span></label>
                        <input 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Facebook Ads"
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-zinc-400 mb-1">URL Inicial <span className="text-red-500">*</span></label>
                         <input 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 font-mono text-sm"
                            value={formData.url || ''}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {/* Icon Selection Section */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Ícone do App</label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <button 
                            onClick={() => setIconSource('none')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${iconSource === 'none' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <Box size={20} className="mb-1" />
                            <span className="text-[10px] font-bold uppercase">Sem Ícone</span>
                        </button>

                        <button 
                            onClick={() => setIconSource('favicon')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${iconSource === 'favicon' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <LinkIcon size={20} className="mb-1" />
                            <span className="text-[10px] font-bold uppercase">Usar FavIcon</span>
                        </button>

                        <button 
                            onClick={() => setIconSource('custom')}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${iconSource === 'custom' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                            <ImageIcon size={20} className="mb-1" />
                            <span className="text-[10px] font-bold uppercase">URL Custom</span>
                        </button>
                    </div>

                    {/* Preview Logic */}
                    <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                        <div className="w-12 h-12 bg-zinc-800 rounded border border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {iconSource === 'none' && <span className="text-xl font-bold text-zinc-600">{formData.name ? formData.name.charAt(0).toUpperCase() : '?'}</span>}
                            {iconSource === 'favicon' && (
                                formData.url ? 
                                <img src={getFaviconUrl(formData.url)} alt="Favicon Preview" className="w-8 h-8 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> 
                                : <LinkIcon className="text-zinc-600" />
                            )}
                            {iconSource === 'custom' && (
                                customIconUrl ? 
                                <img src={customIconUrl} alt="Custom Preview" className="w-full h-full object-cover" /> 
                                : <ImageIcon className="text-zinc-600" />
                            )}
                        </div>
                        
                        <div className="flex-1">
                            {iconSource === 'none' && <p className="text-sm text-zinc-500 italic">Será usada a inicial do nome.</p>}
                            
                            {iconSource === 'favicon' && (
                                <div className="text-sm text-zinc-300">
                                    <p>Extraindo de: <span className="text-orange-500 font-mono text-xs">{getSafeHostname(formData.url)}</span></p>
                                    <p className="text-xs text-zinc-500 mt-1">Usando Google S2 Service</p>
                                </div>
                            )}

                            {iconSource === 'custom' && (
                                <input 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                                    placeholder="Cole a URL da imagem aqui..."
                                    value={customIconUrl}
                                    onChange={e => setCustomIconUrl(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                        {tags.map(tag => {
                            const isSelected = formData.tags?.includes(tag.id);
                            return (
                                <button 
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`text-xs px-2 py-1 rounded border transition-all ${isSelected ? tag.color : 'bg-zinc-900 border-zinc-700 text-zinc-500 grayscale'}`}
                                >
                                    {tag.label}
                                </button>
                            )
                        })}
                        {tags.length === 0 && <span className="text-xs text-zinc-500">Nenhuma tag disponível.</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Proxy</label>
                        <select 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 text-sm"
                            value={formData.proxyId || ''}
                            onChange={e => setFormData({ ...formData, proxyId: e.target.value })}
                        >
                            <option value="">Conexão Direta (Sem Proxy)</option>
                            {proxies.map(p => <option key={p.id} value={p.id}>{p.name} ({p.ip})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">User Agent</label>
                        <select 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 text-xs"
                            value={formData.userAgent}
                            onChange={e => setFormData({ ...formData, userAgent: e.target.value })}
                        >
                            {MOCK_USER_AGENTS.map(ua => <option key={ua.id} value={ua.value}>{ua.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-2">
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                        <Shield size={14} className="text-red-500" /> Bloqueador de Elementos
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 text-sm font-mono"
                            placeholder="Seletor CSS (ex: .logout-btn, #ads)"
                            value={tempBlockElement}
                            onChange={e => setTempBlockElement(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addBlockedElement()}
                        />
                        <button onClick={addBlockedElement} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg transition-colors">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {formData.blockedElements?.map((el, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-zinc-950/50 px-3 py-1.5 rounded border border-zinc-800/50">
                                <span className="text-xs font-mono text-red-300">{el}</span>
                                <button onClick={() => removeBlockedElement(idx)} className="text-zinc-500 hover:text-red-500">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                        {(!formData.blockedElements || formData.blockedElements.length === 0) && (
                            <p className="text-xs text-zinc-600 italic">Nenhum elemento bloqueado.</p>
                        )}
                    </div>
                </div>

                <button onClick={handleSave} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg mt-2 transition-colors">
                    {editingId ? "Salvar Alterações" : "Criar App"}
                </button>
            </div>
        </Modal>

        <TagManager isOpen={isTagManagerOpen} onClose={() => setIsTagManagerOpen(false)} tags={tags} setTags={setTags} />
    </div>
  );
};
