import React, { useState } from 'react';
import type { Mechanic } from '../types';
import { Trash2, Plus, Users } from 'lucide-react';

interface MechanicManagerProps {
    mechanics: Mechanic[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
}

export function MechanicManager({ mechanics, onAdd, onRemove }: MechanicManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newName, setNewName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onAdd(newName.trim());
            setNewName('');
        }
    };

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn flex items-center gap-2 text-sm"
            >
                <Users size={16} />
                Gerenciar Mecânicos ({mechanics.length})
            </button>

            {isOpen && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                    <h3 className="font-bold mb-4">Gerenciar Mecânicos</h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {mechanics.map((mechanic) => (
                            <div
                                key={mechanic.id}
                                className="flex items-center gap-2 bg-white px-3 py-1 rounded border shadow-sm"
                            >
                                <span className="text-sm font-medium">{mechanic.name}</span>
                                <button
                                    onClick={() => onRemove(mechanic.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remover mecânico"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nome do novo mecânico"
                            className="form-input"
                            style={{ maxWidth: '300px' }}
                        />
                        <button type="submit" className="btn btn-primary flex items-center gap-1">
                            <Plus size={16} />
                            Adicionar
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
