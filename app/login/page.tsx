import Link from 'next/link';
import { HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';
import { login, signup } from './actions';

type LoginPageProps = {
  searchParams: Promise<{ error?: string; success?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = typeof params.next === 'string' && params.next.startsWith('/') && !params.next.startsWith('//') ? params.next : '/dashboard';

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-10 text-[#2D3748] sm:py-14">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <section className="rounded-[2rem] bg-[#1F2937] p-7 text-white shadow-xl sm:p-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#319795]"><HeartHandshake className="h-5 w-5" /></span>
            <span><strong className="block">Fernanda Rabelo</strong><span className="text-xs uppercase tracking-[0.18em] text-white/55">Psicologia Online</span></span>
          </Link>
          <div className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#81E6D9]">Área segura</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Sua consulta, seus pagamentos e sua sala em um só lugar.</h1>
            <p className="mt-5 leading-relaxed text-white/65">Entre para acompanhar agendamentos, consultar o status do pagamento e acessar a videochamada no horário marcado.</p>
          </div>
          <div className="mt-10 space-y-3 text-sm text-white/70">
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#81E6D9]" /> Dados protegidos por autenticação e regras de acesso.</p>
            <p className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#81E6D9]" /> A sala só é liberada para consultas confirmadas e pagas.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#DDE8E7] bg-white p-7 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#319795]">Minha área</p>
          <h2 className="mt-2 text-3xl font-bold">Entrar ou criar conta</h2>
          <p className="mt-2 text-sm text-[#718096]">Use o mesmo e-mail informado no agendamento sempre que possível.</p>

          {params.error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div> : null}
          {params.success ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.success}</div> : null}

          <form className="mt-7 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Nome completo <span className="font-normal text-[#A0AEC0]">(para criar conta)</span></span>
              <input id="fullName" name="fullName" type="text" placeholder="Seu nome" className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none transition focus:border-[#319795] focus:ring-2 focus:ring-[#E6FFFA]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">E-mail</span>
              <input id="email" name="email" type="email" required placeholder="voce@email.com" autoComplete="email" className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none transition focus:border-[#319795] focus:ring-2 focus:ring-[#E6FFFA]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Senha</span>
              <input id="password" name="password" type="password" required minLength={6} autoComplete="current-password" className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none transition focus:border-[#319795] focus:ring-2 focus:ring-[#E6FFFA]" />
            </label>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button formAction={login} className="rounded-xl bg-[#319795] px-4 py-3 font-semibold text-white transition hover:bg-[#2C7A7B]">Entrar</button>
              <button formAction={signup} className="rounded-xl border border-[#CBD5E0] px-4 py-3 font-semibold transition hover:bg-[#F7FAFC]">Criar conta</button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#EEF2F2] pt-5 text-sm font-medium text-[#4A5568]">
            <Link href="/agendar" className="hover:text-[#319795]">Agendar consulta</Link>
            <Link href="/privacidade" className="hover:text-[#319795]">Privacidade</Link>
            <Link href="/termos" className="hover:text-[#319795]">Termos</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
