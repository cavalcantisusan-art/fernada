import { NextRequest, NextResponse } from 'next/server';
import { createAppointment, getAvailableTimesForDate, isThursday } from '@/lib/data-store';
import { getLocalSession } from '@/lib/session';

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isFutureWeekday(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  selected.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekday = selected.getDay();
  // Weekday must not be Sunday (0) or Saturday (6)
  return selected >= today && weekday !== 0 && weekday !== 6;
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? '';

  if (!isValidDate(date) || !isFutureWeekday(date)) {
    return NextResponse.json({ error: 'Data inválida para atendimento.' }, { status: 400 });
  }

  // Thursday check: 09h-19h not bookable online as per professional specifications
  if (isThursday(date)) {
    return NextResponse.json({
      bookingEnabled: false,
      availableTimes: [],
      reason: 'Quinta-feira não possui horários para agendamento online (reservada para atividades externas e consultório).',
    });
  }

  const availableTimes = await getAvailableTimesForDate(date);

  return NextResponse.json({
    bookingEnabled: true,
    availableTimes,
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const patientName = String(body.patientName ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const phone = String(body.phone ?? '').trim();
  const appointmentDate = String(body.appointmentDate ?? '').trim();
  const appointmentTime = String(body.appointmentTime ?? '').trim();

  if (patientName.length < 3 || patientName.length > 120) {
    return NextResponse.json({ error: 'Informe o nome completo.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  }

  if (!/^[+()\d\s-]{9,20}$/.test(phone)) {
    return NextResponse.json({ error: 'Informe um telefone válido.' }, { status: 400 });
  }

  if (!isValidDate(appointmentDate) || !isFutureWeekday(appointmentDate)) {
    return NextResponse.json({ error: 'Escolha uma data em dia útil.' }, { status: 400 });
  }

  if (isThursday(appointmentDate)) {
    return NextResponse.json(
      { error: 'Quinta-feira não possui horários para agendamento online.' },
      { status: 400 }
    );
  }

  // Get current user session if any
  const session = await getLocalSession();
  const userId = session?.id || null;

  try {
    const appointment = await createAppointment({
      patient_name: patientName,
      email,
      phone,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      user_id: userId,
      status: 'confirmed',
      payment_status: 'paid', // Mark as confirmed for seamless patient onboarding
    });

    return NextResponse.json(
      {
        id: appointment.id,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time.slice(0, 5),
        status: appointment.status,
        roomToken: appointment.room_token,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao agendar consulta.';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
