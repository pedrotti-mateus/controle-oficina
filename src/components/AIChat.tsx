import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot } from 'lucide-react';
import type { Mechanic } from '../types';
import { format, addDays, nextDay, isSameDay } from 'date-fns';

interface AIChatProps {
    mechanics: Mechanic[];
    onSchedule: (data: {
        date: string;
        time: string;
        mechanicId: string;
        clientName: string;
        serviceDescription: string;
    }) => { success: boolean; message: string };
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export function AIChat({ mechanics, onSchedule }: AIChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Sou seu assistente virtual. Posso agendar serviços para você. Tente algo como: "Agendar troca de óleo para Transportadora ABC amanhã às 14h com Jacir"',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const parseDate = (text: string): Date | null => {
        const lowerText = text.toLowerCase();
        const today = new Date();

        if (lowerText.includes('hoje')) return today;
        if (lowerText.includes('amanhã') || lowerText.includes('amanha')) return addDays(today, 1);

        // Weekdays
        const weekDays = [
            { name: 'domingo', index: 0 },
            { name: 'segunda', index: 1 },
            { name: 'terça', index: 2 },
            { name: 'terca', index: 2 },
            { name: 'quarta', index: 3 },
            { name: 'quinta', index: 4 },
            { name: 'sexta', index: 5 },
            { name: 'sábado', index: 6 },
            { name: 'sabado', index: 6 },
        ];

        for (const day of weekDays) {
            if (lowerText.includes(day.name)) {
                // Find next occurrence of this day
                // If today is the day, nextDay will give next week. 
                // Logic: if user says "segunda" and today is "terça", they mean next monday.
                // If user says "sexta" and today is "segunda", they mean this friday.
                return nextDay(today, day.index as 0 | 1 | 2 | 3 | 4 | 5 | 6);
            }
        }

        // Specific date dd/mm
        const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
        if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            const month = parseInt(dateMatch[2]) - 1; // 0-indexed
            const year = today.getFullYear();

            // Handle year rollover if needed (e.g. in Dec booking for Jan)
            let date = new Date(year, month, day);
            if (date < today && !isSameDay(date, today)) {
                date.setFullYear(year + 1);
            }
            return date;
        }

