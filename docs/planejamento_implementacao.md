# Planejamento de Implementação - Zona Azul Digital (ZAD)

Este documento define o cronograma e as tarefas para a implementação completa do sistema ZAD, baseado no PRD (`docs/projeto.md`) e no estado atual do projeto.

## 📅 Visão Geral do Cronograma

| Fase | Componente | Descrição | Status | Estimativa |
|---|---|---|---|---|
| **1** | **Fundação & Web Motorista** | Estrutura base, Supabase e Web App para motoristas (Vue 3). | 🟡 Em Andamento | Semanas 1-2 |
| **2** | **Painel Administrativo** | Sistema Web (React) para Prefeitura e Gestão de Frotas. | 🔴 Não Iniciado | Semanas 3-5 |
| **3** | **App Motorista (Native)** | App Mobile (React Native) para motoristas. | 🔴 Não Iniciado | Semanas 6-8 |
| **4** | **App Fiscal (Native)** | App Mobile (React Native) para fiscais com OCR. | 🔴 Não Iniciado | Semanas 8-10 |
| **5** | **Integração & Polimento** | Pagamentos reais, notificações push, testes de carga. | 🔴 Não Iniciado | Semanas 11-12 |

---

## ✅ Detalhamento das Tarefas

### Fase 1: Fundação & Web Motorista (Vue 3)
*Foco: Validar regras de negócio básicas e fluxo de usuário.*

- [x] **Setup Inicial**
    - [x] Configuração do Supabase (Auth, Tabelas Básicas).
    - [x] Criação do projeto `vite-app` (Vue 3 + Tailwind).
- [x] **Funcionalidades Web Motorista**
    - [x] Autenticação (Login/Cadastro).
    - [x] Dashboard com saldo e veículos.
    - [x] Cadastro de Veículos.
    - [x] Simulação de Compra de Créditos.
    - [x] Simulação de Estacionamento (Sessão).

### Fase 2: Painel Administrativo (React)
*Foco: Gestão do sistema pela Prefeitura e Frotas.*

- [ ] **Setup do Projeto**
    - [ ] Criar projeto `admin-panel` (React + Vite + TypeScript).
    - [ ] Configurar UI Kit (Ant Design ou Tailwind).
    - [ ] Configurar Rotas e Autenticação (Role-based: Admin, Frota).
- [ ] **Gestão de Zonas (Prefeitura)**
    - [ ] CRUD de Zonas (Nome, Valor/Hora, Horários).
    - [ ] Visualização de Zonas no Mapa.
- [ ] **Gestão de Usuários**
    - [ ] Cadastro de Fiscais.
    - [ ] Gestão de Empresas de Frota.
- [ ] **Relatórios & Financeiro**
    - [ ] Dashboard de Arrecadação em Tempo Real.
    - [ ] Histórico de Sessões e Multas.

### Fase 3: App Motorista (React Native)
*Foco: Experiência nativa para o cidadão.*

- [ ] **Setup do Projeto**
    - [ ] Criar projeto `mobile-driver` (Expo + React Native).
    - [ ] Configurar Navegação e Estilos (NativeBase ou Tamagui).
- [ ] **Portar Funcionalidades**
    - [ ] Login/Cadastro (Social Login).
    - [ ] Carteira Digital (Créditos).
    - [ ] Meus Veículos.
- [ ] **Estacionamento**
    - [ ] Mapa com Geolocalização das Zonas.
    - [ ] Ativação de Sessão via GPS ou QR Code.
    - [ ] Alertas Push (15min antes de vencer).

### Fase 4: App Fiscal (React Native)
*Foco: Ferramenta de trabalho do fiscal.*

- [ ] **Funcionalidades Específicas**
    - [ ] Login Restrito (Apenas Fiscais).
    - [ ] Leitura de Placa (OCR) e QR Code.
    - [ ] Consulta de Status (Sessão Ativa/Inativa).
    - [ ] Emissão de AIT (Multa) com Fotos e Geolocalização.
    - [ ] Modo Offline (Sincronização posterior).

### Fase 5: Integração & Polimento
- [ ] **Pagamentos**
    - [ ] Integração real com Gateway de Pagamento (Pix).
- [ ] **Notificações**
    - [ ] Configurar Push Notifications (Firebase/Expo).
- [ ] **Infraestrutura**
    - [ ] Regras de Segurança no Supabase (RLS).
    - [ ] Backup e Logs.

---

## 📝 Próximos Passos Imediatos

1.  Criar o projeto **Painel Administrativo** em React.
2.  Definir a estrutura de dados para **Zonas** e **Tarifas** no Supabase.
3.  Implementar o CRUD de Zonas no Painel.
