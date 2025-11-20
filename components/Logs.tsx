
import React from 'react';
import { LogEntry } from '../types';
import { ScrollText, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { MOCK_LOGS } from '../constants';

export const Logs: React.FC = () => {
  
  const getIcon = (level: LogEntry['level']) => {
      switch(level) {
          case 'error': return <XCircle size={16} className="text-red-500" />;
          case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
          case 'success': return <CheckCircle size={16} className="text-green-500" />;
          default: return <Info size={16} className="text-blue-500" />;
      }
  };

  const getBadgeClass = (level: LogEntry['level']) => {
      switch(level) {
          case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
          case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
          case 'success': return 'bg-green-500/10 text-green-400 border-green-500/20';
          default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      }
  };

  return (
    <div className="p-6 h-full flex flex-col">
        <div className="mb-6">
            <h2 className="text-3xl font-bold text-white">Logs do Servidor</h2>
            <p className="text-zinc-400 text-sm mt-1">Registro de atividades e auditoria do sistema</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl flex-1 overflow-hidden flex flex-col shadow-inner">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2 text-zinc-400 text-sm font-mono">
                <ScrollText size={16} /> 
                <span>system.log</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
                <table className="w-full text-left text-xs md:text-sm font-mono">
                    <thead className="text-zinc-500 border-b border-zinc-800/50">
                        <tr>
                            <th className="p-3 w-48">Timestamp</th>
                            <th className="p-3 w-32">Nível</th>
                            <th className="p-3 w-40">Ação</th>
                            <th className="p-3 w-32">Usuário</th>
                            <th className="p-3">Mensagem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                        {MOCK_LOGS.map(log => (
                            <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                                <td className="p-3 text-zinc-500 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded border flex items-center gap-1 w-fit ${getBadgeClass(log.level)}`}>
                                        {getIcon(log.level)} <span className="uppercase text-[10px] font-bold">{log.level}</span>
                                    </span>
                                </td>
                                <td className="p-3 text-orange-400 font-bold">{log.action}</td>
                                <td className="p-3 text-zinc-300">{log.user}</td>
                                <td className="p-3 text-zinc-400">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 text-center text-zinc-600 text-xs italic">
                    Fim dos registros (Mock Data)
                </div>
            </div>
        </div>
    </div>
  );
};
