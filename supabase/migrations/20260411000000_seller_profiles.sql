-- Run this in Supabase Dashboard → SQL Editor (once), or via `supabase db push` if you use the CLI.

create table if not exists public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  store_name text,
  description text,
  email text,
  phone text,
  location text,
  website_url text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_seller_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists seller_profiles_set_updated_at on public.seller_profiles;
create trigger seller_profiles_set_updated_at
  before update on public.seller_profiles
  for each row
  execute function public.set_seller_profiles_updated_at();

alter table public.seller_profiles enable row level security;

drop policy if exists "seller_profiles_select_own" on public.seller_profiles;
drop policy if exists "seller_profiles_insert_own" on public.seller_profiles;
drop policy if exists "seller_profiles_update_own" on public.seller_profiles;

create policy "seller_profiles_select_own"
  on public.seller_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "seller_profiles_insert_own"
  on public.seller_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "seller_profiles_update_own"
  on public.seller_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
