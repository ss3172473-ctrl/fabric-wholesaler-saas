'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Table, Badge, Button, Group, Accordion, Card, Text, NumberInput, LoadingOverlay, Select } from '@mantine/core';
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

import * as XLSX from 'xlsx';
import { IconFileSpreadsheet, IconTruckDelivery, IconCheck } from '@tabler/icons-react';

export default function AdminOrdersPage() {
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [priceMap, setPriceMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

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
            const map: Record<string, number> = {};
            data.forEach((o: any) => {
                (o.order_items || []).forEach((item: any) => {
                    map[item.id] = (item.price_at_moment || 0) > 0 ? item.price_at_moment : (item.products?.price_per_yard || 0);
                });
            });
            setPriceMap(map);
        }
    }

    const updateStatus = async (orderId: string, status: string) => {
        setLoading(true);
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (!error) {
            await fetchOrders();
        }
        setLoading(false);
    };

    const handleApprove = async (order: Order) => {
        if (!confirm('설정된 단가로 주문을 승인하시겠습니까? (재고가 자동 차감됩니다)')) return;
        setLoading(true);

        const itemsToUpdate = (order?.order_items || []).map(item => ({
            id: item.id,
            price: priceMap[item.id] || 0
        }));

        try {
            const result = await approveOrder(order.id, itemsToUpdate);
            if (result?.success) {
                alert('주문이 승인되었습니다.');
                await fetchOrders();
            } else {
                alert('오류 발생: ' + result?.error);
            }
        } catch (e: any) {
            alert('승인 중 오류: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const exportData = orders.flatMap(order =>
            (order.order_items || []).map(item => ({
                '주문번호': (order as any).order_number || '-',
                '주문일시': formatKSTDate(order.created_at),
                '거래처': order.users?.business_name || '-',
                '상품명': item.products?.name || '-',
                '색상': item.products?.color || '-',
                '수량(야드)': item.quantity_yards,
                '단가': (order.status === 'pending' ? (priceMap[item.id] || 0) : item.price_at_moment),
                '금액': item.quantity_yards * (order.status === 'pending' ? (priceMap[item.id] || 0) : item.price_at_moment),
                '상태': order.status,
                '메모': order.note
            }))
        );
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        XLSX.writeFile(wb, `Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const formatKSTDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: '견적대기', color: 'yellow' };
            case 'approved': return { label: '승인완료', color: 'teal' };
            case 'preparing': return { label: '출고준비', color: 'blue' };
            case 'shipped': return { label: '출고완료', color: 'gray' };
            case 'cancelled': return { label: '주문취소', color: 'red' };
            default: return { label: status, color: 'gray' };
        }
    };

    return (
        <Container size="xl" py="xl">
            <LoadingOverlay visible={loading} />
            <Group justify="space-between" mb="lg">
                <Title order={2} c="navy.9">주문 관리 (전체 내역)</Title>
                <Button color="green" leftSection={<IconFileSpreadsheet size={18} />} onClick={exportToExcel}>
                    엑셀 다운로드
                </Button>
            </Group>

            <Card withBorder radius="md" p={0}>
                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>주문번호 / 일시</Table.Th>
                            <Table.Th>거래처</Table.Th>
                            <Table.Th>주문 내용</Table.Th>
                            <Table.Th>총액</Table.Th>
                            <Table.Th>상태</Table.Th>
                            <Table.Th>액션</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {orders.map((order: any) => {
                            const statusInfo = getStatusInfo(order.status);
                            const items = order.order_items || [];

                            return (
                                <Table.Tr key={order.id}>
                                    <Table.Td>
                                        <Text fw={700} size="sm">{order.order_number || '-'}</Text>
                                        <Text size="xs" c="dimmed">{formatKSTDate(order.created_at)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={600}>{order.users?.business_name}</Text>
                                        <Text size="xs" c="dimmed">{order.users?.phone}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        {items.map((item: any) => (
                                            <div key={item.id}>
                                                <Text size="sm">
                                                    • {item.products?.name} ({item.products?.color}) - {item.quantity_yards}yds
                                                </Text>
                                                {order.status === 'pending' && (
                                                    <Group gap="xs" mt={2} mb={4}>
                                                        <Text size="xs" c="dimmed">단가 설정:</Text>
                                                        <NumberInput
                                                            size="xs" w={100}
                                                            value={priceMap[item.id] || 0}
                                                            hideControls
                                                            onChange={(v) => setPriceMap(prev => ({ ...prev, [item.id]: Number(v) }))}
                                                        />
                                                    </Group>
                                                )}
                                            </div>
                                        ))}
                                        {order.note && <Text size="xs" c="orange" mt={4}>📝 {order.note}</Text>}
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={700}>{Number(order.total_price || 0).toLocaleString()} 원</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs" wrap="nowrap">
                                            {order.status === 'pending' && (
                                                <Button size="compact-xs" color="navy" onClick={() => handleApprove(order)}>
                                                    승인(재고차감)
                                                </Button>
                                            )}

                                            <Select
                                                size="compact-xs"
                                                w={110}
                                                placeholder="상태 변경"
                                                value={order.status}
                                                data={[
                                                    { value: 'pending', label: '견적대기' },
                                                    { value: 'approved', label: '승인완료' },
                                                    { value: 'preparing', label: '출고준비' },
                                                    { value: 'shipped', label: '출고완료' },
                                                    { value: 'cancelled', label: '주문취소' }
                                                ]}
                                                onChange={(v) => {
                                                    if (v && v !== order.status) {
                                                        if (v === 'approved' && order.status === 'pending') {
                                                            handleApprove(order);
                                                        } else {
                                                            updateStatus(order.id, v);
                                                        }
                                                    }
                                                }}
                                            />

                                            {order.status !== 'shipped' && order.status !== 'cancelled' && order.status !== 'pending' && (
                                                <Button size="compact-xs" variant="subtle" color="red" onClick={() => updateStatus(order.id, 'cancelled')}>
                                                    취소
                                                </Button>
                                            )}
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
                {orders.length === 0 && <Text ta="center" py="xl" c="dimmed">주문 내역이 없습니다.</Text>}
            </Card>
        </Container>
    );
}