        return null;
    };

    const parseTime = (text: string): string | null => {
        // HH:mm or HHh
        const timeMatch = text.match(/(\d{1,2})[:h](\d{2})?/i);
        if (timeMatch) {
            let hour = parseInt(timeMatch[1]);
            let minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;

            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            }
        }
        return null;
    };

    const findMechanic = (text: string): Mechanic | null => {
        const lowerText = text.toLowerCase();
        // Sort by length desc to match longer names first (e.g. "Marcos Petersen" before "Marcos")
        const sortedMechanics = [...mechanics].sort((a, b) => b.name.length - a.name.length);

        for (const mechanic of sortedMechanics) {
            if (lowerText.includes(mechanic.name.toLowerCase())) {
                return mechanic;
            }
            // Try first name only
            const firstName = mechanic.name.split(' ')[0].toLowerCase();
            if (lowerText.includes(firstName)) {
                return mechanic;
            }
        }
        return null;
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        // Process Intent
        const lowerInput = input.toLowerCase();

        // 1. Extract Date
        const date = parseDate(lowerInput);

        // 2. Extract Time
        const time = parseTime(lowerInput);

        // 3. Extract Mechanic
        const mechanic = findMechanic(lowerInput);

        // 4. Extract Client & Service (Heuristic: remove known entities and assume the rest is content)
        // This is tricky without NLP, so we'll try to guess based on "para [Cliente]" and "de [Serviço]" or just take the rest.
        // For now, let's try a simple pattern: "Agendar [Service] para [Client]..."

        let clientName = "Cliente não identificado";
        let serviceDescription = "Serviço não identificado";

        // Simple extraction attempts
        const paraIndex = lowerInput.indexOf(' para ');
        if (paraIndex !== -1) {
            // Assume text after "para" is client, until a date/time/mechanic keyword or end
            // This is hard to do perfectly with regex.
            // Let's simplify: If we have the core 3 (Date, Time, Mechanic), we can try to infer the rest.
        }

        // Alternative: Just ask for missing info or confirm found info.

        if (!date || !time || !mechanic) {
            const missing: string[] = [];
            if (!date) missing.push('data');
            if (!time) missing.push('horário');
            if (!mechanic) missing.push('mecânico');

            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        text: `Entendi que você quer agendar, mas preciso de mais informações. Não consegui identificar: ${missing.join(', ')}.`,
                        sender: 'bot',
                        timestamp: new Date(),
                    },
                ]);
            }, 500);
            return;
        }

        // If we have the basics, let's try to clean up the string to get client/service
        // Remove mechanic name
        let cleanText = input.replace(new RegExp(mechanic.name, 'gi'), '')
            .replace(new RegExp(mechanic.name.split(' ')[0], 'gi'), '');

        // Remove date keywords
        cleanText = cleanText.replace(/hoje/gi, '').replace(/amanhã/gi, '').replace(/amanha/gi, '');
        // Remove time
        cleanText = cleanText.replace(/(\d{1,2})[:h](\d{2})?/gi, '');
        // Remove "Agendar", "Marcar", "para", "com", "as", "às"
        cleanText = cleanText.replace(/agendar/gi, '').replace(/marcar/gi, '')
            .replace(/ para /gi, ' ').replace(/ com /gi, ' ')
            .replace(/ as /gi, ' ').replace(/ às /gi, ' ')
            .replace(/ o /gi, ' ').replace(/ a /gi, ' ');

        // What remains is likely client and service.
        // Let's just use the whole remaining string as "Descrição/Cliente" combined for now, 
        // or split by some logic if possible.
        // A common pattern is "Service para Client".

        const parts = cleanText.split(' ').filter(s => s.trim().length > 0);
        const combinedInfo = parts.join(' ');

        // Heuristic: if "para" was in original, maybe we can split?
        // Let's just set Client = "Cliente (Via Chat)" and Service = combinedInfo to be safe,
        // or try to be smarter.

        clientName = combinedInfo || "Cliente (Via Chat)";
        serviceDescription = "Agendamento via Chat";

        // Try to split "Service" and "Client" if "para" exists in original input
        const paraSplit = input.split(/ para /i);
        if (paraSplit.length > 1) {
            // "Agendar [Troca de oleo] para [Transportadora]..."
            // First part likely has service, second part has client
            let potentialService = paraSplit[0].replace(/agendar/gi, '').replace(/marcar/gi, '').trim();
            let potentialClient = paraSplit[1];

            // Clean potentialClient from date/time/mechanic
            potentialClient = potentialClient.replace(new RegExp(mechanic.name, 'gi'), '')
                .replace(/hoje/gi, '').replace(/amanhã/gi, '')
                .replace(/(\d{1,2})[:h](\d{2})?/gi, '')
                .replace(/ com /gi, '')
                .replace(/ às /gi, '')
                .trim();

            if (potentialClient) clientName = potentialClient;
            if (potentialService) serviceDescription = potentialService;
        }

        // Execute Schedule
        const dateStr = format(date, 'yyyy-MM-dd');
        const result = onSchedule({
            date: dateStr,
            time,
            mechanicId: mechanic.id,
            clientName,
            serviceDescription
        });

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: result.success
                        ? `✅ Agendado! ${serviceDescription} para ${clientName} no dia ${format(date, 'dd/MM')} às ${time} com ${mechanic.name}.`
                        : `❌ Não foi possível agendar: ${result.message}`,
                    sender: 'bot',
                    timestamp: new Date(),
                },
            ]);
        }, 500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col transition-all animate-in slide-in-from-bottom-5 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-brand-yellow p-3 flex justify-between items-center border-b border-yellow-400">
                        <div className="flex items-center gap-2">
                            <Bot size={20} className="text-black" />
                            <span className="font-bold text-black">Assistente Oficina</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-yellow-400 rounded-full transition-colors"
                        >
                            <X size={18} className="text-black" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.sender === 'user'
                                        ? 'bg-black text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Digite seu agendamento..."
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow"
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="bg-black text-brand-yellow p-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 ${isOpen
                    ? 'bg-gray-200 text-gray-600 rotate-90'
                    : 'bg-brand-yellow text-black hover:scale-110 hover:shadow-xl'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
}
