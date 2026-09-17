'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CreditCard, ShieldCheck, UserRound, Video, CheckCircle2, MessageCircle } from 'lucide-react';

const FALLBACK_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

type Step = 'slot' | 'details' | 'success';

export default function SchedulePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('slot');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState(FALLBACK_TIMES);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availabilityNotice, setAvailabilityNotice] = useState('');
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [createdRoomToken, setCreatedRoomToken] = useState<string | null>(null);

  // Available dates: Weekdays only, strictly excluding Thursdays (09h-19h indisponível)
  const availableDates = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 28 })
      .map((_, i) => addDays(today, i + 1))
      .filter((date) => date.getDay() !== 0 && date.getDay() !== 6 && date.getDay() !== 4)
      .slice(0, 16);
  }, []);

  const morningTimes = availableTimes.filter((time) => Number(time.slice(0, 2)) < 12);
  const afternoonTimes = availableTimes.filter((time) => Number(time.slice(0, 2)) >= 12);

  async function chooseDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
    setError('');
    setAvailabilityNotice('');
    setLoadingTimes(true);

    const value = format(date, 'yyyy-MM-dd');
    try {
      const res = await fetch(`/api/appointments?date=${value}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao carregar horários.');
      }
      const data = await res.json();
      setAvailableTimes(data.availableTimes || []);
      if (!data.availableTimes || data.availableTimes.length === 0) {
        setAvailabilityNotice('Não há horários online disponíveis nesta data.');
      }
    } catch {
      setAvailableTimes(FALLBACK_TIMES);
    } finally {
      setLoadingTimes(false);
    }
  }

  function chooseTime(time: string) {
    setSelectedTime(time);
    setStep('details');
    setError('');
  }

  async function handleConfirmBooking(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedDate || !selectedTime) return;
    if (!consentAccepted) {
      setError('Aceite os termos e o consentimento para teleatendimento para continuar.');
      return;
    }

    setSubmitting(true);
    setError('');

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    try {
      // 1. Try creating appointment directly
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          email,
          phone,
          appointmentDate: formattedDate,
          appointmentTime: selectedTime,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível confirmar o agendamento.');
      }

      setCreatedRoomToken(data.roomToken || 'consulta-online');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao agendar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-8 text-[#2D3748] sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-semibold text-[#319795] hover:text-[#2C7A7B]">← Fernanda Rabelo | Psicologia Online</Link>
          <div className="flex items-center gap-2 text-sm">
            <UserRound className="h-4 w-4 text-[#319795]" />
            <Link href="/login" className="font-medium hover:text-[#319795]">Entrar na minha área</Link>
          </div>
        </div>

        <header className="mb-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#319795]">Agendamento online</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">Escolha seu horário e agende com Fernanda Rabelo</h1>
            <p className="mt-4 max-w-2xl text-[#718096]">Sessão individual de 50 minutos por videochamada com escuta clínica qualificada e sigilo profissional.</p>
          </div>
          <div className="rounded-2xl border border-[#D7ECEA] bg-white px-6 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#718096]">Atendimento online</p>
            <p className="text-xl font-bold text-[#319795]">Sob consulta</p>
            <p className="text-xs text-[#718096]">50 minutos • PIX ou Cartão</p>
          </div>
        </header>

        {step !== 'success' && (
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {[
              ['1', 'Escolha data e horário'],
              ['2', 'Confirme seus dados e consulta'],
            ].map(([n, label]) => (
              <div key={n} className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6FFFA] font-bold text-[#319795]">{n}</span>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        )}

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {availabilityNotice && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{availabilityNotice}</div>}

        {step === 'slot' && (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#319795]" />
                  <h2 className="text-xl font-semibold">Escolha a data</h2>
                </div>
                <span className="text-xs text-[#718096]">Segunda a Sexta (exceto quintas)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {availableDates.map((date) => {
                  const active = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => chooseDate(date)}
                      className={`rounded-2xl border px-3 py-4 text-left transition ${active ? 'border-[#319795] bg-[#E6FFFA] text-[#285E61]' : 'border-[#E2E8F0] hover:border-[#319795]'}`}
                    >
                      <span className="block text-xs uppercase text-[#718096]">{format(date, 'EEE', { locale: ptBR })}</span>
                      <span className="mt-1 block text-lg font-semibold">{format(date, 'dd/MM')}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#319795]" />
                <h2 className="text-xl font-semibold">Horários disponíveis</h2>
              </div>

              {!selectedDate && <p className="text-sm text-[#718096]">Selecione uma data para visualizar os horários livres.</p>}
              {selectedDate && loadingTimes && <p className="text-sm text-[#718096]">Consultando agenda...</p>}
              {selectedDate && !loadingTimes && availableTimes.length === 0 && <p className="rounded-xl bg-[#F7FAFC] p-4 text-sm text-[#718096]">Não há horários disponíveis nesta data.</p>}

              {selectedDate && !loadingTimes && availableTimes.length > 0 && (
                <div className="space-y-6">
                  {morningTimes.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#718096]">Manhã</p>
                      <div className="grid grid-cols-3 gap-2">
                        {morningTimes.map((time) => <TimeButton key={time} time={time} onClick={() => chooseTime(time)} />)}
                      </div>
                    </div>
                  )}
                  {afternoonTimes.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#718096]">Tarde</p>
                      <div className="grid grid-cols-3 gap-2">
                        {afternoonTimes.map((time) => <TimeButton key={time} time={time} onClick={() => chooseTime(time)} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {step === 'details' && selectedDate && selectedTime && (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <form onSubmit={handleConfirmBooking} className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Seus dados de contato</h2>
                <p className="mt-2 text-sm text-[#718096]">Os dados informados serão utilizados para o envio das instruções de acesso e confirmação.</p>
              </div>

              <div className="space-y-4">
                <Field label="Nome completo" value={patientName} setValue={setPatientName} required />
                <Field label="E-mail" type="email" value={email} setValue={setEmail} required />
                <Field label="WhatsApp / telefone" value={phone} setValue={setPhone} placeholder="(81) 99193-0007" required />
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FBFB] p-4 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#319795]"
                />
                <span>
                  Li e concordo com as orientações do teleatendimento psicológico da Psicóloga Fernanda Rabelo (CRP 02/15302), respeitando o sigilo profissional do CFP.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !consentAccepted}
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#319795] px-6 font-semibold text-white transition hover:bg-[#2C7A7B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-5 w-5" />
                {submitting ? 'Confirmando agendamento...' : 'Confirmar agendamento'}
              </button>

              <button type="button" onClick={() => setStep('slot')} className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-[#4A5568] hover:bg-[#F7FAFC]">
                Trocar data ou horário
              </button>
            </form>

            <aside className="h-fit rounded-3xl border border-[#D7ECEA] bg-[#F5FFFD] p-6 lg:sticky lg:top-6">
              <h3 className="font-semibold">Resumo da consulta</h3>
              <div className="mt-5 space-y-4 text-sm">
                <Summary icon={<Calendar className="h-4 w-4" />} label="Data" value={format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
                <Summary icon={<Clock className="h-4 w-4" />} label="Horário" value={selectedTime} />
                <Summary icon={<Video className="h-4 w-4" />} label="Modalidade" value="Videochamada online • 50 min" />
                <div className="border-t border-[#D7ECEA] pt-4">
                  <p className="text-[#718096]">Formas de pagamento</p>
                  <p className="font-medium text-[#2D3748]">PIX ou Cartão (combinado previamente)</p>
                </div>
              </div>
              <div className="mt-6 flex gap-2 text-xs text-[#4A5568]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#319795]" />
                <span>Atendimento confidencial e em conformidade com as diretrizes do Conselho Regional de Psicologia de Pernambuco.</span>
              </div>
            </aside>
          </div>
        )}

        {step === 'success' && selectedDate && selectedTime && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-[#B2F5EA] bg-white p-8 text-center shadow-lg sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E6FFFA] text-[#319795]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-5 text-3xl font-bold">Consulta agendada com sucesso!</h2>
            <p className="mt-3 text-[#4A5568]">
              Parabéns, <strong>{patientName}</strong>. Seu horário foi reservado para o dia{' '}
              <strong>{format(selectedDate, "dd/MM/yyyy")}</strong> às <strong>{selectedTime}</strong> com a Psicóloga Fernanda Rabelo.
            </p>

            <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-[#F7FAFC] p-5 text-left text-sm space-y-2">
              <p><strong>Profissional:</strong> Fernanda Caldas Rabelo de Oliveira (CRP 02/15302)</p>
              <p><strong>Modalidade:</strong> Videochamada online criptografada</p>
              <p><strong>Contato profissional:</strong> rabelo.fernandac@gmail.com • (81) 99193-0007</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {createdRoomToken && (
                <Link
                  href={`/sala/${createdRoomToken}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#319795] px-6 py-3.5 font-semibold text-white transition hover:bg-[#2C7A7B]"
                >
                  <Video className="h-5 w-5" /> Entrar na sala de videochamada
                </Link>
              )}
              <a
                href={`https://wa.me/5581991930007?text=${encodeURIComponent(`Olá Fernanda, acabei de agendar uma consulta para ${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}. Meu nome é ${patientName}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#319795] bg-white px-6 py-3.5 font-semibold text-[#319795] transition hover:bg-[#E6FFFA]"
              >
                <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function TimeButton({ time, onClick }: { time: string; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-xl border border-[#E2E8F0] px-3 py-3 font-semibold transition hover:border-[#319795] hover:bg-[#E6FFFA] hover:text-[#2C7A7B]">{time}</button>;
}

function Field({ label, value, setValue, type = 'text', placeholder, required }: { label: string; value: string; setValue: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input type={type} value={value} onChange={(e) => setValue(e.target.value)} required={required} placeholder={placeholder} className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none transition focus:border-[#319795] focus:ring-2 focus:ring-[#E6FFFA]" />
    </label>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-[#319795]">{icon}</span>
      <div><p className="text-[#718096]">{label}</p><p className="font-semibold">{value}</p></div>
    </div>
  );
}
