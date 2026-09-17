import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleConfig, requireProfessional, serviceHeaders } from '@/lib/professional';

export async function PATCH(request: NextRequest) {
  const auth = await requireProfessional();
  if (!auth) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });

  const config = getServiceRoleConfig();
  if (!config) return NextResponse.json({ error: 'Servidor não configurado.' }, { status: 503 });

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

  const response = await fetch(`${config.url}/rest/v1/appointments?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...serviceHeaders(config.key), Prefer: 'return=representation' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Não foi possível atualizar a consulta.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, appointment: (await response.json())[0] ?? null });
}
