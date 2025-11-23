import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag } from 'antd'
import { Building2, Plus, Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

interface Municipality {
    id: string
    nome: string
    status: 'ativo' | 'inativo'
    created_at: string
}

export default function Municipalities() {
    const [data, setData] = useState<Municipality[]>([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Municipality | null>(null)
    const [form] = Form.useForm()

    const load = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('municipalities')
                .select('*')
                .order('nome')
            if (error) throw error
            setData(data as Municipality[])
        } catch (err: any) {
            message.error('Erro ao carregar municípios: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleSave = async (values: any) => {
        try {
            if (editingItem) {
                const { error } = await supabase
                    .from('municipalities')
                    .update({ nome: values.nome, status: values.status })
                    .eq('id', editingItem.id)
                if (error) throw error
                message.success('Município atualizado com sucesso')
            } else {
                const { error } = await supabase
                    .from('municipalities')
                    .insert([{ nome: values.nome, status: values.status }])
                if (error) throw error
                message.success('Município criado com sucesso')
            }
            setIsModalOpen(false)
            form.resetFields()
            setEditingItem(null)
            load()
        } catch (err: any) {
            message.error('Erro ao salvar: ' + err.message)
        }
    }

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'ativo' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Criado em',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: Municipality) => (
                <Space>
                    <Button
                        icon={<Edit size={16} />}
                        onClick={() => {
                            setEditingItem(record)
                            form.setFieldsValue(record)
                            setIsModalOpen(true)
                        }}
                    >
                        Editar
                    </Button>
                </Space>
            )
        }
    ]

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Building2 size={24} />
                    <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Prefeituras</h1>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => {
                        setEditingItem(null)
                        form.resetFields()
                        setIsModalOpen(true)
                    }}
                >
                    Nova Prefeitura
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title={editingItem ? 'Editar Prefeitura' : 'Nova Prefeitura'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="nome"
                        label="Nome da Prefeitura"
                        rules={[{ required: true, message: 'Informe o nome' }]}
                    >
                        <Input placeholder="Ex: Prefeitura de São Paulo" />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        initialValue="ativo"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value="ativo">Ativo</Select.Option>
                            <Select.Option value="inativo">Inativo</Select.Option>
                        </Select>
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                        <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="primary" htmlType="submit">Salvar</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}
