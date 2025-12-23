-- [Phase 4] Notifications System

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create function to handle status change notifications
CREATE OR REPLACE FUNCTION public.handle_order_status_notification()
RETURNS TRIGGER AS $$
DECLARE
    new_status_korean TEXT;
BEGIN
    -- Only trigger if status has changed
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        
        -- Map status to Korean labels
        CASE NEW.status
            WHEN 'approved' THEN new_status_korean := '승인완료';
            WHEN 'preparing' THEN new_status_korean := '출고준비';
            WHEN 'shipped' THEN new_status_korean := '출고완료';
            WHEN 'cancelled' THEN new_status_korean := '주문취소';
            WHEN 'pending' THEN new_status_korean := '견적대기';
            ELSE new_status_korean := NEW.status;
        END CASE;

        -- Insert notification for the customer
        INSERT INTO public.notifications (user_id, message, order_id)
        VALUES (
            NEW.customer_id,
            '주문(' || COALESCE(NEW.order_number, '신규') || ') 상태가 [' || new_status_korean || '] (으)로 변경되었습니다.',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger
DROP TRIGGER IF EXISTS tr_order_status_notification ON public.orders;
CREATE TRIGGER tr_order_status_notification
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_status_notification();
