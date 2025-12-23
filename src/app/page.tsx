'use client';

import { Container, Title, Button, Group, Text, Card, SimpleGrid, ThemeIcon, Box } from '@mantine/core';
import { IconDatabaseImport, IconLogin, IconDeviceMobile, IconChartBar } from '@tabler/icons-react';
import Link from 'next/link';

export default function Home() {
    return (
        <Box style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Container size="lg" py={80}>
                <Box ta="center" mb={60}>
                    <Text c="navy.6" fw={700} tt="uppercase" lts={2} mb="xs">Youngjin Enterprise SaaS</Text>
                    <Title order={1} size={48} mb="md" c="navy.9" style={{ fontFamily: 'Pretendard' }}>
                        영진상사 디지털 장부 시스템
                    </Title>
                    <Text size="xl" c="dimmed" maw={600} mx="auto">
                        이제 모든 주문과 재고 관리를 스마트폰 하나로 해결하세요.<br />
                        실시간 재고 파악부터 월말 정산까지 자동으로 처리됩니다.
                    </Text>

                    <Group justify="center" mt="xl" grow>
                        <Button component={Link} href="/login?role=customer" size="xl" color="navy" leftSection={<IconLogin />} variant="filled">
                            구매자(거래처) 로그인
                        </Button>
                        <Button component={Link} href="/login?role=admin" size="xl" color="gray" leftSection={<IconBuildingWarehouse />} variant="outline">
                            판매자(관리자) 로그인
                        </Button>
                    </Group>
                </Box>

                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                    <FeatureCard
                        icon={<IconDeviceMobile size={30} />}
                        title="모바일 간편 주문"
                        description="거래처에서 스마트폰으로 실시간 재고를 확인하고 바로 주문을 넣을 수 있습니다."
                    />
                    <FeatureCard
                        icon={<IconDatabaseImport size={30} />}
                        title="정확한 재고 관리"
                        description="롤(Roll) 단위 관리로 로스율을 줄이고 정확한 야드(Yard) 수를 추적합니다."
                    />
                    <FeatureCard
                        icon={<IconChartBar size={30} />}
                        title="자동 정산 리포트"
                        description="매월 말일, 복잡한 계산기 없이 클릭 한 번으로 거래 명세서를 엑셀로 받으세요."
                    />
                </SimpleGrid>
            </Container>
        </Box>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card radius="md" p="xl" withBorder style={{ backgroundColor: 'white' }}>
            <ThemeIcon variant="light" size={60} radius="md" color="navy" mb="md">
                {icon}
            </ThemeIcon>
            <Title order={3} size="h4" mb="sm" c="gray.9">{title}</Title>
            <Text c="dimmed" size="sm" lh={1.6}>
                {description}
            </Text>
        </Card>
    );
}
