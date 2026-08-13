-- Move RLS role checks to a private schema and make public SECURITY DEFINER
-- routines callable only by the service role used inside Edge Functions.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_active = true
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "public can read active product categories" on public.product_categories;
create policy "public can read active product categories" on public.product_categories for select using (is_active = true or private.is_admin());
drop policy if exists "public can read active products" on public.products;
create policy "public can read active products" on public.products for select using (is_active = true or private.is_admin());
drop policy if exists "public can read images for active products" on public.product_images;
create policy "public can read images for active products" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.is_active = true or private.is_admin())));
drop policy if exists "public can read published gallery" on public.gallery;
create policy "public can read published gallery" on public.gallery for select using (is_published = true or private.is_admin());
drop policy if exists "public can read active souvenirs" on public.souvenir_packages;
create policy "public can read active souvenirs" on public.souvenir_packages for select using (is_active = true or private.is_admin());
drop policy if exists "public can read published faqs" on public.faqs;
create policy "public can read published faqs" on public.faqs for select using (is_published = true or private.is_admin());
drop policy if exists "public can read published testimonials" on public.testimonials;
create policy "public can read published testimonials" on public.testimonials for select using (is_published = true or private.is_admin());
drop policy if exists "public can read public settings" on public.site_settings;
create policy "public can read public settings" on public.site_settings for select using (is_public = true or private.is_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'product_categories', 'products', 'product_images', 'customers', 'orders', 'order_items',
    'gallery', 'souvenir_packages', 'contact_messages', 'newsletter_subscribers', 'faqs',
    'testimonials', 'site_settings', 'admin_users'
  ] loop
    execute format('drop policy if exists "admins manage %I" on public.%I', table_name, table_name);
    execute format('create policy "admins manage %I" on public.%I for all to authenticated using (private.is_admin()) with check (private.is_admin())', table_name, table_name);
  end loop;
end;
$$;

drop policy if exists "admins can upload product image objects" on storage.objects;
create policy "admins can upload product image objects" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and private.is_admin());
drop policy if exists "admins can update product image objects" on storage.objects;
create policy "admins can update product image objects" on storage.objects for update to authenticated using (bucket_id = 'product-images' and private.is_admin()) with check (bucket_id = 'product-images' and private.is_admin());
drop policy if exists "admins can delete product image objects" on storage.objects;
create policy "admins can delete product image objects" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and private.is_admin());
drop policy if exists "admins can upload gallery image objects" on storage.objects;
create policy "admins can upload gallery image objects" on storage.objects for insert to authenticated with check (bucket_id = 'gallery-images' and private.is_admin());
drop policy if exists "admins can update gallery image objects" on storage.objects;
create policy "admins can update gallery image objects" on storage.objects for update to authenticated using (bucket_id = 'gallery-images' and private.is_admin()) with check (bucket_id = 'gallery-images' and private.is_admin());
drop policy if exists "admins can delete gallery image objects" on storage.objects;
create policy "admins can delete gallery image objects" on storage.objects for delete to authenticated using (bucket_id = 'gallery-images' and private.is_admin());
drop policy if exists "admins can upload souvenir image objects" on storage.objects;
create policy "admins can upload souvenir image objects" on storage.objects for insert to authenticated with check (bucket_id = 'souvenir-images' and private.is_admin());
drop policy if exists "admins can update souvenir image objects" on storage.objects;
create policy "admins can update souvenir image objects" on storage.objects for update to authenticated using (bucket_id = 'souvenir-images' and private.is_admin()) with check (bucket_id = 'souvenir-images' and private.is_admin());
drop policy if exists "admins can delete souvenir image objects" on storage.objects;
create policy "admins can delete souvenir image objects" on storage.objects for delete to authenticated using (bucket_id = 'souvenir-images' and private.is_admin());

drop function if exists public.is_admin();
drop function if exists public.claim_first_admin();
drop function if exists public.grant_admin_by_email(text, text);

create or replace function public.claim_first_admin(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_user_id is null then
    raise exception 'A user identifier is required';
  end if;

  perform pg_advisory_xact_lock(18006001);
  if exists (select 1 from public.admin_users where is_active = true) then
    return false;
  end if;

  insert into public.admin_users (user_id, role, is_active)
  values (p_user_id, 'admin', true)
  on conflict (user_id) do update set role = 'admin', is_active = true;
  return true;
end;
$$;

create or replace function public.grant_admin_by_email(p_actor_id uuid, p_email text, p_role text default 'admin')
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_user_id uuid;
begin
  if not exists (select 1 from public.admin_users where user_id = p_actor_id and is_active = true) then
    raise exception 'Administrator access is required';
  end if;
  if p_role not in ('admin', 'editor') then
    raise exception 'Invalid admin role';
  end if;
  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_user_id is null then
    raise exception 'No Supabase auth user exists for that email';
  end if;
  insert into public.admin_users (user_id, role, is_active)
  values (v_user_id, p_role, true)
  on conflict (user_id) do update set role = excluded.role, is_active = true;
  return v_user_id;
end;
$$;

revoke all on function public.create_public_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_public_order(text, text, text, text, text, jsonb) to service_role;
revoke all on function public.get_public_order_status(uuid, text) from public;
grant execute on function public.get_public_order_status(uuid, text) to service_role;
revoke all on function public.claim_first_admin(uuid) from public;
grant execute on function public.claim_first_admin(uuid) to service_role;
revoke all on function public.grant_admin_by_email(uuid, text, text) from public;
grant execute on function public.grant_admin_by_email(uuid, text, text) to service_role;
