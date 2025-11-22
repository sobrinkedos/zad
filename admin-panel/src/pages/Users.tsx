import { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Space,
    Modal,
    Form,
    Select,
    message,
    Button,
} from 'antd';
import { Edit, Shield } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '../lib/supabase';

interface User {
    user_id: string;
    role: string;
    nome: string | null;
    cpf: string | null;
    email: string | null;
    created_at: string;
}

const ROLES = [
    { label: 'Super Admin', value: 'superadmin', color: 'red' },
    { label: 'Administrador', value: 'admin', color: 'blue' },
    { label: 'Fiscal', value: 'fiscal', color: 'green' },
    { label: 'Motorista', value: 'motorista', color: 'default' },
    { label: 'Financeiro', value: 'financeiro', color: 'purple' },
    { label: 'Empresa', value: 'empresa', color: 'orange' },
];

export default function Users() {
    // ---------- State ----------
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();

    // ---------- Data loading ----------
    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('accounts').select('*');
            if (error) throw error;
            setUsers(data as User[]);
        } catch (err: any) {
            message.error('Erro ao carregar usuários: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // ---------- Handlers ----------
    const handleEditRole = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({ role: user.role });
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        if (!editingUser) return;
        try {
            const { error } = await supabase
                .from('accounts')
                .update({ role: values.role })
                .eq('user_id', editingUser.user_id);
            if (error) throw error;
            message.success('Perfil atualizado com sucesso!');
            setIsModalOpen(false);
            loadUsers();
        } catch (err: any) {
            message.error('Erro ao atualizar perfil: ' + err.message);
        }
    };

    const getRoleConfig = (role: string) =>
        ROLES.find(r => r.value === role) || { label: role, color: 'default' };

    // ---------- Table columns ----------
    const columns: ColumnsType<User> = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
            render: nome => nome || <span style={{ color: '#999' }}>Não informado</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'CPF',
            dataIndex: 'cpf',
            key: 'cpf',
            render: cpf => cpf || <span style={{ color: '#999' }}>-</span>,
        },
        {
            title: 'Perfil',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const cfg = getRoleConfig(role);
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
            },
            filters: ROLES.map(r => ({ text: r.label, value: r.value })),
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Cadastro',
            dataIndex: 'created_at',
            key: 'created_at',
            render: date => new Date(date).toLocaleDateString('pt-BR'),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<Edit size={16} />}
                        onClick={() => handleEditRole(record)}
                    >
                        Alterar Perfil
                    </Button>
                </Space>
            ),
        },
    ];

    // ---------- Render ----------
    return (
        <div>
            {/* Header with role counters */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}
            >
                <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
                    Gestão de Usuários
                </h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    {ROLES.map(role => (
                        <Tag key={role.value} color={role.color}>
                            {users.filter(u => u.role === role.value).length} {role.label}
                        </Tag>
                    ))}
                </div>
            </div>

            {/* Users table */}
            <Table
                columns={columns}
                dataSource={users}
                rowKey="user_id"
                loading={loading}
                pagination={{ pageSize: 15 }}
            />

            {/* Edit role modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Shield size={20} />
                        <span>Alterar Perfil do Usuário</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                {editingUser && (
                    <div
                        style={{
                            marginBottom: 16,
                            padding: 12,
                            background: '#f5f5f5',
                            borderRadius: 8,
                        }}
                    >
                        <p style={{ margin: 0, fontSize: 14 }}>
                            <strong>{editingUser.nome || 'Usuário'}</strong>
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                            {editingUser.email}
                        </p>
                    </div>
                )}

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="role"
                        label="Perfil"
                        rules={[{ required: true, message: 'Selecione um perfil' }]}
                    >
                        <Select size="large">
                            {ROLES.map(role => (
                                <Select.Option key={role.value} value={role.value}>
                                    <Tag color={role.color} style={{ marginRight: 8 }}>
                                        {role.label}
                                    </Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <div
                        style={{
                            padding: 12,
                            background: '#fff7e6',
                            border: '1px solid #ffd591',
                            borderRadius: 4,
                            marginBottom: 16,
                            fontSize: 12,
                            color: '#8c6d00',
                        }}
                    >
                        <strong>⚠️ Atenção:</strong> Alterar o perfil pode modificar as
                        permissões de acesso do usuário.
                    </div>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    form.resetFields();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Confirmar Alteração
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
