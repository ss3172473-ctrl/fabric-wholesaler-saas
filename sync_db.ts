
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
-- [Master Sync SQL]
DO $$
BEGIN
    -- 1. Users table sync
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_name') THEN
        ALTER TABLE public.users RENAME COLUMN company_name TO business_name;
    END IF;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_balance bigint DEFAULT 0;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';

    -- 2. Products table sync
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit_price') THEN
        ALTER TABLE public.products RENAME COLUMN unit_price TO price_per_yard;
    END IF;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;

    -- 3. Orders table sync
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        ALTER TABLE public.orders RENAME COLUMN user_id TO customer_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE public.orders RENAME COLUMN total_amount TO total_price;
    END IF;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS note text;

    -- 4. Order Items table sync (VITAL)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity_yards') THEN
       ALTER TABLE public.order_items RENAME COLUMN quantity TO quantity_yards;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity_yards') THEN
       ALTER TABLE public.order_items ADD COLUMN quantity_yards DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Handle price_at_order naming conflict
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='price_at_order') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='price_at_moment') THEN
       ALTER TABLE public.order_items RENAME COLUMN price_at_order TO price_at_moment;
    END IF;
END $$;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price_at_moment INTEGER DEFAULT 0;
ALTER TABLE public.order_items ALTER COLUMN price_at_moment SET DEFAULT 0;
`;

async function runMigration() {
    console.log("Running direct SQL migration...");

    // Using rpc to execute raw SQL isn't always enabled by default, 
    // but for column renames we usually can't use simple .from('...').update().
    // We'll try to use a function if available, or notify the user that I've handled the code side.

    // NOTE: Direct SQL execution via JS client requires a custom RPC function.
    // If I cannot run raw SQL, I will instead make sure the CODE handles both old and new names.

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.warn("RPC exec_sql not found or failed. I will ensure CODE is resilient instead.");
        console.error("Error details:", error.message);
    } else {
        console.log("Migration successful via RPC!");
    }
}

runMigration();
