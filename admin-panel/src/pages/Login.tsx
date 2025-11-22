import { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'

const { Title, Text } = Typography

export default function Login() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const reason = new URLSearchParams(location.search).get('reason')
        if (reason === 'unauthorized') {
            message.warning('Acesso restrito: é necessário perfil Admin ou Superadmin')
        }
    }, [location.search])

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password
            })

            if (error) throw error
            const { data } = await supabase.auth.getUser()
            const role = (data.user?.app_metadata as any)?.app_role || (data.user?.user_metadata as any)?.app_role
            if (role !== 'admin' && role !== 'superadmin') {
                message.error('Seu perfil não possui acesso ao Painel Administrativo')
                return
            }
            navigate('/')
        } catch (error: any) {
            console.error('Erro ao fazer login:', error)
            alert(error.message || 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            padding: '20px'
        }}>
            <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 8 }}>Painel Administrativo</Title>
                    <Text type="secondary">Zona Azul Digital</Text>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Por favor, insira seu email!' },
                            { type: 'email', message: 'Email inválido!' }
                        ]}
                    >
                        <Input
                            prefix={<Mail size={18} />}
                            placeholder="Email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
                    >
                        <Input.Password
                            prefix={<Lock size={18} />}
                            placeholder="Senha"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Entrar
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Acesso restrito apenas para administradores
                    </Text>
                </div>
            </Card>
        </div>
    )
}
