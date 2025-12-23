-- [영진 장부처리 자동화 DB 마스터 동기화 스크립트]
-- 이 스크립트 하나만 실행하면 모든 테이블의 컬럼명이 코드와 일치하도록 업데이트됩니다.

-- 1. 사용자(Users) 테이블 동기화
DO $$
BEGIN
    -- company_name을 business_name으로 변경
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_name') THEN
        ALTER TABLE public.users RENAME COLUMN company_name TO business_name;
    END IF;
    
    -- 필요한 컬럼들 추가
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_name text;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_balance bigint DEFAULT 0;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';
END $$;

-- 2. 제품(Products) 테이블 동기화
DO $$
BEGIN
    -- unit_price를 price_per_yard로 변경
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit_price') THEN
        ALTER TABLE public.products RENAME COLUMN unit_price TO price_per_yard;
    END IF;
    
    -- 이미지 URL 컬럼 추가
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
END $$;

-- 3. 주문(Orders) 테이블 동기화
DO $$
BEGIN
    -- user_id를 customer_id로 변경
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        ALTER TABLE public.orders RENAME COLUMN user_id TO customer_id;
    END IF;
    
    -- total_amount를 total_price로 변경
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE public.orders RENAME COLUMN total_amount TO total_price;
    END IF;
    
    -- 메모 컬럼 추가
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS note text;
END $$;

-- 4. 재고 롤(Inventory Rolls) 테이블 동기화
DO $$
BEGIN
    -- roll_name을 roll_label로 변경
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_rolls' AND column_name = 'roll_name') THEN
        ALTER TABLE public.inventory_rolls RENAME COLUMN roll_name TO roll_label;
    END IF;
END $$;

-- 5. 주문 상세(Order Items) 테이블 동기화 (가장 중요)
DO $$ 
BEGIN 
  -- quantity를 quantity_yards로 변경 또는 추가
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity_yards') THEN
     ALTER TABLE public.order_items RENAME COLUMN quantity TO quantity_yards;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity_yards') THEN
     ALTER TABLE public.order_items ADD COLUMN quantity_yards DECIMAL(10,2) DEFAULT 0;
  END IF;

  -- price_at_order 를 price_at_moment 로 변경 (중요!)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='price_at_order') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='price_at_moment') THEN
     ALTER TABLE public.order_items RENAME COLUMN price_at_order TO price_at_moment;
  END IF;
END $$;

-- 가격 기록 컬럼 추가 및 기본값 설정 (Constraint 해결)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price_at_moment INTEGER DEFAULT 0;
ALTER TABLE public.order_items ALTER COLUMN price_at_moment SET DEFAULT 0;

-- 6. 스키마 캐시 새로고침 (Supabase API 반영)
NOTIFY pgrst, 'reload config';
