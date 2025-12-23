'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Title, Button, Table, Group, Modal, TextInput, NumberInput, Badge, ActionIcon, Card, Text, Collapse, Switch, FileButton, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createClient } from '@/utils/supabase/client';
import { IconPlus, IconTrash, IconChevronDown, IconChevronRight, IconUpload, IconPhoto } from '@tabler/icons-react';

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
    const [productForm, setProductForm] = useState({ name: '', color: '', price: 0, imageUrl: '' });
    const [rollForm, setRollForm] = useState({ productId: '', label: '', quantity: 0 });
    const [imageFile, setImageFile] = useState<File | null>(null);

    // UI State
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [manageMode, setManageMode] = useState(false);

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
        let uploadedImageUrl = '';

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError, data } = await supabase.storage
                .from('product-images')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                // Continue without image or alert?
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);
                uploadedImageUrl = publicUrl;
            }
        }

        const { error } = await supabase.from('products').insert({
            name: productForm.name,
            color: productForm.color,
            price_per_yard: productForm.price,
            image_url: uploadedImageUrl
        });

        if (!error) {
            await fetchData();
            closeProductModal();
            setProductForm({ name: '', color: '', price: 0, imageUrl: '' });
            setImageFile(null);
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

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('원단과 포함된 롤을 모두 삭제하시겠습니까?')) return;
        setLoading(true);
        // Cascading delete relies on DB FK setup, or manual delete.
        // Assuming DB Cascade for simplicity or do manual.
        // Let's do manual to be checking.
        await supabase.from('inventory_rolls').delete().eq('product_id', id);
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) alert(error.message);
        else await fetchData();
        setLoading(false);
    }

    const handleDeleteRoll = async (id: string) => {
        if (!confirm('이 롤을 삭제하시겠습니까?')) return;
        setLoading(true);
        const { error } = await supabase.from('inventory_rolls').delete().eq('id', id);
        if (error) alert(error.message);
        else await fetchData();
        setLoading(false);
    }

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="lg">
                <Title order={2} c="navy.9">재고 관리 (원단 & 롤)</Title>
                <Group>
                    <Switch
                        label="관리 모드 (삭제/편집)"
                        checked={manageMode}
                        onChange={(event) => setManageMode(event.currentTarget.checked)}
                        color="red"
                        size="md"
                    />
                    <Button onClick={openProductModal} leftSection={<IconPlus size={16} />} color="navy">신규 원단 등록</Button>
                </Group>
            </Group>

            <Card withBorder radius="md" p="md" shadow="sm">
                <Table stickyHeader verticalSpacing="sm" highlightOnHover>
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th w={50}></Table.Th>
                            <Table.Th>상품명 (품목)</Table.Th>
                            <Table.Th>색상/패턴</Table.Th>
                            <Table.Th>단가 (1야드)</Table.Th>
                            <Table.Th>총 재고</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>관리</Table.Th>
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
                                            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setExpandedProduct(isExpanded ? null : p.id)}>
                                                {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                                            </ActionIcon>
                                        </Table.Td>
                                        <Table.Td fw={600} c="navy.9">{p.name}</Table.Td>
                                        <Table.Td>{p.color}</Table.Td>
                                        <Table.Td fw={500}>{p.price_per_yard.toLocaleString()} 원</Table.Td>
                                        <Table.Td>
                                            <Badge color={totalStock > 0 ? 'teal' : 'gray'} variant="light" size="lg">
                                                {totalStock} yds
                                            </Badge>
                                            <Text span size="xs" c="dimmed" ml="xs">({productRolls.length} 롤)</Text>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            {manageMode ? (
                                                <Button size="xs" color="red" variant="subtle" onClick={() => handleDeleteProduct(p.id)}>
                                                    <IconTrash size={16} /> 삭제
                                                </Button>
                                            ) : (
                                                <Button size="xs" variant="outline" color="navy" onClick={() => openAddRoll(p.id)}>
                                                    + 롤 입고
                                                </Button>
                                            )}
                                        </Table.Td>
                                    </Table.Tr>

                                    {isExpanded && (
                                        <Table.Tr>
                                            <Table.Td colSpan={6} p={0}>
                                                <div style={{ padding: '15px 30px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                                    <Title order={6} mb="sm" c="dimmed">개별 롤(Roll) 재고 상세</Title>
                                                    {productRolls.length === 0 ? (
                                                        <Text c="dimmed" size="sm">등록된 롤이 없습니다. 입고 버튼을 눌러 재고를 추가하세요.</Text>
                                                    ) : (
                                                        <Group gap="sm">
                                                            {productRolls.map(roll => (
                                                                <Card key={roll.id} shadow="sm" padding="xs" radius="md" withBorder w={140} bg="white">
                                                                    <Text fw={700} size="sm" c="navy.9">{roll.roll_label}</Text>
                                                                    <Text size="xs" c="dimmed">{Number(roll.quantity_yards)} yds</Text>
                                                                    <Badge size="xs" color={roll.status === 'active' ? 'teal' : 'gray'} mt={5} variant="dot">
                                                                        {roll.status === 'active' ? '판매가능' : '소진됨'}
                                                                    </Badge>
                                                                    {manageMode && (
                                                                        <ActionIcon
                                                                            color="red" variant="filled" size="xs"
                                                                            style={{ position: 'absolute', top: 0, right: 0, borderRadius: '0 0 0 4px', zIndex: 10 }}
                                                                            onClick={() => handleDeleteRoll(roll.id)}
                                                                        >
                                                                            <IconTrash size={10} />
                                                                        </ActionIcon>
                                                                    )}
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
            <Modal opened={productModalOpen} onClose={closeProductModal} title="신규 원단 등록" centered>
                <TextInput label="원단명 (품명)" placeholder="예: 린넨 100% 화이트" required mb="sm"
                    value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.currentTarget.value })} />
                <TextInput label="색상 / 패턴" placeholder="예: 베이지 체크" required mb="sm"
                    value={productForm.color} onChange={(e) => setProductForm({ ...productForm, color: e.currentTarget.value })} />
                <NumberInput label="단가 (1야드 기준)" required mb="lg" suffix=" 원" hideControls
                    value={productForm.price} onChange={(v) => setProductForm({ ...productForm, price: Number(v) })} />

                <Group mb="lg" align="flex-end">
                    <FileButton onChange={setImageFile} accept="image/png,image/jpeg">
                        {(props) => <Button {...props} variant="default" leftSection={<IconPhoto size={16} />}>이미지 선택</Button>}
                    </FileButton>
                    {imageFile && (
                        <Text size="sm" c="dimmed">
                            {imageFile.name}
                        </Text>
                    )}
                </Group>
                <Button fullWidth onClick={handleCreateProduct} loading={loading} color="navy">원단 저장</Button>
            </Modal>

            {/* Add Roll Modal */}
            <Modal opened={rollModalOpen} onClose={closeRollModal} title="롤 입고 (재고 추가)" centered>
                <TextInput label="롤 번호 / 라벨" placeholder="예: #A-101" required mb="sm"
                    value={rollForm.label} onChange={(e) => setRollForm({ ...rollForm, label: e.currentTarget.value })} />
                <NumberInput label="입고 수량 (야드)" placeholder="50" required mb="lg" suffix=" yds"
                    value={rollForm.quantity} onChange={(v) => setRollForm({ ...rollForm, quantity: Number(v) })} />
                <Button fullWidth onClick={handleAddRoll} loading={loading} color="navy">입고 확인</Button>
            </Modal>
        </Container>
    );
}
