'use client';

import { Container, Title, Button, Group, Text } from '@mantine/core';
import { IconDatabaseImport } from '@tabler/icons-react';
import Link from 'next/link';

export default function Home() {
    return (
        <Container size="lg" py="xl">
            <Title order={1} mb="md">Fabric Wholesaler B2B</Title>
            <Text size="lg" mb="xl">
                Welcome to your new digital ledger. Manage orders, inventory, and settlements all in one place.
            </Text>

            <Group>
                <Button component={Link} href="/admin/migration" leftSection={<IconDatabaseImport />}>
                    Go to Data Migration (Excel Upload)
                </Button>
            </Group>
        </Container>
    );
}
