import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, created_at')
    .eq('id', claims.sub)
    .single()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-violet-300">Área protegida</p>
            <h1 className="mt-3 text-3xl font-semibold">
              Olá{profile?.full_name ? `, ${profile.full_name}` : ''}.
            </h1>
            <p className="mt-2 text-white/60">
              Sua sessão foi validada pelo Supabase Auth no servidor.
            </p>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-xl border border-white/15 px-5 py-3 font-medium transition hover:bg-white/10"
            >
              Sair
            </button>
          </form>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">Status</p>
            <p className="mt-2 font-medium text-emerald-300">Autenticado</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
            <p className="text-sm text-white/50">Usuário</p>
            <p className="mt-2 break-all font-medium">{claims.email ?? claims.sub}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
