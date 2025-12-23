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
        return { error: `로그인 실패: ${error.message}` };
    }

    revalidatePath('/', 'layout');
    redirect('/admin/dashboard');
}
