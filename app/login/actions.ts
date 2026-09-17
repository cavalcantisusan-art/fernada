'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function safeNext(formData: FormData) {
  const value = String(formData.get('next') ?? '')
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard'
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
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('fullName') ?? '').trim()

  if (password.length < 6) {
    redirect(`/login?error=${encodeURIComponent('A senha precisa ter pelo menos 6 caracteres.')}`)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.session) {
    redirect(safeNext(formData))
  }

  redirect(`/login?success=${encodeURIComponent('Cadastro criado. Confirme seu e-mail e depois entre com sua senha.')}`)
}
