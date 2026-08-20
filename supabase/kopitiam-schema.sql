-- ════════════════════════════════════════════════════════════════
-- Kopi Corner food-ordering schema
-- Run this ONCE in your Supabase project's SQL editor.
-- Safe to re-run by accident: every statement is guarded.
-- Contains NO statements that destroy data (no drop table / truncate / delete).
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1) profiles — one row per STAFF user only. Regular customers
--    never get a row; is_staff defaults to false as a safety net.
--    Rows are inserted manually (see the bootstrap snippet at the
--    bottom of this file). There are no insert/update policies, so
--    the app can never grant staff access by itself.
-- ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  is_staff   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'profiles'
                   and policyname = 'profiles_select_own') then
    create policy profiles_select_own on public.profiles
      for select using (auth.uid() = id);
  end if;
end $$;

-- Helper used inside orders policies. SECURITY DEFINER so the check
-- runs with the function owner's rights — this avoids the policy on
-- orders having to read profiles through profiles' own RLS.
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select p.is_staff from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- ────────────────────────────────────────────────────────────────
-- 2) menu_items — the menu. Publicly readable (even signed out).
--    No write policies: the menu is managed by seed SQL / the
--    Supabase dashboard, which bypass RLS.
-- ────────────────────────────────────────────────────────────────
create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique check (char_length(name) between 1 and 80),
  description  text check (description is null or char_length(description) <= 300),
  price_cents  integer not null check (price_cents > 0),
  category     text not null check (category in ('food', 'drinks', 'desserts')),
  emoji        text not null default '🍽️',
  is_available boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists menu_items_category_sort_idx
  on public.menu_items (category, sort_order);

alter table public.menu_items enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'menu_items'
                   and policyname = 'menu_items_select_all') then
    create policy menu_items_select_all on public.menu_items
      for select using (true);
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────
-- 3) orders — one row per placed order.
--    Customers see their own; staff see (and update) all.
--    No delete policies: order history is permanent.
-- ────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  status         text not null default 'pending'
                 check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_cents    integer not null check (total_cents >= 0),
  payment_method text not null default 'counter',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Upgrade path for tables created before payments existed.
alter table public.orders add column if not exists payment_method text not null default 'counter';

do $$
begin
  if not exists (select 1 from pg_constraint
                 where conname = 'orders_payment_method_allowed'
                   and conrelid = 'public.orders'::regclass) then
    alter table public.orders add constraint orders_payment_method_allowed
      check (payment_method in ('counter', 'card', 'ewallet'));
  end if;
end $$;

create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

alter table public.orders enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'orders'
                   and policyname = 'orders_select_own_or_staff') then
    create policy orders_select_own_or_staff on public.orders
      for select using (auth.uid() = user_id or public.is_staff());
  end if;

  -- New orders must belong to the caller and start as 'pending'.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'orders'
                   and policyname = 'orders_insert_own') then
    create policy orders_insert_own on public.orders
      for insert with check (auth.uid() = user_id and status = 'pending');
  end if;

  -- Only staff advance / cancel orders.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'orders'
                   and policyname = 'orders_update_staff') then
    create policy orders_update_staff on public.orders
      for update using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- Keep updated_at fresh (same helper the workshop schema defines;
-- redefined here so this file runs standalone).
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

create or replace trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────────
-- 4) order_items — line items. item_name and price_cents are
--    SNAPSHOTS taken at purchase time, so history stays correct
--    even if the menu changes later (menu_item_id may go null).
-- ────────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  item_name    text not null,
  price_cents  integer not null check (price_cents >= 0),
  quantity     integer not null check (quantity between 1 and 20)
);

create index if not exists order_items_order_idx
  on public.order_items (order_id);

alter table public.order_items enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'order_items'
                   and policyname = 'order_items_select_own_or_staff') then
    create policy order_items_select_own_or_staff on public.order_items
      for select using (
        exists (select 1 from public.orders o
                where o.id = order_id
                  and (o.user_id = auth.uid() or public.is_staff()))
      );
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'order_items'
                   and policyname = 'order_items_insert_own') then
    create policy order_items_insert_own on public.order_items
      for insert with check (
        exists (select 1 from public.orders o
                where o.id = order_id
                  and o.user_id = auth.uid()
                  and o.status = 'pending')
      );
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────
-- 5) place_order(items) — places a whole order in ONE transaction.
--    SECURITY INVOKER: the RLS insert policies above still apply.
--    Prices are looked up server-side from menu_items, so a client
--    can never tamper with totals. Input shape:
--      items: [{ "menu_item_id": "<uuid>", "quantity": 2 }, ...]
--      payment_method: 'counter' | 'card' | 'ewallet'
--    Returns the new order's id.
-- ────────────────────────────────────────────────────────────────

