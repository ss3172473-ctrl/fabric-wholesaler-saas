'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Button, Table, Group, Modal, TextInput, PasswordInput, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createClient } from '@/utils/supabase/client';
import { createCustomer, deleteCustomer } from './actions';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';

interface User {
    id: string;
    business_name: string;
    phone: string;
    role: string;
    current_balance: number;
}

export default function CustomersPage() {
    const supabase = createClient();
    const [customers, setCustomers] = useState<User[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'customer')
            .order('business_name', { ascending: true });

        if (data) setCustomers(data);
    };

    async function handleCreate(formData: FormData) {
        setLoading(true);
        const result = await createCustomer(formData);

        if (result?.error) {
            alert(result.error);
        } else {
            await fetchCustomers();
            close();
            // Reset form if needed or rely on unmount
        }
        setLoading(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`${name} 업체를 정말 삭제하시겠습니까? (되돌릴 수 없습니다)`)) return;

        setLoading(true);
        const result = await deleteCustomer(id);
        if (result?.error) {
            alert(result.error);
        } else {
            await fetchCustomers(); // Refresh list
        }
        setLoading(false);
    }

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="lg">
                <Title order={2} c="navy.9">거래처 관리</Title>
                <Button onClick={open} leftSection={<IconPlus size={16} />} color="navy">신규 거래처 등록</Button>
            </Group>

            <Table withTableBorder striped highlightOnHover>
                <Table.Thead bg="gray.1">
                    <Table.Tr>
                        <Table.Th>상호명 (업체명)</Table.Th>
                        <Table.Th>연락처</Table.Th>
                        <Table.Th>현재 미수금 (잔액)</Table.Th>
                        <Table.Th>상태</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {customers.map((c) => (
                        <Table.Tr key={c.id}>
                            <Table.Td fw={600} c="navy.9">{c.business_name}</Table.Td>
                            <Table.Td>{c.phone}</Table.Td>
                            <Table.Td>
                                <span style={{ color: (c.current_balance || 0) > 0 ? '#fa5252' : 'inherit', fontWeight: (c.current_balance || 0) > 0 ? 600 : 400 }}>
                                    {(c.current_balance || 0).toLocaleString()} 원
                                </span>
                            </Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <Badge color="blue" variant="light">승인됨</Badge>
                                    <ActionIcon variant="light" color="red" onClick={() => handleDelete(c.id, c.business_name)}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {customers.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={4} ta="center" py="xl" c="dimmed">등록된 거래처가 없습니다.</Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>

            <Modal opened={opened} onClose={close} title="신규 거래처 등록" centered>
                <form action={handleCreate}>
                    <TextInput label="상호명 (업체명)" name="company" placeholder="예: 김씨네 원단" required mb="sm" />
                    <TextInput label="대표자 성함" name="name" placeholder="예: 김영진" required mb="sm" />
                    <TextInput label="연락처" name="phone" placeholder="010-1234-5678" required mb="sm" />
                    <TextInput label="로그인 이메일 (ID)" name="email" type="email" placeholder="user@example.com" required mb="sm" />
                    <PasswordInput label="비밀번호" name="password" placeholder="초기 비밀번호" required mb="lg" />

                    <Group justify="flex-end">
                        <Button variant="default" onClick={close}>취소</Button>
                        <Button type="submit" loading={loading} color="navy">계정 생성</Button>
                    </Group>
                </form>
            </Modal>
        </Container>
    );
}
