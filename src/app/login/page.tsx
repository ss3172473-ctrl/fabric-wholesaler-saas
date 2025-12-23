'use client';

import { TextInput, PasswordInput, Button, Container, Paper, Title, Text, Group, Alert } from '@mantine/core';
import { useFormStatus } from 'react-dom';
import { login } from './actions';
import { useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button fullWidth mt="xl" type="submit" loading={pending}>
            로그인
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
        <Container size={420} my={40}>
            <Title ta="center">
                영진상사 파트너스 로그인
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                등록된 파트너만 접속 가능합니다.
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form action={handleSubmit}>
                    <TextInput label="이메일" name="email" placeholder="example@youngjin.com" required />
                    <PasswordInput label="비밀번호" name="password" placeholder="비밀번호 입력" required mt="md" />

                    {errorMessage && (
                        <Alert color="red" icon={<IconAlertCircle size="1rem" />} mt="md">
                            {errorMessage}
                        </Alert>
                    )}

                    <SubmitButton />
                </form>
            </Paper>

            <Text c="dimmed" size="xs" ta="center" mt="xl">
                비밀번호 분실 시 관리자(010-5317-2473)에게 문의하세요.
            </Text>
        </Container>
    );
}
