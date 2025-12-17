import { useMemo, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    Area,
    AreaChart,
} from 'recharts';
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Mechanic, Appointment, Priority } from '../types';
import { TIME_SLOTS, LUNCH_SLOTS } from '../constants';
import { Calendar, Filter, TrendingUp, Users, Clock } from 'lucide-react';

interface DashboardProps {
    mechanics: Mechanic[];
    appointments: Record<string, Appointment>;
    currentDate: Date;
}

const PRIORITY_COLORS: Record<Priority, string> = {
    max: '#dc2626', // red-600
    high: '#f87171', // red-400
    normal: '#4ade80', // green-400
    low: '#60a5fa', // blue-400
    zero: '#fbbf24', // amber-400
    absence: '#9ca3af', // gray-400
};

const PRIORITY_LABELS: Record<Priority, string> = {
    max: 'Máximo',
    high: 'Alto',
    normal: 'Normal',
    low: 'Baixo',
    zero: 'Zero',
    absence: 'Ausência',
};

export function Dashboard({ mechanics, appointments, currentDate }: DashboardProps) {
    // Filter states
    const [selectedMechanics, setSelectedMechanics] = useState<string[]>(mechanics.map(m => m.id));
    const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(['max', 'high', 'normal', 'low', 'zero', 'absence']);
    const [startDate, setStartDate] = useState<Date>(startOfMonth(currentDate));
    const [endDate, setEndDate] = useState<Date>(endOfMonth(currentDate));

    // Update date range when currentDate changes
    useMemo(() => {
        setStartDate(startOfMonth(currentDate));
        setEndDate(endOfMonth(currentDate));
    }, [currentDate]);

    const toggleMechanic = (id: string) => {
        setSelectedMechanics(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const togglePriority = (priority: Priority) => {
        setSelectedPriorities(prev =>
            prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
        );
    };

    const stats = useMemo(() => {
        const start = startOfDay(startDate);
        const end = endOfDay(endDate);

        // 1. Calculate Business Days
        const daysInRange = eachDayOfInterval({ start, end });
        const businessDays = daysInRange.filter(day => !isWeekend(day)).length;

        // 2. Calculate Total Capacity per Mechanic
        const slotsPerDay = TIME_SLOTS.length - LUNCH_SLOTS.length;
        const capacityPerMechanic = businessDays * slotsPerDay;

        // 3. Aggregate Data (filtered)
        const filteredMechanics = mechanics.filter(m => selectedMechanics.includes(m.id));

        const mechanicStats = filteredMechanics.map(mechanic => {
            let totalSlotsUsed = 0;
            const priorityCounts: Record<string, number> = {
                max: 0,
                high: 0,
                normal: 0,
                low: 0,
                zero: 0,
                absence: 0,
            };

            // Iterate through all appointments for this mechanic in date range
            Object.values(appointments).forEach(app => {
                if (app.mechanicId === mechanic.id) {
                    const appDate = new Date(app.date + 'T00:00:00');

                    if (appDate >= start && appDate <= end) {
                        // Filter by selected priorities
                        const priority = app.priority || 'normal';
                        if (selectedPriorities.includes(priority as Priority)) {
                            totalSlotsUsed++;
                            if (priorityCounts[priority] !== undefined) {
                                priorityCounts[priority]++;
                            }
                        }
                    }
                }
            });

            const allocationPercentage = capacityPerMechanic > 0
                ? Math.round((totalSlotsUsed / capacityPerMechanic) * 100)
                : 0;

            return {
                name: mechanic.name,
                allocation: allocationPercentage,
                used: totalSlotsUsed,
                capacity: capacityPerMechanic,
                ...priorityCounts,
            };
        });

        // Sort by allocation desc
        mechanicStats.sort((a, b) => b.allocation - a.allocation);

        // Calculate daily trends
        const dailyData = daysInRange
            .filter(day => !isWeekend(day))
            .map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                let count = 0;

                Object.values(appointments).forEach(app => {
                    if (app.date === dateStr &&
                        selectedMechanics.includes(app.mechanicId) &&
                        selectedPriorities.includes((app.priority || 'normal') as Priority)) {
                        count++;
                    }
                });

                return {
                    date: format(day, 'dd/MM', { locale: ptBR }),
                    count,
                };
            });

        return {
            businessDays,
            capacityPerMechanic,
            mechanicStats,
            dailyData,
        };
    }, [mechanics, appointments, selectedMechanics, selectedPriorities, startDate, endDate]);

    return (
        <div className="max-w-7xl mx-auto pt-8 px-4 pb-12">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Dashboard - {format(startDate, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <p className="text-gray-500">
                    {stats.businessDays} dias úteis • {selectedMechanics.length} mecânicos selecionados
                </p>
            </div>

            {/* Filters */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <Filter className="text-brand-yellow-dark" size={24} />
                    <h3 className="text-xl font-bold text-gray-800">Filtros</h3>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            <Calendar size={14} className="inline mr-1" />
                            Data Inicial
                        </label>
                        <input
                            type="date"
                            value={format(startDate, 'yyyy-MM-dd')}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                            className="form-input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            <Calendar size={14} className="inline mr-1" />
                            Data Final
                        </label>
                        <input
                            type="date"
                            value={format(endDate, 'yyyy-MM-dd')}
                            onChange={(e) => setEndDate(new Date(e.target.value))}
                            className="form-input w-full"
                        />
                    </div>
                </div>

                {/* Mechanic Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                        <Users size={14} className="inline mr-1" />
                        Mecânicos ({selectedMechanics.length}/{mechanics.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {mechanics.map(mechanic => (
                            <button
                                key={mechanic.id}
                                onClick={() => toggleMechanic(mechanic.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedMechanics.includes(mechanic.id)
                                    ? 'bg-brand-yellow text-black shadow-md'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                            >
                                {mechanic.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                        Tipos de Serviço ({selectedPriorities.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(PRIORITY_LABELS) as Priority[])
                            .filter(p => p !== 'max')
                            .map(priority => (
                                <button
                                    key={priority}
                                    onClick={() => togglePriority(priority)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedPriorities.includes(priority)
                                            ? 'shadow-md text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                    style={{
                                        backgroundColor: selectedPriorities.includes(priority) && PRIORITY_COLORS[priority]
                                            ? PRIORITY_COLORS[priority]
                                            : undefined,
                                    }}
                                >
                                    {PRIORITY_LABELS[priority]}
                                </button>
                            ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold uppercase opacity-90">Média de Alocação</h3>
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-5xl font-bold">
                        {stats.mechanicStats.length > 0
                            ? Math.round(stats.mechanicStats.reduce((acc, curr) => acc + curr.allocation, 0) / stats.mechanicStats.length)
                            : 0}%
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold uppercase opacity-90">Total Agendamentos</h3>
                        <Clock size={24} />
                    </div>
                    <p className="text-5xl font-bold">
                        {stats.mechanicStats.reduce((acc, curr) => acc + curr.used, 0)}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold uppercase opacity-90">Mais Alocado</h3>
                        <Users size={24} />
                    </div>
                    <p className="text-2xl font-bold truncate">
                        {stats.mechanicStats[0]?.name || '-'}
                    </p>
                    <p className="text-sm opacity-90 font-medium">
                        {stats.mechanicStats[0]?.allocation || 0}% ocupação
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold uppercase opacity-90">Capacidade Total</h3>
                        <Calendar size={24} />
                    </div>
                    <p className="text-5xl font-bold">
                        {stats.mechanicStats.length * stats.capacityPerMechanic}
                    </p>
                    <p className="text-sm opacity-90">slots disponíveis</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Chart 1: Allocation % */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-brand-yellow rounded-full"></div>
                        Alocação por Mecânico (%)
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.mechanicStats}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#666" />
                                <YAxis dataKey="name" type="category" width={100} stroke="#666" />
                                <Tooltip
                                    formatter={(value: any) => [`${value}%`, 'Alocação']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="allocation" fill="#FCE300" radius={[0, 8, 8, 0]} barSize={28}>
                                    {stats.mechanicStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.allocation > 90 ? '#ef4444' : entry.allocation > 70 ? '#f59e0b' : '#FCE300'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Priority Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Distribuição por Tipo de Serviço
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.mechanicStats}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="max" name="Máximo" stackId="a" fill={PRIORITY_COLORS.max} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="high" name="Alto" stackId="a" fill={PRIORITY_COLORS.high} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="normal" name="Normal" stackId="a" fill={PRIORITY_COLORS.normal} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="low" name="Baixo" stackId="a" fill={PRIORITY_COLORS.low} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="zero" name="Zero" stackId="a" fill={PRIORITY_COLORS.zero} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="absence" name="Ausência" stackId="a" fill={PRIORITY_COLORS.absence} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Daily Trend Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    Tendência Diária de Agendamentos
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={stats.dailyData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
