'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Table, Badge, Card, Text, Group, Button, LoadingOverlay } from '@mantine/core';
import { createClient } from '@/utils/supabase/client';
import { IconChevronLeft, IconClock, IconPackage, IconTruck, IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/NotificationBell';

export default function ShopOrdersPage() {
    const supabase = createClient();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMyOrders() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items (
                            *,
                            products (name, color)
                        )
                    `)
                    .eq('customer_id', user.id)
                    .order('created_at', { ascending: false });

                if (data) setOrders(data);
            }
            setLoading(false);
        }
        fetchMyOrders();
    }, []);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: '견적 대기중', color: 'yellow', icon: IconClock };
            case 'approved': return { label: '승인 완료', color: 'teal', icon: IconCheck };
            case 'preparing': return { label: '출고 준비중', color: 'blue', icon: IconPackage };
            case 'shipped': return { label: '출고 완료', color: 'gray', icon: IconTruck };
            case 'cancelled': return { label: '주문 취소', color: 'red', icon: IconX };
            default: return { label: status, color: 'gray', icon: IconClock };
        }
    };

    const formatKSTDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    };

    return (
        <Container size="md" py="xl">
            <LoadingOverlay visible={loading} />
            <Group mb="xl">
                <Button variant="subtle" leftSection={<IconChevronLeft size={16} />} onClick={() => router.push('/shop')} color="gray">
                    쇼핑몰로 돌아가기
                </Button>
                <NotificationBell />
            </Group>

            <Title order={2} mb="lg">내 주문 내역</Title>

            {orders.length === 0 && !loading ? (
                <Card withBorder padding="xl" radius="md">
                    <Text ta="center" c="dimmed">주문 내역이 없습니다.</Text>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map((order) => {
                        const status = getStatusInfo(order.status);
                        const items = order.order_items || [];

                        return (
                            <Card key={order.id} withBorder radius="md" shadow="sm">
                                <Group justify="space-between" mb="md">
                                    <div>
                                        <Text fw={700} size="lg" c="navy.9">주문번호: {order.order_number || '-'}</Text>
                                        <Text size="xs" c="dimmed">주문 날짜: {formatKSTDate(order.created_at)}</Text>
                                    </div>
                                    <Badge size="lg" color={status.color} leftSection={<status.icon size={14} />}>
                                        {status.label}
                                    </Badge>
                                </Group>

                                <Table verticalSpacing="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>상품명</Table.Th>
                                            <Table.Th>색상</Table.Th>
                                            <Table.Th>수량</Table.Th>
                                            <Table.Th>금액</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {items.map((item: any) => (
                                            <Table.Tr key={item.id}>
                                                <Table.Td>{item.products?.name}</Table.Td>
                                                <Table.Td>{item.products?.color}</Table.Td>
                                                <Table.Td>{item.quantity_yards} yds</Table.Td>
                                                <Table.Td>
                                                    {order.status === 'pending' ? '견적 대기' : `${(item.price_at_moment * item.quantity_yards).toLocaleString()} 원`}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>

                                <Group justify="flex-end" mt="md" pt="md" style={{ borderTop: '1px solid #eee' }}>
                                    <Text fw={700} size="lg">
                                        총 합계: {order.status === 'pending' ? '견적 요청 중' : `${Number(order.total_price || 0).toLocaleString()} 원`}
                                    </Text>
                                </Group>
                            </Card>
                        );
                    })}
                </div>
            )}
        </Container>
    );
}
