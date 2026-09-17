import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { sendAppointmentConfirmation } from '@/lib/notifications';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function supabaseHeaders(serviceRoleKey: string, prefer = 'return=minimal') {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: prefer,
  };
}

async function updateAppointment(
  appointmentId: string,
  values: Record<string, string | null>,
) {
  const config = getSupabaseConfig();
  if (!config) throw new Error('Supabase server credentials are not configured.');

  const response = await fetch(`${config.url}/rest/v1/appointments?id=eq.${appointmentId}`, {
    method: 'PATCH',
    headers: supabaseHeaders(config.serviceRoleKey),
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase appointment update failed: ${response.status} ${details}`);
  }
}

async function getAppointment(appointmentId: string) {
  const config = getSupabaseConfig();
  if (!config) return null;

  const response = await fetch(
    `${config.url}/rest/v1/appointments?id=eq.${encodeURIComponent(appointmentId)}&select=patient_name,email,phone,appointment_date,appointment_time&limit=1`,
    {
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) return null;
  const rows = (await response.json()) as Array<{
    patient_name: string;
    email: string;
    phone: string;
    appointment_date: string;
    appointment_time: string;
  }>;
  return rows[0] ?? null;
}

function paymentIntentId(session: Stripe.Checkout.Session) {
  if (!session.payment_intent) return null;
  return typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent.id;
}

async function confirmPaidSession(session: Stripe.Checkout.Session) {
  const appointmentId = session.metadata?.appointment_id;
  if (!appointmentId) return;

  await updateAppointment(appointmentId, {
    status: 'confirmed',
    payment_status: 'paid',
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId(session),
  });

  // Notifications are best-effort: a provider failure must never make Stripe retry
  // an already-successful payment confirmation indefinitely.
  try {
    const appointment = await getAppointment(appointmentId);
    if (appointment) {
      await sendAppointmentConfirmation({
        patientName: appointment.patient_name,
        email: appointment.email,
        phone: appointment.phone,
        appointmentDate: appointment.appointment_date,
        appointmentTime: appointment.appointment_time,
      });
    }
  } catch (error) {
    console.error('Appointment confirmation notification failed:', error);
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Invalid Stripe webhook signature:', error);
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid') {
          await confirmPaidSession(session);
        }
        break;
      }
      case 'checkout.session.async_payment_succeeded': {
        await confirmPaidSession(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointment_id;
        if (appointmentId) {
          await updateAppointment(appointmentId, {
            status: 'cancelled',
            payment_status: 'failed',
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId(session),
          });
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointment_id;
        if (appointmentId) {
          await updateAppointment(appointmentId, {
            status: 'cancelled',
            payment_status: 'failed',
            stripe_checkout_session_id: session.id,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);
    return NextResponse.json({ error: 'Falha ao processar webhook.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
