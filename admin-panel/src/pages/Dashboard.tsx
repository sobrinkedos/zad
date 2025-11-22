import { Card, Row, Col, Statistic } from 'antd'
import { DollarSign, Users, MapPin, AlertCircle } from 'lucide-react'

export default function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Arrecadação Hoje"
                            value={1250.50}
                            precision={2}
                            prefix="R$"
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarSign size={20} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Sessões Ativas"
                            value={42}
                            prefix={<Users size={20} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Zonas Cadastradas"
                            value={8}
                            prefix={<MapPin size={20} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Multas Hoje"
                            value={5}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<AlertCircle size={20} />}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
