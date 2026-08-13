-- Aboyejo Global Foods — dedicated production schema
-- Canonical product image field: image_url (used in products, product_images, order_items, gallery, and souvenir_packages).

create extension if not exists pgcrypto;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  size text not null,
  price numeric(12, 2) not null check (price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  delivery_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled')),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  size text not null,
  quantity integer not null check (quantity > 0 and quantity <= 100),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  category text not null default 'general',
  image_url text not null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.souvenir_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  event_types text[] not null default '{}',
  minimum_quantity integer check (minimum_quantity is null or minimum_quantity > 0),
  image_url text,
  price_note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  subscribed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  customer_name text,
  context text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.create_public_order(
  p_customer_name text,
  p_phone text,
  p_email text,
  p_delivery_address text,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_total numeric(12, 2) := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_unit_price numeric(12, 2);
begin
  if nullif(trim(p_customer_name), '') is null or nullif(trim(p_phone), '') is null then
    raise exception 'Customer name and phone are required';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one order item is required';
  end if;

  insert into public.customers (full_name, phone, email, delivery_address)
  values (trim(p_customer_name), trim(p_phone), nullif(trim(p_email), ''), nullif(trim(p_delivery_address), ''))
  returning id into v_customer_id;

  insert into public.orders (customer_id, notes)
  values (v_customer_id, nullif(trim(p_notes), ''))
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items) loop
    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
      and is_active = true
      and stock_status <> 'out_of_stock';

    if not found then
      raise exception 'Product is unavailable';
    end if;

    v_quantity := least(100, greatest(1, coalesce((v_item->>'quantity')::integer, 1)));
    v_unit_price := coalesce(v_product.sale_price, v_product.price);

    insert into public.order_items (order_id, product_id, product_name, size, quantity, unit_price, image_url)
    values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.size,
      v_quantity,
      v_unit_price,
      v_product.image_url
    );

    v_total := v_total + (v_unit_price * v_quantity);
  end loop;

  update public.orders set total_amount = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

create or replace function public.get_public_order_status(p_order_id uuid, p_phone text)
returns table (id uuid, status text, total_amount numeric, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select o.id, o.status, o.total_amount, o.created_at
  from public.orders o
  join public.customers c on c.id = o.customer_id
  where o.id = p_order_id
    and regexp_replace(c.phone, '[^0-9+]', '', 'g') = regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
revoke all on function public.create_public_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_public_order(text, text, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.get_public_order_status(uuid, text) from public;
grant execute on function public.get_public_order_status(uuid, text) to anon, authenticated;

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_public_idx on public.products(is_active, stock_status, sort_order) where is_active = true;
create index if not exists product_images_product_id_idx on public.product_images(product_id, sort_order);
create index if not exists orders_status_created_at_idx on public.orders(status, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists gallery_public_idx on public.gallery(is_published, category, sort_order) where is_published = true;
create index if not exists souvenir_packages_public_idx on public.souvenir_packages(is_active) where is_active = true;
create index if not exists contact_messages_status_created_at_idx on public.contact_messages(status, created_at desc);
create index if not exists faqs_public_idx on public.faqs(is_published, sort_order) where is_published = true;
create index if not exists testimonials_public_idx on public.testimonials(is_published, sort_order) where is_published = true;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'product_categories', 'products', 'customers', 'orders', 'gallery', 'souvenir_packages',
    'contact_messages', 'newsletter_subscribers', 'faqs', 'testimonials', 'site_settings', 'admin_users'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.gallery enable row level security;
alter table public.souvenir_packages enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;

grant select on public.product_categories, public.products, public.product_images, public.gallery,
  public.souvenir_packages, public.faqs, public.testimonials, public.site_settings to anon, authenticated;
grant insert on public.customers, public.orders, public.order_items, public.contact_messages, public.newsletter_subscribers to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;

drop policy if exists "public can read active product categories" on public.product_categories;
create policy "public can read active product categories" on public.product_categories for select using (is_active = true or public.is_admin());
drop policy if exists "public can read active products" on public.products;
create policy "public can read active products" on public.products for select using (is_active = true or public.is_admin());
drop policy if exists "public can read images for active products" on public.product_images;
create policy "public can read images for active products" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.is_active = true or public.is_admin())));
drop policy if exists "public can read published gallery" on public.gallery;
create policy "public can read published gallery" on public.gallery for select using (is_published = true or public.is_admin());
drop policy if exists "public can read active souvenirs" on public.souvenir_packages;
create policy "public can read active souvenirs" on public.souvenir_packages for select using (is_active = true or public.is_admin());
drop policy if exists "public can read published faqs" on public.faqs;
create policy "public can read published faqs" on public.faqs for select using (is_published = true or public.is_admin());
drop policy if exists "public can read published testimonials" on public.testimonials;
create policy "public can read published testimonials" on public.testimonials for select using (is_published = true or public.is_admin());
drop policy if exists "public can read public settings" on public.site_settings;
create policy "public can read public settings" on public.site_settings for select using (is_public = true or public.is_admin());

