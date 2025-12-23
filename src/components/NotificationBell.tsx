'use client';

import { useState, useEffect } from 'react';
import { ActionIcon, Menu, Badge, Text, Group, ScrollArea, Indicator, Box, Divider } from '@mantine/core';
import { IconBell, IconCircleCheck, IconTruckDelivery, IconX, IconFileText } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';

interface Notification {
    id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const supabase = createClient();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const getIcon = (message: string) => {
        if (message.includes('승인완료')) return <IconCircleCheck size={18} color="teal" />;
        if (message.includes('출고준비') || message.includes('출고완료')) return <IconTruckDelivery size={18} color="blue" />;
        if (message.includes('취소')) return <IconX size={18} color="red" />;
        return <IconFileText size={18} color="gray" />;
    };

    return (
        <Menu shadow="md" width={320} position="bottom-end" onOpen={markAsRead}>
            <Menu.Target>
                <Indicator label={unreadCount} size={16} disabled={unreadCount === 0} color="red">
                    <ActionIcon variant="light" color="gray" size="lg" radius="md">
                        <IconBell size={22} />
                    </ActionIcon>
                </Indicator>
            </Menu.Target>

            <Menu.Dropdown p={0}>
                <Box p="xs" bg="gray.0">
                    <Text fw={700} size="sm">알림 센터</Text>
                </Box>
                <Divider />
                <ScrollArea.Autosize mah={400}>
                    {notifications.length === 0 ? (
                        <Box p="xl" ta="center">
                            <Text size="sm" c="dimmed">새로운 알림이 없습니다.</Text>
                        </Box>
                    ) : (
                        notifications.map((n) => (
                            <Menu.Item key={n.id} p="md">
                                <Group wrap="nowrap" align="flex-start" gap="sm">
                                    <Box mt={2}>{getIcon(n.message)}</Box>
                                    <div style={{ flex: 1 }}>
                                        <Text size="sm" lineClamp={2} fw={n.is_read ? 400 : 600}>
                                            {n.message}
                                        </Text>
                                        <Text size="xs" c="dimmed" mt={4}>
                                            {new Date(n.created_at).toLocaleString('ko-KR')}
                                        </Text>
                                    </div>
                                    {!n.is_read && <Badge size="xs" color="red" variant="filled" circle />}
                                </Group>
                            </Menu.Item>
                        ))
                    )}
                </ScrollArea.Autosize>
                {notifications.length > 0 && (
                    <>
                        <Divider />
                        <Box p="xs" ta="center">
                            <Text size="xs" c="dimmed">최근 10개의 알림만 표시됩니다.</Text>
                        </Box>
                    </>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}
