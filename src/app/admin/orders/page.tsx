'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Table, Badge, Button, Group, Accordion, Card, Text, NumberInput, LoadingOverlay } from '@mantine/core';
import { createClient } from '@/utils/supabase/client';
import { approveOrder } from './actions';

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
            price_per_yard: number;
        }
    }[];
}

export default function AdminOrdersPage() {
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [priceMap, setPriceMap] = useState<Record<string, number>>({}); // itemId -> price
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchOrders() {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                *,
                users (business_name, phone),
                order_items (
                    *,
                    products (name, color, price_per_yard)
                )
            `)
                .order('created_at', { ascending: false });

            if (data) {
                setOrders(data as any);
                // Initialize price map with current or base product prices
                const map: Record<string, number> = {};
                data.forEach((o: any) => {
                    if (o && o.order_items) {
                        o.order_items.forEach((item: any) => {
                            if (item) {
                                // Use existing price if set (>0), otherwise product base price
                                map[item.id] = (item.price_at_moment || 0) > 0 ? item.price_at_moment : (item.products?.price_per_yard || 0);
                            }
                        });
                    }
                });
                setPriceMap(map);
            }
        }
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: string, status: string) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        }
    };

    const handleApprove = async (order: Order) => {
        if (!confirm('설정된 단가로 주문을 승인하시겠습니까?')) return;
        setLoading(true);

        const itemsToUpdate = (order?.order_items || []).map(item => ({
            id: item.id,
            price: priceMap[item.id] || 0
        }));

        const result = await approveOrder(order.id, itemsToUpdate);

        if (result?.success) {
            alert('주문이 승인되었습니다.');
            // Refresh local state roughly or reload
            window.location.reload();
        } else {
            alert('오류 발생: ' + result?.error);
        }
        setLoading(false);
    };

    const formatKSTDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        } catch (e) {
            return '-';
        }
    };

    return (
        <Container size="xl" py="xl">
            <LoadingOverlay visible={loading} />
            <Title order={2} mb="lg" c="navy.9">주문 관리 (견적 승인)</Title>

            <Accordion variant="separated" radius="md">
                {(orders || []).map((order: any) => {
                    if (!order || !order.id) return null;

                    const bizName = order.users?.business_name || '알 수 없음';
                    const createdAt = order.created_at ? formatKSTDate(order.created_at) : '-';
                    const status = order.status || 'unknown';
                    const totalPrice = Number(order.total_price || 0);
                    const note = order.note || '없음';
                    const items = order.order_items || [];

                    return (
                        <Accordion.Item key={order.id} value={order.id} mb="sm" bg="white" style={{ border: '1px solid #eee' }}>
                            <Accordion.Control>
                                <Group justify="space-between" pr="md" wrap="nowrap">
                                    <div style={{ flex: 1 }}>
                                        <Text fw={700} size="lg" c="navy.9">{bizName}</Text>
                                        <Text size="sm" c="dimmed">{createdAt}</Text>
                                    </div>
                                    <Group wrap="nowrap" gap="xl">
                                        <Text fw={700} c="navy.9">
                                            {status === 'pending' ? '견적 대기중' : `${totalPrice.toLocaleString()} 원`}
                                        </Text>
                                        <Badge size="lg" color={
                                            status === 'pending' ? 'yellow' :
                                                status === 'approved' ? 'teal' : 'gray'
                                        }>
                                            {status === 'pending' ? '접수대기' :
                                                status === 'approved' ? '승인완료' : status}
                                        </Badge>
                                    </Group>
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Card withBorder bg="gray.0" mb="md" radius="md">
                                    <Text size="sm" mb="sm" fw={500}>📝 주문 메모: {note}</Text>
                                    <Table bg="white" withTableBorder>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>상품명</Table.Th>
                                                <Table.Th>색상/패턴</Table.Th>
                                                <Table.Th>주문수량 (야드)</Table.Th>
                                                <Table.Th style={{ width: 150 }}>확정 단가 (원)</Table.Th>
                                                <Table.Th>합계</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {(items || []).map((item: any) => {
                                                if (!item) return null;
                                                const currentPrice = priceMap[item.id] || 0;
                                                const qty = Number(item.quantity_yards || 0);
                                                const fixedPrice = Number(item.price_at_moment || 0);
                                                const prodName = item.products?.name || '-';
                                                const prodColor = item.products?.color || '-';

                                                return (
                                                    <Table.Tr key={item.id}>
                                                        <Table.Td>{prodName}</Table.Td>
                                                        <Table.Td>{prodColor}</Table.Td>
                                                        <Table.Td>{qty} yds</Table.Td>
                                                        <Table.Td>
                                                            {status === 'pending' ? (
                                                                <NumberInput
                                                                    value={currentPrice}
                                                                    onChange={(v) => setPriceMap(prev => ({ ...prev, [item.id]: Number(v) }))}
                                                                    min={0} step={100}
                                                                    hideControls
                                                                    size="xs"
                                                                />
                                                            ) : (
                                                                `${fixedPrice.toLocaleString()} 원`
                                                            )}
                                                        </Table.Td>
                                                        <Table.Td fw={600}>
                                                            {(qty * (status === 'pending' ? currentPrice : fixedPrice)).toLocaleString()} 원
                                                        </Table.Td>
                                                    </Table.Tr>
                                                );
                                            })}
                                        </Table.Tbody>
                                    </Table>

                                    <Group justify="flex-end" mt="md">
                                        <Button size="sm" variant="outline" color="red" onClick={() => updateStatus(order.id, 'cancelled')}>
                                            주문 취소
                                        </Button>
                                        {status === 'pending' && (
                                            <Button size="sm" color="navy" onClick={() => handleApprove(order)}>
                                                ✅ 단가 확정 및 승인
                                            </Button>
                                        )}
                                    </Group>
                                </Card>
                            </Accordion.Panel>
                        </Accordion.Item>
                    );
                })}
            </Accordion>
            {(!orders || orders.length === 0) && <Text ta="center" c="dimmed" mt="xl">들어온 주문 내역이 없습니다.</Text>}
        </Container>
    );
}
