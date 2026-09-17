import { createClient } from '@/lib/supabase/server';
import { getLocalSession } from '@/lib/session';

export async function requireProfessional() {
  // 1. Check local session
  const localSession = await getLocalSession();
  if (localSession && localSession.role === 'professional') {
    return {
      userId: localSession.id,
      profile: {
        id: localSession.id,
        full_name: localSession.name,
        role: 'professional' as const,
      },
    };
  }

  // 2. Check Supabase session
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;
    if (!userId) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();

    if (profile?.role !== 'professional') return null;
    return { userId, profile };
  } catch {
    return null;
  }
}

export function getServiceRoleConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function serviceHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}
