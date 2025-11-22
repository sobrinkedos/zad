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
    Input,
} from 'antd';
import { Edit, Shield, UserPlus } from 'lucide-react';
import dayjs from 'dayjs';
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

interface Municipality {
    id: string;
    nome: string;
    status: string;
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
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [search, setSearch] = useState<string>('');

    // ---------- Data loading ----------
    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('accounts').select('*');
            if (error) throw error;
            setUsers(data as User[]);
        } catch (err: any) {
            const msg = String(err?.message || '');
            if (msg.includes('Abort') || msg.includes('ERR_ABORTED')) return;
            message.error('Erro ao carregar usuários: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const loadMunicipalities = async () => {
        try {
            const { data, error } = await supabase.from('municipalities').select('id,nome,status').eq('status','ativo');
            if (error) throw error;
            setMunicipalities(data as Municipality[]);
        } catch (err: any) {
            const msg = String(err?.message || '');
            if (msg.includes('Abort') || msg.includes('ERR_ABORTED')) return;
        }
    };

    useEffect(() => {
        const t = setTimeout(() => { loadUsers(); loadMunicipalities(); }, 500);
        return () => clearTimeout(t);
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
                .update({ role: values.role, municipality_id: values.municipality_id || null })
                .eq('user_id', editingUser.user_id);
            if (error) throw error;
            message.success('Perfil atualizado com sucesso!');
            setIsModalOpen(false);
            loadUsers();
        } catch (err: any) {
            message.error('Erro ao atualizar perfil: ' + err.message);
        }
    };

    const handleCreate = async (values: any) => {
        try {
            const { error } = await supabase.functions.invoke('admin-create-user', {
                body: {
                    email: values.email,
                    password: values.password,
                    role: values.role,
                    nome: values.nome,
                    cpf: values.cpf,
                    municipality_id: values.municipality_id || null,
                }
            })
            if (error) throw error
            message.success('Usuário criado com sucesso!')
            setIsCreateOpen(false)
            createForm.resetFields()
            loadUsers()
        } catch (err: any) {
            message.error('Erro ao criar usuário: ' + err.message)
        }
    }

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
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
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
                <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Gestão de Usuários</h1>
                <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setIsCreateOpen(true)}>
                    Criar Usuário
                </Button>
                <div style={{ display: 'flex', gap: 8 }}>
                    {ROLES.map(role => (
                        <Tag key={role.value} color={role.color}>
                            {users.filter(u => u.role === role.value).length} {role.label}
                        </Tag>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Input.Search placeholder="Buscar por nome ou email" allowClear onSearch={v => setSearch(v)} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
            </div>

            {/* Users table */}
            <Table
                columns={columns}
                dataSource={users.filter(u => {
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    return (u.nome || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
                })}
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
                    <Form.Item name="municipality_id" label="Município">
                        <Select
                            size="large"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={municipalities.map(m => ({ label: m.nome, value: m.id }))}
                        />
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

            {/* Create user modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserPlus size={20} />
                        <span>Criar Usuário</span>
                    </div>
                }
                open={isCreateOpen}
                onCancel={() => {
                    setIsCreateOpen(false);
                    createForm.resetFields();
                }}
                footer={null}
                width={520}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>                    
                        <Input placeholder="email@exemplo.com" />
                    </Form.Item>
                    <Form.Item name="password" label="Senha" rules={[{ required: true, min: 6 }]}>                   
                        <Input.Password placeholder="Senha temporária" />
                    </Form.Item>
                    <Form.Item name="nome" label="Nome">                                           
                        <Input placeholder="Nome completo" />
                    </Form.Item>
                    <Form.Item name="cpf" label="CPF">                                             
                        <Input placeholder="CPF" />
                    </Form.Item>
                    <Form.Item name="municipality_id" label="Município (opcional)">               
                        <Select
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={municipalities.map(m => ({ label: m.nome, value: m.id }))}
                        />
                    </Form.Item>
                    <Form.Item name="role" label="Perfil" rules={[{ required: true }]}>           
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

                    <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => { setIsCreateOpen(false); createForm.resetFields(); }}>Cancelar</Button>
                            <Button type="primary" htmlType="submit">Criar</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
