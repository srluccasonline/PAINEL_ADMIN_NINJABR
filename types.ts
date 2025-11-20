
export enum ProxyType {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  SOCKS4 = 'SOCKS4',
  SOCKS5 = 'SOCKS5',
}

export type ProxyStatus = 'online' | 'offline' | 'checking' | 'unknown';

export interface ProxyItem {
  id: string;
  name: string;
  ip: string;
  port: string;
  type: ProxyType;
  username?: string;
  password?: string;
  status: ProxyStatus;
  latency?: number; // ms
  lastCheck?: string; // ISO Date
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface AppItem {
  id: string;
  name: string;
  url: string;
  icon?: string; // URL or base64
  proxyId?: string;
  userAgent: string;
  blockedElements: string[]; // CSS selectors
  tags: string[]; // Added tags
  status: 'pronto' | 'rodando';
}

export interface Profile {
  id: string;
  name: string;
  // group: string; // REMOVED CATEGORY
  tags: string[];
  status: 'criado' | 'rodando' | 'salvo' | 'erro' | 'desabilitado';
  lastSession?: string;
  banner?: string; // Image URL
  appIds: string[]; // List of App IDs included in this profile
}

export interface User {
  id: string;
  username: string;
  nickname?: string; // Added nickname
  password?: string; 
  email?: string; 
  status: 'ativo' | 'bloqueado';
  role: 'user' | 'admin';
  expirationDate: string; // ISO Date
  assignedProfileIds: string[];
  isFavorite: boolean;
}

export interface UserAgentOption {
  id: string;
  label: string;
  value: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  action: string;
  user: string;
  details: string;
}

export interface RemoteConfig {
  apiKey: string;
  remoteAdminId: string;
  lastGenerated: string;
}

export type ViewState = 'dashboard' | 'apps' | 'proxies' | 'profiles' | 'users' | 'settings' | 'logs' | 'api';
