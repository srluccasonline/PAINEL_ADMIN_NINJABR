
import React, { useState } from 'react';
import { Tag } from '../types';
import { Plus, Trash2, Tag as TagIcon, X } from 'lucide-react';
import { Modal } from './ui/Modal';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const PRESET_COLORS = [
  { label: 'Verde', value: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: 'Azul', value: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Vermelho', value: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { label: 'Amarelo', value: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { label: 'Roxo', value: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { label: 'Laranja', value: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { label: 'Cinza', value: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
];

export const TagManager: React.FC<TagManagerProps> = ({ isOpen, onClose, tags, setTags }) => {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: Date.now().toString(),
      label: newTagName.trim(),
      color: selectedColor
    };

    setTags(prev => [...prev, newTag]);
    setNewTagName('');
  };

  const handleDeleteTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Tags">
      <div className="space-y-6">
        
        {/* Creator */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
          <h4 className="text-sm font-bold text-white">Criar Nova Tag</h4>
          <div className="flex gap-2">
            <input 
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="Nome da tag (ex: Prioridade)"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
            />
            <button 
              onClick={handleCreateTag}
              className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColor(color.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: 'currentColor' }}
              >
                <div className={`w-full h-full rounded-full ${color.value.split(' ')[0].replace('/20', '')}`}></div>
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div>
          <h4 className="text-sm font-bold text-white mb-2">Tags Existentes</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 px-3 py-2 rounded">
                <span className={`text-xs px-2 py-1 rounded border ${tag.color}`}>
                  {tag.label}
                </span>
                <button 
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-zinc-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {tags.length === 0 && <p className="text-xs text-zinc-600 text-center py-4">Nenhuma tag criada.</p>}
          </div>
        </div>

      </div>
    </Modal>
  );
};
