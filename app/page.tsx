'use client';

import React, { FormEvent, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  Clock,
  HeartHandshake,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  Video,
} from 'lucide-react';
import { addDays, format, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewState = 'home' | 'schedule' | 'success';

type BookingResponse = {
  id?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  error?: string;
  code?: string;
  whatsapp?: string;
  bookingEnabled?: boolean;
  availableTimes?: string[];
  reason?: string;
};

const WHATSAPP_URL = 'https://wa.me/5581991930007';
const PHONE_NUMBER = '+5581991930007';
const EMAIL = 'rabelo.fernanda.psi@gmail.com';
const DEFAULT_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState<boolean | null>(null);
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');

  const today = startOfToday();
  const availableDates = Array.from({ length: 20 })
    .map((_, index) => addDays(today, index + 1))
    .filter((date) => date.getDay() !== 0 && date.getDay() !== 6)
    .slice(0, 14);

  const openSchedule = () => {
    setError('');
    setCurrentView('schedule');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectDate = async (date: Date) => {
    const value = format(date, 'yyyy-MM-dd');
    setSelectedDate(value);
    setSelectedTime('');
    setLoadingTimes(true);
    setError('');

    try {
      const response = await fetch(`/api/appointments?date=${encodeURIComponent(value)}`, {
        cache: 'no-store',
      });
      const data = (await response.json()) as BookingResponse;

      if (response.ok) {
        setBookingEnabled(true);
        setAvailableTimes(data.availableTimes ?? []);
        return;
      }

      if (data.bookingEnabled === false || data.reason === 'database_not_configured') {
        setBookingEnabled(false);
        setAvailableTimes(data.availableTimes ?? DEFAULT_TIMES);
        return;
      }

      setBookingEnabled(null);
      setAvailableTimes([]);
      setError(data.error ?? 'Não foi possível consultar os horários.');
    } catch {
      setBookingEnabled(null);
      setAvailableTimes([]);
      setError('Não foi possível conectar ao sistema de agenda.');
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!selectedDate || !selectedTime) {
      setError('Escolha uma data e um horário para continuar.');
      return;
    }

    if (!acceptedPrivacy) {
      setError('Confirme a autorização para uso dos dados necessários ao agendamento.');
      return;
    }

    if (bookingEnabled === false) {
      setError('O agendamento automático ainda está sendo ativado. Use o WhatsApp para confirmar este horário.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          email,
          phone,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
        }),
      });
      const data = (await response.json()) as BookingResponse;

      if (!response.ok) {
        if (data.code === 'DATABASE_NOT_CONFIGURED') {
          setBookingEnabled(false);
        }
        setError(data.error ?? 'Não foi possível concluir o agendamento.');
        return;
      }

      setBookingId(data.id ?? '');
      setCurrentView('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Não foi possível concluir o agendamento. Tente novamente ou utilize o WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDateLabel = selectedDate
    ? format(new Date(`${selectedDate}T12:00:00`), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3748] font-sans selection:bg-[#E2E8F0]">
      <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-[#FDFBF7]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className="group flex items-center gap-3 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#319795] text-white shadow-sm transition-colors group-hover:bg-[#2C7A7B]">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-[#2D3748]">Fernanda Rabelo</span>
              <span className="block text-xs font-medium uppercase tracking-wider text-[#718096]">Psicologia Online</span>
            </span>
          </button>

          {currentView === 'home' && (
            <nav className="hidden items-center gap-7 text-sm font-medium text-[#4A5568] md:flex">
              <a href="#sobre" className="transition-colors hover:text-[#319795]">Sobre</a>
              <a href="#atuacao" className="transition-colors hover:text-[#319795]">Atuação</a>
              <a href="#contato" className="transition-colors hover:text-[#319795]">Contato</a>
              <button
                type="button"
                onClick={openSchedule}
                className="rounded-full bg-[#319795] px-5 py-2.5 text-white transition-colors hover:bg-[#2C7A7B]"
              >
                Agendar
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <section className="grid min-h-[70vh] items-center gap-14 md:grid-cols-2">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#E6FFFA] px-3 py-1 text-sm font-medium text-[#319795]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38B2AC] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#319795]" />
                    </span>
                    Atendimentos online
                  </div>

                  <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-[#1A202C] md:text-6xl">
                    Um espaço de acolhimento e escuta para cuidar da sua <span className="text-[#319795]">saúde emocional.</span>
                  </h1>

                  <p className="max-w-xl text-lg leading-relaxed text-[#4A5568]">
                    Psicoterapia online com Fernanda Rabelo, em um ambiente de escuta, respeito e confidencialidade.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={openSchedule}
                      className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#319795] px-8 text-lg font-medium text-white shadow-[0_4px_14px_0_rgba(49,151,149,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#2C7A7B]"
                    >
                      <CalendarIcon className="h-5 w-5" />
                      Agendar consulta
                    </button>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-14 items-center justify-center gap-2 rounded-full border border-[#CBD5E0] bg-white px-7 font-medium text-[#2D3748] transition-colors hover:border-[#319795] hover:text-[#319795]"
                    >
                      <MessageCircle className="h-5 w-5" />
                      WhatsApp
                    </a>
                  </div>

                  <div className="grid gap-3 border-t border-[#E2E8F0] pt-6 text-sm text-[#718096] sm:grid-cols-2">
                    <span className="flex items-center gap-2"><Video className="h-4 w-4 text-[#319795]" /> Atendimento online</span>
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#319795]" /> Dados de reserva enviados ao servidor</span>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-md">
                  <div className="absolute inset-0 rotate-3 scale-105 rounded-[2rem] bg-gradient-to-tr from-[#E6FFFA] to-[#EDF2F7] opacity-70" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop"
                      alt="Apresentação profissional de Fernanda Rabelo"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF2F7]">
                          <User className="h-6 w-6 text-[#4A5568]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#2D3748]">Fernanda Rabelo</p>
                          <p className="text-sm text-[#718096]">CRP 02/15302</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-28 space-y-24">
                <section id="sobre" className="scroll-mt-28 grid items-center gap-12 md:grid-cols-2">
                  <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-white shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1400&auto=format&fit=crop"
                      alt="Fernanda Rabelo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#319795]">Sobre</p>
                    <h2 className="text-3xl font-bold text-[#1A202C] md:text-4xl">Fernanda Rabelo</h2>
                    <div className="space-y-4 leading-relaxed text-[#4A5568]">
                      <p><strong>Psicóloga formada pela FAFIRE, em 2010.</strong> Atua com experiência em saúde mental, arteterapia e redução de danos.</p>
                      <ul className="space-y-3 pl-5 marker:text-[#319795] list-disc">
                        <li>Arteterapeuta — ARTE-PE 107/0516.</li>
                        <li>Mestra em Psicologia Social pela UFS.</li>
                        <li>Especialista em Psicologia Junguiana com enfoque na prática clínica pela Faculdade IDE.</li>
                        <li>Facilitadora de SoulCollage.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="atuacao" className="scroll-mt-28 rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm md:p-14">
                  <div className="mx-auto mb-10 max-w-2xl text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#319795]">Atuação</p>
                    <h2 className="text-3xl font-bold text-[#1A202C]">Áreas de trabalho</h2>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      'Psicologia Analítica',
                      'Arteterapia',
                      'Saúde Mental',
                      'Redução de Danos',
                      'Psicoterapia Assistida com Cetamina',
                      'Psicologia Financeira',
                    ].map((area) => (
                      <div key={area} className="rounded-2xl border border-[#E2E8F0] bg-[#F7FAFC] p-6 text-center font-medium text-[#2D3748] transition-all hover:border-[#319795] hover:shadow-md">
                        {area}
                      </div>
                    ))}
                  </div>
                </section>

                <section id="contato" className="scroll-mt-28 rounded-3xl bg-[#319795] p-8 text-center text-white md:p-14">
                  <h2 className="text-3xl font-bold">Contato e agendamento</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-[#E6FFFA]">
                    Você pode iniciar o agendamento pelo site ou falar diretamente com Fernanda pelos canais abaixo.
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                    <button type="button" onClick={openSchedule} className="flex h-13 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#319795] hover:bg-[#E6FFFA]">
                      <CalendarIcon className="h-5 w-5" /> Agendar online
                    </button>
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#2C7A7B] px-6 py-3 font-semibold text-white hover:bg-[#285E61]">
                      <MessageCircle className="h-5 w-5" /> WhatsApp
                    </a>
                    <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 rounded-full bg-[#2C7A7B] px-6 py-3 font-semibold text-white hover:bg-[#285E61]">
                      <Mail className="h-5 w-5" /> E-mail
                    </a>
                    <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-2 rounded-full bg-[#2C7A7B] px-6 py-3 font-semibold text-white hover:bg-[#285E61]">
                      <Phone className="h-5 w-5" /> Ligar
                    </a>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {currentView === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-5xl"
            >
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="mb-7 flex items-center gap-2 text-sm font-medium text-[#718096] transition-colors hover:text-[#2D3748]"
              >
                <ChevronLeft className="h-4 w-4" /> Voltar ao início
              </button>

              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#319795]">Agenda online</p>
                <h1 className="text-3xl font-bold text-[#1A202C] md:text-4xl">Solicite sua consulta</h1>
                <p className="mt-3 max-w-2xl text-[#718096]">Escolha a data e o horário. A reserva será registrada como pendente até a confirmação final.</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:p-8">
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#2D3748]"><CalendarIcon className="h-5 w-5 text-[#319795]" /> 1. Escolha a data</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {availableDates.map((date) => {
                        const value = format(date, 'yyyy-MM-dd');
                        const active = selectedDate === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => selectDate(date)}
                            className={`rounded-2xl border p-3 text-left transition-all ${active ? 'border-[#319795] bg-[#E6FFFA] text-[#285E61]' : 'border-[#E2E8F0] bg-[#FDFBF7] hover:border-[#319795]'}`}
                          >
                            <span className="block text-xs font-medium uppercase text-[#718096]">{format(date, 'EEE', { locale: ptBR })}</span>
                            <span className="mt-1 block font-semibold">{format(date, 'dd/MM')}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-[#E2E8F0] pt-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#2D3748]"><Clock className="h-5 w-5 text-[#319795]" /> 2. Escolha o horário</h2>
                    {!selectedDate && <p className="text-sm text-[#718096]">Selecione primeiro uma data.</p>}
                    {selectedDate && loadingTimes && <p className="text-sm text-[#718096]">Consultando horários...</p>}
                    {selectedDate && !loadingTimes && availableTimes.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {availableTimes.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-xl border px-3 py-3 font-medium transition-all ${selectedTime === time ? 'border-[#319795] bg-[#319795] text-white' : 'border-[#E2E8F0] hover:border-[#319795] hover:text-[#319795]'}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedDate && !loadingTimes && availableTimes.length === 0 && bookingEnabled === true && (
                      <p className="rounded-xl bg-[#FFF5F5] p-4 text-sm text-[#C53030]">Não há horários livres nessa data.</p>
                    )}
                  </div>

                  {bookingEnabled === false && (
                    <div className="rounded-2xl border border-[#F6E05E] bg-[#FFFFF0] p-4 text-sm text-[#744210]">
                      A agenda automática ainda está sendo conectada ao banco de dados. Você pode escolher o horário e finalizar a confirmação pelo WhatsApp.
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-xl font-bold text-[#1A202C]">3. Seus dados</h2>
                  <p className="mt-2 text-sm text-[#718096]">Informe apenas os dados necessários para contato e reserva.</p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#4A5568]">Nome completo</label>
                      <input value={patientName} onChange={(event) => setPatientName(event.target.value)} required minLength={3} maxLength={120} autoComplete="name" className="w-full rounded-xl border border-[#CBD5E0] px-4 py-3 outline-none transition focus:border-[#319795] focus:ring-2 focus:ring-[#319795]/20" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#4A5568]">E-mail</label>
                      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="w-full rounded-xl border border-[#CBD5E0] px-4 py-3 outline-none transition focus:border-[#319795] focus:ring-2 focus:ring-[#319795]/20" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#4A5568]">Telefone / WhatsApp</label>
                      <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel" placeholder="(81) 99999-9999" className="w-full rounded-xl border border-[#CBD5E0] px-4 py-3 outline-none transition focus:border-[#319795] focus:ring-2 focus:ring-[#319795]/20" />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#F7FAFC] p-4 text-sm text-[#4A5568]">
                    <p className="font-semibold text-[#2D3748]">Resumo</p>
                    <p className="mt-2">Data: <strong>{selectedDateLabel || 'Selecione uma data'}</strong></p>
                    <p>Horário: <strong>{selectedTime || 'Selecione um horário'}</strong></p>
                    <p>Duração prevista: <strong>50 minutos</strong></p>
                  </div>

                  <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-[#4A5568]">
                    <input type="checkbox" checked={acceptedPrivacy} onChange={(event) => setAcceptedPrivacy(event.target.checked)} className="mt-1 h-4 w-4 accent-[#319795]" />
                    <span>Autorizo o uso destes dados exclusivamente para contato e gestão do meu agendamento.</span>
                  </label>

                  {error && <p role="alert" className="mt-5 rounded-xl bg-[#FFF5F5] p-4 text-sm text-[#C53030]">{error}</p>}

                  {bookingEnabled === false ? (
                    <a
                      href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Olá, gostaria de agendar uma consulta${selectedDateLabel ? ` para ${selectedDateLabel}` : ''}${selectedTime ? ` às ${selectedTime}` : ''}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#319795] px-5 py-4 font-semibold text-white transition-colors hover:bg-[#2C7A7B]"
                    >
                      <MessageCircle className="h-5 w-5" /> Confirmar pelo WhatsApp
                    </a>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || !selectedDate || !selectedTime}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#319795] px-5 py-4 font-semibold text-white transition-colors hover:bg-[#2C7A7B] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? 'Registrando...' : 'Solicitar agendamento'}
                    </button>
                  )}

                  <p className="mt-4 text-center text-xs leading-relaxed text-[#A0AEC0]">Pagamento e acesso à videochamada não são liberados automaticamente nesta etapa. A confirmação final ocorre depois da validação da reserva.</p>
                </form>
              </div>
            </motion.div>
          )}

          {currentView === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-xl py-12 text-center"
            >
              <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-[#E6FFFA]">
                <CheckCircle2 className="h-12 w-12 text-[#319795]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1A202C]">Solicitação registrada</h1>
              <p className="mt-4 text-lg leading-relaxed text-[#718096]">Seu horário foi reservado como pendente. A confirmação final será feita pelos canais de atendimento.</p>

              <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 text-left shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <span className="text-[#718096]">Data</span>
                  <strong>{selectedDateLabel}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] py-4">
                  <span className="text-[#718096]">Horário</span>
                  <strong>{selectedTime}</strong>
                </div>
                {bookingId && (
                  <div className="flex items-center justify-between pt-4 text-sm">
                    <span className="text-[#718096]">Protocolo</span>
                    <span className="font-mono text-xs text-[#4A5568]">{bookingId}</span>
                  </div>
                )}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#319795] px-5 py-4 font-semibold text-white hover:bg-[#2C7A7B]">
                  <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
                </a>
                <button type="button" onClick={() => setCurrentView('home')} className="rounded-xl border border-[#CBD5E0] bg-white px-5 py-4 font-semibold text-[#4A5568] hover:border-[#319795] hover:text-[#319795]">
                  Voltar ao início
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-14 border-t border-[#E2E8F0] bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-[#718096] sm:flex-row sm:items-center sm:justify-between">
          <span>Fernanda Rabelo • CRP 02/15302</span>
          <span>Psicologia Online</span>
        </div>
      </footer>
    </div>
  );
}
