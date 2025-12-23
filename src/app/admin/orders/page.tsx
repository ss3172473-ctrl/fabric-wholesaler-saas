'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Table, Badge, Button, Group, Accordion, Card, Text, Select } from '@mantine/core';
import { createClient } from '@/utils/supabase/client';

interface Order {
    id: string;
    created_at: string;
    status: string;
    total_price: number;
    note: string;
    users: {
        business_name: string;
        phone: string;
    };
    order_items: {
        id: string;
        quantity_yards: number;
        price_at_moment: number;
        products: {
            name: string;
            color: string;
        }
    }[];
}

export default function AdminOrdersPage() {
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        async function fetchOrders() {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                *,
                users (business_name, phone),
                order_items (
                    *,
                    products (name, color)
                )
            `)
                .order('created_at', { ascending: false });

            if (data) setOrders(data as any);
        }
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: string, status: string) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        }
    };

    return (
        <Container size="xl" py="xl">
            <Title order={2} mb="lg">Order Management</Title>

            <Accordion variant="separated">
                {orders.map(order => (
                    <Accordion.Item key={order.id} value={order.id}>
                        <Accordion.Control>
                            <Group justify="space-between" pr="md">
                                <div>
                                    <Text fw={700}>{order.users?.business_name || 'Unknown'}</Text>
                                    <Text size="sm" c="dimmed">{new Date(order.created_at).toLocaleString()}</Text>
                                </div>
                                <Group>
                                    <Text fw={700}>{order.total_price.toLocaleString()} ₩</Text>
                                    <Badge color={
                                        order.status === 'pending' ? 'yellow' :
                                            order.status === 'approved' ? 'teal' : 'gray'
                                    }>{order.status}</Badge>
                                </Group>
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Card withBorder bg="gray.0" mb="md">
                                <Text size="sm" mb="xs">Note: {order.note || '-'}</Text>
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Product</Table.Th>
                                            <Table.Th>Color</Table.Th>
                                            <Table.Th>Qty (yds)</Table.Th>
                                            <Table.Th>Price/yd</Table.Th>
                                            <Table.Th>Subtotal</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {order.order_items.map(item => (
                                            <Table.Tr key={item.id}>
                                                <Table.Td>{item.products?.name}</Table.Td>
                                                <Table.Td>{item.products?.color}</Table.Td>
                                                <Table.Td>{item.quantity_yards}</Table.Td>
                                                <Table.Td>{item.price_at_moment.toLocaleString()}</Table.Td>
                                                <Table.Td>{(item.quantity_yards * item.price_at_moment).toLocaleString()}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>

                                <Group justify="flex-end" mt="md">
                                    <Button size="xs" variant="default" onClick={() => updateStatus(order.id, 'cancelled')}>Cancel</Button>
                                    <Button size="xs" color="teal" onClick={() => updateStatus(order.id, 'approved')}>Approve (Allocate Rolls)</Button>
                                </Group>
                            </Card>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Container>
    );
}
