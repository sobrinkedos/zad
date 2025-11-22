import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, TimePicker, Switch, message } from 'antd'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

interface Zone {
    id: string
    nome: string
    localizacao: string
    valor_hora: number
    horario_inicio: string
    horario_fim: string
    dias_funcionamento: string[]
    tolerancia_minutos: number
    status: string
    vagas: number
}

export default function Zones() {
    const [zones, setZones] = useState<Zone[]>([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingZone, setEditingZone] = useState<Zone | null>(null)
    const [form] = Form.useForm()

    useEffect(() => {
        loadZones()
    }, [])

    const loadZones = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('zones')
                .select('*')
                .order('nome')

            if (error) throw error
            setZones(data || [])
        } catch (error: any) {
            message.error('Erro ao carregar zonas: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingZone(null)
        form.resetFields()
        form.setFieldsValue({
            status: 'ativa',
            tolerancia_minutos: 5,
            vagas: 50,
            dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex'],
            horario_inicio: dayjs('08:00', 'HH:mm'),
            horario_fim: dayjs('18:00', 'HH:mm')
        })
        setIsModalOpen(true)
    }

    const handleEdit = (zone: Zone) => {
        setEditingZone(zone)
        form.setFieldsValue({
            ...zone,
            horario_inicio: dayjs(zone.horario_inicio, 'HH:mm:ss'),
            horario_fim: dayjs(zone.horario_fim, 'HH:mm:ss')
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        Modal.confirm({
            title: 'Confirmar exclusão',
            content: 'Tem certeza que deseja excluir esta zona?',
            okText: 'Sim',
            cancelText: 'Não',
            okType: 'danger',
            onOk: async () => {
                try {
                    const { error } = await supabase
                        .from('zones')
                        .delete()
                        .eq('id', id)

                    if (error) throw error
                    message.success('Zona excluída com sucesso!')
                    loadZones()
                } catch (error: any) {
                    message.error('Erro ao excluir zona: ' + error.message)
                }
            }
        })
    }

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
                dias_funcionamento: values.dias_funcionamento ?? ['seg', 'ter', 'qua', 'qui', 'sex']
            }

            if (editingZone) {
                const { error } = await supabase
                    .from('zones')
                    .update(zoneData)
                    .eq('id', editingZone.id)

                if (error) throw error
                message.success('Zona atualizada com sucesso!')
            } else {
                const { error } = await supabase
                    .from('zones')
                    .insert([zoneData])

                if (error) throw error
                message.success('Zona criada com sucesso!')
            }

            setIsModalOpen(false)
            form.resetFields()
            loadZones()
        } catch (error: any) {
            message.error('Erro ao salvar zona: ' + error.message)
        }
    }

    const columns: ColumnsType<Zone> = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Localização',
            dataIndex: 'localizacao',
            key: 'localizacao',
        },
        {
            title: 'Valor/Hora',
            dataIndex: 'valor_hora',
            key: 'valor_hora',
            render: (value) => `R$ ${value.toFixed(2)}`
        },
        {
            title: 'Horário',
            key: 'schedule',
            render: (_, record) => {
                const start = record.horario_inicio.substring(0, 5)
                const end = record.horario_fim.substring(0, 5)
                return `${start} - ${end}`
            }
        },
        {
            title: 'Vagas',
            dataIndex: 'vagas',
            key: 'vagas',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span style={{ color: status === 'ativa' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                    {status === 'ativa' ? '✓ Ativa' : '✗ Inativa'}
                </span>
            )
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            )
        }
    ]

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Gestão de Zonas</h1>
                <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
                    Nova Zona
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={zones}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingZone ? 'Editar Zona' : 'Nova Zona'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false)
                    form.resetFields()
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="nome"
                        label="Nome da Zona"
                        rules={[{ required: true, message: 'Digite o nome da zona' }]}
                    >
                        <Input placeholder="Ex: Centro" />
                    </Form.Item>

                    <Form.Item
                        name="localizacao"
                        label="Localização"
                        rules={[{ required: true, message: 'Digite a localização' }]}
                    >
                        <Input placeholder="Ex: Rua Principal, Centro" />
                    </Form.Item>

                    <Form.Item
                        name="valor_hora"
                        label="Valor por Hora (R$)"
                        rules={[{ required: true, message: 'Digite o valor' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.50}
                            precision={2}
                            placeholder="Ex: 5.00"
                        />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="horario_inicio"
                            label="Horário Inicial"
                            rules={[{ required: true, message: 'Selecione' }]}
                        >
                            <TimePicker format="HH:mm" />
                        </Form.Item>

                        <Form.Item
                            name="horario_fim"
                            label="Horário Final"
                            rules={[{ required: true, message: 'Selecione' }]}
                        >
                            <TimePicker format="HH:mm" />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="vagas"
                            label="Número de Vagas"
                        >
                            <InputNumber min={1} max={1000} placeholder="50" />
                        </Form.Item>

                        <Form.Item
                            name="tolerancia_minutos"
                            label="Tolerância (min)"
                        >
                            <InputNumber min={0} max={30} placeholder="5" />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="status"
                        label="Status"
                    >
                        <Switch
                            checkedChildren="Ativa"
                            unCheckedChildren="Inativa"
                            checked={form.getFieldValue('status') === 'ativa'}
                            onChange={(checked) => form.setFieldValue('status', checked ? 'ativa' : 'inativa')}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setIsModalOpen(false)
                                form.resetFields()
                            }}>
                                Cancelar
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingZone ? 'Atualizar' : 'Criar'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
