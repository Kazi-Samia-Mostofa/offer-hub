-- Migration to create the products table
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  category text,
  tags text[] default '{}',
  original_price numeric default 0,
  discount_percent numeric default 0,
  final_price numeric default 0,
  stock_status text default 'In Stock',
  image_urls text[] default '{}',
  status text check (status in ('published', 'draft')) default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- Policies
drop policy if exists "Sellers can manage their own products" on public.products;
create policy "Sellers can manage their own products"
  on public.products for all
  to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "Public can view published products" on public.products;
create policy "Public can view published products"
  on public.products for select
  to public
  using (status = 'published');

-- Function to handle updated_at
create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for updated_at
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_products_updated_at();
