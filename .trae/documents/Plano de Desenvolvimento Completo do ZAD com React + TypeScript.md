# Plano de Desenvolvimento Completo do ZAD (React + TypeScript, Expo, Supabase)

## Estado Atual

* UI estática (motorista/fiscal/admin) com Tailwind e lógica em `main.js` (serviços de autenticação, veículos, sessões, pagamentos simulados, fiscalização, administração).

* Sem backend real; dados em `localStorage`.

## Objetivo

* Migrar frontend web para **React + TypeScript** (admin).

* Implementar apps nativos em **React Native com Expo** (motorista e fiscal).

* Adotar **Supabase** como backend (Auth, Postgres, Storage, Realtime, Edge Functions).

## Arquitetura Alvo

* **Web Admin (React + TS)**: Vite, React Router, React Query, Tailwind, RHF + Zod.

* **Mobile (Expo RN + TS)**:

  * Motorista: Expo Router, React Query, AsyncStorage/MMKV, `expo-notifications`, `react-native-qrcode-svg`, `expo-location`.

  * Fiscal: Expo Router, offline-first, `expo-camera`/`expo-barcode-scanner`, geolocalização, evidências.

* **Backend Supabase**:

  * Auth (email/OTP, OAuth, phone) com roles via custom claims (`app_role`).

  * Postgres com **Row Level Security (RLS)** e políticas por role.

  * Storage (bucket `evidences` para fotos e documentos; `qrcodes` opcional).

  * Realtime (canal `sessions` para atualizações em tempo real).

  * Edge Functions (Deno) para regras de negócio, pagamentos (webhooks), conciliação e operações fiscais/admin.

  * Tarefas agendadas (Supabase Scheduler / `pg_cron`) para expiração e manutenção.

## Estrutura de Repositório

* `apps/web-admin` (React + TS)

* `apps/user-mobile` (Expo Motorista)

* `apps/fiscal-mobile` (Expo Fiscal)

* `packages/ui-web` (Tailwind componentes web)

* `packages/ui-mobile` (NativeWind/Componentes RN)

* `packages/shared` (types, validações Zod, regras)

* `packages/api` (SDK chamando Edge Functions + consultas Supabase tipadas)

* `supabase/` (migrations SQL, policies RLS, triggers, Edge Functions)

## Modelo de Dados (Postgres)

* `users` (id, cpf/cnpj, nome, email, telefone, role, status)

* `vehicles` (id, user\_id, placa, marca, modelo, cor, ano)

* `zones` (id, nome, polígono, valor\_hora, horário, tolerância, dias, status, vagas)

* `sessions` (id, user\_id, vehicle\_id, zone\_id, inicio, fim, status, `tarifa_aplicada`, `creditos_utilizados`)

* `transactions` (id, user\_id, tipo, valor, metodo, status, session\_id?)

* `penalties` (id, vehicle\_id, zone\_id, fiscal\_id, valor, motivo, evidências\_url, gps, timestamp, status)

* `pricing_rules` (faixas horárias, descontos)

* `notifications`, `audit_logs`

* Índices por placa, zona, status e datas; constraints de integridade.

## RLS e RBAC (exemplos)

* `users`: cada usuário lê próprio registro; admins leem todos.

* `vehicles`: owner CRUD; fiscal read-only; admin full.

* `sessions`: owner lê próprias; fiscal lê ativas por zona; admin full.

* `penalties`: fiscal CRUD próprio; admin gerencia; motoristas leem multas próprias.

## Edge Functions (Deno)

* `payments/credits` (criar transação, atualizar saldo, lidar com gateway e webhooks).

* `sessions/start`, `sessions/extend`, `sessions/end` (calcular custo com `tarifa_aplicada`, aplicar regras).

* `enforcement/check` (consulta por placa, tempo restante, zona); `enforcement/penalize` (registrar AIT, upload evidências para Storage).

* `admin/stats` (agregações; triggers e materialized views para desempenho).

## Realtime e Triggers

* Canal `public:sessions` para atualizações (contagem regressiva no app, estado mudando para `expirada`).

* Triggers para expiração, estorno e métricas (ex.: atualizar `admin_stats` a cada alteração relevante).

## Web Admin (React)

* Páginas: Login/2FA, Zonas (CRUD + import CSV), Usuários (fiscais/admins), Dashboard tempo real, Relatórios financeiros e conciliação.

* Consumo Supabase via `supabase-js` + Edge Functions; políticas RLS garantem segurança no cliente.

## Apps Expo (Motorista/Fiscal)

* **Motorista**: cadastro/login Supabase, veículos, compra de créditos, sessões (start/extend/end), QRCode da sessão, push notifications (`expo-notifications` + Supabase Edge para disparos).

* **Fiscal**: login corporativo, consulta placa (online/offline), emissão de penalidade com foto/GPS/timestamp, sincronização offline → Edge Function.

* **Comum**: supabase-js (persistência de sessão com `expo-secure-store`), i18n, OTA Updates (Expo Updates), deep linking.

## Pagamentos

* Abstração `PaymentProvider`; Edge Functions recebem webhooks do gateway (PIX/cartão/boleto), atualizam `transactions` e saldo.

* Conciliação para Admin; exportação CSV/XML.

## Segurança e LGPD

* Policies RLS rigorosas, JWT com claims e expiração; criptografia de senhas.

* Auditoria, consentimento, retenção/anonimização, prevenção OWASP.

## Observabilidade e Qualidade

* Sentry (web/mobile/functions), logs estruturados nas Edge Functions.

* Testes: unit (Vitest/Jest), integração (supertest via local functions), E2E web (Playwright), E2E mobile (Detox).

## Roadmap

* **Fase 1 – Supabase Base**: schema SQL, RLS, seeds (zonas), Edge Functions esqueleto, SDK.

* **Fase 2 – Motorista (Expo)**: veículos, créditos, sessões, QR, notificações.

* **Fase 3 – Fiscal (Expo)**: consulta placa, penalidade, offline-first, sync.

* **Fase 4 – Admin (Web)**: CRUD zonas/usuários, dashboard, relatórios.

* **Fase 5 – Hardening**: segurança, LGPD, observabilidade, performance.

## Critérios de Pronto

* Paridade das jornadas; RLS cobrindo todos os acessos; testes e CI/CD; Sentry e métricas ativas.

## Próximos Passos

* Provisionar projeto Supabase; definir policies e migrations iniciais.

* Selecionar gateway de pagamento; implementar Edge Functions de pagamento e sessões.

* Bootstrap dos apps Expo e web admin; integrar `packages/api` ao Supabase.

