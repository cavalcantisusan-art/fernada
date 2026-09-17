import { NextRequest, NextResponse } from 'next/server';
import { requireProfessional } from '@/lib/professional';
import { updateAppointment } from '@/lib/data-store';

export async function PATCH(request: NextRequest) {
  const auth = await requireProfessional();
  if (!auth) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const id = String(body.id ?? '');
  const status = String(body.status ?? '');
  if (!id || !['confirmed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  }

  const updated = await updateAppointment(id, { status: status as 'confirmed' | 'cancelled' });
  if (!updated) {
    return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, appointment: updated });
}
