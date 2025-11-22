import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    InputNumber,
    TimePicker,
    Select,
    message,
} from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';

interface Zone {
    id: string;
    nome: string;
    localizacao: string;
    valor_hora: number;
    horario_inicio: string; // stored as HH:mm:ss
    horario_fim: string; // stored as HH:mm:ss
    status: string; // 'ativa' | 'inativa'
    vagas: number;
    tolerancia_minutos: number;
}

const STATUS_OPTIONS = [
    { label: 'Ativa', value: 'ativa' },
    { label: 'Inativa', value: 'inativa' },
];

export default function Zones() {
    // ---------- State ----------
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [form] = Form.useForm();

    // ---------- Data loading ----------
    const loadZones = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('zones').select('*');
            if (error) throw error;
            setZones(data as Zone[]);
        } catch (err: any) {
            message.error('Erro ao carregar zonas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadZones();
    }, []);

    // ---------- Handlers ----------
    const handleAdd = () => {
        setEditingZone(null);
        form.resetFields();
        form.setFieldsValue({
            status: 'ativa',
            vagas: 50,
            tolerancia_minutos: 5,
            horario_inicio: dayjs('08:00', 'HH:mm'),
            horario_fim: dayjs('18:00', 'HH:mm'),
        });
        setIsModalOpen(true);
    };

    const handleEdit = (zone: Zone) => {
        setEditingZone(zone);
        form.setFieldsValue({
            ...zone,
            horario_inicio: dayjs(zone.horario_inicio, 'HH:mm:ss'),
            horario_fim: dayjs(zone.horario_fim, 'HH:mm:ss'),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        Modal.confirm({
            title: 'Confirmar exclusão',
            content: 'Tem certeza que deseja excluir esta zona?',
            okText: 'Sim',
            cancelText: 'Não',
            okType: 'danger',
            onOk: async () => {
                try {
                    const { error } = await supabase.from('zones').delete().eq('id', id);
                    if (error) throw error;
                    message.success('Zona excluída com sucesso!');
                    loadZones();
                } catch (err: any) {
                    message.error('Erro ao excluir zona: ' + err.message);
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            const zoneData = {
                nome: values.nome,
                localizacao: values.localizacao,
                valor_hora: values.valor_hora,
                horario_inicio: values.horario_inicio.format('HH:mm:ss'),
                horario_fim: values.horario_fim.format('HH:mm:ss'),
                status: values.status ?? 'ativa',
                tolerancia_minutos: values.tolerancia_minutos ?? 5,
                vagas: values.vagas ?? 50,
            };

            if (editingZone) {
                const { error } = await supabase
                    .from('zones')
                    .update(zoneData)
                    .eq('id', editingZone.id);
                if (error) throw error;
                message.success('Zona atualizada com sucesso!');
            } else {
                const { error } = await supabase.from('zones').insert([zoneData]);
                if (error) throw error;
                message.success('Zona criada com sucesso!');
            }

            setIsModalOpen(false);
            form.resetFields();
            loadZones();
        } catch (err: any) {
            message.error('Erro ao salvar zona: ' + err.message);
        }
    };

    // ---------- Table columns ----------
    const columns: ColumnsType<Zone> = [
        { title: 'Nome', dataIndex: 'nome', key: 'nome' },
        { title: 'Localização', dataIndex: 'localizacao', key: 'localizacao' },
        {
            title: 'Valor/Hora',
            dataIndex: 'valor_hora',
            key: 'valor_hora',
            render: v => `R$ ${v.toFixed(2)}`,
        },
        {
            title: 'Horário',
            key: 'schedule',
            render: (_, rec) => {
                const start = rec.horario_inicio.substring(0, 5);
                const end = rec.horario_fim.substring(0, 5);
                return `${start} - ${end}`;
            },
        },
        { title: 'Vagas', dataIndex: 'vagas', key: 'vagas' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: s => (
                <span style={{ color: s === 'ativa' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                    {s === 'ativa' ? '✓ Ativa' : '✗ Inativa'}
                </span>
            ),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, rec) => (
                <Space>
                    <Button type="link" icon={<Edit size={16} />} onClick={() => handleEdit(rec)}>
                        Editar
                    </Button>
                    <Button type="link" danger icon={<Trash2 size={16} />} onClick={() => handleDelete(rec.id)}>
                        Excluir
                    </Button>
                </Space>
            ),
        },
    ];

    // ---------- Render ----------
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Gestão de Zonas</h1>
                <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
                    Nova Zona
                </Button>
            </div>

            <Table columns={columns} dataSource={zones} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

            <Modal
                title={editingZone ? 'Editar Zona' : 'Nova Zona'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="nome" label="Nome da Zona" rules={[{ required: true, message: 'Digite o nome' }]}>
                        <Input placeholder="Ex: Centro" />
                    </Form.Item>

                    <Form.Item name="localizacao" label="Localização" rules={[{ required: true, message: 'Digite a localização' }]}>
                        <Input placeholder="Ex: Rua Principal, Centro" />
                    </Form.Item>

                    <Form.Item name="valor_hora" label="Valor por Hora (R$)" rules={[{ required: true, message: 'Digite o valor' }]}>
                        <InputNumber style={{ width: '100%' }} min={0} step={0.5} precision={2} placeholder="Ex: 5.00" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="horario_inicio" label="Horário Inicial" rules={[{ required: true, message: 'Selecione o horário' }]}>
                            <TimePicker format="HH:mm" />
                        </Form.Item>
                        <Form.Item name="horario_fim" label="Horário Final" rules={[{ required: true, message: 'Selecione o horário' }]}>
                            <TimePicker format="HH:mm" />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="vagas" label="Número de Vagas" rules={[{ required: true, message: 'Informe a quantidade' }]}>
                            <InputNumber min={1} max={1000} placeholder="50" />
                        </Form.Item>
                        <Form.Item name="tolerancia_minutos" label="Tolerância (min)" rules={[{ required: true, message: 'Informe a tolerância' }]}>
                            <InputNumber min={0} max={30} placeholder="5" />
                        </Form.Item>
                    </Space>

                    <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Selecione o status' }]}>
                        <Select>
                            {STATUS_OPTIONS.map(opt => (
                                <Select.Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>Cancelar</Button>
                            <Button type="primary" htmlType="submit">{editingZone ? 'Atualizar' : 'Criar'}</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
