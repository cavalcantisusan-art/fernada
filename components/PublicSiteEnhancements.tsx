'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2, CreditCard, ShieldCheck, UserRound, Video } from 'lucide-react';

const faqs = [
  ['Como funciona a consulta online?', 'Você escolhe um horário, finaliza o pagamento e acompanha tudo pela Área da Paciente. A sala virtual é liberada próximo do horário da sessão.'],
  ['Quanto dura a sessão?', 'Cada sessão individual tem duração prevista de 50 minutos.'],
  ['Como é feito o pagamento?', 'O pagamento é processado pela Stripe. Os dados do cartão não são armazenados neste site.'],
  ['Quando o horário fica confirmado?', 'A consulta é considerada confirmada depois que o pagamento é aprovado e o status é atualizado no sistema.'],
  ['Posso acessar pelo celular?', 'Sim. O site é responsivo. Para a videochamada, use um navegador atualizado e permita acesso à câmera e ao microfone.'],
  ['O site serve para emergências?', 'Não. A plataforma é destinada a agendamento e atendimento programado, não a situações de emergência.'],
];

export default function PublicSiteEnhancements() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <>
      <section className="bg-[#FDFBF7] px-5 py-16 text-[#2D3748] sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#319795]">Como funciona</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Do agendamento à consulta em poucos passos</h2>
            <p className="mt-4 text-[#718096]">Um fluxo simples para escolher o horário, pagar com segurança e acessar sua sessão online.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <StepCard icon={<CalendarCheck2 />} number="01" title="Escolha o horário" text="Consulte a agenda em tempo real e selecione uma data e horário disponíveis." />
            <StepCard icon={<CreditCard />} number="02" title="Finalize o pagamento" text="O pagamento acontece no ambiente seguro da Stripe. O site não armazena dados do cartão." />
            <StepCard icon={<Video />} number="03" title="Acesse sua sessão" text="Após a confirmação, acompanhe a consulta na Área da Paciente e entre na sala no horário marcado." />
          </div>

          <div className="mt-10 grid gap-4 rounded-3xl border border-[#DDE8E7] bg-white p-6 shadow-sm sm:grid-cols-3 sm:p-8">
            <Info title="Atendimento" value="Sob consulta" subtitle="combinado no primeiro contato" />
            <Info title="Duração" value="50 minutos" subtitle="atendimento individual" />
            <Info title="Modalidade" value="Online" subtitle="videochamada segura" />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-[#E6FFFA] p-7">
              <ShieldCheck className="h-7 w-7 text-[#319795]" />
              <h3 className="mt-4 text-xl font-bold">Privacidade desde o agendamento</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A5568]">Autenticação, controle de acesso, banco protegido por políticas e checkout externo ajudam a separar dados públicos, privados e de pagamento.</p>
              <div className="mt-4 flex gap-4 text-sm font-semibold text-[#2C7A7B]"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></div>
            </div>
            <div className="rounded-3xl bg-[#1F2937] p-7 text-white">
              <UserRound className="h-7 w-7 text-[#81E6D9]" />
              <h3 className="mt-4 text-xl font-bold">Sua consulta em um só lugar</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">Na Área da Paciente você acompanha consultas futuras, status do pagamento, adiciona o compromisso à agenda e acessa a sala virtual.</p>
              <div className="mt-5 flex flex-wrap gap-3"><Link href="/login" className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2937]">Entrar</Link><Link href="/agendar" className="rounded-xl bg-[#319795] px-4 py-2.5 text-sm font-semibold text-white">Agendar</Link></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#E2E8F0] bg-white px-5 py-16 text-[#2D3748] sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#319795]">Dúvidas frequentes</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Antes de agendar</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map(([question, answer]) => (
              <article key={question} className="rounded-2xl border border-[#E2E8F0] bg-[#FDFBF7] p-6">
                <h3 className="font-bold">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#718096]">{answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/agendar" className="inline-flex rounded-full bg-[#319795] px-6 py-3 font-semibold text-white hover:bg-[#2C7A7B]">Ver horários disponíveis</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E2E8F0] bg-white px-5 py-10 text-[#4A5568]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-bold text-[#2D3748]">Fernanda Rabelo</p>
            <p className="mt-1 text-sm">Fernanda Caldas Rabelo de Oliveira • CRP 02/15302</p>
            <p className="mt-2 text-sm text-[#718096]">
              WhatsApp: <a href="https://wa.me/5581991930007" className="text-[#319795] underline">+55 81 99193-0007</a> • E-mail: rabelo.fernandac@gmail.com
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium"><Link href="/agendar">Agendar</Link><Link href="/login">Minha área</Link><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></div>
        </div>
      </footer>
    </>
  );
}

function StepCard({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) {
  return <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="text-[#319795]">{icon}</span><span className="text-xs font-bold tracking-widest text-[#A0AEC0]">{number}</span></div><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#718096]">{text}</p></div>;
}
function Info({ title, value, subtitle }: { title: string; value: string; subtitle: string }) { return <div className="text-center sm:border-r sm:border-[#E2E8F0] sm:last:border-0"><p className="text-xs uppercase tracking-wider text-[#718096]">{title}</p><p className="mt-2 text-2xl font-bold text-[#319795]">{value}</p><p className="mt-1 text-sm text-[#718096]">{subtitle}</p></div>; }
