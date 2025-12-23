-- Add missing column for Dynamic Pricing
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS price_at_moment INTEGER DEFAULT 0;

COMMENT ON COLUMN public.order_items.price_at_moment IS 'Price per yard at the time of order/approval';

-- Ensure it's accessible (if RLS is on, this might be needed, though usually schema changes propagate)
-- GRANT ALL ON public.order_items TO postgres, anon, authenticated, service_role;
