'use client';

import { useState } from 'react';
import { Group, Text, useMantineTheme, useMantineColorScheme, Table, Alert, Button, Container, Title } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconUpload, IconX, IconFileSpreadsheet, IconAlertCircle } from '@tabler/icons-react';
import * as XLSX from 'xlsx';

// Defined based on the user's "Jangbu" columns
interface LedgerRow {
    Date: string; // e.g., '2025-01-15'
    CustomerName: string; // 'Kim Fabric'
    ItemName: string; // 'Blue Cotton 20s'
    Quantity: number; // 50
    Unit: string; // 'yds'
    Price: number; // 4500
    Total: number; // 225000
}

export function ExcelMigration() {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const [data, setData] = useState<LedgerRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDrop = async (files: File[]) => {
        setLoading(true);
        setError(null);
        const file = files[0];

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            // Assuming the first sheet is the target
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Basic Parsing Logic (Assumption: Row 0 is header)
            // We start from row 1
            const parsedData: LedgerRow[] = [];

            // Skip header (row 0)
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                if (!row || row.length === 0) continue;

                // Map columns based on index (Needs to be adjusted to actual Excel file)
                // Example: Col 0=Date, 1=Customer, 2=Item, 3=Qty, 4=Price
                const parsedRow: LedgerRow = {
                    Date: row[0] || '',
                    CustomerName: row[1] || 'Unknown',
                    ItemName: row[2] || '',
                    Quantity: Number(row[3]) || 0,
                    Unit: 'yds', // Default or parsed
                    Price: Number(row[4]) || 0,
                    Total: (Number(row[3]) || 0) * (Number(row[4]) || 0),
                };

                if (parsedRow.CustomerName && parsedRow.ItemName) {
                    parsedData.push(parsedRow);
                }
            }

            setData(parsedData);
        } catch (err) {
            console.error(err);
            setError('Failed to parse Excel file. Please check the format.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="lg" py="xl">
            <Title order={2} mb="md">Data Migration (Excel Upload)</Title>
            <Text c="dimmed" mb="xl">
                기존 장부 엑셀 파일을 업로드해주세요. 시스템이 날짜, 거래처, 품목 등을 자동으로 인식합니다.
            </Text>

            <Group mb="lg">
                <Button component="a" href="/template_migration.xlsx" download color="green" variant="outline" leftSection={<IconFileSpreadsheet size={18} />}>
                    엑셀 양식 다운로드
                </Button>
            </Group>

            <Dropzone
                onDrop={handleDrop}
                onReject={(files) => setError('File invalid. Please upload .xlsx or .xls')}
                maxSize={5 * 1024 ** 2}
                accept={[MIME_TYPES.xlsx, MIME_TYPES.xls]}
                loading={loading}
                mb="xl"
            >
                <Group justify="center" gap="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                        <IconUpload
                            size="3.2rem"
                            stroke={1.5}
                            color={theme.colors[theme.primaryColor][colorScheme === 'dark' ? 4 : 6]}
                        />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX
                            size="3.2rem"
                            stroke={1.5}
                            color={theme.colors.red[colorScheme === 'dark' ? 4 : 6]}
                        />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <IconFileSpreadsheet size="3.2rem" stroke={1.5} />
                    </Dropzone.Idle>

                    <div>
                        <Text size="xl" inline>
                            Drag 'ty 수정2025.xlsx' here or click to select files
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                            Attach one file per upload. max 5mb.
                        </Text>
                    </div>
                </Group>
            </Dropzone>

            {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mb="lg">
                    {error}
                </Alert>
            )}

            {data.length > 0 && (
                <>
                    <Group justify="space-between" mb="xs">
                        <Title order={4}>Preview ({data.length} rows)</Title>
                        <Button color="blue">Confirm & Import to Database</Button>
                    </Group>

                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Date</Table.Th>
                                <Table.Th>Customer</Table.Th>
                                <Table.Th>Item</Table.Th>
                                <Table.Th>Qty</Table.Th>
                                <Table.Th>Price</Table.Th>
                                <Table.Th>Total</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.slice(0, 10).map((row, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>{row.Date}</Table.Td>
                                    <Table.Td>{row.CustomerName}</Table.Td>
                                    <Table.Td>{row.ItemName}</Table.Td>
                                    <Table.Td>{row.Quantity}</Table.Td>
                                    <Table.Td>{row.Price.toLocaleString()} KRW</Table.Td>
                                    <Table.Td>{row.Total.toLocaleString()} KRW</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    {data.length > 10 && <Text ta="center" mt="sm">...and {data.length - 10} more rows</Text>}
                </>
            )}
        </Container>
    );
}
