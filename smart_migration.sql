-- [스마트 DB 동기화 스크립트]
-- 이 스크립트는 기존 테이블 구조를 분석하여, 코드와 맞지 않는 컬럼명을 자동으로 변경(Rename)하거나 새로 추가합니다.
-- Supabase SQL Editor에서 전체 복사 후 실행(Run)하세요.

DO $$
BEGIN
    -- 1. Users 테이블 (company_name -> business_name)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_name') THEN
        ALTER TABLE public.users RENAME COLUMN company_name TO business_name;
    ELSE
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_name text;
    END IF;

    -- Users 추가 컬럼
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credit_limit bigint DEFAULT 0;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_balance bigint DEFAULT 0;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';


    -- 2. Products 테이블 (unit_price -> price_per_yard)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit_price') THEN
        ALTER TABLE public.products RENAME COLUMN unit_price TO price_per_yard;
    ELSE
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_per_yard bigint DEFAULT 0;
    END IF;

    -- Products 추가 컬럼
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS code text;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color text;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pattern text;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS thickness text;


    -- 3. Inventory Rolls 테이블 (roll_name -> roll_label)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_rolls' AND column_name = 'roll_name') THEN
        ALTER TABLE public.inventory_rolls RENAME COLUMN roll_name TO roll_label;
    ELSE
        ALTER TABLE public.inventory_rolls ADD COLUMN IF NOT EXISTS roll_label text;
    END IF;

    ALTER TABLE public.inventory_rolls ADD COLUMN IF NOT EXISTS quantity_yards decimal DEFAULT 0;


    -- 4. Orders 테이블 (user_id -> customer_id, total_amount -> total_price, admin_memo -> note)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        ALTER TABLE public.orders RENAME COLUMN user_id TO customer_id;
    ELSE
        -- customer_id가 없고 user_id도 없으면 새로 추가해야 함 (FK 제약조건은 별도 확인 필요)
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id uuid references public.users(id);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE public.orders RENAME COLUMN total_amount TO total_price;
    ELSE
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_price bigint DEFAULT 0;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'admin_memo') THEN
        ALTER TABLE public.orders RENAME COLUMN admin_memo TO note;
    ELSE
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS note text;
    END IF;
    
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';


    -- 5. Settlements 테이블 생성 (존재하지 않을 경우만)
    CREATE TABLE IF NOT EXISTS public.settlements (
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

END $$;
