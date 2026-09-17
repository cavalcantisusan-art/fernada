import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://oqudtwtnnuqgvltcremx.supabase.co'
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_SOOwgewRCvOCvpHR4sKECw_d7leAlav'

const PROTECTED_PREFIXES = ['/dashboard', '/profissional', '/sala']
const SESSION_COOKIE_NAME = 'psi_fernanda_session'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // 1. Check local session cookie
  const localCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
  let hasValidSession = false
  let isProfessional = false

  if (localCookie) {
    try {
      const decoded = JSON.parse(Buffer.from(localCookie, 'base64').toString('utf-8'))
      if (decoded && decoded.id) {
        hasValidSession = true
        isProfessional = decoded.role === 'professional'
      }
    } catch {
      // ignore invalid base64 cookie
    }
  }

  // 2. Check Supabase session
  if (!hasValidSession) {
    try {
      const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      })

      const { data } = await supabase.auth.getClaims()
      if (data?.claims) {
        hasValidSession = true
      }
    } catch {
      // fallback gracefully if Supabase is unreachable
    }
  }

  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!hasValidSession && isProtected) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (hasValidSession && pathname === '/login') {
    const targetUrl = request.nextUrl.clone()
    targetUrl.pathname = isProfessional ? '/profissional' : '/dashboard'
    targetUrl.search = ''
    return NextResponse.redirect(targetUrl)
  }

  return response
}
