import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Mechanic, Appointment } from '../types';
import { TIME_SLOTS, LUNCH_SLOTS } from '../constants';
import { SlotCell } from './SlotCell';

interface DayGridProps {
    date: Date;
    mechanics: Mechanic[];
    appointments: Record<string, Appointment>;
    onSlotClick: (date: string, time: string, mechanicId: string) => void;
    onDelete: (id: string) => void;
}

export function DayGrid({ date, mechanics, appointments, onSlotClick, onDelete }: DayGridProps) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Grid template: Time Column + 1 Column per Mechanic
    const gridTemplateColumns = `80px repeat(${mechanics.length}, minmax(150px, 1fr))`;

    return (
        <div className={`day-section ${isWeekend ? 'weekend' : ''}`}>
            <div className="day-header flex items-center gap-4">
                <span>{format(date, 'dd/MM/yyyy')}</span>
                <span className="capitalize font-normal text-gray-600">
                    {format(date, 'EEEE', { locale: ptBR })}
                </span>
            </div>

            <div className="day-grid" style={{ gridTemplateColumns }}>
                {/* Header Row */}
                <div className="grid-header-cell bg-gray-900 border-gray-700">Horário</div>
                {mechanics.map((mechanic) => (
                    <div key={mechanic.id} className="grid-header-cell">
                        {mechanic.name}
                    </div>
                ))}

                {/* Time Slots */}
                {TIME_SLOTS.map((time) => {
                    const isLunch = LUNCH_SLOTS.includes(time);

                    return (
                        <React.Fragment key={`row-${time}`}>
                            <div className={`grid-time-cell ${isLunch ? 'bg-gray-200 text-gray-500' : ''}`}>
                                {time}
                            </div>

                            {isLunch ? (
                                /* Lunch Row - Spans all mechanic columns or just individual disabled cells */
                                /* The requirement says "Trave os slots... como Almoço". 
                                   To make it look like a full row break, we can just render disabled cells. */
                                mechanics.map((mechanic) => (
                                    <div
                                        key={`${dateStr}-${mechanic.id}-${time}`}
                                        className="grid-cell bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs cursor-not-allowed"
                                        title="Horário de Almoço"
                                    >
                                        ALMOÇO
                                    </div>
                                ))
                            ) : (
                                mechanics.map((mechanic) => {
                                    const key = `${dateStr}-${mechanic.id}-${time}`;
                                    const appointment = appointments[key];

                                    return (
                                        <SlotCell
                                            key={key}
                                            appointment={appointment}
                                            onClick={() => onSlotClick(dateStr, time, mechanic.id)}
                                            onDelete={onDelete}
                                        />
                                    );
                                })
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
