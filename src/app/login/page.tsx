'use client';

import { TextInput, PasswordInput, Button, Container, Paper, Title, Text, Group, Alert, Box, ThemeIcon } from '@mantine/core';
import { useFormStatus } from 'react-dom';
import { login } from './actions';
import { useState } from 'react';
import { IconAlertCircle, IconBuildingWarehouse } from '@tabler/icons-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            fullWidth
            mt="xl"
            size="lg"
            type="submit"
            loading={pending}
            color="navy"
        >
            로그인 하기
        </Button>
    );
}

export default function LoginPage() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setErrorMessage(null);
        const result = await login(formData);
        if (result?.error) {
            setErrorMessage(result.error);
        }
    }

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
            <Container size={420} my={40}>
                <Box ta="center" mb={30}>
                    <ThemeIcon size={80} radius={100} color="navy" variant="filled">
                        <IconBuildingWarehouse size={45} stroke={1.5} />
                    </ThemeIcon>
                    <Title order={1} mt="md" style={{ fontFamily: 'Pretendard', fontWeight: 800 }}>
                        영진상사 파트너스
                    </Title>
                    <Text c="dimmed" size="sm" mt={5}>
                        신뢰할 수 있는 원단 비즈니스 파트너
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

                        <SubmitButton />
                    </form>
                </Paper>

                <Text c="dimmed" size="xs" ta="center" mt="xl">
                    계정 접속에 문제가 있으신가요? <br />
                    <Text span fw={700} c="navy.7">관리자 (010-5317-2473)</Text>에게 문의해주세요.
                </Text>
            </Container>
        </Box>
    );
}
