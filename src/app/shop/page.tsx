'use client';

import { useState, useEffect } from 'react';
import { Container, Title, SimpleGrid, Card, Image, Text, Badge, Button, Group, Indicator, Modal, NumberInput, Textarea, ActionIcon } from '@mantine/core';
import { createClient } from '@/utils/supabase/client';
import { IconShoppingCart, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { createOrder } from './actions';
import { NotificationBell } from '@/components/NotificationBell';
import Link from 'next/link';
import { IconHistory } from '@tabler/icons-react';

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
        if (cart.length === 0) return;
        setLoading(true);
        try {
            const items = cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: 0 // 견적 요청이므로 0원으로 전송 (관리자가 설정)
            }));

            console.log("Creating order with:", items);
            const result = await createOrder(items, orderNote);

            if (result.success) {
                alert('주문이 정상적으로 접수되었습니다! (관리자 승인 대기중)');
                setCart([]);
                setOrderNote('');
                close();
            } else {
                alert('주문 실패: ' + result.error);
            }
        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert('주문 처리 중 오류가 발생했습니다: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price_per_yard * item.quantity), 0);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login?role=customer';
    };

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2} c="navy.9">원단 주문 (쇼핑몰)</Title>
                    <Text c="dimmed" size="sm">원단 재고 확인 및 견적 요청</Text>
                </div>
                <Group>
                    <NotificationBell />
                    <Button variant="subtle" color="navy" component={Link} href="/shop/orders" leftSection={<IconHistory size={20} />}>
                        주문 내역
                    </Button>
                    <Button variant="default" onClick={handleLogout} color="gray">
                        로그아웃
                    </Button>
                    <Indicator label={cart.length} size={16} disabled={cart.length === 0} color="red">
                        <Button variant="outline" color="navy" onClick={open} leftSection={<IconShoppingCart size={20} />}>
                            견적함 보기
                        </Button>
                    </Indicator>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
                {products.map((product) => {
                    const stock = stockMap[product.id] || 0;
                    const inCart = cart.some(c => c.product.id === product.id);
                    return (
                        <Card key={product.id} shadow="sm" padding="lg" radius="md" withBorder>
                            <Card.Section>
                                <div style={{ height: 140, backgroundColor: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text c="gray.5" fw={900} fz={40} style={{ fontFamily: 'Pretendard' }}>
                                        {product.name.substring(0, 1)}
                                    </Text>
                                </div>
                            </Card.Section>

                            <Group justify="space-between" mt="md" mb="xs">
                                <Text fw={700} c="navy.9">{product.name}</Text>
                                <Badge color="gray" variant="light">{product.color}</Badge>
                            </Group>

                            <Text size="sm" c="orange.8" fw={600}>단가: 견적문의 (주문 승인 시 확정)</Text>

                            <Text size="sm" c={stock > 0 ? "teal" : "red"} fw={600} mt={5}>
                                {stock > 0 ? `현재 재고: ${stock} yds` : '일시 품절 (입고 예정)'}
                            </Text>

                            <Button color={inCart ? "green" : "navy"} fullWidth mt="md" radius="md"
                                disabled={stock === 0 || inCart}
                                onClick={() => addToCart(product)}
                                variant={inCart ? "light" : "filled"}>
                                {inCart ? '견적함에 담김' : '견적함 담기'}
                            </Button>
                        </Card>
                    );
                })}
            </SimpleGrid>

            {/* Cart Modal */}
            <Modal opened={opened} onClose={close} title="견적 요청 (장바구니)" size="lg" centered>
                {cart.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">견적함이 비어있습니다.</Text>
                ) : (
                    <>
                        {cart.map(item => (
                            <Group key={item.product.id} mb="sm" justify="space-between" wrap="nowrap" align="center">
                                <div style={{ flex: 1 }}>
                                    <Text fw={600} c="navy.9">{item.product.name} ({item.product.color})</Text>
                                    <Text size="xs" c="dimmed">단가: 별도 협의</Text>
                                </div>
                                <NumberInput w={100} value={item.quantity} onChange={(v) => updateQuantity(item.product.id, Number(v))} min={1} suffix=" yds" step={10} />
                                <Text fw={600} w={100} ta="right" c="dimmed">-</Text>
                                <ActionIcon color="red" variant="subtle" onClick={() => removeFromCart(item.product.id)}>
                                    <IconTrash size={18} />
                                </ActionIcon>
                            </Group>
                        ))}

                        <Group justify="flex-end" mt="xl" pt="md" style={{ borderTop: '2px solid #f1f3f5' }}>
                            <Text size="lg">예상 견적 합계:</Text>
                            <Text size="xl" fw={800} c="orange.8">관리자 승인 후 확정</Text>
                        </Group>

                        <Textarea label="주문 메모 / 요청사항" placeholder="배송지 변경이나 기타 요청사항을 입력하세요." mt="md"
                            value={orderNote} onChange={(e) => setOrderNote(e.currentTarget.value)} />

                        <Button fullWidth mt="lg" onClick={handleCheckout} loading={loading} size="lg" color="navy">
                            견적 요청하기
                        </Button>
                    </>
                )}
            </Modal>
        </Container>
    );
}
