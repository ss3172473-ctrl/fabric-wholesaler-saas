'use client';

import { Container, Grid, Paper, Text, Title, Group, ThemeIcon, SimpleGrid, Card, Button } from '@mantine/core';
import { IconBuildingStore, IconUsers, IconShoppingCart, IconReportMoney, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const features = [
    {
        title: '재고 관리 (Inventory)',
        description: '원단 및 롤 재고를 실시간으로 관리하고 입고 처리합니다.',
        icon: IconBuildingStore,
        color: 'blue',
        link: '/admin/inventory'
    },
    {
        title: '거래처 관리 (Customers)',
        description: '거래처 정보를 조회하고 신규 업체를 등록합니다.',
        icon: IconUsers,
        color: 'teal',
        link: '/admin/customers'
    },
    {
        title: '주문 관리 (Orders)',
        description: '들어온 주문을 확인하고 승인 및 출고 처리합니다.',
        icon: IconShoppingCart,
        color: 'violet',
        link: '/admin/orders'
    },
    {
        title: '월말 정산 (Settlements)',
        description: '월별 거래 내역을 조회하고 엑셀로 다운로드합니다.',
        icon: IconReportMoney,
        color: 'orange',
        link: '/admin/settlements'
    }
];

import { IconBuildingStore, IconUsers, IconShoppingCart, IconReportMoney, IconArrowRight, IconAlertTriangle, IconPackage } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();
    const [stats, setStats] = useState({
        pendingOrders: 0,
        monthlySales: 0,
        lowStockItems: 0,
        totalCustomers: 0
    });

    useEffect(() => {
        async function fetchStats() {
            // 1. Pending Orders
            const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            // 2. Monthly Sales (Approximate for current month KST)
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const { data: monthlyOrders } = await supabase.from('orders')
                .select('total_price')
                .gte('created_at', startOfMonth.toISOString())
                .neq('status', 'cancelled');
            const sales = (monthlyOrders || []).reduce((sum, o) => sum + (o.total_price || 0), 0);

            // 3. Low Stock (Rolls with < 10 yards)
            const { count: lowStockCount } = await supabase.from('inventory_rolls').select('*', { count: 'exact', head: true }).lt('quantity_yards', 10).eq('status', 'active');

            // 4. Total Customers
            const { count: customerCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer');

            setStats({
                pendingOrders: pendingCount || 0,
                monthlySales: sales,
                lowStockItems: lowStockCount || 0,
                totalCustomers: customerCount || 0
            });
        }
        fetchStats();
    }, []);

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2} style={{ fontFamily: 'Pretendard', fontWeight: 800, letterSpacing: '-0.5px' }}>
                        영진상사 파트너스 대시보드
                    </Title>
                    <Text c="dimmed" size="sm">실시간 주문 현황 및 재고 통계를 확인하세요.</Text>
                </div>
                <Button variant="light" color="navy" onClick={() => router.push('/shop')}>
                    쇼핑몰 바로가기
                </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="xl">
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">견적 대기건</Text>
                            <Text fw={700} size="xl">{stats.pendingOrders} 건</Text>
                        </div>
                        <ThemeIcon color="yellow" variant="light" size="xl">
                            <IconShoppingCart size="1.2rem" />
                        </ThemeIcon>
                    </Group>
                    <Text size="xs" c="yellow" mt="sm" fw={500}>빠른 승인이 필요합니다</Text>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">이달의 매출</Text>
                            <Text fw={700} size="xl">{stats.monthlySales.toLocaleString()} 원</Text>
                        </div>
                        <ThemeIcon color="teal" variant="light" size="xl">
                            <IconReportMoney size="1.2rem" />
                        </ThemeIcon>
                    </Group>
                    <Badge color="teal" variant="light" mt="sm">성장 중</Badge>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">재고 부족 (10yd 미만)</Text>
                            <Text fw={700} size="xl">{stats.lowStockItems} 롤</Text>
                        </div>
                        <ThemeIcon color="red" variant="light" size="xl">
                            <IconAlertTriangle size="1.2rem" />
                        </ThemeIcon>
                    </Group>
                    <Text size="xs" c="red" mt="sm" fw={500}>추가 발주가 필요합니다</Text>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">총 거래처</Text>
                            <Text fw={700} size="xl">{stats.totalCustomers} 개</Text>
                        </div>
                        <ThemeIcon color="blue" variant="light" size="xl">
                            <IconUsers size="1.2rem" />
                        </ThemeIcon>
                    </Group>
                    <Text size="xs" c="dimmed" mt="sm">활성 파트너사</Text>
                </Paper>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing="lg">
                {features.map((feature) => (
                    <Card key={feature.title} shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Group>
                                <ThemeIcon color={feature.color} variant="light" size="lg">
                                    <feature.icon size="1.2rem" />
                                </ThemeIcon>
                                <Text fw={600} size="lg">{feature.title}</Text>
                            </Group>
                        </Group>
                        <Text size="sm" c="dimmed" mb="md" h={40}>{feature.description}</Text>
                        <Button component={Link} href={feature.link} variant="light" color="navy" fullWidth rightSection={<IconArrowRight size="0.9rem" />}>
                            바로가기
                        </Button>
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    );
}
