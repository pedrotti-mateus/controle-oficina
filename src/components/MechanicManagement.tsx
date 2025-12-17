import React, { useState } from 'react';
import type { Mechanic } from '../types';
import { Trash2, Plus, GripVertical } from 'lucide-react';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MechanicManagementProps {
    mechanics: Mechanic[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
    onReorder: (mechanics: Mechanic[]) => void;
}

function SortableMechanicRow({ mechanic, onRemove }: { mechanic: Mechanic; onRemove: (id: string) => void }) {
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
            className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-2 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-4">
                <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded">
                    <GripVertical size={20} />
                </button>
                <div className="flex flex-col">
                    <span className="font-bold text-lg">{mechanic.name}</span>
                    <span className="text-xs text-gray-500">ID: {mechanic.id.slice(0, 8)}...</span>
                </div>
            </div>

            <button
                onClick={() => onRemove(mechanic.id)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Remover mecânico"
            >
                <Trash2 size={20} />
            </button>
        </div>
    );
}

export function MechanicManagement({ mechanics, onAdd, onRemove, onReorder }: MechanicManagementProps) {
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
        <div className="max-w-2xl mx-auto pt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">Gerenciar Mecânicos</h2>

                <form onSubmit={handleAdd} className="flex gap-3 mb-8">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nome do novo mecânico"
                        className="form-input flex-1 text-lg py-3"
                    />
                    <button type="submit" className="btn btn-primary flex items-center gap-2 px-6">
                        <Plus size={20} />
                        Adicionar
                    </button>
                </form>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 ml-2">Lista de Mecânicos (Arraste para reordenar)</h3>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={mechanics.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col">
                                {mechanics.map((mechanic) => (
                                    <SortableMechanicRow
                                        key={mechanic.id}
                                        mechanic={mechanic}
                                        onRemove={onRemove}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {mechanics.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                            Nenhum mecânico cadastrado. Adicione um acima.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
