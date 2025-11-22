import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, TimePicker, Switch, message } from 'antd'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

interface Zone {
    id: string
    name: string
    hourly_rate: number
    start_time: string
    end_time: string
    active: boolean
    max_duration_minutes?: number
    tolerance_minutes?: number
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
                .order('name')

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
            active: true,
            max_duration_minutes: 120,
            tolerance_minutes: 5,
            start_time: dayjs('08:00', 'HH:mm'),
            end_time: dayjs('18:00', 'HH:mm')
        })
        setIsModalOpen(true)
    }

    const handleEdit = (zone: Zone) => {
        setEditingZone(zone)
        form.setFieldsValue({
            ...zone,
            start_time: dayjs(zone.start_time, 'HH:mm:ss'),
            end_time: dayjs(zone.end_time, 'HH:mm:ss')
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
                name: values.name,
                hourly_rate: values.hourly_rate,
                start_time: values.start_time.format('HH:mm:ss'),
                end_time: values.end_time.format('HH:mm:ss'),
                active: values.active ?? true,
                max_duration_minutes: values.max_duration_minutes ?? 120,
                tolerance_minutes: values.tolerance_minutes ?? 5
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
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Valor/Hora',
            dataIndex: 'hourly_rate',
            key: 'hourly_rate',
            render: (value) => `R$ ${value.toFixed(2)}`
        },
        {
            title: 'Horário',
            key: 'schedule',
            render: (_, record) => {
                const start = record.start_time.substring(0, 5)
                const end = record.end_time.substring(0, 5)
                return `${start} - ${end}`
            }
        },
        {
            title: 'Duração Máx.',
            dataIndex: 'max_duration_minutes',
            key: 'max_duration_minutes',
            render: (value) => value ? `${value} min` : '-'
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <span style={{ color: active ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                    {active ? '✓ Ativa' : '✗ Inativa'}
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
                        name="name"
                        label="Nome da Zona"
                        rules={[{ required: true, message: 'Digite o nome da zona' }]}
                    >
                        <Input placeholder="Ex: Centro" />
                    </Form.Item>

                    <Form.Item
                        name="hourly_rate"
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
                            name="start_time"
                            label="Horário Inicial"
                            rules={[{ required: true, message: 'Selecione' }]}
                        >
                            <TimePicker format="HH:mm" />
                        </Form.Item>

                        <Form.Item
                            name="end_time"
                            label="Horário Final"
                            rules={[{ required: true, message: 'Selecione' }]}
                        >
                            <TimePicker format="HH:mm" />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="max_duration_minutes"
                            label="Duração Máxima (min)"
                        >
                            <InputNumber min={15} max={480} placeholder="120" />
                        </Form.Item>

                        <Form.Item
                            name="tolerance_minutes"
                            label="Tolerância (min)"
                        >
                            <InputNumber min={0} max={30} placeholder="5" />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="active"
                        label="Status"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Ativa" unCheckedChildren="Inativa" />
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
