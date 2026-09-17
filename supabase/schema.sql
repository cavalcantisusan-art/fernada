create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  email text not null,
  phone text not null,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists appointments_unique_active_slot
  on public.appointments (appointment_date, appointment_time)
  where status <> 'cancelled';

alter table public.appointments enable row level security;

-- The browser must never talk directly to this table. The Next.js API route uses
-- the server-only SUPABASE_SERVICE_ROLE_KEY. Keep public roles explicitly blocked.
revoke all on table public.appointments from anon, authenticated;
grant select, insert, update, delete on table public.appointments to service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();
