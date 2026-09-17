import { cookies } from 'next/headers';

export type UserSession = {
  id: string;
  email: string;
  name: string;
  role: 'professional' | 'patient';
  createdAt: string;
};

const SESSION_COOKIE_NAME = 'psi_fernanda_session';

export function isProfessionalEmail(email: string): boolean {
  const normalized = (email || '').trim().toLowerCase();
  return (
    normalized === 'rabelo.fernandac@gmail.com' ||
    normalized === 'rabelo.fernanda.psi@gmail.com' ||
    normalized === 'fernanda.rabelo@gmail.com' ||
    normalized.startsWith('fernanda') ||
    normalized.includes('fernanda')
  );
}

export async function getLocalSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded) as UserSession;
    if (parsed && parsed.id && parsed.email && parsed.role) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setLocalSession(session: UserSession): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64');
  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearLocalSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
