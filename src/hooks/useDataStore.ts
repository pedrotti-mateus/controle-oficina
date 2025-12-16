import { useState, useEffect } from 'react';
import type { Mechanic, Appointment, Priority } from '../types';
import { TIME_SLOTS, LUNCH_SLOTS } from '../constants';
import { supabase } from '../lib/supabase';

export function useDataStore() {
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);
    const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mechanicsRes, appointmentsRes] = await Promise.all([
                supabase.from('mechanics').select('*'),
                supabase.from('appointments').select('*')
            ]);

            if (mechanicsRes.data) {
                setMechanics(mechanicsRes.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
            }
            if (appointmentsRes.data) {
                const appointmentsMap: Record<string, Appointment> = {};
                appointmentsRes.data.forEach((app: any) => {
                    const key = `${app.date}-${app.mechanic_id}-${app.time}`;
                    appointmentsMap[key] = {
                        id: app.id,
                        mechanicId: app.mechanic_id,
                        date: app.date,
                        time: app.time,
                        clientName: app.client_name,
                        serviceDescription: app.service_description,
                        priority: app.priority as Priority,
                    };
                });
                setAppointments(appointmentsMap);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addMechanic = async (name: string) => {
        // Get max order
        const maxOrder = mechanics.length > 0 ? Math.max(...mechanics.map(m => m.order || 0)) : 0;

        const { data, error } = await supabase
            .from('mechanics')
            .insert([{ name, order: maxOrder + 1 }])
            .select()
            .single();

        if (error) {
            console.error('Error adding mechanic:', error);
            return;
        }

        if (data) {
            setMechanics((prev) => [...prev, data]);
        }
    };

    const removeMechanic = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este mecânico?')) {
            const { error } = await supabase.from('mechanics').delete().eq('id', id);

            if (error) {
                console.error('Error removing mechanic:', error);
                return;
            }

            setMechanics((prev) => prev.filter((m) => m.id !== id));
            // Also remove appointments locally for this mechanic to update UI immediately
            // (Though cascade delete handles DB, local state needs update)
            setAppointments((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (next[key].mechanicId === id) {
                        delete next[key];
                    }
                });
                return next;
            });
        }
    };

    const reorderMechanics = async (newMechanics: Mechanic[]) => {
        // Optimistic update
        setMechanics(newMechanics);

        // Update in DB
        const updates = newMechanics.map((m, index) => ({
            id: m.id,
            name: m.name,
            order: index + 1
        }));

        const { error } = await supabase
            .from('mechanics')
            .upsert(updates)
            .select();

        if (error) {
            console.error('Error reordering mechanics:', error);
            // Revert on error would be ideal, but for now just log
            fetchData(); // Refetch to sync
        }
    };

    const saveAppointmentRange = async (
        date: string,
        startTime: string,
        endTime: string,
        mechanicId: string,
        data: { clientName: string; serviceDescription: string; priority: Priority }
    ) => {
        const startIndex = TIME_SLOTS.indexOf(startTime);
        const endIndex = TIME_SLOTS.indexOf(endTime);

        if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) return;

        const upsertData = [];
        const keysToUpdate: string[] = [];

        for (let i = startIndex; i <= endIndex; i++) {
            const time = TIME_SLOTS[i];
            if (LUNCH_SLOTS.includes(time)) continue;

            keysToUpdate.push(`${date}-${mechanicId}-${time}`);
            upsertData.push({
                mechanic_id: mechanicId,
                date,
                time,
                client_name: data.clientName,
                service_description: data.serviceDescription,
                priority: data.priority,
            });
        }

        if (upsertData.length === 0) return;

        const { data: savedData, error } = await supabase
            .from('appointments')
            .upsert(upsertData, { onConflict: 'mechanic_id,date,time' })
            .select();

        if (error) {
            console.error('Error saving appointments:', error);
            return;
        }

        if (savedData) {
            setAppointments((prev) => {
                const next = { ...prev };
                savedData.forEach((app: any) => {
                    const key = `${app.date}-${app.mechanic_id}-${app.time}`;
                    next[key] = {
                        id: app.id,
                        mechanicId: app.mechanic_id,
                        date: app.date,
                        time: app.time,
                        clientName: app.client_name,
                        serviceDescription: app.service_description,
                        priority: app.priority as Priority,
                    };
                });
                return next;
            });
        }
    };

    const deleteAppointment = async (id: string) => {
        const { error } = await supabase.from('appointments').delete().eq('id', id);

        if (error) {
            console.error('Error deleting appointment:', error);
            return;
        }

        setAppointments((prev) => {
            const next = { ...prev };
            const keyToDelete = Object.keys(next).find((key) => next[key].id === id);
            if (keyToDelete) {
                delete next[keyToDelete];
            }
            return next;
        });
    };

    const getAppointment = (date: string, time: string, mechanicId: string) => {
        const key = `${date}-${mechanicId}-${time}`;
        return appointments[key];
    };

    return {
        mechanics,
        addMechanic,
        removeMechanic,
        reorderMechanics,
        appointments,
        saveAppointmentRange,
        deleteAppointment,
        getAppointment,
        loading,
    };
}
