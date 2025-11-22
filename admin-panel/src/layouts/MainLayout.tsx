import { useState } from 'react'
import { Layout, Menu } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, MapPin, Users, FileText, LogOut } from 'lucide-react'

const { Header, Sider, Content } = Layout

export default function MainLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

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
                        <span>Admin</span>
                        <LogOut size={18} className="cursor-pointer" />
                    </div>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}
