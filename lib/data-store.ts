import crypto from 'crypto';

export type Appointment = {
  id: string;
  patient_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  room_token: string;
  user_id?: string | null;
  created_at: string;
};

export type BlockedSlot = {
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
};

export const STANDARD_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

// In-memory fallback cache with cross-invocation support in Node global
interface GlobalStore {
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
}

declare global {
  var __psi_store: GlobalStore | undefined;
}

function initStore(): GlobalStore {
  if (!global.__psi_store) {
    // Generate a few realistic demonstration appointments for upcoming days (excluding Thursdays)
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    const nextWorkday = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      // Skip weekend (0=Sun, 6=Sat) and Thursday (4)
      while (d.getDay() === 0 || d.getDay() === 6 || d.getDay() === 4) {
        d.setDate(d.getDate() + 1);
      }
      return formatDate(d);
    };

    const date1 = nextWorkday(1);
    const date2 = nextWorkday(3);

    global.__psi_store = {
      appointments: [
        {
          id: 'demo-app-1',
          patient_name: 'Mariana Silva',
          email: 'mariana.silva@email.com',
          phone: '(81) 98877-6655',
          appointment_date: date1,
          appointment_time: '10:00',
          status: 'confirmed',
          payment_status: 'paid',
          room_token: 'sala-mariana-silva',
          user_id: 'paciente-demo',
          created_at: new Date().toISOString(),
        },
        {
          id: 'demo-app-2',
          patient_name: 'Lucas Almeida',
          email: 'lucas.almeida@email.com',
          phone: '(81) 99122-3344',
          appointment_date: date2,
          appointment_time: '15:00',
          status: 'confirmed',
          payment_status: 'paid',
          room_token: 'sala-lucas-almeida',
          user_id: null,
          created_at: new Date().toISOString(),
        },
      ],
      blockedSlots: [],
    };
  }
  return global.__psi_store;
}

export function isThursday(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getDay() === 4;
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const store = initStore();
  return [...store.appointments].sort((a, b) => {
    const comp = a.appointment_date.localeCompare(b.appointment_date);
    if (comp !== 0) return comp;
    return a.appointment_time.localeCompare(b.appointment_time);
  });
}

export async function getAppointmentsForUser(email?: string, userId?: string): Promise<Appointment[]> {
  const all = await getAllAppointments();
  if (!email && !userId) return all;

  const normalizedEmail = (email || '').toLowerCase().trim();
  return all.filter((app) => {
    if (userId && app.user_id === userId) return true;
    if (normalizedEmail && app.email.toLowerCase() === normalizedEmail) return true;
    return false;
  });
}

export async function getAppointmentByRoomToken(token: string): Promise<Appointment | null> {
  const all = await getAllAppointments();
  return all.find((app) => app.room_token === token) || null;
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const all = await getAllAppointments();
  return all.find((app) => app.id === id) || null;
}

export async function createAppointment(data: {
  patient_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  user_id?: string | null;
  status?: 'pending' | 'confirmed';
  payment_status?: 'pending' | 'paid';
}): Promise<Appointment> {
  const store = initStore();

  if (isThursday(data.appointment_date)) {
    throw new Error('Quinta-feira não possui horários disponíveis para agendamento.');
  }

  // Check if slot already taken
  const conflict = store.appointments.some(
    (app) =>
      app.appointment_date === data.appointment_date &&
      app.appointment_time.slice(0, 5) === data.appointment_time.slice(0, 5) &&
      app.status !== 'cancelled'
  );
  if (conflict) {
    throw new Error('Esse horário já foi reservado.');
  }

  const roomToken = `consulta-${crypto.randomBytes(6).toString('hex')}`;
  const appointment: Appointment = {
    id: `app-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    patient_name: data.patient_name,
    email: data.email,
    phone: data.phone,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    status: data.status || 'confirmed',
    payment_status: data.payment_status || 'paid',
    room_token: roomToken,
    user_id: data.user_id || null,
    created_at: new Date().toISOString(),
  };

  store.appointments.push(appointment);
  return appointment;
}

export async function updateAppointment(
  id: string,
  patch: Partial<Pick<Appointment, 'status' | 'payment_status' | 'room_token'>>
): Promise<Appointment | null> {
  const store = initStore();
  const index = store.appointments.findIndex((a) => a.id === id);
  if (index === -1) return null;

  store.appointments[index] = {
    ...store.appointments[index],
    ...patch,
  };
  return store.appointments[index];
}

export async function getBlockedSlots(): Promise<BlockedSlot[]> {
  const store = initStore();
  return [...store.blockedSlots];
}

export async function toggleSlotBlocked(date: string, time: string): Promise<boolean> {
  const store = initStore();
  const formattedTime = time.slice(0, 5);
  const existingIdx = store.blockedSlots.findIndex(
    (b) => b.appointment_date === date && b.appointment_time.slice(0, 5) === formattedTime
  );

  if (existingIdx !== -1) {
    store.blockedSlots.splice(existingIdx, 1);
    return false; // Now unblocked
  } else {
    store.blockedSlots.push({
      appointment_date: date,
      appointment_time: formattedTime,
      reason: 'Bloqueado pela profissional',
    });
    return true; // Now blocked
  }
}

export async function getAvailableTimesForDate(dateStr: string): Promise<string[]> {
  // Thursdays are never bookable as per user constraints (09h às 19h indisponível)
  if (isThursday(dateStr)) {
    return [];
  }

  const store = initStore();
  const dateAppointments = store.appointments.filter(
    (a) => a.appointment_date === dateStr && a.status !== 'cancelled'
  );
  const occupiedTimes = new Set(dateAppointments.map((a) => a.appointment_time.slice(0, 5)));

  const blockedForDate = store.blockedSlots.filter((b) => b.appointment_date === dateStr);
  const blockedTimes = new Set(blockedForDate.map((b) => b.appointment_time.slice(0, 5)));

  return STANDARD_TIMES.filter((time) => !occupiedTimes.has(time) && !blockedTimes.has(time));
}
