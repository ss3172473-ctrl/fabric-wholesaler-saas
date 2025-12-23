'use client';

import { ExcelMigration } from '@/components/ExcelMigration';
import { Container } from '@mantine/core';

export default function MigrationPage() {
    return (
        <Container size="xl" py="xl">
            <ExcelMigration />
        </Container>
    );
}
