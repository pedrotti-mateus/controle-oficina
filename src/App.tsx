import { useState } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { useDataStore } from './hooks/useDataStore';
import { MonthNavigation } from './components/MonthNavigation';
import { MechanicManager } from './components/MechanicManager';
import { DayGrid } from './components/DayGrid';
import { EditSlotModal } from './components/EditSlotModal';
import type { Priority } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { mechanics, addMechanic, removeMechanic, reorderMechanics, appointments, saveAppointmentRange, getAppointment } = useDataStore();

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

  const handleSaveSlot = (data: { clientName: string; serviceDescription: string; priority: Priority; endTime: string }) => {
    if (editingSlot) {
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
    }
  };

  const currentAppointment = editingSlot
    ? getAppointment(editingSlot.date, editingSlot.time, editingSlot.mechanicId)
    : undefined;

  return (
    <div className="container mx-auto p-4 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Oficina</h1>
        <p className="text-gray-600">Gerenciamento diário de demanda</p>
      </header>

      <MechanicManager
        mechanics={mechanics}
        onAdd={addMechanic}
        onRemove={removeMechanic}
        onReorder={reorderMechanics}
      />

      <MonthNavigation
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <div className="flex flex-col gap-8">
        {daysInMonth.map((day) => (
          <DayGrid
            key={day.toISOString()}
            date={day}
            mechanics={mechanics}
            appointments={appointments}
            onSlotClick={handleSlotClick}
          />
        ))}
      </div>

      <EditSlotModal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        onSave={handleSaveSlot}
        initialData={currentAppointment}
        title={editingSlot ? `Editar: ${format(new Date(editingSlot.date), 'dd/MM')} - ${editingSlot.time}` : ''}
        startTime={editingSlot?.time || ''}
      />
    </div>
  );
}

export default App;
