'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function safeNext(formData: FormData) {
  const value = String(formData.get('next') ?? '')
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard'
}

function friendlySignupError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('rate limit') || normalized.includes('email rate limit exceeded')) {
    return 'Muitos e-mails de confirmação foram solicitados em pouco tempo. Aguarde alguns minutos e tente novamente. Se você já criou a conta, use Entrar em vez de Criar conta.'
  }

  if (normalized.includes('already registered') || normalized.includes('already been registered') || normalized.includes('user already exists')) {
    return 'Este e-mail já possui uma conta. Use o botão Entrar com sua senha.'
  }

  if (normalized.includes('invalid email')) {
    return 'Informe um e-mail válido.'
  }

  return 'Não foi possível criar a conta agora. Tente novamente em alguns minutos.'
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const next = safeNext(formData)
    redirect(`/login?error=${encodeURIComponent('E-mail ou senha inválidos.')}&next=${encodeURIComponent(next)}`)
  }

  redirect(safeNext(formData))
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('fullName') ?? '').trim()
  const next = safeNext(formData)

  if (fullName.length < 3) {
    redirect(`/login?error=${encodeURIComponent('Informe seu nome completo para criar a conta.')}&next=${encodeURIComponent(next)}`)
  }

  if (password.length < 6) {
    redirect(`/login?error=${encodeURIComponent('A senha precisa ter pelo menos 6 caracteres.')}&next=${encodeURIComponent(next)}`)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(friendlySignupError(error.message))}&next=${encodeURIComponent(next)}`)
  }

  if (data.session) {
    redirect(next)
  }

  redirect(`/login?success=${encodeURIComponent('Cadastro criado. Verifique sua caixa de entrada e confirme o e-mail. Se já confirmou anteriormente, use Entrar.')}&next=${encodeURIComponent(next)}`)
}
