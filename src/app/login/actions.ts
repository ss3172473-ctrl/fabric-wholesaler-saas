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

        // Strict Role Enforcement
        const expectedRole = formData.get('expectedRole') as string;
        if (expectedRole && userProfile?.role !== expectedRole) {
            await supabase.auth.signOut();
            const isTryingAsAdmin = expectedRole === 'admin';
            const errorMsg = isTryingAsAdmin
                ? "로그인 실패: 본 계정은 판매자(관리자) 권한이 없습니다. 구매자 전용 로그인을 이용해주세요."
                : "로그인 실패: 본 계정은 구매자(거래처) 권한이 아닙니다. 판매자 전용 로그인을 이용해주세요.";
            return { error: errorMsg };
        }

        if (userProfile?.role === 'admin') {
            redirectPath = '/admin/dashboard';
        }
    }

    revalidatePath('/', 'layout');
    redirect(redirectPath);
}
