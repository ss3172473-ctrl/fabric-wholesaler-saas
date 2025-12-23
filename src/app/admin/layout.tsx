import { useState, useEffect } from 'react';
import { AppShell, Burger, Group, NavLink, Title, Text, Button, Badge } from '@mantine/core';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const [pendingCount, setPendingCount] = useState(0);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
                if (profile && profile.role !== 'admin') {
                    router.replace('/shop');
                    return;
                }
            }

            // Fetch pending count
            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            setPendingCount(count || 0);
        };
        init();
    }, [pathname]);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <IconBuildingWarehouse size={30} color="var(--mantine-color-navy-7)" />
                        <Title order={3} c="navy.9">영진상사 관리자</Title>
                    </Group>
                    <Text size="sm" c="dimmed" hiddenFrom="xs">관리자 모드</Text>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">메인 메뉴</Text>
                <NavLink label="대시보드" leftSection={<IconDashboard size={20} stroke={1.5} />} href="/admin/dashboard" active={pathname === '/admin/dashboard'} variant="filled" color="navy" />
                <NavLink label="재고 관리 (원단/롤)" leftSection={<IconPackage size={20} stroke={1.5} />} href="/admin/inventory" active={pathname === '/admin/inventory'} variant="filled" color="navy" />
                <NavLink
                    label="주문 관리"
                    leftSection={<IconTruckDelivery size={20} stroke={1.5} />}
                    href="/admin/orders"
                    active={pathname === '/admin/orders'}
                    variant="filled"
                    color="navy"
                    rightSection={pendingCount > 0 && <Badge size="xs" color="red" variant="filled">{pendingCount}</Badge>}
                />
                <NavLink label="거래처 관리" leftSection={<IconUsers size={20} stroke={1.5} />} href="/admin/customers" active={pathname === '/admin/customers'} variant="filled" color="navy" />
                <NavLink label="월말 정산" leftSection={<IconFileSpreadsheet size={20} stroke={1.5} />} href="/admin/settlements" active={pathname === '/admin/settlements'} variant="filled" color="navy" />

                <Text size="xs" fw={700} c="dimmed" mb="xs" mt="xl" tt="uppercase">시스템</Text>

                <div style={{ marginTop: 'auto' }}>
                    <Button variant="subtle" color="gray" fullWidth onClick={handleLogout} leftSection={<IconLogout size={16} />}>
                        로그아웃
                    </Button>
                </div>
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
