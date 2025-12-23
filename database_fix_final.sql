-- Fix for order_items table validation errors
-- Ensure 'quantity_yards' exists (Renaming 'quantity' if it exists, or adding it)

DO $$ 
BEGIN 
  -- Check if 'quantity' exists but 'quantity_yards' does not
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity_yards') THEN
     
     ALTER TABLE public.order_items RENAME COLUMN quantity TO quantity_yards;
     
  -- If neither exists, add quantity_yards
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='quantity_yards') THEN
     
     ALTER TABLE public.order_items ADD COLUMN quantity_yards DECIMAL(10,2) DEFAULT 0;
     
  END IF;
END $$;

-- Explicitly ensure price_at_moment exists (Double check)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price_at_moment INTEGER DEFAULT 0;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
