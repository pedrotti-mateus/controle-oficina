import type { Appointment } from '../types';

interface SlotCellProps {
    appointment?: Appointment;
    onClick: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
    max: 'var(--priority-max)',
    high: 'var(--priority-high)',
    normal: 'var(--priority-normal)',
    low: 'var(--priority-low)',
    zero: 'var(--priority-zero)',
};

export function SlotCell({ appointment, onClick }: SlotCellProps) {
    const priority = appointment?.priority || 'zero';
    const backgroundColor = PRIORITY_COLORS[priority];

    // Determine text color based on background
    // Simple heuristic: dark text for light backgrounds (zero, high, normal, low), white for dark (max)
    // Actually, let's stick to black for most, maybe white for 'max' (red) and 'low' (blue) if they are dark.
    // Based on the print, text is black even on colors. Let's keep it black for now, except maybe Red.
    // The print shows black text on Red. So black text everywhere.

    return (
        <div
            className="grid-cell"
            style={{ backgroundColor }}
            onClick={onClick}
            title={appointment ? `${appointment.clientName} - ${appointment.serviceDescription}` : 'Clique para editar'}
        >
            {appointment && (
                <>
                    <div className="font-bold truncate text-xs leading-tight">
                        {appointment.clientName}
                    </div>
                    <div className="truncate text-xs leading-tight opacity-90">
                        {appointment.serviceDescription}
                    </div>
                </>
            )}
        </div>
    );
}
