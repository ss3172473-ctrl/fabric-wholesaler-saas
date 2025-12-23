'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface OrderItemUpdate {
    id: string; // Order Item ID
    price: number;
}

export async function approveOrder(orderId: string, items: OrderItemUpdate[]) {
    const supabase = await createClient();

    // 1. Update each item's price and deduct inventory
    let calculatedTotal = 0;

    for (const item of items) {
        // Fetch order item details
        const { data: orderItem } = await supabase
            .from('order_items')
            .select('quantity_yards, product_id')
            .eq('id', item.id)
            .single();

        if (!orderItem) continue;

        calculatedTotal += (orderItem.quantity_yards * item.price);

        // --- FIFO Inventory Deduction ---
        let remainingToDeduct = orderItem.quantity_yards;

        // Fetch active rolls for this product sorted by creation date (FIFO)
        const { data: activeRolls } = await supabase
            .from('inventory_rolls')
            .select('*')
            .eq('product_id', orderItem.product_id)
            .eq('status', 'active')
            .order('created_at', { ascending: true });

        if (activeRolls) {
            for (const roll of activeRolls) {
                if (remainingToDeduct <= 0) break;

                const deduction = Math.min(roll.quantity_yards, remainingToDeduct);
                const newQuantity = roll.quantity_yards - deduction;
                remainingToDeduct -= deduction;

                // Update roll quantity and status
                await supabase
                    .from('inventory_rolls')
                    .update({
                        quantity_yards: newQuantity,
                        status: newQuantity <= 0 ? 'depleted' : 'active'
                    })
                    .eq('id', roll.id);
            }
        }

        // Update the order item price
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

    revalidatePath('/admin/orders');
    revalidatePath('/admin/inventory');
    return { success: true };
}
