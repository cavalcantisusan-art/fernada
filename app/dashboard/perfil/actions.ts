'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;
  if (!userId) redirect('/login');

  const fullName = String(formData.get('fullName') ?? '').trim();
  const avatarUrl = String(formData.get('avatarUrl') ?? '').trim();

  if (fullName.length < 2 || fullName.length > 120) {
    redirect('/dashboard/perfil?error=Informe%20um%20nome%20válido.');
  }

  if (avatarUrl && !/^https:\/\//i.test(avatarUrl)) {
    redirect('/dashboard/perfil?error=A%20foto%20precisa%20usar%20um%20endereço%20HTTPS.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, avatar_url: avatarUrl || null })
    .eq('id', userId);

  if (error) {
    redirect(`/dashboard/perfil?error=${encodeURIComponent('Não foi possível salvar o perfil.')}`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/perfil');
  redirect('/dashboard/perfil?success=Perfil%20atualizado.');
}
