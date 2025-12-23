'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Button, Table, Group, Modal, TextInput, PasswordInput, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createClient } from '@/utils/supabase/client';
import { createCustomer } from './actions';
import { IconPlus } from '@tabler/icons-react';

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

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="lg">
                <Title order={2}>Customer Management</Title>
                <Button onClick={open} leftSection={<IconPlus size={16} />}>Register New Customer</Button>
            </Group>

            <Table withTableBorder striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Company Name</Table.Th>
                        <Table.Th>Phone</Table.Th>
                        <Table.Th>Balance</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {customers.map((c) => (
                        <Table.Tr key={c.id}>
                            <Table.Td fw={500}>{c.business_name}</Table.Td>
                            <Table.Td>{c.phone}</Table.Td>
                            <Table.Td>
                                <span style={{ color: c.current_balance > 0 ? 'red' : 'inherit' }}>
                                    {c.current_balance.toLocaleString()} ₩
                                </span>
                            </Table.Td>
                            <Table.Td>
                                <Badge color="blue">Active</Badge>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {customers.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={4} ta="center">No customers found.</Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>

            <Modal opened={opened} onClose={close} title="Register New Customer">
                <form action={handleCreate}>
                    <TextInput label="Company Name" name="company" placeholder="e.g. Kim Fabric" required mb="sm" />
                    <TextInput label="Owner Name" name="name" placeholder="Name" required mb="sm" />
                    <TextInput label="Phone" name="phone" placeholder="010-1234-5678" required mb="sm" />
                    <TextInput label="Email (ID)" name="email" type="email" placeholder="user@example.com" required mb="sm" />
                    <PasswordInput label="Password" name="password" required mb="lg" />

                    <Group justify="flex-end">
                        <Button variant="default" onClick={close}>Cancel</Button>
                        <Button type="submit" loading={loading}>Create Account</Button>
                    </Group>
                </form>
            </Modal>
        </Container>
    );
}
