import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://oqudtwtnnuqgvltcremx.supabase.co'
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_SOOwgewRCvOCvpHR4sKECw_d7leAlav'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey)
}
