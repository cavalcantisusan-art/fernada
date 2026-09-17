'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  QrCode, 
  Video, 
  CheckCircle2, 
  ChevronLeft,
  HeartHandshake,
  User,
  ShieldCheck,
  VideoIcon,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Mail,
  MessageCircle,
  Phone
} from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewState = 'home' | 'schedule' | 'payment' | 'success' | 'call';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');

  const today = startOfToday();
  const availableDates = Array.from({ length: 14 }).map((_, i) => addDays(today, i + 1)).filter(d => d.getDay() !== 0 && d.getDay() !== 6); // Next 14 weekdays
  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const handleScheduleClick = () => {
    setCurrentView('schedule');
  };

  const handleTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setTimeout(() => setCurrentView('payment'), 400);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentView('success');
  };

  const startCall = () => {
    setCurrentView('call');
  };

  const goBack = (view: ViewState) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3748] font-sans selection:bg-[#E2E8F0]">
      {/* Header */}
      {currentView !== 'call' && (
        <header className="sticky top-0 z-10 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#E2E8F0]">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCurrentView('home')}
            >
              <div className="w-10 h-10 rounded-full bg-[#319795] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2C7A7B] transition-colors">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[#2D3748]">Fernanda Rabelo</h1>
                <p className="text-xs text-[#718096] uppercase tracking-wider font-medium">Psicologia Online</p>
              </div>
            </div>
            
            {currentView === 'home' && (
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4A5568]">
                <a href="#sobre" className="hover:text-[#319795] transition-colors">Sobre</a>
                <a href="#abordagem" className="hover:text-[#319795] transition-colors">Abordagem</a>
                <a href="mailto:rabelo.fernanda.psi@gmail.com" className="hover:text-[#319795] transition-colors">Contato</a>
              </nav>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={currentView === 'call' ? 'h-screen w-full' : 'max-w-5xl mx-auto px-6 py-12'}>
        <AnimatePresence mode="wait">
          
          {/* HOME VIEW */}
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-16 items-center min-h-[70vh]"
            >
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6FFFA] text-[#319795] text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38B2AC] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#319795]"></span>
                  </span>
                  Atendimentos online disponíveis
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.15] text-[#1A202C] tracking-tight">
                  Um espaço de acolhimento e escuta para cuidar da sua <span className="text-[#319795]">saúde emocional.</span>
                </h2>
                
                <p className="text-lg text-[#4A5568] leading-relaxed max-w-lg">
                  Agende sua consulta online com a psicóloga Fernanda Rabelo. Sessões seguras, confidenciais e no conforto da sua casa.
                </p>
                
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleScheduleClick}
                    className="h-14 px-8 rounded-full bg-[#319795] text-white font-medium text-lg shadow-[0_4px_14px_0_rgba(49,151,149,0.39)] hover:bg-[#2C7A7B] hover:shadow-[0_6px_20px_rgba(49,151,149,0.23)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <CalendarIcon className="w-5 h-5" />
                    Agendar consulta com Fernanda
                  </button>
                </div>

                <div className="flex flex-col gap-4 text-sm text-[#718096] pt-6 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#319795]" />
                      <span>Videochamada segura</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#319795]" />
                      <span>Pagamento protegido</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="w-4 h-4 text-[#319795]" />
                    <span>Dúvidas? <a href="mailto:rabelo.fernanda.psi@gmail.com" className="text-[#319795] hover:underline font-medium">rabelo.fernanda.psi@gmail.com</a></span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E6FFFA] to-[#EDF2F7] rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop" 
                    alt="Psicóloga em atendimento online" 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#EDF2F7] flex items-center justify-center">
                        <User className="w-6 h-6 text-[#4A5568]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2D3748]">Fernanda Rabelo</p>
                        <p className="text-sm text-[#718096]">CRP 02/15302</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ABOUT SECTION */}
          {currentView === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-32 space-y-24"
            >
              <section id="sobre" className="scroll-mt-32 grid md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1 relative aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1887&auto=format&fit=crop" 
                    alt="Fernanda Rabelo" 
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="order-1 md:order-2 space-y-6">
                  <h3 className="text-3xl font-bold text-[#1A202C]">Sobre Fernanda</h3>
                  <div className="space-y-4 text-[#4A5568] leading-relaxed">
                    <p>
                      <strong>Psicóloga formada pela FAFIRE, em 2010.</strong> Com uma trajetória profunda em saúde mental, arteterapia e redução de danos.
                    </p>
                    <ul className="space-y-3 list-disc pl-5">
                      <li>Arteterapeuta — ARTE-PE 107/0516.</li>
                      <li>Mestra em Psicologia Social pela UFS.</li>
                      <li>Especialista em Psicologia Junguiana com enfoque na prática clínica pela Faculdade IDE.</li>
                      <li>Facilitadora de SoulCollage.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="abordagem" className="scroll-mt-32 bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-[#E2E8F0]">
                <h3 className="text-3xl font-bold text-[#1A202C] text-center mb-12">Áreas de Atuação</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {['Psicologia Analítica', 'Arteterapia', 'Saúde Mental', 'Redução de Danos', 'Psicoterapia Assistida com Cetamina', 'Psicologia Financeira'].map((area, idx) => (
                    <div key={idx} className="bg-[#F7FAFC] rounded-2xl p-6 border border-[#E2E8F0] flex items-center justify-center text-center hover:border-[#319795] hover:shadow-md transition-all">
                      <span className="font-medium text-[#2D3748]">{area}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section id="contato" className="scroll-mt-32 bg-[#319795] text-white rounded-3xl p-10 md:p-16 text-center space-y-8">
                <h3 className="text-3xl font-bold">Pronto para dar o primeiro passo?</h3>
                <p className="text-[#E6FFFA] max-w-2xl mx-auto text-lg">
                  Neste momento, os agendamentos online estão sendo realizados exclusivamente via WhatsApp para um atendimento mais personalizado.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <a 
                    href="https://wa.me/5581991930007" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-14 px-8 rounded-full bg-white text-[#319795] font-semibold text-lg hover:bg-[#E6FFFA] transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chamar no WhatsApp
                  </a>
                  <a 
                    href="tel:+5581991930007" 
                    className="h-14 px-8 rounded-full bg-[#2C7A7B] text-white font-semibold text-lg hover:bg-[#285E61] transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Ligar
                  </a>
                </div>
              </section>
            </motion.div>
          )}

          {/* SCHEDULE VIEW (Modified to inform WhatsApp dependency) */}
          {currentView === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto text-center py-12"
            >
              <button 
                onClick={() => goBack('home')}
                className="flex items-center gap-2 text-[#718096] hover:text-[#2D3748] transition-colors mb-8 mx-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
              
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E2E8F0]">
                <div className="w-16 h-16 bg-[#E6FFFA] rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-[#319795]" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D3748] mb-4">Agendamento via WhatsApp</h3>
                <p className="text-[#718096] mb-8">
                  No momento, a plataforma de reservas automáticas está em configuração (banco de dados pendente). Para agendar a sua consulta com a psicóloga Fernanda Rabelo, por favor, entre em contato diretamente pelo WhatsApp.
                </p>
                
                <a 
                  href="https://wa.me/5581991930007" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full h-14 rounded-xl bg-[#319795] text-white font-medium text-lg shadow-[0_4px_14px_0_rgba(49,151,149,0.39)] hover:bg-[#2C7A7B] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Ir para o WhatsApp
                </a>
              </div>
            </motion.div>
          )}

          {/* PAYMENT VIEW */}
          {currentView === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => goBack('schedule')}
                className="flex items-center gap-2 text-[#718096] hover:text-[#2D3748] transition-colors mb-8"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar para horários
              </button>
              
              <div className="grid md:grid-cols-5 gap-8">
                {/* Form Col */}
                <div className="md:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-[#E2E8F0]">
                  <h3 className="text-2xl font-bold text-[#2D3748] mb-6">Pagamento</h3>
                  
                  <div className="flex gap-4 mb-8">
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex-1 py-4 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-colors
                        ${paymentMethod === 'pix' ? 'border-[#319795] bg-[#E6FFFA] text-[#319795]' : 'border-[#E2E8F0] text-[#718096] hover:border-[#CBD5E0]'}`}
                    >
                      <QrCode className="w-5 h-5" /> PIX
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 py-4 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-colors
                        ${paymentMethod === 'card' ? 'border-[#319795] bg-[#E6FFFA] text-[#319795]' : 'border-[#E2E8F0] text-[#718096] hover:border-[#CBD5E0]'}`}
                    >
                      <CreditCard className="w-5 h-5" /> Cartão
                    </button>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#4A5568] mb-1">Nome completo</label>
                        <input type="text" required className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#319795] focus:border-transparent outline-none transition-all" placeholder="Como deseja ser chamado(a)" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4A5568] mb-1">E-mail</label>
                        <input type="email" required className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#319795] focus:border-transparent outline-none transition-all" placeholder="Para receber o link da sala" />
                      </div>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
                        <div>
                          <label className="block text-sm font-medium text-[#4A5568] mb-1">Número do Cartão</label>
                          <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#319795] focus:border-transparent outline-none transition-all" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#4A5568] mb-1">Validade</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#319795] focus:border-transparent outline-none transition-all" placeholder="MM/AA" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#4A5568] mb-1">CVV</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#319795] focus:border-transparent outline-none transition-all" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'pix' && (
                      <div className="p-6 bg-[#F7FAFC] rounded-2xl border border-[#E2E8F0] text-center space-y-4 pt-4 mt-4">
                        <div className="w-40 h-40 bg-white p-2 rounded-xl border border-[#E2E8F0] mx-auto flex items-center justify-center">
                          <QrCode className="w-32 h-32 text-[#4A5568]" />
                        </div>
                        <p className="text-sm text-[#718096]">Abra o app do seu banco e escaneie o código acima, ou copie o código PIX.</p>
                        <button type="button" className="text-[#319795] font-medium text-sm hover:underline">
                          Copiar código PIX
                        </button>
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full h-14 rounded-xl bg-[#319795] text-white font-medium text-lg shadow-[0_4px_14px_0_rgba(49,151,149,0.39)] hover:bg-[#2C7A7B] transition-colors"
                    >
                      Confirmar Agendamento
                    </button>
                  </form>
                </div>

                {/* Summary Col */}
                <div className="md:col-span-2">
                  <div className="bg-[#F7FAFC] rounded-3xl p-6 border border-[#E2E8F0] sticky top-28">
                    <h4 className="font-semibold text-[#2D3748] mb-4 pb-4 border-b border-[#E2E8F0]">Resumo da Sessão</h4>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <CalendarIcon className="w-5 h-5 text-[#319795] mt-0.5" />
                        <div>
                          <p className="text-sm text-[#718096]">Data</p>
                          <p className="font-medium text-[#2D3748]">
                            {selectedDate ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR }) : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-[#319795] mt-0.5" />
                        <div>
                          <p className="text-sm text-[#718096]">Horário</p>
                          <p className="font-medium text-[#2D3748]">
                            {selectedTime || '-'} (50 minutos)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Video className="w-5 h-5 text-[#319795] mt-0.5" />
                        <div>
                          <p className="text-sm text-[#718096]">Modalidade</p>
                          <p className="font-medium text-[#2D3748]">Videochamada</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0]">
                      <div className="flex justify-between items-center text-[#2D3748] font-bold text-lg">
                        <span>Total</span>
                        <span>R$ 180,00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS VIEW */}
          {currentView === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto text-center py-12"
            >
              <div className="w-24 h-24 bg-[#E6FFFA] rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-[#319795]" />
              </div>
              <h2 className="text-3xl font-bold text-[#2D3748] mb-4">Agendamento Confirmado!</h2>
              <p className="text-lg text-[#718096] mb-8">
                Tudo certo para a nossa sessão. O link da sala foi enviado para o seu e-mail.
              </p>
              
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm mb-8 text-left space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                  <span className="text-[#718096]">Quando:</span>
                  <span className="font-medium text-[#2D3748]">
                    {selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#718096]">Onde:</span>
                  <span className="font-medium text-[#319795] flex items-center gap-2">
                    <Video className="w-4 h-4" /> Sala Virtual Exclusiva
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={startCall}
                  className="h-14 px-8 rounded-xl bg-[#2D3748] text-white font-medium text-lg hover:bg-[#1A202C] transition-colors flex items-center justify-center gap-2"
                >
                  <VideoIcon className="w-5 h-5" />
                  Acessar Sala de Videochamada Agora
                </button>
                <button 
                  onClick={() => setCurrentView('home')}
                  className="h-14 px-8 rounded-xl text-[#4A5568] font-medium hover:bg-[#EDF2F7] transition-colors"
                >
                  Voltar ao início
                </button>
              </div>
            </motion.div>
          )}
          
          {/* VIDEO CALL VIEW (PLATFORM INTEGRATION) */}
          {currentView === 'call' && (
            <motion.div
              key="call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full w-full bg-[#1A202C] flex flex-col"
            >
              <div className="h-16 px-6 flex items-center justify-between bg-[#2D3748] border-b border-white/10 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#319795] flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Sala de Atendimento - Fernanda Rabelo</span>
                </div>
                <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase animate-pulse flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Sessão Criptografada
                </div>
              </div>
              
              <div className="flex-1 p-6 relative">
                {/* Remote Video (Mock) */}
                <div className="absolute inset-4 bg-[#2D3748] rounded-2xl overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-[#4A5568] mx-auto flex items-center justify-center border-4 border-[#319795]/30">
                      <User className="w-12 h-12 text-white/50" />
                    </div>
                    <div>
                      <p className="text-white text-xl font-medium">Aguardando Fernanda Rabelo...</p>
                      <p className="text-[#A0AEC0] text-sm">A sua psicóloga entrará em breve.</p>
                    </div>
                  </div>
                </div>

                {/* Local Video (Mock) */}
                <div className="absolute bottom-8 right-8 w-64 aspect-video bg-[#4A5568] rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 flex items-center justify-center">
                   <div className="text-white/50 flex flex-col items-center">
                      <User className="w-8 h-8 mb-2" />
                      <span className="text-xs">Sua Câmera</span>
                   </div>
                </div>
              </div>
              
              {/* Call Controls */}
              <div className="h-24 bg-[#2D3748] flex items-center justify-center gap-6 pb-safe">
                <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <Mic className="w-6 h-6" />
                </button>
                <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <VideoIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setCurrentView('home')}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20 transition-colors"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
