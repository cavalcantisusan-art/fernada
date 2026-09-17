import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarClock, CreditCard, LogOut, UserRoundCheck, Video } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { requireProfessional } from '@/lib/professional';
import { AppointmentActions, SlotToggle } from '@/components/ProfessionalControls';

const TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

type Appointment = {
  id: string;
  patient_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_status: string;
  room_token: string;
};

type BlockedSlot = { appointment_date: string; appointment_time: string; reason: string | null };

export default async function ProfessionalPage() {
  const auth = await requireProfessional();
  if (!auth) redirect('/dashboard');

  const today = new Date();
  const todayIso = format(today, 'yyyy-MM-dd');
  const endIso = format(addDays(today, 30), 'yyyy-MM-dd');

  const [{ data: appointments }, { data: blocked }] = await Promise.all([
    auth.supabase
      .from('appointments')
      .select('id, patient_name, email, phone, appointment_date, appointment_time, status, payment_status, room_token')
      .gte('appointment_date', todayIso)
      .lte('appointment_date', endIso)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true }),
    auth.supabase
      .from('blocked_slots')
      .select('appointment_date, appointment_time, reason')
      .gte('appointment_date', todayIso)
      .lte('appointment_date', endIso),
  ]);

  const items = (appointments ?? []) as Appointment[];
  const blockedItems = (blocked ?? []) as BlockedSlot[];
  const blockedSet = new Set(blockedItems.map((b) => `${b.appointment_date}|${b.appointment_time.slice(0, 5)}`));
  const confirmed = items.filter((i) => i.status === 'confirmed').length;
  const paid = items.filter((i) => i.payment_status === 'paid').length;
  const pending = items.filter((i) => i.status === 'pending').length;

  const days = Array.from({ length: 10 })
    .map((_, i) => addDays(today, i))
    .filter((d) => d.getDay() !== 0 && d.getDay() !== 6)
    .slice(0, 7);

  return (
    <main className="min-h-screen bg-[#F6F8F8] px-5 py-8 text-[#1F2937] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 rounded-3xl bg-[#1F2937] p-6 text-white shadow-xl sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#81E6D9]">Painel profissional</p>
            <h1 className="mt-2 text-3xl font-bold">Agenda da Fernanda</h1>
            <p className="mt-2 text-white/65">Consultas, pagamentos e disponibilidade em um só lugar.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15">Área da paciente</Link>
            <form action="/auth/signout" method="post"><button className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/10"><LogOut className="h-4 w-4" /> Sair</button></form>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<CalendarClock />} label="Consultas nos próximos 30 dias" value={String(items.length)} />
          <Stat icon={<UserRoundCheck />} label="Confirmadas" value={String(confirmed)} />
          <Stat icon={<CreditCard />} label="Pagas" value={String(paid)} />
          <Stat icon={<CalendarClock />} label="Pendentes" value={String(pending)} />
        </section>

        <section className="mt-8 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Controle de disponibilidade</h2>
            <p className="mt-1 text-sm text-[#718096]">Bloqueie ou libere horários individuais. Horários já reservados continuam indisponíveis automaticamente.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full border-collapse text-sm">
              <thead><tr className="border-b border-[#E2E8F0] text-left text-[#718096]"><th className="py-3 pr-4">Data</th>{TIMES.map((time) => <th key={time} className="px-2 py-3 text-center">{time}</th>)}</tr></thead>
              <tbody>
                {days.map((day) => {
                  const date = format(day, 'yyyy-MM-dd');
                  return (
                    <tr key={date} className="border-b border-[#EEF2F2] last:border-0">
                      <td className="py-4 pr-4 font-semibold capitalize">{format(day, "EEE, dd/MM", { locale: ptBR })}</td>
                      {TIMES.map((time) => {
                        const blockedSlot = blockedSet.has(`${date}|${time}`);
                        const booked = items.some((a) => a.appointment_date === date && a.appointment_time.slice(0, 5) === time && a.status !== 'cancelled');
                        return (
                          <td key={time} className="px-2 py-3 text-center">
                            {booked ? <span className="rounded-lg bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-700">Reservado</span> : <SlotToggle date={date} time={time} blocked={blockedSlot} />}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between"><div><h2 className="text-2xl font-bold">Consultas</h2><p className="text-sm text-[#718096]">Próximos 30 dias</p></div></div>
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#CBD5E0] bg-white p-10 text-center text-[#718096]">Nenhuma consulta nesse período.</div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {items.map((item) => (
                <article key={item.id} className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#718096]">{formatDate(item.appointment_date)} • {item.appointment_time.slice(0, 5)}</p>
                      <h3 className="mt-1 text-xl font-bold">{item.patient_name}</h3>
                      <p className="mt-1 text-sm text-[#4A5568]">{item.email} • {item.phone}</p>
                    </div>
                    <PaymentBadge status={item.payment_status} />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="rounded-xl bg-[#F7FAFC] px-4 py-3 text-sm"><strong>Status:</strong> {statusLabel(item.status)}</div>
                    <AppointmentActions id={item.id} status={item.status} />
                  </div>
                  {item.status === 'confirmed' && item.payment_status === 'paid' && (
                    <Link href={`/sala/${item.room_token}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1F2937] px-4 py-3 text-sm font-semibold text-white hover:bg-black"><Video className="h-4 w-4" /> Abrir sala</Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm"><div className="text-[#319795]">{icon}</div><p className="mt-4 text-sm text-[#718096]">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}
function PaymentBadge({ status }: { status: string }) {
  const paid = status === 'paid';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paid ? 'bg-emerald-100 text-emerald-700' : status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{paid ? 'Pago' : status === 'failed' ? 'Falhou' : 'Pendente'}</span>;
}
function statusLabel(status: string) { return status === 'confirmed' ? 'Confirmada' : status === 'cancelled' ? 'Cancelada' : 'Pendente'; }
function formatDate(value: string) { const [y,m,d] = value.split('-'); return `${d}/${m}/${y}`; }
