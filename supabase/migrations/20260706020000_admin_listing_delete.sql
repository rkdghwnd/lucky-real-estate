-- Admin hard-delete for listings. anon/public stay delete-denied; only an
-- authenticated admin (public.is_admin()) may remove a row.
grant delete on public.listings to authenticated;

drop policy if exists "admin deletes listings" on public.listings;
create policy "admin deletes listings"
on public.listings for delete
to authenticated
using ((select public.is_admin()));
