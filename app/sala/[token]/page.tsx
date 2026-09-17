import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Clock, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import VideoRoom from '@/components/VideoRoom';

export default async function RoomPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null;
  if (!userId) redirect(`/login?next=/sala/${token}`);

  const [{ data: profile }, { data: appointment }] = await Promise.all([
    supabase.from('profiles').select('role, full_name').eq('id', userId).single(),
    supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, status, payment_status, room_token')
      .eq('room_token', token)
      .single(),
  ]);

  if (!appointment) notFound();
  if (appointment.status !== 'confirmed' || appointment.payment_status !== 'paid') {
    return <RoomMessage title="Sala ainda não liberada" text="A sala fica disponível após a confirmação da consulta e do pagamento." href="/dashboard" />;
  }

  const appointmentStart = new Date(`${appointment.appointment_date}T${appointment.appointment_time.slice(0, 8)}-03:00`);
  const opensAt = new Date(appointmentStart.getTime() - 30 * 60 * 1000);
  const closesAt = new Date(appointmentStart.getTime() + 90 * 60 * 1000);
  const now = new Date();
  const isProfessional = profile?.role === 'professional';
  const roomOpen = now >= opensAt && now <= closesAt;

  if (!roomOpen) {
    const when = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Recife' }).format(appointmentStart);
    return <RoomMessage title="Sala protegida por horário" text={`Esta sala abre 30 minutos antes da consulta e fecha 90 minutos depois. Consulta: ${when}.`} href={isProfessional ? '/profissional' : '/dashboard'} />;
  }

  return (
    <main className="min-h-screen bg-[#0B1120] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between gap-3 px-2 text-white/70">
          <Link href={isProfessional ? '/profissional' : '/dashboard'} className="text-sm font-medium hover:text-white">← Voltar</Link>
          <div className="flex items-center gap-2 text-xs"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Sala acessível apenas a usuários autorizados</div>
        </div>
        <VideoRoom roomToken={token} isProfessional={isProfessional} />
      </div>
    </main>
  );
}

function RoomMessage({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-6 text-[#2D3748]">
      <div className="w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <Clock className="mx-auto h-12 w-12 text-[#319795]" />
        <h1 className="mt-5 text-2xl font-bold">{title}</h1>
        <p className="mt-3 leading-relaxed text-[#718096]">{text}</p>
        <Link href={href} className="mt-6 inline-flex rounded-xl bg-[#319795] px-5 py-3 font-semibold text-white">Voltar</Link>
      </div>
    </main>
  );
}
