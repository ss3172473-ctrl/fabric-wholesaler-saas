'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Button, Table, Group, Modal, TextInput, NumberInput, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { supabase } from '@/lib/supabaseClient';

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
    status: string;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [rolls, setRolls] = useState<Roll[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formName, setFormName] = useState('');
    const [formColor, setFormColor] = useState('');
    const [formPrice, setFormPrice] = useState<number | string>(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: pData } = await supabase.from('products').select('*');
        const { data: rData } = await supabase.from('inventory_rolls').select('*');
        if (pData) setProducts(pData);
        if (rData) setRolls(rData);
    };

    const createProduct = async () => {
        setLoading(true);
        const { error } = await supabase.from('products').insert({
            name: formName,
            color: formColor,
            price_per_yard: Number(formPrice),
        });

        if (!error) {
            fetchData();
            close();
            setFormName('');
            setFormColor('');
            setFormPrice(0);
        } else {
            alert('Error creating product: ' + error.message);
        }
        setLoading(false);
    };

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="lg">
                <Title order={2}>Inventory Management</Title>
                <Button onClick={open}>+ Add New Product</Button>
            </Group>

            <Title order={4} mt="xl" mb="md">Products</Title>
            <Table withTableBorder striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Color</Table.Th>
                        <Table.Th>Price (/yd)</Table.Th>
                        <Table.Th>Total Rolls</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {products.map((p) => {
                        const productRolls = rolls.filter(r => r.product_id === p.id);
                        return (
                            <Table.Tr key={p.id}>
                                <Table.Td>{p.name}</Table.Td>
                                <Table.Td>{p.color}</Table.Td>
                                <Table.Td>{p.price_per_yard.toLocaleString()} KRW</Table.Td>
                                <Table.Td>{productRolls.length} rolls ({productRolls.reduce((a, b) => a + Number(b.quantity_yards), 0)} yds)</Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>

            <Modal opened={opened} onClose={close} title="Create New Product">
                <TextInput label="Product Name" placeholder="e.g. Cotton 20s" mb="sm" value={formName} onChange={(e) => setFormName(e.currentTarget.value)} />
                <TextInput label="Color" placeholder="e.g. Blue" mb="sm" value={formColor} onChange={(e) => setFormColor(e.currentTarget.value)} />
                <NumberInput label="Price per Yard" mb="lg" value={formPrice} onChange={setFormPrice} />
                <Group justify="flex-end">
                    <Button variant="default" onClick={close}>Cancel</Button>
                    <Button onClick={createProduct} loading={loading}>Create</Button>
                </Group>
            </Modal>
        </Container>
    );
}
