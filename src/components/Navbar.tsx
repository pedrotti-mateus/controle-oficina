import { Calendar, Users, BarChart3 } from 'lucide-react';

interface NavbarProps {
    currentView: 'agenda' | 'mechanics' | 'dashboard';
    onNavigate: (view: 'agenda' | 'mechanics' | 'dashboard') => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-full px-2 py-1 flex items-center gap-1">
            <button
                onClick={() => onNavigate('agenda')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentView === 'agenda'
                    ? 'bg-brand-yellow text-black font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
            >
                <Calendar size={18} />
                <span>Agenda</span>
            </button>

            <button
                onClick={() => onNavigate('mechanics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentView === 'mechanics'
                    ? 'bg-brand-yellow text-black font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
            >
                <Users size={18} />
                <span>Mecânicos</span>
            </button>

            <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentView === 'dashboard'
                    ? 'bg-brand-yellow text-black font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
            >
                <BarChart3 size={18} />
                <span>Dashboard</span>
            </button>
        </div>
    );
}
