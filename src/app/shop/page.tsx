'use client';

import { useState, useEffect } from 'react';
import { Container, Title, SimpleGrid, Card, Image, Text, Badge, Button, Group, Indicator, Modal, NumberInput, Textarea, ActionIcon } from '@mantine/core';
import { createClient } from '@/utils/supabase/client';
import { IconShoppingCart, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { createOrder } from './actions';

interface Product {
    id: string;
    name: string;
    color: string;
    price_per_yard: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function ShopPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [stockMap, setStockMap] = useState<Record<string, number>>({});

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [orderNote, setOrderNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const { data: pData } = await supabase.from('products').select('*');
            const { data: rData } = await supabase.from('inventory_rolls').select('product_id, quantity_yards').eq('status', 'active');

            if (pData) setProducts(pData);
            if (rData) {
                const map: Record<string, number> = {};
                rData.forEach((r: any) => {
                    map[r.product_id] = (map[r.product_id] || 0) + Number(r.quantity_yards);
                });
                setStockMap(map);
            }
        }
        fetchData();
    }, []);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const exists = prev.find(item => item.product.id === product.id);
            if (exists) return prev; // Already in cart
            return [...prev, { product, quantity: 50 }]; // Default 50 yds
        });
        open();
    };

    const updateQuantity = (productId: string, val: number) => {
        setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: val } : item));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleCheckout = async () => {
        setLoading(true);
        const items = cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price_per_yard
        }));

        const result = await createOrder(items, orderNote);
        if (result.success) {
            alert('Order placed successfully!');
            setCart([]);
            setOrderNote('');
            close();
        } else {
            alert('Failed: ' + result.error);
        }
        setLoading(false);
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price_per_yard * item.quantity), 0);

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={2}>Fabric Shop</Title>
                <Indicator label={cart.length} size={16} disabled={cart.length === 0}>
                    <Button variant="light" onClick={open} leftSection={<IconShoppingCart size={20} />}>
                        View Cart
                    </Button>
                </Indicator>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                {products.map((product) => {
                    const stock = stockMap[product.id] || 0;
                    const inCart = cart.some(c => c.product.id === product.id);
                    return (
                        <Card key={product.id} shadow="sm" padding="lg" radius="md" withBorder>
                            <Card.Section>
                                <div style={{ height: 120, backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text c="dimmed" fw={700} fz="xl">{product.name.substring(0, 2)}</Text>
                                </div>
                            </Card.Section>

                            <Group justify="space-between" mt="md" mb="xs">
                                <Text fw={500}>{product.name}</Text>
                                <Badge color="pink" variant="light">{product.color}</Badge>
                            </Group>

                            <Text size="sm" c="dimmed">{product.price_per_yard.toLocaleString()} ₩ / yd</Text>

                            <Text size="sm" c={stock > 0 ? "teal" : "red"} fw={700} mt={5}>
                                {stock > 0 ? `Stock: ${stock} yds` : 'Out of Stock'}
                            </Text>

                            <Button color="blue" fullWidth mt="md" radius="md"
                                disabled={stock === 0 || inCart}
                                onClick={() => addToCart(product)}>
                                {inCart ? 'In Cart' : 'Add to Order'}
                            </Button>
                        </Card>
                    );
                })}
            </SimpleGrid>

            {/* Cart Modal */}
            <Modal opened={opened} onClose={close} title="Your Order Cart" size="lg">
                {cart.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">Cart is empty.</Text>
                ) : (
                    <>
                        {cart.map(item => (
                            <Group key={item.product.id} mb="sm" justify="space-between" wrap="nowrap">
                                <div style={{ flex: 1 }}>
                                    <Text fw={500}>{item.product.name} ({item.product.color})</Text>
                                    <Text size="xs" c="dimmed">{item.product.price_per_yard.toLocaleString()} ₩/yd</Text>
                                </div>
                                <NumberInput w={100} value={item.quantity} onChange={(v) => updateQuantity(item.product.id, Number(v))} min={1} suffix=" yd" />
                                <Text fw={500} w={100} ta="right">{(item.product.price_per_yard * item.quantity).toLocaleString()} ₩</Text>
                                <ActionIcon color="red" variant="subtle" onClick={() => removeFromCart(item.product.id)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        ))}

                        <Group justify="flex-end" mt="xl" pt="md" style={{ borderTop: '1px solid #eee' }}>
                            <Text size="lg">Total:</Text>
                            <Text size="xl" fw={700} c="blue">{totalAmount.toLocaleString()} ₩</Text>
                        </Group>

                        <Textarea label="Order Notes" placeholder="Any special requests?" mt="md"
                            value={orderNote} onChange={(e) => setOrderNote(e.currentTarget.value)} />

                        <Button fullWidth mt="lg" onClick={handleCheckout} loading={loading} size="lg">
                            Place Order via Telegram
                        </Button>
                    </>
                )}
            </Modal>
        </Container>
    );
}
