import React, { useState } from 'react';
import type { Mechanic } from '../types';
import { Trash2, Plus, Users, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MechanicManagerProps {
    mechanics: Mechanic[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
    onReorder: (mechanics: Mechanic[]) => void;
}

function SortableMechanic({ mechanic, onRemove }: { mechanic: Mechanic; onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: mechanic.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 bg-white px-3 py-1 rounded border shadow-sm"
        >
            <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                <GripVertical size={14} />
            </button>
            <span className="text-sm font-medium">{mechanic.name}</span>
            <button
                onClick={() => onRemove(mechanic.id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remover mecânico"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}

export function MechanicManager({ mechanics, onAdd, onRemove, onReorder }: MechanicManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newName, setNewName] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onAdd(newName.trim());
            setNewName('');
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = mechanics.findIndex((m) => m.id === active.id);
            const newIndex = mechanics.findIndex((m) => m.id === over.id);

            onReorder(arrayMove(mechanics, oldIndex, newIndex));
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn flex items-center gap-2 text-sm"
            >
                <Users size={16} />
                Gerenciar Mecânicos ({mechanics.length})
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 p-4 border rounded-lg bg-white shadow-xl z-50 w-[90vw] max-w-4xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Gerenciar Mecânicos (Arraste para reordenar)</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">Fechar</span>
                            ✕
                        </button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={mechanics.map(m => m.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            <div className="flex flex-wrap gap-2 mb-4">
                                {mechanics.map((mechanic) => (
                                    <SortableMechanic
                                        key={mechanic.id}
                                        mechanic={mechanic}
                                        onRemove={onRemove}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

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
