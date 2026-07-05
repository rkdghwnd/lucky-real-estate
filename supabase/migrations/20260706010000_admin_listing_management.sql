do $$
declare
  legacy_has_rows boolean := false;
begin
  if to_regclass('public.admin') is not null then
    execute 'select exists (select 1 from public.admin)' into legacy_has_rows;
    if legacy_has_rows then
      raise exception 'public.admin contains legacy PIN data; back it up before running this migration';
    end if;
  end if;
end
$$;

drop table if exists public.admin;

create table if not exists public.admin_users (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

update public.listings set status = '거래완료' where status = '비공개';
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings
  add constraint listings_status_check check (status in ('공개','거래완료'));

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

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

grant select on public.listings to anon, authenticated;
grant insert, update on public.listings to authenticated;
revoke delete on public.listings from anon, authenticated;

drop policy if exists "public reads open listings" on public.listings;
drop policy if exists "admin reads all listings" on public.listings;
drop policy if exists "admin inserts listings" on public.listings;
drop policy if exists "admin updates listings" on public.listings;

create policy "public reads open listings"
on public.listings for select
to anon
using (status = '공개');

create policy "admin reads all listings"
on public.listings for select
to authenticated
using ((select public.is_admin()));

create policy "admin inserts listings"
on public.listings for insert
to authenticated
with check ((select public.is_admin()) and status = '공개');

create policy "admin updates listings"
on public.listings for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()) and status in ('공개','거래완료'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin uploads listing images" on storage.objects;
drop policy if exists "admin updates listing images" on storage.objects;
drop policy if exists "admin deletes listing images" on storage.objects;

create policy "admin uploads listing images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'listing-images' and (select public.is_admin()));

create policy "admin updates listing images"
on storage.objects for update
to authenticated
using (bucket_id = 'listing-images' and (select public.is_admin()))
with check (bucket_id = 'listing-images' and (select public.is_admin()));

create policy "admin deletes listing images"
on storage.objects for delete
to authenticated
using (bucket_id = 'listing-images' and (select public.is_admin()));
