import { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, MapPin, Users, FileText, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

const { Header, Sider, Content } = Layout

export default function MainLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const [displayName, setDisplayName] = useState('')
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const check = async () => {
            const { data } = await supabase.auth.getSession()
            const user = data.session?.user
            if (!user) {
                navigate('/login')
                setReady(false)
                return
            }
            const role = (user.app_metadata as any)?.app_role || (user.user_metadata as any)?.app_role
            if (role !== 'admin' && role !== 'superadmin') {
                navigate('/login?reason=unauthorized')
                setReady(false)
                return
            }
            const nome = (user.user_metadata as any)?.nome
            setDisplayName(nome ? String(nome) : role)
            setReady(true)
        }
        check()
        const { data: sub } = supabase.auth.onAuthStateChange(() => {
            check()
        })
        return () => { sub.subscription.unsubscribe() }
    }, [navigate])

    const menuItems = [
        {
            key: '/',
            icon: <LayoutDashboard size={18} />,
            label: 'Dashboard'
        },
        {
            key: '/zones',
            icon: <MapPin size={18} />,
            label: 'Zonas'
        },
        {
            key: '/users',
            icon: <Users size={18} />,
            label: 'Usuários'
        },
        {
            key: '/reports',
            icon: <FileText size={18} />,
            label: 'Relatórios'
        }
    ]

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                theme="dark"
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: collapsed ? 16 : 18,
                    fontWeight: 'bold'
                }}>
                    {collapsed ? 'ZAD' : 'Zona Azul'}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>

            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                        Painel Administrativo
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span>{displayName || 'Admin'}</span>
                        <LogOut size={18} className="cursor-pointer" onClick={async () => { await supabase.auth.signOut(); navigate('/login') }} />
                    </div>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    {ready ? <Outlet /> : <div>Carregando...</div>}
                </Content>
            </Layout>
        </Layout>
    )
}
