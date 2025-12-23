'use client';

import { AppShell, Burger, Group, NavLink, Title, Text, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPackage, IconUsers, IconFileSpreadsheet, IconDashboard, IconTruckDelivery, IconLogout } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    <Title order={3}>Youngjin Partners (Admin)</Title>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <NavLink label="Dashboard" leftSection={<IconDashboard size={20} stroke={1.5} />} href="/admin/dashboard" active={pathname === '/admin/dashboard'} />
                <NavLink label="Inventory & Rolls" leftSection={<IconPackage size={20} stroke={1.5} />} href="/admin/inventory" active={pathname === '/admin/inventory'} />
                <NavLink label="Order Management" leftSection={<IconTruckDelivery size={20} stroke={1.5} />} href="/admin/orders" active={pathname === '/admin/orders'} />
                <NavLink label="Customers" leftSection={<IconUsers size={20} stroke={1.5} />} href="/admin/customers" active={pathname === '/admin/customers'} />
                <NavLink label="Monthly Settlement" leftSection={<IconFileSpreadsheet size={20} stroke={1.5} />} href="/admin/settlements" active={pathname === '/admin/settlements'} />

                <NavLink label="Data Migration" leftSection={<IconFileSpreadsheet size={20} stroke={1.5} />} href="/admin/migration" color="green" variant="light" active={pathname === '/admin/migration'} mt="xl" />

                <div style={{ marginTop: 'auto' }}>
                    <Button variant="light" color="red" fullWidth onClick={handleLogout} leftSection={<IconLogout size={16} />}>
                        Logout
                    </Button>
                </div>
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
