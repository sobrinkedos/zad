import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, DatePicker, Space, Button, message } from 'antd'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'

export default function Reports() {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().startOf('day'), dayjs().endOf('day')])
  const [loading, setLoading] = useState(false)
  const [revenue, setRevenue] = useState(0)
  const [sessions, setSessions] = useState(0)
  const [penalties, setPenalties] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const start = range[0].toISOString()
      const end = range[1].toISOString()
      const [{ count: sessCnt }, { count: penCnt }, trxRes] = await Promise.all([
        supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('inicio', start).lte('inicio', end),
        supabase.from('penalties').select('*', { count: 'exact', head: true }).gte('created_at', start).lte('created_at', end),
        supabase.from('transactions').select('valor, tipo, created_at').gte('created_at', start).lte('created_at', end),
      ])
      setSessions(sessCnt || 0)
      setPenalties(penCnt || 0)
      const list = (trxRes.data || []).filter((t: any) => t.tipo === 'compra')
      const sum = list.reduce((acc: number, x: any) => acc + Number(x.valor || 0), 0)
      setRevenue(sum)
    } catch (err: any) {
      const msg = String(err?.message || '')
      if (msg.includes('Abort') || msg.includes('ERR_ABORTED')) return
      message.error('Erro ao carregar relatórios: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const exportCsv = async () => {
    try {
      const start = range[0].toISOString()
      const end = range[1].toISOString()
      const { data } = await supabase
        .from('transactions')
        .select('created_at, tipo, valor')
        .gte('created_at', start)
        .lte('created_at', end)
      const rows = [['created_at','tipo','valor'], ...((data||[]).map((r:any)=>[r.created_at, r.tipo, String(r.valor)]))]
      const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_transacoes_${range[0].format('YYYYMMDD')}_${range[1].format('YYYYMMDD')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      message.error('Erro ao exportar CSV')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Relatórios</h1>
        <Space>
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => { if (v && v[0] && v[1]) setRange([v[0], v[1]]) }}
            showTime
            format="YYYY-MM-DD HH:mm"
          />
          <Button type="primary" onClick={load} loading={loading}>Atualizar</Button>
          <Button onClick={exportCsv}>Exportar CSV</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Arrecadação (R$)" value={revenue} precision={2} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Sessões (início no período)" value={sessions} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Multas (no período)" value={penalties} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}