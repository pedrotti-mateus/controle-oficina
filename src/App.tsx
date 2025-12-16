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

      <div className="flex justify-center mb-6">
        <MonthNavigation
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
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
    </div>
  );
}

export default App;
