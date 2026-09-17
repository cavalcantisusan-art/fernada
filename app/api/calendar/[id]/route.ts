import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function toUtcStamp(date: string, time: string) {
  const value = new Date(`${date}T${time.slice(0, 8)}-03:00`);
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function addMinutes(date: string, time: string, minutes: number) {
  const value = new Date(`${date}T${time.slice(0, 8)}-03:00`);
  value.setMinutes(value.getMinutes() + minutes);
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;
  if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, appointment_date, appointment_time, status, payment_status, room_token')
    .eq('id', id)
    .single();

  if (!appointment) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });

  const start = toUtcStamp(appointment.appointment_date, appointment.appointment_time);
  const end = addMinutes(appointment.appointment_date, appointment.appointment_time, 50);
  const origin = process.env.APP_URL?.replace(/\/$/, '') || '';
  const roomUrl = appointment.status === 'confirmed' && appointment.payment_status === 'paid'
    ? `${origin}/sala/${appointment.room_token}`
    : `${origin}/dashboard`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fernanda Rabelo Psicologia Online//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@fernanda-rabelo-psicologia-online`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs('Consulta online com Fernanda Rabelo')}`,
    `DESCRIPTION:${escapeIcs('Sessão online de 50 minutos. Acesse sua Área da Paciente antes do horário.')}`,
    `URL:${escapeIcs(roomUrl)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="consulta-${appointment.appointment_date}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
