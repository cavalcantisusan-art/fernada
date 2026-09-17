import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { updateProfile } from './actions';

type PageProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function ProfilePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', userId)
    .single();

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-8 text-[#2D3748] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="font-semibold text-[#319795]">← Voltar à minha área</Link>
          <span className="rounded-full bg-[#E6FFFA] px-3 py-1 text-xs font-semibold text-[#2C7A7B]">Conta protegida</span>
        </div>

        <section className="rounded-3xl border border-[#DDE8E7] bg-white p-6 shadow-sm sm:p-9">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#E6FFFA] text-[#319795]">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : <UserRound className="h-7 w-7" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#319795]">Meu perfil</p>
              <h1 className="mt-1 text-3xl font-bold">Dados da conta</h1>
            </div>
          </div>

          {params.error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</div> : null}
          {params.success ? <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.success}</div> : null}

          <form action={updateProfile} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Nome completo</span>
              <input name="fullName" required defaultValue={profile?.full_name ?? ''} className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#319795] focus:ring-2 focus:ring-[#E6FFFA]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">URL da foto <span className="font-normal text-[#A0AEC0]">(opcional)</span></span>
              <input name="avatarUrl" type="url" defaultValue={profile?.avatar_url ?? ''} placeholder="https://..." className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 outline-none focus:border-[#319795] focus:ring-2 focus:ring-[#E6FFFA]" />
              <span className="mt-1 block text-xs text-[#718096]">A foto é opcional. O sistema não altera permissões da conta por esta tela.</span>
            </label>
            <button className="rounded-xl bg-[#319795] px-5 py-3 font-semibold text-white hover:bg-[#2C7A7B]">Salvar perfil</button>
          </form>
        </section>
      </div>
    </main>
  );
}
