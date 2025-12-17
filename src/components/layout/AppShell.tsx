import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
    currentView: 'agenda' | 'mechanics' | 'dashboard' | 'settings';
    onNavigate: (view: 'agenda' | 'mechanics' | 'dashboard' | 'settings') => void;
    title: string;
    breadcrumb?: string[];
    children: ReactNode;
}

export function AppShell({ currentView, onNavigate, title, breadcrumb, children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar currentView={currentView} onNavigate={onNavigate} />

            <div className="lg:ml-[240px]">
                <Topbar title={title} breadcrumb={breadcrumb} />

                <main className="p-6">
                    <div className="max-w-screen-xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
