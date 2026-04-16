-- Fix relationship between products and seller_profiles
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Add foreign key if it doesn't exist
alter table public.products
drop constraint if exists products_seller_id_fkey,
add constraint products_seller_id_fkey 
foreign key (seller_id) 
references public.seller_profiles(user_id) 
on delete cascade;

-- 2. Ensure RLS is still correct
alter table public.products enable row level security;

-- 3. Update select policy to ensure joins work
drop policy if exists "Enable select for everyone" on public.products;
create policy "Enable select for everyone"
on public.products
for select
to public
using (status = 'published' or auth.uid() = seller_id);
