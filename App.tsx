
import React, { useState } from 'react';
import { LoginPage } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ProxyManager } from './components/ProxyManager';
import { ProfileManager } from './components/ProfileManager';
import { UserManager } from './components/UserManager';
import { Settings } from './components/Settings';
import { Logs } from './components/Logs';
import { ApiSync } from './components/ApiSync';
import { ViewState, User, Profile, ProxyItem } from './types';
import { INITIAL_USERS, INITIAL_PROFILES, INITIAL_PROXIES } from './constants';
import { LayoutDashboard, Users, Globe, Monitor, Settings as SettingsIcon, LogOut, Menu, X, ScrollText, Cable } from 'lucide-react';

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // App Data State (Mock Database)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [proxies, setProxies] = useState<ProxyItem[]>(INITIAL_PROXIES);

  // Navigation State
  const [view, setView] = useState<ViewState>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const NavItem = ({ target, icon: Icon, label }: { target: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setView(target);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
        view === target 
          ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-black text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 bg-zinc-800 p-2 rounded text-white"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-zinc-900">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Ninja<span className="text-orange-500">BR</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Painel MultiLogin v1.0</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <NavItem target="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <div className="my-4 border-t border-zinc-900" />
          <div className="px-4 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Gerenciamento</div>
          <NavItem target="profiles" icon={Monitor} label="Perfis" />
          <NavItem target="proxies" icon={Globe} label="Proxies" />
          <NavItem target="users" icon={Users} label="Usuários" />
          <div className="my-4 border-t border-zinc-900" />
          <div className="px-4 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">Sistema</div>
          <NavItem target="logs" icon={ScrollText} label="Logs do Servidor" />
          <NavItem target="api" icon={Cable} label="API / Sincronização" />
          <NavItem target="settings" icon={SettingsIcon} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-500 hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#09090b]">
        <div className="max-w-7xl mx-auto">
            {view === 'dashboard' && <Dashboard users={users} profiles={profiles} proxies={proxies} />}
            {view === 'proxies' && <ProxyManager proxies={proxies} setProxies={setProxies} />}
            {view === 'profiles' && <ProfileManager profiles={profiles} setProfiles={setProfiles} proxies={proxies} />}
            {view === 'users' && <UserManager users={users} setUsers={setUsers} profiles={profiles} />}
            {view === 'logs' && <Logs />}
            {view === 'api' && <ApiSync />}
            {view === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}

export default App;
