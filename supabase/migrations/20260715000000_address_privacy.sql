-- Address privacy + form-driven status.
--
-- 1) address_public: whether the listing's address (and map location) may be
--    shown on the public site. Defaults true so existing listings are unchanged.
-- 2) listings_public: the read surface for the public (anon) site. It filters to
--    공개 listings and masks address/lat/lng when the address is private, so a
--    private address never reaches the browser through the app.
--
-- This migration is additive and safe to run against the live database: existing
-- code that reads the `listings` table directly keeps working. After the new
-- build (which reads `listings_public`) is deployed, you may optionally run the
-- REVOKE at the bottom to also block direct anon table reads.

alter table public.listings
  add column if not exists address_public boolean not null default true;

create or replace view public.listings_public
with (security_invoker = on) as
  select
    id, slug, title, property_type, deal_type, status,
    case when address_public then address else null end as address,
    address_public,
    land_area_m2, building_area_m2, price, monthly_rent,
    zoning, land_category, road_access, ceiling_height_m, power_capacity, completion_year,
    case when address_public then lat else null end as lat,
    case when address_public then lng else null end as lng,
    images, description, created_at, updated_at
  from public.listings
  where status = '공개';

grant select on public.listings_public to anon, authenticated;

-- Optional hardening — run only AFTER the new build (reading listings_public) is
-- live, otherwise the currently-deployed build (reading the table) breaks:
-- revoke select on public.listings from anon;
