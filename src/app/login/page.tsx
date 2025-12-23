'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { TextInput, PasswordInput, Button, Container, Paper, Title, Text, Group, Alert, Box, ThemeIcon, LoadingOverlay } from '@mantine/core';
import { useFormStatus } from 'react-dom';
import { login } from './actions';
import { IconAlertCircle, IconBuildingWarehouse } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function SubmitButton({ color }: { color: string }) {
    const { pending } = useFormStatus();
    return (
        <Button
            fullWidth
            mt="xl"
            size="lg"
            type="submit"
            loading={pending}
            color={color}
        >
            로그인 하기
        </Button>
    );
}

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();
    const role = searchParams.get('role') || 'customer';
    const isSeller = role === 'admin';
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
                // If already logged in with the ROLE we are targeting, just go there.
                if (profile?.role === role) {
                    router.replace(role === 'admin' ? '/admin/dashboard' : '/shop');
                    return;
                }
            }
            setChecking(false);
        };
        checkSession();
    }, [role, router, supabase]);

    async function handleSubmit(formData: FormData) {
        setErrorMessage(null);
        const result = await login(formData); // Actions handle redirection logic
        if (result?.error) {
            setErrorMessage(result.error);
        }
    }

    return (
        <Container size={420} my={40} style={{ position: 'relative' }}>
            <LoadingOverlay visible={checking} />
            <Box ta="center" mb={30}>
                <ThemeIcon size={80} radius={100} color={isSeller ? "gray" : "navy"} variant="filled">
                    <IconBuildingWarehouse size={45} stroke={1.5} />
                </ThemeIcon>
                <Title order={1} mt="md" style={{ fontFamily: 'Pretendard', fontWeight: 800 }} c={isSeller ? "gray.9" : "navy.9"}>
                    {isSeller ? '영진상사 판매자(관리자)' : '영진상사 구매자(거래처)'}
                </Title>
                <Text c="dimmed" size="sm" mt={5}>
                    {isSeller ? '관리자 전용 로그인 페이지입니다.' : '신뢰할 수 있는 원단 비즈니스 파트너'}
                </Text>
            </Box>

            <Paper withBorder shadow="xl" p={40} radius="lg" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>

                <form action={handleSubmit}>
                    <TextInput
                        label="이메일 주소"
                        name="email"
                        placeholder="example@youngjin.com"
                        required
                        size="md"
                    />
                    <input type="hidden" name="expectedRole" value={isSeller ? 'admin' : 'customer'} />
                    <PasswordInput
                        label="비밀번호"
                        name="password"
                        placeholder="비밀번호를 입력하세요"
                        required
                        mt="md"
                        size="md"
                    />

                    {errorMessage && (
                        <Alert color="red" icon={<IconAlertCircle size="1rem" />} mt="md" variant="light">
                            {errorMessage}
                        </Alert>
                    )}

                    <SubmitButton color={isSeller ? "gray" : "navy"} />
                </form>
            </Paper>

            <Text c="dimmed" size="xs" ta="center" mt="xl">
                계정 접속에 문제가 있으신가요? <br />
                <Text span fw={700} c="navy.7">관리자 (010-5317-2473)</Text>에게 문의해주세요.
            </Text>
        </Container>
    );
}

export default function LoginPage() {
    return (
        <Box
            style={{
                minHeight: '100vh',
                backgroundColor: '#f1f3f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </Box>
    );
}
