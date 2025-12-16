export type Priority = 'max' | 'high' | 'normal' | 'low' | 'zero' | 'absence';

export interface Mechanic {
  id: string;
  name: string;
  order: number;
}

export interface Appointment {
  id: string;
  mechanicId: string;
  date: string; // YYYY-MM-DD
  time: string; // "07:30"
  clientName: string;
  serviceDescription: string;
  priority: Priority;
}

export interface DayConfig {
  date: Date;
  isWeekend: boolean;
}
