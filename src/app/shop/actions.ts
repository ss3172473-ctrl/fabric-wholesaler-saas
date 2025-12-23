'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface CartItem {
    productId: string;
    quantity: number;
    price: number;
}

export async function createOrder(items: CartItem[], note: string = '') {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Calculate total
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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

    if (orderError) return { error: orderError.message };

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

    if (itemsError) return { error: itemsError.message };

    // Notify Admin (Telegram Placeholder)
    // await notifyAdmin(`New order from ${user.email}: ${totalPrice} KRW`);

    revalidatePath('/shop');
    return { success: true, orderId: order.id };
}
