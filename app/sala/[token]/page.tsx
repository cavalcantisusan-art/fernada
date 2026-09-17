import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getLocalSession } from '@/lib/session';
import { getAppointmentByRoomToken } from '@/lib/data-store';
import VideoRoom from '@/components/VideoRoom';

export default async function RoomPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // 1. Session check
  const localSession = await getLocalSession();
  let userId = localSession?.id || null;
  let isProfessional = localSession?.role === 'professional';

  if (!userId) {
    try {
      const supabase = await createClient();
      const { data: claimsData } = await supabase.auth.getClaims();
      userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null;
      if (userId) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
        isProfessional = profile?.role === 'professional';
      }
    } catch {
      // Supabase offline
    }
  }

  if (!userId) {
    redirect(`/login?next=/sala/${token}`);
  }

  // 2. Lookup appointment by token
  const appointment = await getAppointmentByRoomToken(token);

  return (
    <main className="min-h-screen bg-[#0B1120] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between gap-3 px-2 text-white/70">
          <Link
            href={isProfessional ? '/profissional' : '/dashboard'}
            className="text-sm font-medium hover:text-white transition"
          >
            ← Voltar para {isProfessional ? 'Painel Profissional' : 'Minha Área'}
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>Sala virtual segura • Criptografia ponto a ponto</span>
          </div>
        </div>

        {appointment && (
          <div className="mb-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-xs text-white/80 flex items-center justify-between">
            <span>
              <strong>Consulta:</strong> {appointment.patient_name} • {appointment.appointment_date} às {appointment.appointment_time.slice(0, 5)}
            </span>
            <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5">Autorizado</span>
          </div>
        )}

        <VideoRoom roomToken={token} isProfessional={isProfessional} />
      </div>
    </main>
  );
}
