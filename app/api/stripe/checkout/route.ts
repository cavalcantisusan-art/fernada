import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

const AVAILABLE_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
const CONSULTATION_PRICE_CENTS = 18000;
const CHECKOUT_HOLD_MINUTES = 45;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function supabaseHeaders(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today && date.getDay() !== 0 && date.getDay() !== 6;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseConfig();
  if (!supabase) {
    return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
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
  const consentAccepted = body.consentAccepted === true;

  if (patientName.length < 3 || patientName.length > 120) return NextResponse.json({ error: 'Informe o nome completo.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  if (!/^[+()\d\s-]{10,20}$/.test(phone)) return NextResponse.json({ error: 'Informe um telefone válido.' }, { status: 400 });
  if (!validDate(appointmentDate)) return NextResponse.json({ error: 'Escolha uma data futura em dia útil.' }, { status: 400 });
  if (!AVAILABLE_TIMES.includes(appointmentTime)) return NextResponse.json({ error: 'Horário inválido.' }, { status: 400 });
  if (!consentAccepted) return NextResponse.json({ error: 'É necessário aceitar os termos e o consentimento para teleatendimento.' }, { status: 400 });

  let userId: string | null = null;
  try {
    const authClient = await createServerSupabase();
    const { data } = await authClient.auth.getClaims();
    userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;
  } catch {
    userId = null;
  }

  const insertResponse = await fetch(`${supabase.url}/rest/v1/appointments`, {
    method: 'POST',
    headers: { ...supabaseHeaders(supabase.serviceRoleKey), Prefer: 'return=representation' },
    body: JSON.stringify({
      patient_name: patientName,
      email,
      phone,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'pending',
      payment_status: 'pending',
      user_id: userId,
      consent_accepted_at: new Date().toISOString(),
    }),
  });

  if (insertResponse.status === 409) return NextResponse.json({ error: 'Esse horário já foi reservado. Escolha outro.' }, { status: 409 });
  if (!insertResponse.ok) {
    const details = await insertResponse.text();
    console.error('Appointment insert failed:', insertResponse.status, details);
    return NextResponse.json({ error: 'Não foi possível reservar o horário.' }, { status: 502 });
  }

  const [appointment] = (await insertResponse.json()) as Array<{ id: string }>;

  try {
    const stripe = getStripe();
    const origin = process.env.APP_URL?.replace(/\/$/, '') || request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'pt-BR',
      customer_email: email,
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_HOLD_MINUTES * 60,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: CONSULTATION_PRICE_CENTS,
            product_data: {
              name: 'Consulta online com Fernanda Rabelo',
              description: `${appointmentDate} às ${appointmentTime} • sessão de 50 minutos`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/agendar/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/agendar?cancelled=1`,
      metadata: {
        appointment_id: appointment.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        patient_name: patientName.slice(0, 120),
        user_id: userId ?? '',
      },
    });

    await fetch(`${supabase.url}/rest/v1/appointments?id=eq.${appointment.id}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(supabase.serviceRoleKey), Prefer: 'return=minimal' },
      body: JSON.stringify({ stripe_checkout_session_id: session.id }),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout creation failed:', error);
    await fetch(`${supabase.url}/rest/v1/appointments?id=eq.${appointment.id}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(supabase.serviceRoleKey), Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'cancelled', payment_status: 'failed' }),
    });
    return NextResponse.json({ error: 'Não foi possível iniciar o pagamento.' }, { status: 502 });
  }
}
