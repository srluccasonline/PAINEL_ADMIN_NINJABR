
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

export interface Profile {
  id: string;
  name: string;
  group: string;
  tags: string[];
  userAgent: string;
  status: 'criado' | 'rodando' | 'salvo' | 'erro' | 'desabilitado';
  lastSession?: string;
  proxyId?: string;
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

export interface GroupOption {
  id: string;
  label: string;
}

export interface TagOption {
  id: string;
  label: string;
  color: string;
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
  remoteUser: string;
  remotePass: string;
}

export type ViewState = 'dashboard' | 'proxies' | 'profiles' | 'users' | 'settings' | 'logs' | 'api';
