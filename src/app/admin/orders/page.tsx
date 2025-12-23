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
            <Title order={2} mb="lg" c="navy.9">주문 관리 (오더 내역)</Title>

            <Accordion variant="separated" radius="md">
                {orders.map(order => (
                    <Accordion.Item key={order.id} value={order.id} mb="sm" bg="white" style={{ border: '1px solid #eee' }}>
                        <Accordion.Control>
                            <Group justify="space-between" pr="md">
                                <div>
                                    <Text fw={700} size="lg" c="navy.9">{order.users?.business_name || '알 수 없음'}</Text>
                                    <Text size="sm" c="dimmed">{new Date(order.created_at).toLocaleString('ko-KR')}</Text>
                                </div>
                                <Group>
                                    <Text fw={700} c="navy.9">{order.total_price.toLocaleString()} 원</Text>
                                    <Badge size="lg" color={
                                        order.status === 'pending' ? 'yellow' :
                                            order.status === 'approved' ? 'teal' : 'gray'
                                    }>
                                        {order.status === 'pending' ? '접수대기' :
                                            order.status === 'approved' ? '승인완료' : order.status}
                                    </Badge>
                                </Group>
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Card withBorder bg="gray.0" mb="md" radius="md">
                                <Text size="sm" mb="sm" fw={500}>📝 주문 메모: {order.note || '없음'}</Text>
                                <Table bg="white" withTableBorder>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>상품명</Table.Th>
                                            <Table.Th>색상/패턴</Table.Th>
                                            <Table.Th>주문수량 (야드)</Table.Th>
                                            <Table.Th>단가</Table.Th>
                                            <Table.Th>합계</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {order.order_items.map(item => (
                                            <Table.Tr key={item.id}>
                                                <Table.Td>{item.products?.name}</Table.Td>
                                                <Table.Td>{item.products?.color}</Table.Td>
                                                <Table.Td>{item.quantity_yards} yds</Table.Td>
                                                <Table.Td>{item.price_at_moment.toLocaleString()} 원</Table.Td>
                                                <Table.Td fw={600}>{(item.quantity_yards * item.price_at_moment).toLocaleString()} 원</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>

                                <Group justify="flex-end" mt="md">
                                    <Button size="sm" variant="outline" color="red" onClick={() => updateStatus(order.id, 'cancelled')}>
                                        주문 취소
                                    </Button>
                                    {order.status !== 'approved' && (
                                        <Button size="sm" color="navy" onClick={() => updateStatus(order.id, 'approved')}>
                                            ✅ 주문 승인 (재고 할당)
                                        </Button>
                                    )}
                                </Group>
                            </Card>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
            {orders.length === 0 && <Text ta="center" c="dimmed" mt="xl">들어온 주문 내역이 없습니다.</Text>}
        </Container>
    );
}
