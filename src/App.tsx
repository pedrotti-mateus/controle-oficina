import { useState } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { useDataStore } from './hooks/useDataStore';
import { MonthNavigation } from './components/MonthNavigation';
import { MechanicManager } from './components/MechanicManager';
import { DayGrid } from './components/DayGrid';
import { EditSlotModal } from './components/EditSlotModal';
import { AIChat } from './components/AIChat';
import type { Priority } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { mechanics, addMechanic, removeMechanic, reorderMechanics, appointments, saveAppointmentRange, deleteAppointment, getAppointment } = useDataStore();

  const [editingSlot, setEditingSlot] = useState<{
    date: string;
    time: string;
    mechanicId: string;
  } | null>(null);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleSlotClick = (date: string, time: string, mechanicId: string) => {
    setEditingSlot({ date, time, mechanicId });
  };

  const handleSaveSlot = (data: { clientName: string; serviceDescription: string; priority: Priority; endTime: string; additionalMechanics?: string[] }) => {
    if (editingSlot) {
      // Save for the primary mechanic
      saveAppointmentRange(
        editingSlot.date,
        editingSlot.time,
        data.endTime,
        editingSlot.mechanicId,
        {
          clientName: data.clientName,
          serviceDescription: data.serviceDescription,
          priority: data.priority,
        }
      );

      // Save for additional mechanics
      if (data.additionalMechanics && data.additionalMechanics.length > 0) {
        data.additionalMechanics.forEach(mechanicId => {
          saveAppointmentRange(
            editingSlot.date,
            editingSlot.time,
            data.endTime,
            mechanicId,
            {
              clientName: data.clientName,
              serviceDescription: data.serviceDescription,
              priority: data.priority,
            }
          );
        });
      }
    }
  };

  const currentAppointment = editingSlot
    ? getAppointment(editingSlot.date, editingSlot.time, editingSlot.mechanicId)
    : undefined;

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;

    const [year, month, day] = e.target.value.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);

    // Update current date to switch month view if necessary
    setCurrentDate(selectedDate);

    // Scroll to the specific day after a brief delay to allow rendering
    setTimeout(() => {
      const element = document.getElementById(`day-${day}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAISchedule = (data: {
    date: string;
    time: string;
    mechanicId: string;
    clientName: string;
    serviceDescription: string;
  }) => {
    // Check if slot is already taken
    const existingAppointment = getAppointment(data.date, data.time, data.mechanicId);
    if (existingAppointment) {
      return { success: false, message: 'Horário já ocupado.' };
    }

    // Check if it's lunch time
    if (['11:00', '12:00'].includes(data.time)) {
      return { success: false, message: 'Horário de almoço.' };
    }

    saveAppointmentRange(
      data.date,
      data.time,
      data.time, // Single slot for now via chat
      data.mechanicId,
      {
        clientName: data.clientName,
        serviceDescription: data.serviceDescription,
        priority: 'normal', // Default priority
      }
    );

    return { success: true, message: 'Agendamento realizado com sucesso.' };
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <header className="mb-8 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 self-start md:self-auto">
          <img src="/logo.jpg" alt="Guerra Pedrotti" className="h-6 md:h-8 object-contain" />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <MechanicManager
            mechanics={mechanics}
            onAdd={addMechanic}
            onRemove={removeMechanic}
            onReorder={reorderMechanics}
          />
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
        <MonthNavigation
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <div className="relative">
          <input
            type="date"
            onChange={handleDateSelect}
            className="form-input py-1 px-3 text-gray-700 font-medium cursor-pointer"
            title="Ir para data específica"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {daysInMonth.map((day) => (
          <DayGrid
            key={day.toISOString()}
            date={day}
            mechanics={mechanics}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onDelete={deleteAppointment}
          />
        ))}
      </div>

      <EditSlotModal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        onSave={handleSaveSlot}
        onDelete={() => {
          if (currentAppointment) {
            deleteAppointment(currentAppointment.id);
          }
        }}
        initialData={currentAppointment}
        title={editingSlot ? `Editar: ${format(new Date(editingSlot.date), 'dd/MM')} - ${editingSlot.time}` : ''}
        startTime={editingSlot?.time || ''}
        mechanics={mechanics}
        currentMechanicId={editingSlot?.mechanicId || ''}
      />

      <AIChat mechanics={mechanics} onSchedule={handleAISchedule} />
    </div>
  );
}

export default App;
