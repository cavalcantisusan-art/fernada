import { login, signup } from './actions'

type LoginPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-violet-300">Área segura</p>
        <h1 className="mt-3 text-3xl font-semibold">Entrar no sistema</h1>
        <p className="mt-2 text-sm text-white/60">
          Use seu e-mail e senha para acessar a área protegida.
        </p>

        {params.error ? (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {params.error}
          </div>
        ) : null}

        {params.success ? (
          <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {params.success}
          </div>
        ) : null}

        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/70" htmlFor="fullName">
              Nome completo
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Seu nome"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-violet-400 transition focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="voce@email.com"
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-violet-400 transition focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-violet-400 transition focus:ring-2"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <button
              formAction={login}
              className="rounded-xl bg-violet-500 px-4 py-3 font-medium text-white transition hover:bg-violet-400"
            >
              Entrar
            </button>
            <button
              formAction={signup}
              className="rounded-xl border border-white/15 px-4 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Criar conta
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
