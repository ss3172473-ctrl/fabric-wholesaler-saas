'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Button, Table, Group, Modal, TextInput, NumberInput, Badge, ActionIcon, Card, Text, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createClient } from '@/utils/supabase/client';
import { IconPlus, IconTrash, IconChevronDown, IconChevronRight } from '@tabler/icons-react';

interface Product {
    id: string;
    name: string;
    color: string;
    price_per_yard: number;
}

interface Roll {
    id: string;
    product_id: string;
    roll_label: string;
    quantity_yards: number;
    status: 'active' | 'depleted';
}

export default function InventoryPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [rolls, setRolls] = useState<Roll[]>([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [productModalOpen, { open: openProductModal, close: closeProductModal }] = useDisclosure(false);
    const [rollModalOpen, { open: openRollModal, close: closeRollModal }] = useDisclosure(false);

    // Form State
    const [productForm, setProductForm] = useState({ name: '', color: '', price: 0 });
    const [rollForm, setRollForm] = useState({ productId: '', label: '', quantity: 0 });

    // UI State
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: rData } = await supabase.from('inventory_rolls').select('*').order('created_at', { ascending: true });

        if (pData) setProducts(pData);
        if (rData) setRolls(rData);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateProduct = async () => {
        setLoading(true);
        const { error } = await supabase.from('products').insert({
            name: productForm.name,
            color: productForm.color,
            price_per_yard: productForm.price,
        });

        if (!error) {
            await fetchData();
            closeProductModal();
            setProductForm({ name: '', color: '', price: 0 });
        } else {
            alert(error.message);
        }
        setLoading(false);
    };

    const handleAddRoll = async () => {
        if (!rollForm.productId) return;
        setLoading(true);
        const { error } = await supabase.from('inventory_rolls').insert({
            product_id: rollForm.productId,
            roll_label: rollForm.label,
            quantity_yards: rollForm.quantity,
            status: 'active'
        });

        if (!error) {
            await fetchData();
            closeRollModal();
            setRollForm(prev => ({ ...prev, label: '', quantity: 0 }));
        } else {
            alert(error.message);
        }
        setLoading(false);
    };

    const openAddRoll = (productId: string) => {
        setRollForm({ productId, label: '', quantity: 0 });
        openRollModal();
    };

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="lg">
                <Title order={2}>Inventory & Rolls</Title>
                <Button onClick={openProductModal} leftSection={<IconPlus size={16} />}>New Product</Button>
            </Group>

            <Card withBorder radius="md" p="md">
                <Table stickyHeader>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w={50}></Table.Th>
                            <Table.Th>Product Name</Table.Th>
                            <Table.Th>Color</Table.Th>
                            <Table.Th>Price / Yd</Table.Th>
                            <Table.Th>Total Stock</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {products.map((p) => {
                            const productRolls = rolls.filter(r => r.product_id === p.id);
                            const totalStock = productRolls.reduce((sum, r) => sum + Number(r.quantity_yards), 0);
                            const isExpanded = expandedProduct === p.id;

                            return (
                                <>
                                    <Table.Tr key={p.id} bg={isExpanded ? 'var(--mantine-color-gray-0)' : undefined}>
                                        <Table.Td>
                                            <ActionIcon variant="subtle" size="sm" onClick={() => setExpandedProduct(isExpanded ? null : p.id)}>
                                                {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                                            </ActionIcon>
                                        </Table.Td>
                                        <Table.Td fw={500}>{p.name}</Table.Td>
                                        <Table.Td>{p.color}</Table.Td>
                                        <Table.Td>{p.price_per_yard.toLocaleString()} ₩</Table.Td>
                                        <Table.Td>
                                            <Badge color={totalStock > 0 ? 'blue' : 'gray'}>
                                                {totalStock} yds
                                            </Badge>
                                            <Text span size="xs" c="dimmed" ml="xs">({productRolls.length} rolls)</Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Button size="xs" variant="light" onClick={() => openAddRoll(p.id)}>
                                                + Add Roll
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>

                                    {isExpanded && (
                                        <Table.Tr>
                                            <Table.Td colSpan={6} p={0}>
                                                <div style={{ padding: '10px 20px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                                    <Title order={6} mb="xs">Rolls Inventory</Title>
                                                    {productRolls.length === 0 ? (
                                                        <Text c="dimmed" size="sm">No rolls registered. Add one to start selling.</Text>
                                                    ) : (
                                                        <Group gap="sm">
                                                            {productRolls.map(roll => (
                                                                <Card key={roll.id} shadow="sm" padding="xs" radius="md" withBorder w={120}>
                                                                    <Text fw={700} size="sm">{roll.roll_label}</Text>
                                                                    <Text size="xs" c="dimmed">{Number(roll.quantity_yards)} yds</Text>
                                                                    <Badge size="xs" color={roll.status === 'active' ? 'teal' : 'gray'} mt={5}>{roll.status}</Badge>
                                                                </Card>
                                                            ))}
                                                        </Group>
                                                    )}
                                                </div>
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Card>

            {/* Create Product Modal */}
            <Modal opened={productModalOpen} onClose={closeProductModal} title="Register New Fabric">
                <TextInput label="Fabric Name" placeholder="e.g. Linen 100%" required mb="sm"
                    value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.currentTarget.value })} />
                <TextInput label="Color / Pattern" placeholder="e.g. Beige Check" required mb="sm"
                    value={productForm.color} onChange={(e) => setProductForm({ ...productForm, color: e.currentTarget.value })} />
                <NumberInput label="Base Price (per yard)" required mb="lg"
                    value={productForm.price} onChange={(v) => setProductForm({ ...productForm, price: Number(v) })} />
                <Button fullWidth onClick={handleCreateProduct} loading={loading}>Save Product</Button>
            </Modal>

            {/* Add Roll Modal */}
            <Modal opened={rollModalOpen} onClose={closeRollModal} title="Stock In (Add Roll)">
                <TextInput label="Roll Label/Number" placeholder="e.g. #A-102" required mb="sm"
                    value={rollForm.label} onChange={(e) => setRollForm({ ...rollForm, label: e.currentTarget.value })} />
                <NumberInput label="Yards Amount" placeholder="50" required mb="lg"
                    value={rollForm.quantity} onChange={(v) => setRollForm({ ...rollForm, quantity: Number(v) })} />
                <Button fullWidth onClick={handleAddRoll} loading={loading}>confirm Stock In</Button>
            </Modal>
        </Container>
    );
}
