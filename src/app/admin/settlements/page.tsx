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
    const [month, setMonth] = useState<string>(() => {
        // Initial month in KST
        const now = new Date();
        const kstOffset = 9 * 60; // Korea is UTC+9
        const kstDate = new Date(now.getTime() + (kstOffset + now.getTimezoneOffset()) * 60000);
        return kstDate.toISOString().slice(0, 7);
    });
    const [data, setData] = useState<SettlementData[]>([]);

    useEffect(() => {
        fetchSettlement();
    }, [month]);

    const fetchSettlement = async () => {
        const { data: users } = await supabase.from('users').select('id, business_name');
        if (!users) return;

        // KST Month Range
        const start = `${month}-01T00:00:00+09:00`;
        const end = `${month}-31T23:59:59+09:00`; // Supabase handles timestampz correctly

        const { data: orders } = await supabase.from('orders')
            .select('customer_id, total_price')
            .gte('created_at', start)
            .lte('created_at', end)
            .neq('status', 'cancelled');

        const map: Record<string, SettlementData> = {};
        users.forEach(u => {
            map[u.id] = { user_id: u.id, business_name: u.business_name, total_orders: 0, total_amount: 0, payments: 0, balance_due: 0 };
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

    const monthOptions = Array.from({ length: 36 }, (_, i) => {
        const d = new Date(2024, i, 1);
        return d.toISOString().slice(0, 7);
    });

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data.map(d => ({
            '거래처명': d.business_name,
            '정산월(KST)': month,
            '총 주문건수': d.total_orders,
            '총 거래금액(원)': d.total_amount,
            '미수금(원)': d.balance_due
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Settlement");
        XLSX.writeFile(wb, `영진상사_정산_${month}.xlsx`);
    };

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2} c="navy.9">월말 정산 (거래 명세)</Title>
                    <Text size="xs" c="dimmed">한국 시간(KST) 기준 자동 집계</Text>
                </div>
                <Group>
                    <Select
                        placeholder="날짜 선택"
                        value={month}
                        onChange={(v) => setMonth(v || '')}
                        data={monthOptions}
                        allowDeselect={false}
                        searchable
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
