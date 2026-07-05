create extension if not exists "pgcrypto";

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  property_type text not null check (property_type in ('공장','창고','토지','기타')),
  deal_type text not null check (deal_type in ('매매','임대')),
  status text not null default '공개' check (status in ('공개','거래완료')),
  address text not null,
  land_area_m2 numeric,
  building_area_m2 numeric,
  price bigint not null default 0,
  monthly_rent bigint,
  zoning text,
  land_category text,
  road_access text,
  ceiling_height_m numeric,
  power_capacity text,
  completion_year int,
  lat numeric,
  lng numeric,
  images text[] not null default '{}',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in ('가이드','리포트')),
  title text not null,
  body text not null,
  summary text,
  author text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_set_updated_at on listings;
create trigger listings_set_updated_at
before update on listings
for each row execute function public.set_updated_at();

-- RLS: public may READ only visible content; writes are service-role only (P2 admin).
alter table listings enable row level security;
alter table posts enable row level security;
alter table inquiries enable row level security;
alter table admin_users enable row level security;

revoke all on admin_users from anon, authenticated;
grant select on listings to anon, authenticated;
grant insert, update on listings to authenticated;
revoke delete on listings from anon, authenticated;

drop policy if exists "public reads open listings" on listings;
create policy "public reads open listings" on listings
  for select to anon using (status = '공개');

drop policy if exists "admin reads all listings" on listings;
create policy "admin reads all listings" on listings
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "admin inserts listings" on listings;
create policy "admin inserts listings" on listings
  for insert to authenticated
  with check ((select public.is_admin()) and status = '공개');

drop policy if exists "admin updates listings" on listings;
create policy "admin updates listings" on listings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()) and status in ('공개','거래완료'));

drop policy if exists "public reads published posts" on posts;
create policy "public reads published posts" on posts
  for select using (published = true);
-- inquiries/admin_users: no public policy → anon fully denied.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin uploads listing images" on storage.objects;
create policy "admin uploads listing images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images' and (select public.is_admin()));

drop policy if exists "admin updates listing images" on storage.objects;
create policy "admin updates listing images" on storage.objects
  for update to authenticated
  using (bucket_id = 'listing-images' and (select public.is_admin()))
  with check (bucket_id = 'listing-images' and (select public.is_admin()));

drop policy if exists "admin deletes listing images" on storage.objects;
create policy "admin deletes listing images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-images' and (select public.is_admin()));
