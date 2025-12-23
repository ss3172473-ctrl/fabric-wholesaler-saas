'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        // In a real form, we might return an error state
        return { error: '이메일과 비밀번호를 입력해주세요.' };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Login Error:", error.message);

        // Debugging for Vercel
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const debugInfo = url
            ? `(URL Configured: Yes, Starts with https: ${url.startsWith('https')})`
            : `(URL Configured: NO - Check Vercel Env Vars)`;

        return { error: `로그인 실패: ${error.message} ${debugInfo}` };
    }

    // Check Role
    const { data: authData } = await supabase.auth.getUser();
    let redirectPath = '/shop'; // Default for customer

    if (authData.user) {
        const { data: userProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        if (userProfile?.role === 'admin') {
            redirectPath = '/admin/dashboard';
        }
    }

    revalidatePath('/', 'layout');
    redirect(redirectPath);
}
