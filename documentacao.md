# Sistema de Zona Azul Digital - Documentação Técnica

## Visão Geral

Sistema completo de gerenciamento de estacionamento rotativo (Zona Azul) para municipalidades, permitindo que usuários comprem créditos, estacionem em vagas demarcadas e sejam fiscalizados digitalmente.

## Arquitetura do Sistema

### Tecnologias Utilizadas
- Frontend: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- Backend: Node.js com Express.js
- Banco de Dados: SQLite
- Autenticação: JWT (JSON Web Tokens)
- Pagamento: Simulação de múltiplos métodos
- Geolocalização: API de mapas

### Estrutura de Pastas
```
/mnt/okcomputer/output/
├── index.html              # App do motorista
├── fiscal.html             # App do fiscal
├── admin.html              # Painel administrativo
├── main.js                 # Lógica principal
├── database.js             # Gerenciamento do banco
├── resources/              # Arquivos de mídia
│   ├── hero-bg.jpg         # Background do hero
│   ├── user-avatar.jpg     # Avatar padrão
│   ├── fiscal-avatar.jpg   # Avatar fiscal
│   └── admin-avatar.jpg    # Avatar admin
└── README.md               # Documentação
```

## Módulos do Sistema

### 1. Módulo de Usuário (Motorista)
- **Cadastro e Login**: CPF, nome, email, senha
- **Gerenciamento de Veículos**: Múltiplos veículos por usuário
- **Compra de Créditos**: Pacotes e pagamento simulado
- **Estacionamento**: Iniciar/estender sessões
- **Histórico**: Registro de transações e estacionamentos

### 2. Módulo Fiscal
- **Login Corporativo**: Autenticação especial
- **Verificação de Veículos**: Scan de placas e QR codes
- **Aplicação de Penalidades**: Registro de infrações
- **Relatórios**: Verificações realizadas

### 3. Módulo Administrativo
- **Gerenciamento de Zonas**: CRUD de zonas com tarifas
- **Cadastro de Fiscais**: Gerenciamento de usuários fiscais
- **Configurações do Sistema**: Valores, horários, tolerâncias
- **Relatórios e Analytics**: Dashboard com métricas
- **Conciliação Financeira**: Controle de receitas

### 4. Módulo de Pagamentos
- **Créditos Pré-pagos**: Pacotes de tempo
- **Múltiplas Formas**: Pix, cartão, boleto (simulado)
- **Transações Seguras**: Registro completo de operações
- **Estornos**: Gerenciamento de devoluções

## Estrutura do Banco de Dados

### Tabelas Principais

#### users
- id (PRIMARY KEY)
- cpf (UNIQUE)
- nome
- email (UNIQUE)
- senha (hash)
- telefone
- saldo_creditos
- tipo (motorista, fiscal, admin)
- created_at
- updated_at

#### vehicles
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- placa (UNIQUE)
- marca
- modelo
- cor
- ano
- foto_crlv
- created_at

#### zones
- id (PRIMARY KEY)
- nome
- localizacao
- valor_hora
- horario_inicio
- horario_fim
- dias_funcionamento
- tolerancia_minutos
- status
- created_at

#### parking_sessions
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- vehicle_id (FOREIGN KEY)
- zone_id (FOREIGN KEY)
- tempo_inicio
- tempo_fim
- valor_total
- creditos_utilizados
- status (ativa, finalizada, expirada)
- created_at

#### penalties
- id (PRIMARY KEY)
- vehicle_id (FOREIGN KEY)
- fiscal_id (FOREIGN KEY)
- valor
- motivo
- foto_veiculo
- localizacao
- status (ativa, paga, cancelada)
- created_at

#### transactions
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- tipo (compra, uso, estorno)
- valor
- creditos
- metodo_pagamento
- status
- created_at

## Fluxos de Trabalho

### 1. Fluxo de Estacionamento
1. Usuario seleciona veículo
2. Escaneia QR code da vaga ou seleciona zona
3. Informa tempo desejado
4. Sistema calcula custo e verifica saldo
5. Debita créditos e inicia sessão
6. Gera QR code para fiscalização
7. Envia notificações de expiração
8. Permite extensão ou encerramento

### 2. Fluxo de Fiscalização
1. Fiscal escaneia placa ou QR code
2. Sistema verifica sessão ativa
3. Se válida: mostra tempo restante
4. Se inválida: registra infração
5. Tira foto e gera penalidade
6. Imprime ou deixa etiqueta

### 3. Fluxo Administrativo
1. Admin acessa painel com 2FA
2. Gerencia zonas (CRUD)
3. Configura tarifas e horários
4. Cadastra fiscais
5. Visualiza relatórios e métricas
6. Realiza conciliação financeira

## Segurança e Compliance

### Autenticação
- JWT tokens com expiração
- Refresh tokens para sessões longas
- 2FA para usuários administrativos

### Validações
- CPF e CNPJ válidos
- Formato de placa válido
- Prevenção de SQL injection
- Validação de entrada de dados

### Auditoria
- Logs de todas as transações
- Registro de modificações
- Rastreabilidade completa

## APIs do Sistema

### Autenticação
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout

### Usuários
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/vehicles
- POST /api/users/vehicles
- DELETE /api/users/vehicles/:id

### Zonas
- GET /api/zones
- GET /api/zones/:id
- POST /api/zones (admin)
- PUT /api/zones/:id (admin)
- DELETE /api/zones/:id (admin)

### Estacionamento
- POST /api/parking/start
- PUT /api/parking/extend/:id
- DELETE /api/parking/end/:id
- GET /api/parking/active

### Fiscalização
- POST /api/enforcement/check
- POST /api/enforcement/penalty
- GET /api/enforcement/history

### Pagamentos
- POST /api/payments/credits
- GET /api/payments/transactions
- POST /api/payments/refund/:id

## Configuração e Deploy

### Instalação
1. Clonar repositório
2. Instalar dependências: `npm install`
3. Configurar variáveis de ambiente
4. Inicializar banco: `npm run db:init`
5. Iniciar servidor: `npm start`

### Variáveis de Ambiente
- PORT: Porta do servidor
- JWT_SECRET: Chave secreta JWT
- DB_PATH: Caminho do banco SQLite
- ENV: Ambiente (dev/prod)

## Manutenção e Suporte

### Monitoramento
- Logs de erro detalhados
- Métricas de performance
- Monitoramento de saúde do sistema

### Backup
- Backup automático do banco
- Retenção de dados configurável
- Restauração simplificada

### Suporte
- Documentação completa
- FAQ para usuários
- Canais de atendimento