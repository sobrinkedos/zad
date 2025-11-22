import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, DatePicker, Space, Button, message, Select, Table, Dropdown } from 'antd'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'

export default function Reports() {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().startOf('day'), dayjs().endOf('day')])
  const [loading, setLoading] = useState(false)
  const [revenue, setRevenue] = useState(0)
  const [sessions, setSessions] = useState(0)
  const [penalties, setPenalties] = useState(0)
  const [municipalities, setMunicipalities] = useState<Array<{ id: string; nome: string }>>([])
  const [zones, setZones] = useState<Array<{ id: string; nome: string }>>([])
  const [municipalityId, setMunicipalityId] = useState<string | undefined>(undefined)
  const [zoneId, setZoneId] = useState<string | undefined>(undefined)
  const [daily, setDaily] = useState<Array<{ date: string; revenue: number; sessions: number; penalties: number }>>([])
  const [dailyTypes, setDailyTypes] = useState<Array<{ date: string; compras: number; comprasValor: number; usos: number; usosValor: number; estornos: number; estornosValor: number }>>([])

  const load = async () => {
    setLoading(true)
    try {
      const start = range[0].toISOString()
      const end = range[1].toISOString()
      // Filters
      let accountsUserIds: string[] | null = null
      if (municipalityId) {
        const { data: accIds } = await supabase.from('accounts').select('user_id').eq('municipality_id', municipalityId)
        accountsUserIds = (accIds || []).map((a: any) => a.user_id)
      }

      // Query sessions
      let sessionsQuery = supabase.from('sessions').select('user_id, inicio').gte('inicio', start).lte('inicio', end)
      if (zoneId) sessionsQuery = sessionsQuery.eq('zone_id', zoneId)
      if (accountsUserIds && accountsUserIds.length) sessionsQuery = sessionsQuery.in('user_id', accountsUserIds)
      const sessRes = await sessionsQuery
      const sessData = (sessRes.data || [])

      // Query penalties (filterable by zone)
      let penaltiesQuery = supabase.from('penalties').select('created_at, zone_id').gte('created_at', start).lte('created_at', end)
      if (zoneId) penaltiesQuery = penaltiesQuery.eq('zone_id', zoneId)
      const penRes = await penaltiesQuery
      const penData = (penRes.data || [])

      // Query transactions (filterable by municipality via accounts user_id)
      let trxQuery = supabase.from('transactions').select('valor, tipo, created_at, user_id').gte('created_at', start).lte('created_at', end)
      if (accountsUserIds && accountsUserIds.length) trxQuery = trxQuery.in('user_id', accountsUserIds)
      const trxRes = await trxQuery
      const trxData = (trxRes.data || [])

      // Totals
      const revenueList = trxData.filter((t: any) => t.tipo === 'compra')
      const revenueSum = revenueList.reduce((acc: number, x: any) => acc + Number(x.valor || 0), 0)
      setRevenue(revenueSum)
      setSessions(sessData.length)
      setPenalties(penData.length)

      // Daily grouping
      const map: Record<string, { revenue: number; sessions: number; penalties: number }> = {}
      const typesMap: Record<string, { compras: number; comprasValor: number; usos: number; usosValor: number; estornos: number; estornosValor: number }> = {}
      const keyFn = (d: string) => dayjs(d).format('YYYY-MM-DD')
      revenueList.forEach((t: any) => {
        const k = keyFn(t.created_at)
        map[k] = map[k] || { revenue: 0, sessions: 0, penalties: 0 }
        map[k].revenue += Number(t.valor || 0)
        typesMap[k] = typesMap[k] || { compras: 0, comprasValor: 0, usos: 0, usosValor: 0, estornos: 0, estornosValor: 0 }
        typesMap[k].compras += 1
        typesMap[k].comprasValor += Number(t.valor || 0)
      })
      trxData.filter((t: any) => t.tipo === 'uso').forEach((t: any) => {
        const k = keyFn(t.created_at)
        typesMap[k] = typesMap[k] || { compras: 0, comprasValor: 0, usos: 0, usosValor: 0, estornos: 0, estornosValor: 0 }
        typesMap[k].usos += 1
        typesMap[k].usosValor += Number(t.valor || 0)
      })
      trxData.filter((t: any) => t.tipo === 'estorno').forEach((t: any) => {
        const k = keyFn(t.created_at)
        typesMap[k] = typesMap[k] || { compras: 0, comprasValor: 0, usos: 0, usosValor: 0, estornos: 0, estornosValor: 0 }
        typesMap[k].estornos += 1
        typesMap[k].estornosValor += Number(t.valor || 0)
      })
      sessData.forEach((s: any) => {
        const k = keyFn(s.inicio)
        map[k] = map[k] || { revenue: 0, sessions: 0, penalties: 0 }
        map[k].sessions += 1
      })
      penData.forEach((p: any) => {
        const k = keyFn(p.created_at)
        map[k] = map[k] || { revenue: 0, sessions: 0, penalties: 0 }
        map[k].penalties += 1
      })
      const rows = Object.entries(map)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, v]) => ({ date, ...v }))
      setDaily(rows)
      const typeRows = Object.entries(typesMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, v]) => ({ date, ...v }))
      setDailyTypes(typeRows)
    } catch (err: any) {
      const msg = String(err?.message || '')
      if (msg.includes('Abort') || msg.includes('ERR_ABORTED')) return
      message.error('Erro ao carregar relatórios: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(); (async () => {
    try {
      const [{ data: ms }, { data: zs }] = await Promise.all([
        supabase.from('municipalities').select('id,nome').eq('status','ativo'),
        supabase.from('zones').select('id,nome')
      ])
      setMunicipalities((ms||[]) as any)
      setZones((zs||[]) as any)
    } catch {}
  })() }, [])

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

  const exportAggregatedCsv = () => {
    const rows = [['date','revenue','sessions','penalties'], ...daily.map(r => [r.date, String(r.revenue), String(r.sessions), String(r.penalties)])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_agregado_${range[0].format('YYYYMMDD')}_${range[1].format('YYYYMMDD')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportSessionsCsv = async () => {
    try {
      const start = range[0].toISOString()
      const end = range[1].toISOString()
      let q = supabase.from('sessions').select('id,user_id,zone_id,inicio,fim,status').gte('inicio', start).lte('inicio', end)
      if (zoneId) q = q.eq('zone_id', zoneId)
      const { data } = await q
      const rows = [['id','user_id','zone_id','inicio','fim','status'], ...((data||[]).map((r:any)=>[r.id, r.user_id, r.zone_id, r.inicio, r.fim, r.status]))]
      const csv = rows.map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sessoes_${range[0].format('YYYYMMDD')}_${range[1].format('YYYYMMDD')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      message.error('Erro ao exportar sessões')
    }
  }

  const exportPenaltiesCsv = async () => {
    try {
      const start = range[0].toISOString()
      const end = range[1].toISOString()
      let q = supabase.from('penalties').select('id,vehicle_id,zone_id,fiscal_id,valor,motivo,created_at,status').gte('created_at', start).lte('created_at', end)
      if (zoneId) q = q.eq('zone_id', zoneId)
      const { data } = await q
      const rows = [['id','vehicle_id','zone_id','fiscal_id','valor','motivo','created_at','status'], ...((data||[]).map((r:any)=>[r.id, r.vehicle_id, r.zone_id, String(r.valor), r.motivo, r.created_at, r.status]))]
      const csv = rows.map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `multas_${range[0].format('YYYYMMDD')}_${range[1].format('YYYYMMDD')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      message.error('Erro ao exportar multas')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Relatórios</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => { if (v && v[0] && v[1]) setRange([v[0], v[1]]) }}
            showTime
            format="DD/MM/YYYY HH:mm"
            size="small"
            style={{ minWidth: 260, flex: '1 1 280px' }}
          />
          <Select allowClear placeholder="Município" value={municipalityId} onChange={setMunicipalityId} size="small" style={{ minWidth: 200, flex: '1 1 220px' }} showSearch filterOption={(input, option) => (option?.children as string).toLowerCase().includes(input.toLowerCase())}>
            {municipalities.map(m => (<Select.Option key={m.id} value={m.id}>{m.nome}</Select.Option>))}
          </Select>
          <Select allowClear placeholder="Zona" value={zoneId} onChange={setZoneId} size="small" style={{ minWidth: 200, flex: '1 1 220px' }} showSearch filterOption={(input, option) => (option?.children as string).toLowerCase().includes(input.toLowerCase())}>
            {zones.map(z => (<Select.Option key={z.id} value={z.id}>{z.nome}</Select.Option>))}
          </Select>
          <Button type="primary" size="small" onClick={load} loading={loading}>Atualizar</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'csv', label: 'Exportar CSV' },
                { key: 'csv-agregado', label: 'Exportar CSV (Agregado)' },
                { key: 'sess', label: 'Exportar Sessões' },
                { key: 'mult', label: 'Exportar Multas' },
              ],
              onClick: ({ key }) => {
                if (key === 'csv') return exportCsv()
                if (key === 'csv-agregado') return exportAggregatedCsv()
                if (key === 'sess') return exportSessionsCsv()
                if (key === 'mult') return exportPenaltiesCsv()
              }
            }}
          >
            <Button size="small">Exportar</Button>
          </Dropdown>
        </div>
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

      <Card style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Visualização diária</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {daily.map((r) => (
            <div key={r.date} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 12 }}>
              <div style={{ color: '#666' }}>{dayjs(r.date).format('DD/MM/YYYY')}</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {(() => {
                  const max = Math.max(1, ...daily.map(d => d.revenue))
                  const width = Math.round((r.revenue / max) * 100)
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: `${width}%`, height: 8, background: '#1677ff', borderRadius: 4 }} />
                      <span style={{ fontSize: 12 }}>R$ {r.revenue.toFixed(2)}</span>
                    </div>
                  )
                })()}
                {(() => {
                  const max = Math.max(1, ...daily.map(d => d.sessions))
                  const width = Math.round((r.sessions / max) * 100)
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: `${width}%`, height: 8, background: '#52c41a', borderRadius: 4 }} />
                      <span style={{ fontSize: 12 }}>{r.sessions} sessões</span>
                    </div>
                  )
                })()}
                {(() => {
                  const max = Math.max(1, ...daily.map(d => d.penalties))
                  const width = Math.round((r.penalties / max) * 100)
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: `${width}%`, height: 8, background: '#faad14', borderRadius: 4 }} />
                      <span style={{ fontSize: 12 }}>{r.penalties} multas</span>
                    </div>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Table
          dataSource={daily}
          rowKey={r => r.date}
          pagination={false}
          columns={[
            { title: 'Data', dataIndex: 'date', key: 'date', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
            { title: 'Arrecadação (R$)', dataIndex: 'revenue', key: 'revenue', render: (v: number) => v.toFixed(2) },
            { title: 'Sessões', dataIndex: 'sessions', key: 'sessions' },
            { title: 'Multas', dataIndex: 'penalties', key: 'penalties' },
          ]}
        />
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Table
          dataSource={dailyTypes}
          rowKey={r => r.date}
          pagination={false}
          columns={[
            { title: 'Data', dataIndex: 'date', key: 'date', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
            { title: 'Compras (R$)', dataIndex: 'comprasValor', key: 'comprasValor', render: (v: number) => v.toFixed(2) },
            { title: 'Compras (Qtd)', dataIndex: 'compras', key: 'compras' },
            { title: 'Usos (R$)', dataIndex: 'usosValor', key: 'usosValor', render: (v: number) => v.toFixed(2) },
            { title: 'Usos (Qtd)', dataIndex: 'usos', key: 'usos' },
            { title: 'Estornos (R$)', dataIndex: 'estornosValor', key: 'estornosValor', render: (v: number) => v.toFixed(2) },
            { title: 'Estornos (Qtd)', dataIndex: 'estornos', key: 'estornos' },
          ]}
        />
      </Card>

      {/* Resumo por zona */}
      <Card style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Resumo por Zona</h3>
        {(() => {
          const zoneNames = Object.fromEntries(zones.map(z => [z.id, z.nome]))
          // Build zone stats from sessData & penData already aggregated payloads via daily calculation context
          // Recompute for simplicity in UI: query needed again when pressing Atualizar
          return null
        })()}
      </Card>
    </div>
  )
}