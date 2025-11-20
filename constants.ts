
import { GroupOption, TagOption, UserAgentOption, User, Profile, ProxyItem, ProxyType, LogEntry } from './types';

export const MOCK_GROUPS: GroupOption[] = [
  { id: 'fb-ads', label: 'Facebook Ads' },
  { id: 'google-ads', label: 'Google Ads' },
  { id: 'farming', label: 'Farm de Contas' },
  { id: 'organic', label: 'Tráfego Orgânico' },
  { id: 'tiktok', label: 'TikTok' },
];

export const MOCK_TAGS: TagOption[] = [
  { id: 'high-trust', label: 'Alta Confiança', color: 'bg-green-500/20 text-green-400' },
  { id: 'warmup', label: 'Aquecimento', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'banned', label: 'Banido', color: 'bg-red-500/20 text-red-400' },
  { id: 'new', label: 'Novo', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'vip', label: 'VIP', color: 'bg-purple-500/20 text-purple-400' },
];

export const MOCK_USER_AGENTS: UserAgentOption[] = [
  { id: 'win-chrome', label: 'Windows 10 - Chrome 120', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { id: 'mac-safari', label: 'macOS - Safari 17', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15' },
  { id: 'win-edge', label: 'Windows 11 - Edge', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' },
  { id: 'linux-firefox', label: 'Linux - Firefox', value: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0' },
];

// Initial Data
export const INITIAL_PROXIES: ProxyItem[] = [
  { id: '1', name: 'US Residencial 1', ip: '192.168.1.10', port: '8080', type: ProxyType.HTTP, status: 'unknown' },
  { id: '2', name: 'BR Mobile 4G', ip: '200.100.50.25', port: '1080', type: ProxyType.SOCKS5, status: 'unknown' },
];

export const INITIAL_PROFILES: Profile[] = [
  { id: '1', name: 'FB Farm 01', group: 'fb-ads', tags: ['high-trust', 'vip'], userAgent: MOCK_USER_AGENTS[0].value, status: 'salvo', lastSession: '2023-10-25T10:00:00Z', proxyId: '1' },
  { id: '2', name: 'Google Limpo', group: 'google-ads', tags: ['new'], userAgent: MOCK_USER_AGENTS[1].value, status: 'criado', proxyId: '2' },
];

export const INITIAL_USERS: User[] = [
  { id: '1', username: 'cliente1', nickname: 'Loja do João', password: '123', email: 'cliente1@ninjabr.com', status: 'ativo', role: 'user', expirationDate: '2024-12-31T23:59:59Z', assignedProfileIds: ['1'], isFavorite: true },
  { id: '2', username: 'teste_bloq', password: '123', email: 'bloqueado@gmail.com', status: 'bloqueado', role: 'user', expirationDate: '2023-01-01T00:00:00Z', assignedProfileIds: [], isFavorite: false },
];

export const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), level: 'info', action: 'LOGIN', user: 'admin', details: 'Login efetuado com sucesso via painel web.' },
  { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), level: 'success', action: 'PROFILE_SYNC', user: 'remote_client', details: 'Perfil "FB Farm 01" sincronizado com Electron Client #8291.' },
  { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), level: 'warning', action: 'PROXY_FAIL', user: 'system', details: 'Proxy US Residencial 1 (192.168.1.10) demorou a responder (2500ms).' },
  { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), level: 'error', action: 'AUTH_FAIL', user: 'unknown', details: 'Tentativa de login falha: senha incorreta (IP 172.10.10.5).' },
  { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), level: 'info', action: 'USER_CREATE', user: 'admin', details: 'Novo usuário "cliente_novo" criado.' },
];
