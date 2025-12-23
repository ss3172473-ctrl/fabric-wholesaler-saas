'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface CartItem {
    productId: string;
    quantity: number;
    price: number;
}

export async function createOrder(items: CartItem[], note: string = '') {
    console.log('[createOrder] Starting with items:', items);
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('[createOrder] No user found');
            return { error: '로그인이 필요합니다.' };
        }
        console.log('[createOrder] User:', user.id);

        // Calculate total
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('[createOrder] Total Price:', totalPrice);

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: user.id,
                total_price: totalPrice,
                note: note,
                status: 'pending'
            })
            .select()
            .single();

        if (orderError) {
            console.error('[createOrder] Order Insert Error:', orderError);
            return { error: `주문 생성 실패: ${orderError.message}` };
        }
        console.log('[createOrder] Order Created:', order.id);

        // 2. Create Order Items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            quantity_yards: item.quantity,
            price_at_moment: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('[createOrder] Items Insert Error:', itemsError);
            return { error: `주문 상세 저장 실패: ${itemsError.message}` };
        }
        console.log('[createOrder] Items Saved');

        revalidatePath('/shop');
        return { success: true, orderId: order.id };
    } catch (e: any) {
        console.error('[createOrder] Unexpected Error:', e);
        return { error: `서버 오류 발생: ${e.message}` };
    }
}
