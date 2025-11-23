import { Card, Row, Col, Statistic, Select } from 'antd'
import { DollarSign, Users, MapPin, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts'
import dayjs from 'dayjs'

export default function Dashboard() {
    const [revenueToday, setRevenueToday] = useState<number>(0)
    const [sessionsActive, setSessionsActive] = useState<number>(0)
    const [zonesCount, setZonesCount] = useState<number>(0)
    const [penaltiesToday, setPenaltiesToday] = useState<number>(0)
    const [chartData, setChartData] = useState<any[]>([])
    const [period, setPeriod] = useState<'7d' | '30d'>('7d')

    useEffect(() => {
        const load = async () => {
            const now = dayjs()
            const startToday = now.startOf('day').toISOString()
            const endToday = now.endOf('day').toISOString()

            const days = period === '7d' ? 7 : 30
            const startChart = now.subtract(days - 1, 'day').startOf('day').toISOString()

            try {
                const [
                    { count: zonesCnt },
                    { count: sessCnt },
                    revRes,
                    { count: penCnt },
                    chartTrx,
                    chartSess
                ] = await Promise.all([
                    supabase.from('zones').select('*', { count: 'exact', head: true }),
                    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'ativa'),
                    supabase.from('transactions').select('valor, tipo').gte('created_at', startToday).lte('created_at', endToday),
                    supabase.from('penalties').select('*', { count: 'exact', head: true }).gte('created_at', startToday).lte('created_at', endToday),
                    supabase.from('transactions').select('valor, tipo, created_at').gte('created_at', startChart).order('created_at'),
                    supabase.from('sessions').select('inicio').gte('inicio', startChart).order('inicio')
                ])

                setZonesCount(zonesCnt || 0)
                setSessionsActive(sessCnt || 0)
                setPenaltiesToday(penCnt || 0)

                const list = (revRes.data || []).filter((t: any) => t.tipo === 'compra')
                const sum = list.reduce((acc: number, x: any) => acc + Number(x.valor || 0), 0)
                setRevenueToday(sum)

                // Process Chart Data
                const dataMap: Record<string, { date: string, revenue: number, sessions: number }> = {}

                // Initialize all days
                for (let i = 0; i < days; i++) {
                    const d = now.subtract(days - 1 - i, 'day').format('YYYY-MM-DD')
                    dataMap[d] = { date: dayjs(d).format('DD/MM'), revenue: 0, sessions: 0 }
                }

                (chartTrx.data || []).forEach((t: any) => {
                    if (t.tipo === 'compra') {
                        const d = dayjs(t.created_at).format('YYYY-MM-DD')
                        if (dataMap[d]) {
                            dataMap[d].revenue += Number(t.valor)
                        }
                    }
                });

                (chartSess.data || []).forEach((s: any) => {
                    const d = dayjs(s.inicio).format('YYYY-MM-DD')
                    if (dataMap[d]) {
                        dataMap[d].sessions += 1
                    }
                })

                setChartData(Object.values(dataMap))

            } catch (err: any) {
                const msg = String(err?.message || '')
                if (msg.includes('Abort') || msg.includes('ERR_ABORTED')) return
            }
        }
        load()
    }, [period])

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Dashboard</h1>
                <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
                    <Select.Option value="7d">Últimos 7 dias</Select.Option>
                    <Select.Option value="30d">Últimos 30 dias</Select.Option>
                </Select>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Arrecadação Hoje"
                            value={revenueToday}
                            precision={2}
                            prefix={<DollarSign size={20} />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Sessões Ativas"
                            value={sessionsActive}
                            prefix={<Users size={20} />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Zonas Cadastradas"
                            value={zonesCount}
                            prefix={<MapPin size={20} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Multas Hoje"
                            value={penaltiesToday}
                            prefix={<AlertCircle size={20} />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Arrecadação (R$)">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" name="Receita" stroke="#82ca9d" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Sessões de Estacionamento">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sessions" name="Sessões" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
