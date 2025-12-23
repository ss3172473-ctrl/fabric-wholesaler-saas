'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Select, Table, Button, Group, Card, Text } from '@mantine/core';
import { createClient } from '@/utils/supabase/client';
import * as XLSX from 'xlsx';
import { IconFileSpreadsheet } from '@tabler/icons-react';

interface SettlementData {
    user_id: string;
    business_name: string;
    total_orders: number;
    total_amount: number;
    payments: number;
    balance_due: number;
}

export default function SettlementPage() {
    const supabase = createClient();
    const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [data, setData] = useState<SettlementData[]>([]);

    useEffect(() => {
        fetchSettlement();
    }, [month]);

    const fetchSettlement = async () => {
        // 1. Fetch all customers
        const { data: users } = await supabase.from('users').select('id, business_name');
        if (!users) return;

        // 2. Fetch Orders for the month
        const start = `${month}-01`;
        const end = `${month}-31 23:59:59`; // Simple approximation
        const { data: orders } = await supabase.from('orders')
            .select('customer_id, total_price')
            .gte('created_at', start)
            .lte('created_at', end)
            .neq('status', 'cancelled'); // Include approved and pending

        // 3. Fetch Payments (Conceptual - assuming we have a payments table or just user balance)
        // For this MVP, we calculate "Due for this month" = Total Orders
        // Total Balance would need a transaction history table. 

        const map: Record<string, SettlementData> = {};

        users.forEach(u => {
            map[u.id] = {
                user_id: u.id,
                business_name: u.business_name,
                total_orders: 0,
                total_amount: 0,
                payments: 0,
                balance_due: 0
            };
        });

        orders?.forEach(o => {
            if (map[o.customer_id]) {
                map[o.customer_id].total_orders += 1;
                map[o.customer_id].total_amount += o.total_price;
                map[o.customer_id].balance_due += o.total_price;
            }
        });

        setData(Object.values(map));
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data.map(d => ({
            'Customer': d.business_name,
            'Month': month,
            'Total Orders': d.total_orders,
            'Total Amount (KRW)': d.total_amount,
            'Balance Due': d.balance_due
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Settlement");
        XLSX.writeFile(wb, `Settlement_${month}.xlsx`);
    };

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={2} c="navy.9">월말 정산 (거래 명세)</Title>
                <Group>
                    <Select
                        placeholder="날짜 선택"
                        value={month}
                        onChange={(v) => setMonth(v || '')}
                        data={[
                            '2024-01', '2024-02', '2024-03', '2024-04',
                            '2024-05', '2024-06', '2024-07', '2024-08',
                            '2024-09', '2024-10', '2024-11', '2024-12',
                            '2025-01', '2025-02', '2025-03'
                        ]}
                        allowDeselect={false}
                        w={150}
                    />
                    <Button color="green" onClick={exportToExcel} leftSection={<IconFileSpreadsheet size={18} />}>
                        엑셀 다운로드
                    </Button>
                </Group>
            </Group>

            <Card withBorder radius="md" shadow="sm">
                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>거래처명</Table.Th>
                            <Table.Th>총 주문 건수</Table.Th>
                            <Table.Th>총 거래 금액</Table.Th>
                            <Table.Th>관리</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {data.map((row) => (
                            <Table.Tr key={row.user_id}>
                                <Table.Td fw={600} c="navy.9">{row.business_name}</Table.Td>
                                <Table.Td>{row.total_orders} 건</Table.Td>
                                <Table.Td>{row.total_amount.toLocaleString()} 원</Table.Td>
                                <Table.Td>
                                    <Button variant="subtle" size="xs" color="gray">상세 내역</Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                {data.length === 0 && <Text ta="center" py="xl" c="dimmed">해당 월의 거래 내역이 없습니다.</Text>}
            </Card>
        </Container>
    );
}
