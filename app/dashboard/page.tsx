import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, CreditCard, LogOut, ShieldCheck, Stethoscope, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_status: string;
  room_token: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) redirect('/login');

  const [{ data: profile }, { data: appointments }] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', claims.sub).single(),
    supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, status, payment_status, room_token')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true }),
  ]);

  const items = (appointments ?? []) as Appointment[];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = items.filter((item) => item.appointment_date >= today && item.status !== 'cancelled');
  const history = items.filter((item) => item.appointment_date < today || item.status === 'cancelled');

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-8 text-[#2D3748] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 rounded-3xl border border-[#DDE8E7] bg-white p-6 shadow-sm sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#319795]">Área da Paciente</p>
            <h1 className="mt-2 text-3xl font-bold">Olá{profile?.full_name ? `, ${profile.full_name}` : ''}.</h1>
            <p className="mt-2 text-[#718096]">Acompanhe suas consultas, pagamentos e acesso à sala virtual.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {profile?.role === 'professional' && (
              <Link href="/profissional" className="inline-flex items-center gap-2 rounded-xl bg-[#1F2937] px-4 py-3 text-sm font-semibold text-white hover:bg-black">
                <Stethoscope className="h-4 w-4" /> Painel profissional
              </Link>
            )}
            <Link href="/agendar" className="rounded-xl bg-[#319795] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2C7A7B]">Nova consulta</Link>
            <form action="/auth/signout" method="post">
              <button className="inline-flex items-center gap-2 rounded-xl border border-[#DDE8E7] px-4 py-3 text-sm font-semibold hover:bg-[#F7FAFC]">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </form>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat icon={<CalendarDays />} label="Próximas consultas" value={String(upcoming.length)} />
          <Stat icon={<CreditCard />} label="Pagamentos aprovados" value={String(items.filter((i) => i.payment_status === 'paid').length)} />
          <Stat icon={<ShieldCheck />} label="Conta" value="Protegida" />
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Próximas consultas</h2>
              <p className="text-sm text-[#718096]">O acesso à sala aparece para consultas confirmadas e pagas.</p>
            </div>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#CBD5E0] bg-white p-10 text-center">
              <p className="font-semibold">Você ainda não tem consulta futura vinculada a esta conta.</p>
              <p className="mt-2 text-sm text-[#718096]">Entre na conta antes de realizar um novo agendamento para ele aparecer aqui automaticamente.</p>
              <Link href="/agendar" className="mt-5 inline-flex rounded-xl bg-[#319795] px-5 py-3 font-semibold text-white">Agendar consulta</Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((item) => <AppointmentCard key={item.id} item={item} />)}
            </div>
          )}
        </section>

        {history.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">Histórico</h2>
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
              {history.slice().reverse().map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF2F2] px-5 py-4 last:border-0">
                  <div><p className="font-semibold">{formatDate(item.appointment_date)} às {item.appointment_time.slice(0, 5)}</p><p className="text-sm text-[#718096]">{statusLabel(item.status)}</p></div>
                  <PaymentBadge status={item.payment_status} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="text-[#319795]">{icon}</div>
      <p className="mt-4 text-sm text-[#718096]">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function AppointmentCard({ item }: { item: Appointment }) {
  const canEnter = item.status === 'confirmed' && item.payment_status === 'paid';
  return (
    <article className="rounded-3xl border border-[#DDE8E7] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm text-[#718096]">Consulta online</p><h3 className="mt-1 text-xl font-bold">{formatDate(item.appointment_date)}</h3><p className="mt-1 font-semibold text-[#319795]">{item.appointment_time.slice(0, 5)} • 50 minutos</p></div>
        <PaymentBadge status={item.payment_status} />
      </div>
      <div className="mt-5 rounded-2xl bg-[#F7FAFC] p-4 text-sm"><p><strong>Status:</strong> {statusLabel(item.status)}</p><p className="mt-1 text-[#718096]">Videochamada online com Fernanda Rabelo.</p></div>
      {canEnter ? (
        <Link href={`/sala/${item.room_token}`} className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1F2937] font-semibold text-white hover:bg-black"><Video className="h-5 w-5" /> Acessar sala</Link>
      ) : (
        <div className="mt-5 rounded-xl border border-[#E2E8F0] px-4 py-3 text-center text-sm text-[#718096]">A sala será liberada após a confirmação do pagamento.</div>
      )}
    </article>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const paid = status === 'paid';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paid ? 'bg-emerald-100 text-emerald-700' : status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{paid ? 'Pago' : status === 'failed' ? 'Falhou' : 'Pendente'}</span>;
}

function statusLabel(status: string) {
  if (status === 'confirmed') return 'Confirmada';
  if (status === 'cancelled') return 'Cancelada';
  return 'Aguardando confirmação';
}

function formatDate(value: string) {
  const [y, m, d] = value.split('-');
  return `${d}/${m}/${y}`;
}
