import Link from 'next/link';
import {
  CalendarCheck2,
  HeartHandshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Video,
} from 'lucide-react';

const areas = [
  'Psicologia Analítica',
  'Arteterapia',
  'Saúde Mental',
  'Redução de Danos',
  'Psicoterapia Assistida com Cetamina',
  'Psicologia Financeira',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3748]">
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-[#FDFBF7]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#319795] text-white">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold leading-tight">Fernanda Rabelo</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#718096]">Psicologia Online</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#4A5568] md:flex">
            <a href="#sobre" className="hover:text-[#319795]">Sobre</a>
            <a href="#atuacao" className="hover:text-[#319795]">Atuação</a>
            <a href="mailto:rabelo.fernanda.psi@gmail.com" className="hover:text-[#319795]">Contato</a>
            <Link href="/login" className="hover:text-[#319795]">Minha área</Link>
            <Link href="/agendar" className="rounded-full bg-[#319795] px-5 py-3 font-semibold text-white hover:bg-[#2C7A7B]">Agendar</Link>
          </nav>

          <Link href="/agendar" className="rounded-full bg-[#319795] px-4 py-2.5 text-sm font-semibold text-white md:hidden">Agendar</Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[74vh] max-w-6xl items-center gap-10 px-5 py-12 sm:px-6 md:grid-cols-2 md:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6FFFA] px-3 py-1.5 text-sm font-semibold text-[#319795]">
              <span className="h-2 w-2 rounded-full bg-[#319795]" />
              Atendimentos online disponíveis
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-[#1A202C] sm:text-5xl">
              Um espaço de acolhimento e escuta para cuidar da sua <span className="text-[#319795]">saúde emocional.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#4A5568]">
              Agende sua consulta online com Fernanda Rabelo. Sessões individuais, com 50 minutos de duração e acesso por videochamada.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/agendar" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#319795] px-7 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2C7A7B]">
                <CalendarCheck2 className="h-5 w-5" /> Agendar consulta
              </Link>
              <Link href="/login" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#DDE8E7] bg-white px-7 font-semibold text-[#2D3748] hover:bg-[#F7FAFC]">
                <UserRound className="h-5 w-5 text-[#319795]" /> Área da Paciente
              </Link>
            </div>

            <div className="mt-8 grid gap-3 border-t border-[#E2E8F0] pt-6 text-sm text-[#718096] sm:grid-cols-2">
              <div className="flex items-center gap-2"><Video className="h-4 w-4 text-[#319795]" /> Videochamada protegida</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#319795]" /> Pagamento pela Stripe</div>
              <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#319795]" /> Área autenticada</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#319795]" /> rabelo.fernanda.psi@gmail.com</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rotate-3 scale-[1.03] rounded-[2rem] bg-gradient-to-tr from-[#E6FFFA] to-[#EDF2F7]" />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1400&auto=format&fit=crop"
                alt="Fernanda Rabelo"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-lg backdrop-blur">
                <p className="font-semibold">Fernanda Rabelo</p>
                <p className="text-sm text-[#718096]">Psicóloga • CRP 02/15302</p>
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="border-y border-[#E2E8F0] bg-white px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
            <div className="overflow-hidden rounded-3xl shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1400&auto=format&fit=crop"
                alt="Psicóloga em atendimento"
                className="aspect-square w-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#319795]">Sobre</p>
              <h2 className="mt-3 text-3xl font-bold text-[#1A202C] sm:text-4xl">Fernanda Rabelo</h2>
              <div className="mt-5 space-y-4 leading-relaxed text-[#4A5568]">
                <p><strong>Psicóloga formada pela FAFIRE, em 2010.</strong> Atua com experiência em saúde mental, arteterapia e redução de danos.</p>
                <ul className="space-y-3 pl-5 marker:text-[#319795] list-disc">
                  <li>Arteterapeuta — ARTE-PE 107/0516.</li>
                  <li>Mestra em Psicologia Social pela UFS.</li>
                  <li>Especialista em Psicologia Junguiana com enfoque na prática clínica pela Faculdade IDE.</li>
                  <li>Facilitadora de SoulCollage.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="atuacao" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#319795]">Atuação</p>
            <h2 className="mt-3 text-3xl font-bold text-[#1A202C] sm:text-4xl">Áreas de atendimento</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <div key={area} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-[#319795]">
                {area}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
