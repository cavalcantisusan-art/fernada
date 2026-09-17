import { NextRequest, NextResponse } from 'next/server';

const AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function headers(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };
}

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
  return selected > today && weekday !== 0 && weekday !== 6;
}

export async function GET(request: NextRequest) {
  const config = getSupabaseConfig();
  const date = request.nextUrl.searchParams.get('date') ?? '';

  if (!config) {
    return NextResponse.json(
      {
        bookingEnabled: false,
        availableTimes: AVAILABLE_TIMES,
        reason: 'database_not_configured',
      },
      { status: 503 },
    );
  }

  if (!isValidDate(date) || !isFutureWeekday(date)) {
    return NextResponse.json({ error: 'Data inválida para atendimento.' }, { status: 400 });
  }

  const query = new URLSearchParams({
    select: 'appointment_time',
    appointment_date: `eq.${date}`,
    status: 'neq.cancelled',
  });

  const response = await fetch(`${config.url}/rest/v1/appointments?${query.toString()}`, {
    headers: headers(config.serviceRoleKey),
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Não foi possível consultar os horários.' }, { status: 502 });
  }

  const rows = (await response.json()) as Array<{ appointment_time: string }>;
  const occupied = new Set(rows.map((row) => row.appointment_time.slice(0, 5)));

  return NextResponse.json({
    bookingEnabled: true,
    availableTimes: AVAILABLE_TIMES.filter((time) => !occupied.has(time)),
  });
}

export async function POST(request: NextRequest) {
  const config = getSupabaseConfig();

  if (!config) {
    return NextResponse.json(
      {
        error: 'Agendamento automático ainda não está configurado.',
        code: 'DATABASE_NOT_CONFIGURED',
        whatsapp: 'https://wa.me/5581991930007',
      },
      { status: 503 },
    );
  }

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

  if (!/^[+()\d\s-]{10,20}$/.test(phone)) {
    return NextResponse.json({ error: 'Informe um telefone válido.' }, { status: 400 });
  }

  if (!isValidDate(appointmentDate) || !isFutureWeekday(appointmentDate)) {
    return NextResponse.json({ error: 'Escolha uma data futura em dia útil.' }, { status: 400 });
  }

  if (!AVAILABLE_TIMES.includes(appointmentTime)) {
    return NextResponse.json({ error: 'Horário indisponível.' }, { status: 400 });
  }

  const response = await fetch(`${config.url}/rest/v1/appointments`, {
    method: 'POST',
    headers: {
      ...headers(config.serviceRoleKey),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      patient_name: patientName,
      email,
      phone,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'pending',
      payment_status: 'pending',
    }),
  });

  if (response.status === 409) {
    return NextResponse.json(
      { error: 'Esse horário acabou de ser reservado. Escolha outro horário.' },
      { status: 409 },
    );
  }

  if (!response.ok) {
    const details = await response.text();
    console.error('Supabase appointment insert failed:', response.status, details);
    return NextResponse.json({ error: 'Não foi possível concluir a reserva.' }, { status: 502 });
  }

  const rows = (await response.json()) as Array<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
  }>;

  const appointment = rows[0];
  return NextResponse.json(
    {
      id: appointment.id,
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time.slice(0, 5),
      status: appointment.status,
    },
    { status: 201 },
  );
}
