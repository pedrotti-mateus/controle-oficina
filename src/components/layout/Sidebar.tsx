import { Calendar, Users, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    currentView: 'agenda' | 'mechanics' | 'dashboard' | 'settings';
    onNavigate: (view: 'agenda' | 'mechanics' | 'dashboard' | 'settings') => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { id: 'agenda' as const, label: 'Agenda', icon: Calendar },
        { id: 'mechanics' as const, label: 'Mecânicos', icon: Users },
        { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
        { id: 'settings' as const, label: 'Configurações', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
                aria-label="Toggle menu"
            >
                {isCollapsed ? <Menu size={24} /> : <X size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
                    transition-transform duration-300 ease-in-out
                    ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
                `}
                style={{ width: '240px' }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo/Brand */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Oficina Manager</h2>
                        <p className="text-xs text-gray-500 mt-1">Controle de Demanda</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        if (window.innerWidth < 1024) {
                                            setIsCollapsed(true);
                                        }
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                        text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                    style={{
                                        backgroundColor: isActive ? 'var(--brand-primary)' : undefined,
                                        color: isActive ? 'var(--brand-secondary)' : undefined,
                                    }}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400 text-center">v1.0.0</p>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {!isCollapsed && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
        </>
    );
}
