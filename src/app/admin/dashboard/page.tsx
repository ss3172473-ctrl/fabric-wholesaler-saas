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

export default function DashboardPage() {
    const router = useRouter();

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2} style={{ fontFamily: 'Pretendard', fontWeight: 700 }}>관리자 대시보드</Title>
                    <Text c="dimmed" size="sm">영진상사 파트너스 관리 시스템에 오신 것을 환영합니다.</Text>
                </div>
                <Button variant="light" color="navy" onClick={() => router.push('/shop')}>
                    쇼핑몰 바로가기
                </Button>
            </Group>

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

                        <Text size="sm" c="dimmed" mb="md" h={40}>
                            {feature.description}
                        </Text>

                        <Button
                            component={Link}
                            href={feature.link}
                            variant="light"
                            color="navy"
                            fullWidth
                            rightSection={<IconArrowRight size="0.9rem" />}
                        >
                            바로가기
                        </Button>
                    </Card>
                ))}
            </SimpleGrid>

            <Paper p="xl" radius="md" mt="xl" bg="gray.0" withBorder>
                <Title order={4} mb="md">시스템 상태</Title>
                <Grid>
                    <Grid.Col span={4}>
                        <Text size="sm" c="dimmed">서버 상태</Text>
                        <Text fw={500} c="green">정상 작동 (Online)</Text>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Text size="sm" c="dimmed">데이터베이스</Text>
                        <Text fw={500} c="blue">Supabase Connected</Text>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Text size="sm" c="dimmed">최근 배포</Text>
                        <Text fw={500}>v1.2.0 (Premium Update)</Text>
                    </Grid.Col>
                </Grid>
            </Paper>
        </Container>
    );
}
