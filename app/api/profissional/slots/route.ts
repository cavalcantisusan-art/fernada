import { NextRequest, NextResponse } from 'next/server';
import { requireProfessional } from '@/lib/professional';

const VALID_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export async function POST(request: NextRequest) {
  const auth = await requireProfessional();
  if (!auth) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const action = String(body.action ?? 'block');
  const appointmentDate = String(body.appointmentDate ?? '');
  const appointmentTime = String(body.appointmentTime ?? '');
  const reason = String(body.reason ?? '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !VALID_TIMES.includes(appointmentTime)) {
    return NextResponse.json({ error: 'Data ou horário inválido.' }, { status: 400 });
  }

  if (action === 'unblock') {
    const { error } = await auth.supabase
      .from('blocked_slots')
      .delete()
      .eq('appointment_date', appointmentDate)
      .eq('appointment_time', appointmentTime);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await auth.supabase
    .from('blocked_slots')
    .insert({ appointment_date: appointmentDate, appointment_time: appointmentTime, reason: reason || null });

  if (error) {
    if (error.code === '23505') return NextResponse.json({ ok: true });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
