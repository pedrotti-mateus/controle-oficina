import { useState } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useDataStore } from './hooks/useDataStore';
import { MonthNavigation } from './components/MonthNavigation';
import { DayGrid } from './components/DayGrid';
import { EditSlotModal } from './components/EditSlotModal';
import { AIChat } from './components/AIChat';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MechanicManagement } from './components/MechanicManagement';
import { Settings } from './components/Settings';
import type { Priority } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'agenda' | 'mechanics' | 'dashboard' | 'settings'>('agenda');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
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

  const handleGoToDay = (date: Date) => {
    // Update current date to switch month view if necessary
    setCurrentDate(date);

    // Scroll to the specific day after a brief delay to allow rendering
    setTimeout(() => {
      const dataDateString = format(date, 'yyyy-MM-dd');
      const dayElement = document.querySelector(`[data-date="${dataDateString}"]`);
      if (dayElement) {
        dayElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
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
    <div className="container mx-auto p-4 pb-20 pt-24">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      {currentView === 'agenda' && (
        <>
          <header className="mb-8 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 self-start md:self-auto">
              <img src="/logo.jpg" alt="Guerra Pedrotti" className="h-6 md:h-8 object-contain" />
            </div>
          </header>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            <MonthNavigation
              currentDate={currentDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />

            <div className="relative">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && selectedDate) {
                      // Parse correctly to avoid timezone issues
                      const [year, month, day] = selectedDate.split('-').map(Number);
                      const parsedDate = new Date(year, month - 1, day);
                      if (!isNaN(parsedDate.getTime())) {
                        handleGoToDay(parsedDate);
                      }
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
                <button
                  onClick={() => {
                    if (selectedDate) {
                      // Parse correctly to avoid timezone issues
                      const [year, month, day] = selectedDate.split('-').map(Number);
                      const parsedDate = new Date(year, month - 1, day);
                      if (!isNaN(parsedDate.getTime())) {
                        handleGoToDay(parsedDate);
                        setSelectedDate(''); // Limpar após navegação
                      }
                    }
                  }}
                  disabled={!selectedDate}
                  className="w-10 h-10 rounded-full bg-brand-yellow hover:bg-yellow-400 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                  title="Ir para data"
                >
                  <ArrowRight size={20} className={selectedDate ? 'text-black' : 'text-gray-400'} />
                </button>
              </div>
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
        </>
      )}

      {currentView === 'mechanics' && (
        <MechanicManagement
          mechanics={mechanics}
          onAdd={addMechanic}
          onRemove={removeMechanic}
          onReorder={reorderMechanics}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          mechanics={mechanics}
          appointments={appointments}
          currentDate={currentDate}
        />
      )}

      {currentView === 'settings' && <Settings />}
    </div>
  );
}

export default App;
