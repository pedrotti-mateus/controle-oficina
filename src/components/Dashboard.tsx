import { Construction } from 'lucide-react';

export function Dashboard() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
            <div className="bg-yellow-100 p-6 rounded-full mb-6">
                <Construction size={64} className="text-brand-yellow-dark" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Dashboard em Construção</h2>
            <p className="text-gray-600 max-w-md">
                Em breve você terá acesso a estatísticas detalhadas sobre agendamentos, produtividade dos mecânicos e muito mais.
            </p>
        </div>
    );
}