-- Remove the old one-argument version (pre-payments) so calls are unambiguous.
drop function if exists public.place_order(jsonb);

create or replace function public.place_order(items jsonb, payment_method text default 'counter')
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  line        jsonb;
  menu_row    public.menu_items%rowtype;
  qty         integer;
  new_order   uuid;
  order_total integer := 0;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  if payment_method not in ('counter', 'card', 'ewallet') then
    raise exception 'Unknown payment method.';
  end if;

  -- Validate every line and compute the total before inserting anything.
  for line in select * from jsonb_array_elements(items)
  loop
    qty := coalesce((line->>'quantity')::integer, 0);
    if qty < 1 or qty > 20 then
      raise exception 'Quantity must be between 1 and 20.';
    end if;

    select * into menu_row
      from public.menu_items m
      where m.id = (line->>'menu_item_id')::uuid;

    if not found or not menu_row.is_available then
      raise exception 'Sorry, "%" is no longer available.',
        coalesce(menu_row.name, 'an item in your cart');
    end if;

    order_total := order_total + menu_row.price_cents * qty;
  end loop;

  insert into public.orders (user_id, status, total_cents, payment_method)
    values (auth.uid(), 'pending', order_total, payment_method)
    returning id into new_order;

  for line in select * from jsonb_array_elements(items)
  loop
    select * into menu_row
      from public.menu_items m
      where m.id = (line->>'menu_item_id')::uuid;

    insert into public.order_items (order_id, menu_item_id, item_name, price_cents, quantity)
      values (new_order, menu_row.id, menu_row.name, menu_row.price_cents,
              (line->>'quantity')::integer);
  end loop;

  return new_order;
end;
$$;

grant execute on function public.place_order(jsonb, text) to authenticated;

-- ────────────────────────────────────────────────────────────────
-- 6) Seed menu — idempotent (re-running never duplicates rows).
--    Ais Kacang is seeded as unavailable to demo the sold-out UI.
-- ────────────────────────────────────────────────────────────────
insert into public.menu_items (name, description, price_cents, category, emoji, is_available, sort_order)
values
  ('Nasi Lemak Ayam',        'Coconut rice, fried chicken, sambal, egg and anchovies.',   850, 'food',     '🍛', true,  1),
  ('Hainanese Chicken Rice', 'Poached chicken over fragrant rice with chilli-ginger dip.', 900, 'food',     '🍗', true,  2),
  ('Mee Goreng Mamak',       'Wok-fried yellow noodles, tofu, potato and a squeeze of lime.', 750, 'food',  '🍜', true,  3),
  ('Curry Mee',              'Noodles in spicy coconut curry broth with cockles and tofu puffs.', 800, 'food', '🍲', true, 4),
  ('Kaya Butter Toast',      'Charcoal-toasted bread with kaya and a thick slab of butter.', 380, 'food',   '🍞', true,  5),
  ('Half-Boiled Eggs',       'Two eggs, soy sauce and white pepper. Kopitiam classic.',    320, 'food',     '🥚', true,  6),
  ('Teh Tarik',              'Pulled milk tea, frothy and sweet.',                         280, 'drinks',   '🫖', true,  1),
  ('Kopi O',                 'Strong black kopitiam coffee, lightly sweetened.',           220, 'drinks',   '☕', true,  2),
  ('Kopi Peng',              'Iced kopitiam coffee with condensed milk.',                  300, 'drinks',   '🧊', true,  3),
  ('Milo Ais',               'Iced Milo, extra kaw.',                                      350, 'drinks',   '🥤', true,  4),
  ('Teh O Limau',            'Iced black tea with fresh lime.',                            250, 'drinks',   '🍋', true,  5),
  ('Cendol',                 'Shaved ice, pandan jelly, coconut milk and gula melaka.',    450, 'desserts', '🍧', true,  1),
  ('Ais Kacang',             'Shaved ice piled with red beans, jelly, corn and syrup.',    500, 'desserts', '🍨', false, 2),
  ('Pisang Goreng',          'Crispy banana fritters, fried to order.',                    300, 'desserts', '🍌', true,  3),
  ('Kuih Lapis',             'Steamed rainbow layer cake, chewy and sweet.',               250, 'desserts', '🍰', true,  4)
on conflict (name) do nothing;

-- ────────────────────────────────────────────────────────────────
-- STAFF BOOTSTRAP — run this separately for each staff account
-- (replace the email). This is the ONLY way to grant staff access.
--
--   insert into public.profiles (id, is_staff)
--   select id, true from auth.users where email = 'you@example.com'
--   on conflict (id) do update set is_staff = true;
--
-- Optional cleanup from the old workshop notes app (destructive —
-- only run once you are sure you no longer need the old data):
--
--   -- drop table public.items;
-- ────────────────────────────────────────────────────────────────
