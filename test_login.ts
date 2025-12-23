
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};

envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const anonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !anonKey) {
    console.error("Missing SUPABASE URL/ANON KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testLogin() {
    const email = '35081363@naver.com';
    const password = 'qwas1122**';

    console.log(`Attempting login for: ${email} with password: ${password}`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error("LOGIN FAILED:", error.message);
        console.error("Full Error:", error);
    } else {
        console.log("LOGIN SUCCESS!");
        console.log("Session User:", data.user?.email);
        console.log("Access Token:", data.session?.access_token ? "Generating..." : "Missing");
    }
}

testLogin();
