
import React, { useState, useEffect } from 'react';
import { User, Profile } from '../types';
import { Search, UserPlus, Lock, Unlock, Trash2, Calendar, Star, Filter, Edit2, Key, ShieldAlert, Check, MoreHorizontal, ChevronDown, Eye, CalendarClock, Shuffle } from 'lucide-react';
import { Modal } from './ui/Modal';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  profiles: Profile[];
}

type FilterStatus = 'todos' | 'ativos' | 'bloqueados' | 'expirados' | 'favoritos';

// Custom Checkbox Component for Ninja Theme
const NinjaCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div 
    onClick={onChange}
    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all border ${
      checked 
        ? 'bg-orange-600 border-orange-600 shadow-lg shadow-orange-900/20' 
        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
    }`}
  >
    {checked && <Check size={14} className="text-white" strokeWidth={3} />}
  </div>
);

export const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, profiles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todos');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  
  // Modal & Form State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formUsername, setFormUsername] = useState('');
  const [formNickname, setFormNickname] = useState(''); // Added Nickname
  const [formPassword, setFormPassword] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAssignedProfiles, setFormAssignedProfiles] = useState<string[]>([]);

  // Renewal Modal State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewingUserId, setRenewingUserId] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState('');

  // Profile View Modal State
  const [viewingProfilesUserId, setViewingProfilesUserId] = useState<string | null>(null);

  // Confirmation Modal State (Bulk)
  const [confirmAction, setConfirmAction] = useState<'block' | 'unlock' | 'delete' | null>(null);
  const [confirmCountdown, setConfirmCountdown] = useState(0);

  // Confirmation Modal State (Single)
  const [singleActionModal, setSingleActionModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDelete?: boolean;
  }>({ isOpen: false, title: '', message: '', action: () => {}, isDelete: false });

  // --- Computed & Logic ---

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.nickname && u.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filterStatus === 'todos') return true;
    if (filterStatus === 'ativos') return u.status === 'ativo';
    if (filterStatus === 'bloqueados') return u.status === 'bloqueado';
    if (filterStatus === 'expirados') return new Date(u.expirationDate) < new Date();
    if (filterStatus === 'favoritos') return u.isFavorite;
    
    return true;
  });

  const getRelativeTime = (dateString: string) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return `Expirou há ${Math.abs(diffDays)} dias`;
      if (diffDays === 0) return 'Vence hoje';
      return `Em ${diffDays} dias`;
  };

  // --- Effects ---

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (confirmAction && confirmCountdown > 0) {
      interval = setInterval(() => {
        setConfirmCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [confirmAction, confirmCountdown]);

  // --- Handlers ---

  const toggleAllUsers = () => {
      if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) {
          setSelectedUsers([]);
      } else {
          setSelectedUsers(filteredUsers.map(u => u.id));
      }
  };

  const toggleUserSelection = (id: string) => {
      setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const initiateBulkAction = (action: 'block' | 'unlock' | 'delete') => {
      setConfirmAction(action);
      setConfirmCountdown(3);
      setShowBulkMenu(false);
  };

  const executeBulkAction = () => {
      if (confirmAction === 'block') {
          setUsers(prev => prev.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'bloqueado' } : u));
      } else if (confirmAction === 'unlock') {
          setUsers(prev => prev.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'ativo' } : u));
      } else if (confirmAction === 'delete') {
          setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      }
      setSelectedUsers([]);
      setConfirmAction(null);
  };

  // Single User Actions
  const confirmSingleBlock = (user: User) => {
      const isBlocking = user.status === 'ativo';
      setSingleActionModal({
          isOpen: true,
          title: isBlocking ? 'Bloquear Usuário' : 'Desbloquear Usuário',
          message: `Tem certeza que deseja ${isBlocking ? 'bloquear' : 'desbloquear'} o usuário ${user.nickname || user.username}?`,
          action: () => {
             setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: isBlocking ? 'bloqueado' : 'ativo' } : u));
             setSingleActionModal(prev => ({ ...prev, isOpen: false }));
          },
          isDelete: false
      });
  };

  const confirmSingleDelete = (userId: string) => {
      setSingleActionModal({
          isOpen: true,
          title: 'Excluir Usuário',
          message: 'Tem certeza que deseja excluir permanentemente este usuário? Esta ação não pode ser desfeita.',
          action: () => {
              setUsers(prev => prev.filter(u => u.id !== userId));
              setSingleActionModal(prev => ({ ...prev, isOpen: false }));
          },
          isDelete: true
      });
  };

  // Renewal Logic
  const openRenewModal = (userId: string) => {
      setRenewingUserId(userId);
      setCustomDate('');
      setIsRenewModalOpen(true);
  };

  const applyRenewal = (months: number | 'custom') => {
      if (!renewingUserId) return;
      
      setUsers(prev => prev.map(u => {
          if (u.id !== renewingUserId) return u;
          
          let newDate = new Date(u.expirationDate);
          // If already expired, start from today
          if (newDate < new Date()) {
              newDate = new Date();
          }

          if (months === 'custom') {
              if (!customDate) return u;
              newDate = new Date(customDate);
          } else {
              newDate.setMonth(newDate.getMonth() + months);
          }
          
          return { ...u, expirationDate: newDate.toISOString() };
      }));
      setIsRenewModalOpen(false);
      setRenewingUserId(null);
  };

  // CRUD User
  const handleOpenUserModal = (user?: User) => {
      if (user) {
          setEditingId(user.id);
          setFormUsername(user.username);
          setFormNickname(user.nickname || '');
          setFormPassword(user.password || '');
          setFormEmail(user.email || '');
          setFormAssignedProfiles(user.assignedProfileIds);
      } else {
          setEditingId(null);
          setFormUsername('');
          setFormNickname('');
          setFormPassword('');
          setFormEmail('');
          setFormAssignedProfiles([]);
      }
      setIsUserModalOpen(true);
  };

  const generatePassword = () => {
      const pass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
      setFormPassword(pass);
  };

  const generateUsername = () => {
      const prefix = 'ninja_';
      const random = Math.floor(1000 + Math.random() * 9000);
      setFormUsername(`${prefix}${random}`);
  };

  const handleSaveUser = () => {
      if(!formUsername || !formPassword) return;

      if (editingId) {
          setUsers(prev => prev.map(u => u.id === editingId ? {
              ...u,
              username: formUsername,
              nickname: formNickname,
              password: formPassword,
              email: formEmail,
              assignedProfileIds: formAssignedProfiles
          } : u));
      } else {
          const defaultExp = new Date();
          defaultExp.setDate(defaultExp.getDate() + 30);

          const newUser: User = {
              id: Date.now().toString(),
              username: formUsername,
              nickname: formNickname,
              password: formPassword,
              email: formEmail,
              status: 'ativo',
              role: 'user',
              expirationDate: defaultExp.toISOString(),
              assignedProfileIds: formAssignedProfiles,
              isFavorite: false
          };
          setUsers(prev => [...prev, newUser]);
      }
      setIsUserModalOpen(false);
  };

  const toggleFavorite = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isFavorite: !u.isFavorite } : u));
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Diretório de Usuários</h2>
            <p className="text-zinc-400 text-sm mt-1">Gerencie acessos e assinaturas dos clientes</p>
        </div>
        <button onClick={() => handleOpenUserModal()} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
            <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full md:w-auto">
             <Search className="absolute left-3 top-2.5 text-zinc-500" size={20} />
             <input 
                type="text"
                placeholder="Buscar por usuário, email ou apelido..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-orange-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
         </div>
         
         <div className="flex items-center gap-2 w-full md:w-auto min-w-[200px]">
             <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-lg w-full">
                 <div className="pl-3 text-zinc-400">
                    <Filter size={18} />
                 </div>
                 <select 
                    className="bg-zinc-950 text-zinc-200 text-sm focus:outline-none cursor-pointer appearance-none py-2 pl-3 pr-8 w-full rounded-lg"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                 >
                     <option value="todos" className="bg-zinc-900 text-zinc-200">Todos os Status</option>
                     <option value="ativos" className="bg-zinc-900 text-zinc-200">Apenas Ativos</option>
                     <option value="bloqueados" className="bg-zinc-900 text-zinc-200">Apenas Bloqueados</option>
                     <option value="expirados" className="bg-zinc-900 text-zinc-200">Apenas Expirados</option>
                     <option value="favoritos" className="bg-zinc-900 text-yellow-500 font-medium">★ Favoritos</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-3 text-zinc-500 pointer-events-none" />
             </div>
         </div>

         {/* Bulk Actions Dropdown */}
         {selectedUsers.length > 0 && (
             <div className="relative">
                 <button 
                    onClick={() => setShowBulkMenu(!showBulkMenu)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm border border-zinc-700 transition-colors"
                 >
                     <MoreHorizontal size={16} /> Ações em Lote ({selectedUsers.length})
                 </button>
                 
                 {showBulkMenu && (
                     <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 overflow-hidden">
                         <button onClick={() => initiateBulkAction('block')} className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white border-b border-zinc-800 flex items-center gap-2">
                             <Lock size={14} /> Bloquear
                         </button>
                         <button onClick={() => initiateBulkAction('unlock')} className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white border-b border-zinc-800 flex items-center gap-2">
                             <Unlock size={14} /> Desbloquear
                         </button>
                         <button onClick={() => initiateBulkAction('delete')} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2">
                             <Trash2 size={14} /> Excluir
                         </button>
                     </div>
                 )}
             </div>
         )}
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950 text-zinc-200 uppercase font-medium border-b border-zinc-800">
                    <tr>
                        <th className="p-4 w-14">
                            <NinjaCheckbox 
                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                onChange={toggleAllUsers}
                            />
                        </th>
                        <th className="p-4">Info Usuário</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Perfis</th>
                        <th className="p-4">Expiração</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {filteredUsers.map(user => (
                        <tr key={user.id} className={`hover:bg-zinc-800/50 transition-colors ${user.status === 'bloqueado' ? 'bg-red-900/5' : ''}`}>
                            <td className="p-4">
                                <NinjaCheckbox 
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => toggleUserSelection(user.id)}
                                />
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div onClick={() => toggleFavorite(user.id)} className={`cursor-pointer ${user.isFavorite ? 'text-yellow-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                        <Star size={16} fill={user.isFavorite ? "currentColor" : "none"} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white flex items-center gap-2">
                                            {user.nickname || user.username}
                                            {user.nickname && <span className="text-xs text-zinc-500 font-normal">({user.username})</span>}
                                        </div>
                                        <div className="text-xs">{user.email || '-'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'ativo' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {user.status.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4">
                                <button 
                                    onClick={() => setViewingProfilesUserId(user.id)}
                                    className="bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-xs text-zinc-300 flex items-center gap-1 transition-colors"
                                >
                                    <Eye size={12} /> {user.assignedProfileIds.length} Associados
                                </button>
                            </td>
                            <td className="p-4">
                                <div className="group relative inline-block cursor-help">
                                    <span className={`text-xs font-mono ${new Date(user.expirationDate) < new Date() ? 'text-red-400' : 'text-zinc-300'}`}>
                                        {getRelativeTime(user.expirationDate)}
                                    </span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                                        {new Date(user.expirationDate).toLocaleString('pt-BR')}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => openRenewModal(user.id)} className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors" title="Renovar Assinatura">
                                        <CalendarClock size={16} />
                                    </button>
                                    <button onClick={() => handleOpenUserModal(user)} className="p-1.5 text-zinc-400 hover:text-orange-500 hover:bg-zinc-800 rounded transition-colors" title="Editar">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => confirmSingleBlock(user)} className="p-1.5 text-zinc-400 hover:text-yellow-500 hover:bg-zinc-800 rounded transition-colors" title={user.status === 'ativo' ? "Bloquear" : "Desbloquear"}>
                                        {user.status === 'ativo' ? <Unlock size={16} /> : <Lock size={16} />}
                                    </button>
                                    <button onClick={() => confirmSingleDelete(user.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded transition-colors" title="Excluir">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && <div className="p-8 text-center text-zinc-500">Nenhum usuário encontrado com os filtros atuais.</div>}
      </div>

      {/* --- MODALS --- */}

      {/* Single Action Confirmation Modal */}
      <Modal isOpen={singleActionModal.isOpen} onClose={() => setSingleActionModal(prev => ({ ...prev, isOpen: false }))} title={singleActionModal.title}>
          <div className="space-y-4 text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${singleActionModal.isDelete ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  <ShieldAlert size={24} />
              </div>
              <p className="text-zinc-300">{singleActionModal.message}</p>
              <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setSingleActionModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg transition-colors"
                  >
                      Cancelar
                  </button>
                  <button 
                    onClick={singleActionModal.action}
                    className={`flex-1 text-white py-2 rounded-lg transition-colors ${singleActionModal.isDelete ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'}`}
                  >
                      Confirmar
                  </button>
              </div>
          </div>
      </Modal>

      {/* Create/Edit User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingId ? "Editar Usuário" : "Novo Usuário"}>
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Apelido / Nickname (Opcional)</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" 
                    placeholder="Ex: Cliente VIP 01"
                    value={formNickname} 
                    onChange={e => setFormNickname(e.target.value)} 
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Login do Usuário <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" value={formUsername} onChange={e => setFormUsername(e.target.value)} />
                        <button onClick={generateUsername} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 rounded-lg border border-zinc-700 transition-colors" title="Gerar Login Aleatório">
                            <Shuffle size={16} />
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Senha <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
                        <button onClick={generatePassword} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 rounded-lg border border-zinc-700 transition-colors" title="Gerar Senha">
                            <Key size={16} />
                        </button>
                    </div>
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email (Opcional)</label>
                  <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
              </div>

              <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Associar Perfis</label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-1 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1">
                        {profiles.map(p => {
                            const isSelected = formAssignedProfiles.includes(p.id);
                            return (
                                <label key={p.id} className={`flex items-center justify-between p-3 rounded cursor-pointer transition-all border ${isSelected ? 'bg-orange-500/10 border-orange-500/50' : 'border-transparent hover:bg-zinc-900'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'}`}>
                                            {isSelected && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-zinc-400'}`}>{p.name}</span>
                                    </div>
                                    <span className="text-xs text-zinc-600">{p.group}</span>
                                    <input 
                                        type="checkbox" 
                                        className="hidden"
                                        checked={isSelected}
                                        onChange={() => setFormAssignedProfiles(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                    />
                                </label>
                            );
                        })}
                      </div>
                      {profiles.length === 0 && <div className="p-4 text-center text-xs text-zinc-500">Sem perfis disponíveis para associar.</div>}
                  </div>
              </div>
              <div className="pt-2">
                  <p className="text-xs text-zinc-500 mb-2">Nota: Expiração padrão é de 30 dias a partir de agora.</p>
                  <button onClick={handleSaveUser} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-lg transition-colors">
                      {editingId ? "Salvar Alterações" : "Criar Usuário"}
                  </button>
              </div>
          </div>
      </Modal>

      {/* Bulk Confirmation Modal */}
      <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title="Ação em Lote">
         <div className="text-center py-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmAction === 'delete' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
                {confirmAction === 'delete' ? 'Exclusão Permanente' : confirmAction === 'block' ? 'Bloqueio em Massa' : 'Desbloqueio em Massa'}
            </h3>
            <p className="text-zinc-400 mb-6">
                Você aplicará esta ação em <strong className="text-white">{selectedUsers.length} usuários</strong>.
                {confirmAction === 'delete' && <span className="block mt-2 text-red-400 font-bold uppercase text-xs">Esta ação é irreversível!</span>}
            </p>

            <button 
                onClick={executeBulkAction} 
                disabled={confirmCountdown > 0}
                className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    confirmCountdown > 0 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : confirmAction === 'delete' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
            >
                {confirmCountdown > 0 ? `Aguarde ${confirmCountdown}s...` : `Confirmar Ação`}
            </button>
         </div>
      </Modal>

      {/* Renewal Modal */}
      <Modal isOpen={isRenewModalOpen} onClose={() => setIsRenewModalOpen(false)} title="Renovar Assinatura">
          <div className="space-y-4">
              <p className="text-zinc-400 text-sm">Escolha o período para adicionar à assinatura atual.</p>
              <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => applyRenewal(1)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-lg transition-colors">+ 1 Mês</button>
                  <button onClick={() => applyRenewal(3)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-lg transition-colors">+ 3 Meses</button>
                  <button onClick={() => applyRenewal(6)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-lg transition-colors">+ 6 Meses</button>
                  <button onClick={() => applyRenewal(12)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-lg transition-colors">+ 1 Ano</button>
              </div>
              <div className="relative border-t border-zinc-800 pt-4 mt-2">
                  <p className="text-xs text-zinc-500 mb-2">Ou defina uma data personalizada:</p>
                  <div className="flex gap-2">
                      <input 
                        type="date" 
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                        value={customDate}
                        onChange={e => setCustomDate(e.target.value)}
                      />
                      <button 
                        onClick={() => applyRenewal('custom')}
                        disabled={!customDate}
                        className="bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-4 rounded-lg font-medium transition-colors"
                      >
                          Salvar
                      </button>
                  </div>
              </div>
          </div>
      </Modal>

      {/* View Profiles Modal */}
      <Modal isOpen={!!viewingProfilesUserId} onClose={() => setViewingProfilesUserId(null)} title="Perfis Associados">
          <div className="space-y-2">
              {viewingProfilesUserId && users.find(u => u.id === viewingProfilesUserId)?.assignedProfileIds.map(pid => {
                  const p = profiles.find(prof => prof.id === pid);
                  if (!p) return null;
                  return (
                      <div key={pid} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                          <span className="text-white font-medium">{p.name}</span>
                          <span className="text-xs text-zinc-500">{p.group}</span>
                      </div>
                  );
              })}
              {viewingProfilesUserId && users.find(u => u.id === viewingProfilesUserId)?.assignedProfileIds.length === 0 && (
                  <p className="text-zinc-500 text-center py-4">Nenhum perfil associado a este usuário.</p>
              )}
          </div>
      </Modal>
    </div>
  );
};
