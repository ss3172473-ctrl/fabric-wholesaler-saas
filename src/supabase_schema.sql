-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- USERS
create table public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  role text check (role in ('admin', 'customer')) default 'customer',
  business_name text,
  phone text,
  credit_limit bigint default 0,
  current_balance bigint default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text,
  color text,
  pattern text,
  thickness text,
  price_per_yard bigint not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVENTORY_ROLLS
create table public.inventory_rolls (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  roll_label text not null, -- e.g. "Roll-A1"
  quantity_yards decimal not null default 0,
  status text check (status in ('active', 'depleted')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.users(id) not null,
  status text check (status in ('pending', 'approved', 'shipping', 'completed', 'cancelled')) default 'pending',
  total_price bigint not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER_ITEMS
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity_yards decimal not null,
  price_at_moment bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER_ALLOCATIONS (Linking Items to specific Rolls)
create table public.order_allocations (
  id uuid default uuid_generate_v4() primary key,
  order_item_id uuid references public.order_items(id) on delete cascade not null,
  inventory_roll_id uuid references public.inventory_rolls(id) not null,
  cut_amount decimal not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PAYMENTS
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.users(id) not null,
  amount bigint not null,
  method text check (method in ('cash', 'transfer', 'card')),
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SETTLEMENTS (Monthly Snapshots)
create table public.settlements (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.users(id) on delete cascade not null,
  year int not null,
  month int not null,
  prev_balance bigint not null,
  total_purchase bigint not null,
  total_payment bigint not null,
  balance_due bigint not null,
  is_closed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) - Basic Policy
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.inventory_rolls enable row level security;
alter table public.orders enable row level security;

-- Admin Policy (Full Access) - Placeholder logic, assumes a function exist or simply by role
-- For implementation, we usually use custom claims or a specific admin table.
-- Here we keep it simple: auth.uid() checks.
