import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthNavigationProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export function MonthNavigation({ currentDate, onPrevMonth, onNextMonth }: MonthNavigationProps) {
    return (
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded shadow-sm border">
            <button onClick={onPrevMonth} className="btn flex items-center gap-2">
                <ChevronLeft size={20} />
                Anterior
            </button>

            <h2 className="text-2xl font-bold capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>

            <button onClick={onNextMonth} className="btn flex items-center gap-2">
                Próximo
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
