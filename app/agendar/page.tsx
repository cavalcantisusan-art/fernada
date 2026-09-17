'use client';

import { useMemo, useState } from 'react';
import { addDays, format, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CreditCard, ShieldCheck } from 'lucide-react';

const FALLBACK_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

type Step = 'slot' | 'details';

export default function SchedulePage() {
  const [step, setStep] = useState<Step>('slot');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState(FALLBACK_TIMES);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const availableDates = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 21 })
      .map((_, i) => addDays(today, i + 1))
      .filter((date) => date.getDay() !== 0 && date.getDay() !== 6)
      .slice(0, 14);
  }, []);

  async function chooseDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
    setError('');
    setLoadingTimes(true);

    const value = format(date, 'yyyy-MM-dd');
    try {
      const response = await fetch(`/api/appointments?date=${value}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível consultar os horários.');
      setAvailableTimes(Array.isArray(data.availableTimes) ? data.availableTimes : FALLBACK_TIMES);
    } catch (err) {
      setAvailableTimes(FALLBACK_TIMES);
      setError(err instanceof Error ? err.message : 'Não foi possível consultar os horários.');
    } finally {
      setLoadingTimes(false);
    }
  }

  function chooseTime(time: string) {
    setSelectedTime(time);
    setStep('details');
    setError('');
  }

  async function startCheckout(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          email,
          phone,
          appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
          appointmentTime: selectedTime,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar o pagamento.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-10 text-[#2D3748]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#319795]">Psicologia Online</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Agende e pague sua consulta online</h1>
            <p className="mt-3 max-w-2xl text-[#718096]">Escolha um horário disponível e finalize o pagamento com segurança pela Stripe. A consulta é confirmada somente após a confirmação do pagamento.</p>
          </div>
          <div className="rounded-2xl border border-[#D7ECEA] bg-white px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#718096]">Valor da sessão</p>
            <p className="text-2xl font-bold text-[#319795]">R$ 180,00</p>
            <p className="text-xs text-[#718096]">50 minutos • videochamada</p>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {step === 'slot' && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#319795]" />
                <h2 className="text-xl font-semibold">1. Escolha a data</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {availableDates.map((date) => {
                  const active = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => chooseDate(date)}
                      className={`rounded-2xl border px-3 py-4 text-left transition ${active ? 'border-[#319795] bg-[#E6FFFA]' : 'border-[#E2E8F0] hover:border-[#319795]'}`}
                    >
                      <span className="block text-xs uppercase text-[#718096]">{format(date, 'EEE', { locale: ptBR })}</span>
                      <span className="mt-1 block font-semibold">{format(date, 'dd/MM')}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#319795]" />
                <h2 className="text-xl font-semibold">2. Escolha o horário</h2>
              </div>

              {!selectedDate && <p className="text-sm text-[#718096]">Selecione uma data para visualizar os horários.</p>}
              {selectedDate && loadingTimes && <p className="text-sm text-[#718096]">Consultando horários...</p>}
              {selectedDate && !loadingTimes && availableTimes.length === 0 && <p className="text-sm text-[#718096]">Não há horários disponíveis nesta data.</p>}

              <div className="grid grid-cols-2 gap-3">
                {selectedDate && !loadingTimes && availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => chooseTime(time)}
                    className="rounded-2xl border border-[#E2E8F0] px-4 py-4 font-semibold transition hover:border-[#319795] hover:bg-[#E6FFFA] hover:text-[#2C7A7B]"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {step === 'details' && selectedDate && selectedTime && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <form onSubmit={startCheckout} className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Seus dados</h2>
                <p className="mt-2 text-sm text-[#718096]">Depois você será direcionado para a página segura da Stripe para pagar por cartão ou PIX, conforme disponibilidade da sua conta.</p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Nome completo</span>
                  <input value={patientName} onChange={(e) => setPatientName(e.target.value)} required minLength={3} className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#319795]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">E-mail</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#319795]" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">WhatsApp/telefone</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(81) 99999-9999" className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#319795]" />
                </label>
              </div>

              <button disabled={submitting} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#319795] px-6 font-semibold text-white transition hover:bg-[#2C7A7B] disabled:opacity-60">
                <CreditCard className="h-5 w-5" />
                {submitting ? 'Abrindo pagamento...' : 'Ir para pagamento seguro'}
              </button>

              <button type="button" onClick={() => setStep('slot')} className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-[#4A5568] hover:bg-[#F7FAFC]">Trocar data ou horário</button>
            </form>

            <aside className="h-fit rounded-3xl border border-[#D7ECEA] bg-[#F5FFFD] p-6">
              <h3 className="font-semibold">Resumo da consulta</h3>
              <div className="mt-5 space-y-4 text-sm">
                <div><p className="text-[#718096]">Data</p><p className="font-semibold">{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p></div>
                <div><p className="text-[#718096]">Horário</p><p className="font-semibold">{selectedTime}</p></div>
                <div><p className="text-[#718096]">Modalidade</p><p className="font-semibold">Videochamada • 50 minutos</p></div>
                <div className="border-t border-[#D7ECEA] pt-4"><p className="text-[#718096]">Total</p><p className="text-2xl font-bold text-[#319795]">R$ 180,00</p></div>
              </div>
              <div className="mt-6 flex gap-2 text-xs text-[#4A5568]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#319795]" /><span>Os dados do cartão são informados diretamente à Stripe e não ficam armazenados neste site.</span></div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
