create extension if not exists "pgcrypto";

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  property_type text not null check (property_type in ('공장','창고','토지','기타')),
  deal_type text not null check (deal_type in ('매매','임대')),
  status text not null default '공개' check (status in ('공개','거래완료','비공개')),
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

create table if not exists admin (
  id uuid primary key default gen_random_uuid(),
  pin_hash text not null,
  created_at timestamptz not null default now()
);

-- RLS: public may READ only visible content; writes are service-role only (P2 admin).
alter table listings enable row level security;
alter table posts enable row level security;
alter table inquiries enable row level security;
alter table admin enable row level security;

drop policy if exists "public reads open listings" on listings;
create policy "public reads open listings" on listings
  for select using (status = '공개');

drop policy if exists "public reads published posts" on posts;
create policy "public reads published posts" on posts
  for select using (published = true);
-- inquiries/admin: no public policy → anon fully denied (P2 adds authed access).
