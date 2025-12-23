import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Stateless client for debugging/testing only
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const body = await request.json().catch(() => ({}));

    try {
        // 1. LOGIN TEST
        if (action === 'login') {
            const { email, password } = body;
            // Use signInWithPassword
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                return NextResponse.json({ success: false, error: error.message }, { status: 401 });
            }
            return NextResponse.json({ success: true, user: data.user.email });
        }

        // 2. CREATE CUSTOMER TEST (Admin)
        if (action === 'create_customer') {
            const { email, password, business_name } = body;
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role: 'customer' }
            });
            if (authError) throw authError;

            const { error: dbError } = await supabase.from('users').insert({
                id: authUser.user.id,
                email,
                business_name,
                role: 'customer'
            });
            console.log("DB Insert Error:", dbError);
            if (dbError) throw dbError;

            return NextResponse.json({ success: true, userId: authUser.user.id });
        }

        // 3. INVENTORY CHECK
        if (action === 'check_inventory') {
            const { data, error } = await supabase.from('products').select('*').limit(1);
            if (error) throw error;
            return NextResponse.json({ success: true, count: data.length });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        console.error("API Error:", e);
        return NextResponse.json({ success: false, error: e.message || 'Unknown error' }, { status: 500 });
    }
}
