'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface OrderItemUpdate {
    id: string; // Order Item ID
    price: number;
}

export async function approveOrder(orderId: string, items: OrderItemUpdate[]) {
    const supabase = await createClient();

    // 1. Update each item's price
    let calculatedTotal = 0;

    for (const item of items) {
        // Fetch quantity to calculate total
        const { data: currentItem } = await supabase.from('order_items').select('quantity_yards').eq('id', item.id).single();
        if (currentItem) {
            calculatedTotal += (currentItem.quantity_yards * item.price);
        }

        const { error: updateError } = await supabase
            .from('order_items')
            .update({ price_at_moment: item.price })
            .eq('id', item.id);

        if (updateError) throw new Error(`Failed to update item ${item.id}: ${updateError.message}`);
    }

    // 2. Update Order Status and Total Price
    const { error: orderError } = await supabase
        .from('orders')
        .update({
            status: 'approved',
            total_price: calculatedTotal
        })
        .eq('id', orderId);

    if (orderError) return { error: orderError.message };

    // 3. Deduct Inventory (Simple logic for now - just deduct from active rolls or mark logic later)
    // Note: To truly deduct, we need to know WHICH roll. 
    // For this step, we just approve the pricing. Roll assignment is a separate advanced step.
    // We will assume "Generic Deduction" or manual inventory adjustment for this MVF.

    revalidatePath('/admin/orders');
    return { success: true };
}
