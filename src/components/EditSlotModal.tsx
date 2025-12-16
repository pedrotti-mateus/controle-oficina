import React, { useState, useEffect } from 'react';
import type { Priority } from '../types';
import { TIME_SLOTS } from '../constants';
import { X } from 'lucide-react';

interface EditSlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { clientName: string; serviceDescription: string; priority: Priority; endTime: string }) => void;
    initialData?: { clientName: string; serviceDescription: string; priority: Priority };
    title: string;
    startTime: string;
}

const PRIORITIES: { value: Priority; label: string; colorVar: string }[] = [
    { value: 'max', label: 'Prioridade Máxima', colorVar: '--priority-max' },
    { value: 'high', label: 'Prioridade Alta', colorVar: '--priority-high' },
    { value: 'normal', label: 'Prioridade Normal', colorVar: '--priority-normal' },
    { value: 'low', label: 'Prioridade Baixa', colorVar: '--priority-low' },
    { value: 'zero', label: 'Prioridade Zero', colorVar: '--priority-zero' },
];

export function EditSlotModal({ isOpen, onClose, onSave, initialData, title, startTime }: EditSlotModalProps) {
    const [clientName, setClientName] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('zero');
    const [endTime, setEndTime] = useState(startTime);

    // Filter slots that are after or equal to startTime
    const availableEndTimes = TIME_SLOTS.filter(
        (t) => TIME_SLOTS.indexOf(t) >= TIME_SLOTS.indexOf(startTime)
    );

    useEffect(() => {
        if (isOpen && initialData) {
            setClientName(initialData.clientName);
            setServiceDescription(initialData.serviceDescription);
            setPriority(initialData.priority);
            setEndTime(startTime); // Reset end time on open, or could try to infer if we had range data
        } else if (isOpen) {
            setClientName('');
            setServiceDescription('');
            setPriority('zero');
            setEndTime(startTime);
        }
    }, [isOpen, initialData, startTime]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ clientName, serviceDescription, priority, endTime });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nome do Cliente</label>
                        <input
                            type="text"
                            className="form-input"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Ex: Transportadora XYZ"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descrição do Serviço</label>
                        <textarea
                            className="form-textarea"
                            value={serviceDescription}
                            onChange={(e) => setServiceDescription(e.target.value)}
                            placeholder="Ex: Troca de óleo e filtros..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Último Horário (para agendamento em bloco)</label>
                        <select
                            className="form-select"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        >
                            {availableEndTimes.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            O sistema preencherá todos os horários entre {startTime} e o horário selecionado, pulando o almoço.
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Prioridade (Cor)</label>
                        <div className="flex flex-col gap-2">
                            {PRIORITIES.map((p) => (
                                <label
                                    key={p.value}
                                    className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                                    style={{
                                        borderColor: priority === p.value ? 'var(--primary)' : 'var(--border)',
                                        backgroundColor: priority === p.value ? '#eff6ff' : 'transparent',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={p.value}
                                        checked={priority === p.value}
                                        onChange={() => setPriority(p.value)}
                                        className="hidden"
                                    />
                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: `var(${p.colorVar})`,
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                        }}
                                    />
                                    <span className="text-sm">{p.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="btn">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
