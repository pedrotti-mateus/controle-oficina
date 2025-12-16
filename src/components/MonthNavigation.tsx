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
        <div className="flex items-center justify-center gap-4 mb-6 bg-white p-2 rounded shadow-sm border w-fit mx-auto">
            <button onClick={onPrevMonth} className="btn p-2 hover:bg-gray-100 rounded-full" title="Mês Anterior">
                <ChevronLeft size={20} />
            </button>

            <div className="px-6 py-1 bg-gray-50 border rounded text-center min-w-[200px]">
                <h2 className="text-lg font-bold capitalize text-gray-800">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </h2>
            </div>

            <button onClick={onNextMonth} className="btn p-2 hover:bg-gray-100 rounded-full" title="Próximo Mês">
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
