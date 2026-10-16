-- Panificacao Capricho: catalogo e area administrativa
-- Execute no SQL Editor do Supabase. Nunca publique uma service_role/secret key.

create table if not exists public.catalog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name_pt text not null check (char_length(trim(name_pt)) between 1 and 120),
  name_en text not null check (char_length(trim(name_en)) between 1 and 120),
  description_pt text not null default '',
  description_en text not null default '',
  category_pt text not null default 'Outros',
  category_en text not null default 'Other',
  image_url text not null,
  price numeric(10,2) check (price is null or price >= 0),
  is_active boolean not null default true,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();

create or replace function public.is_catalog_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.catalog_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_catalog_admin() from public;
grant execute on function public.is_catalog_admin() to anon, authenticated;

alter table public.catalog_admins enable row level security;
alter table public.products enable row level security;

drop policy if exists "Admins can read their own admin record" on public.catalog_admins;
create policy "Admins can read their own admin record" on public.catalog_admins for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Public can view published catalog items" on public.products;
create policy "Public can view published catalog items" on public.products for select to anon, authenticated using (is_active = true or public.is_catalog_admin());

drop policy if exists "Catalog admins can insert products" on public.products;
create policy "Catalog admins can insert products" on public.products for insert to authenticated with check (public.is_catalog_admin());

drop policy if exists "Catalog admins can update products" on public.products;
create policy "Catalog admins can update products" on public.products for update to authenticated using (public.is_catalog_admin()) with check (public.is_catalog_admin());

drop policy if exists "Catalog admins can delete products" on public.products;
create policy "Catalog admins can delete products" on public.products for delete to authenticated using (public.is_catalog_admin());

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.catalog_admins to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Public can view product photo objects" on storage.objects;
create policy "Public can view product photo objects" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "Catalog admins can upload product photos" on storage.objects;
create policy "Catalog admins can upload product photos" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_catalog_admin());

drop policy if exists "Catalog admins can update product photos" on storage.objects;
create policy "Catalog admins can update product photos" on storage.objects for update to authenticated using (bucket_id='product-images' and public.is_catalog_admin()) with check (bucket_id='product-images' and public.is_catalog_admin());

drop policy if exists "Catalog admins can delete product photos" on storage.objects;
create policy "Catalog admins can delete product photos" on storage.objects for delete to authenticated using (bucket_id='product-images' and public.is_catalog_admin());

-- Após criar um usuário em Authentication > Users, copie seu UUID e execute:
-- insert into public.catalog_admins (user_id) values ('UUID-DO-USUARIO-AQUI');
