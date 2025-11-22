import { Card, Row, Col, Statistic } from 'antd'
import { DollarSign, Users, MapPin, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
    const [revenueToday, setRevenueToday] = useState<number>(0)
    const [sessionsActive, setSessionsActive] = useState<number>(0)
    const [zonesCount, setZonesCount] = useState<number>(0)
    const [penaltiesToday, setPenaltiesToday] = useState<number>(0)

    useEffect(() => {
        const load = async () => {
            const start = new Date()
            start.setHours(0,0,0,0)
            const end = new Date()
            end.setHours(23,59,59,999)
            try {
                const [{ count: zonesCnt }, { count: sessCnt }, revRes, { count: penCnt }] = await Promise.all([
                    supabase.from('zones').select('*', { count: 'exact', head: true }),
                    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'ativa'),
                    supabase.from('transactions').select('valor, tipo, created_at').gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
                    supabase.from('penalties').select('*', { count: 'exact', head: true }).gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
                ])

                setZonesCount(zonesCnt || 0)
                setSessionsActive(sessCnt || 0)
                setPenaltiesToday(penCnt || 0)
                const list = (revRes.data || []).filter((t: any) => t.tipo === 'compra')
                const sum = list.reduce((acc: number, x: any) => acc + Number(x.valor || 0), 0)
                setRevenueToday(sum)
            } catch (err: any) {
                const msg = String(err?.message || '')
                if (msg.includes('Abort') || msg.includes('ERR_ABORTED')) return
            }
        }
        const t = setTimeout(() => { load() }, 500)
        return () => clearTimeout(t)
    }, [])

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Dashboard</h1>

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Arrecadação Hoje"
                            value={revenueToday}
                            precision={2}
                            prefix={<DollarSign size={20} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Sessões Ativas"
                            value={sessionsActive}
                            prefix={<Users size={20} />}
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
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
