'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createCustomer(formData: FormData) {
    const supabaseAdmin = createAdminClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string; // Owner Name
    const company = formData.get('company') as string;
    const phone = formData.get('phone') as string;

    if (!email || !password || !name) {
        return { error: '필수 정보를 모두 입력해주세요.' };
    }

    // 1. Create Auth User (without email confirmation)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'customer' }
    });

    if (authError) {
        return { error: '계정 생성 실패: ' + authError.message };
    }

    if (!authUser.user) {
        return { error: '계정 생성 중 알 수 없는 오류가 발생했습니다.' };
    }

    // 2. Insert into public.users table
    const { error: dbError } = await supabaseAdmin.from('users').insert({
        id: authUser.user.id,
        role: 'customer',
        business_name: company,
        phone: phone,
        // Add owner name if schema supports it, otherwise store in metadata or separate field
        // For now assuming business_name encompasses identity or adding a note.
        // Based on schema: business_name, phone. 
        // If 'name' is needed in public schema, we should add it. 
        // For now, we'll store specific owner name if necessary or check schema.
        // Schema check: users table has id, role, business_name, phone, credit_limit, current_balance.
        // We will stick to schema. Logic: Business Name is primary identifier.
    });

    if (dbError) {
        // Optional: Delete auth user if DB insert fails to maintain consistency
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        return { error: 'DB 등록 실패: ' + dbError.message };
    }

    revalidatePath('/admin/customers');
    return { success: true };
}

export async function deleteCustomer(userId: string) {
    const supabaseAdmin = createAdminClient();
    try {
        // 1. Delete from Auth (This usually cascades to public.users if logic exists, but let's be safe)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        // 2. Delete from public.users manually if needed (or rely on Cascade)
        // Explicitly trying to delete user record to ensure cleanup
        const { error: dbError } = await supabaseAdmin.from('users').delete().eq('id', userId);

        if (dbError) console.error("DB Delete Warning:", dbError.message);

        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error: any) {
        console.error("Delete Customer Error:", error);
        return { error: error.message };
    }
}