drop policy if exists "public can submit customers" on public.customers;
create policy "public can submit customers" on public.customers for insert to anon, authenticated with check (true);
drop policy if exists "public can submit orders" on public.orders;
create policy "public can submit orders" on public.orders for insert to anon, authenticated with check (true);
drop policy if exists "public can submit order items" on public.order_items;
create policy "public can submit order items" on public.order_items for insert to anon, authenticated with check (true);
drop policy if exists "public can submit contact messages" on public.contact_messages;
create policy "public can submit contact messages" on public.contact_messages for insert to anon, authenticated with check (true);
drop policy if exists "public can subscribe to newsletter" on public.newsletter_subscribers;
create policy "public can subscribe to newsletter" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

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
    execute format('create policy "admins manage %I" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', table_name, table_name);
  end loop;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('gallery-images', 'gallery-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('souvenir-images', 'souvenir-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read product image objects" on storage.objects;
create policy "public can read product image objects" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "public can read gallery image objects" on storage.objects;
create policy "public can read gallery image objects" on storage.objects for select using (bucket_id = 'gallery-images');
drop policy if exists "public can read souvenir image objects" on storage.objects;
create policy "public can read souvenir image objects" on storage.objects for select using (bucket_id = 'souvenir-images');

drop policy if exists "admins can upload product image objects" on storage.objects;
create policy "admins can upload product image objects" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admins can update product image objects" on storage.objects;
create policy "admins can update product image objects" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admins can delete product image objects" on storage.objects;
create policy "admins can delete product image objects" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins can upload gallery image objects" on storage.objects;
create policy "admins can upload gallery image objects" on storage.objects for insert to authenticated with check (bucket_id = 'gallery-images' and public.is_admin());
drop policy if exists "admins can update gallery image objects" on storage.objects;
create policy "admins can update gallery image objects" on storage.objects for update to authenticated using (bucket_id = 'gallery-images' and public.is_admin()) with check (bucket_id = 'gallery-images' and public.is_admin());
drop policy if exists "admins can delete gallery image objects" on storage.objects;
create policy "admins can delete gallery image objects" on storage.objects for delete to authenticated using (bucket_id = 'gallery-images' and public.is_admin());

drop policy if exists "admins can upload souvenir image objects" on storage.objects;
create policy "admins can upload souvenir image objects" on storage.objects for insert to authenticated with check (bucket_id = 'souvenir-images' and public.is_admin());
drop policy if exists "admins can update souvenir image objects" on storage.objects;
create policy "admins can update souvenir image objects" on storage.objects for update to authenticated using (bucket_id = 'souvenir-images' and public.is_admin()) with check (bucket_id = 'souvenir-images' and public.is_admin());
drop policy if exists "admins can delete souvenir image objects" on storage.objects;
create policy "admins can delete souvenir image objects" on storage.objects for delete to authenticated using (bucket_id = 'souvenir-images' and public.is_admin());
