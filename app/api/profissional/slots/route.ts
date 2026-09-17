import { NextRequest, NextResponse } from 'next/server';
import { requireProfessional } from '@/lib/professional';
import { toggleSlotBlocked } from '@/lib/data-store';

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

  const appointmentDate = String(body.appointmentDate ?? '');
  const appointmentTime = String(body.appointmentTime ?? '');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !VALID_TIMES.includes(appointmentTime)) {
    return NextResponse.json({ error: 'Data ou horário inválido.' }, { status: 400 });
  }

  const isBlocked = await toggleSlotBlocked(appointmentDate, appointmentTime);
  return NextResponse.json({ ok: true, blocked: isBlocked });
}
