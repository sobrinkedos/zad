import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Zones from './pages/Zones'
import Users from './pages/Users'
import Login from './pages/Login'

function App() {
  return (
    <ConfigProvider locale={ptBR}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="zones" element={<Zones />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<div>Relatórios (em breve)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
