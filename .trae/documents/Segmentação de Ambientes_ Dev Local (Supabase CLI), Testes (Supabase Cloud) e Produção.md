# Integração MCP com Supabase (usando token do projeto)

## Objetivo

* Configurar um servidor MCP para Supabase que permita consultar dados, acionar Edge Functions e operar recursos (Storage/Realtime) com **princípio de menor privilégio**, usando o **token do projeto** apenas onde ele é necessário.

## Tokens e Permissões

* `sbp_*` (token do projeto): uso na **Supabase Management API** e em tarefas administrativas (NUNCA em cliente web/mobile).

* `anon` key: leitura autenticada no cliente (web/admin e apps Expo) sob **RLS**.

* `service_role` key: apenas em Functions/servidor MCP para operações que exigem bypass de RLS (críticas e auditáveis).

## Variáveis de Ambiente

* Dev Local (CLI):

  * `MCP_SUPABASE_URL=http://localhost:54321`

  * `MCP_SUPABASE_ANON_KEY=<anon local>`

  * `MCP_SUPABASE_SERVICE_ROLE=<service local>`

  * `MCP_SUPABASE_PROJECT_TOKEN=<sbp_local | opcional>`

* Staging/Prod (Cloud):

  * `MCP_SUPABASE_URL=https://<project>.supabase.co`

  * `MCP_SUPABASE_ANON_KEY=<anon>`

  * `MCP_SUPABASE_SERVICE_ROLE=<service_role>` (apenas secrets do MCP)

  * `MCP_SUPABASE_PROJECT_TOKEN=<sbp_...>` (apenas se for necessário o Management API)

## Configuração do Servidor MCP

* Adicionar servidor `supabase` na configuração MCP do IDE com argumentos:

  * `url`, `anonKey` para operações seguras de leitura/consulta.

  * `serviceRole` restrito a rotas MCP que precisem bypass (ex.: job de conciliação, agregações admin).

  * `projectToken` apenas se forem expostas capacidades de administração via Management API (opcional).

* Padrões de segurança:

  * O MCP não expõe `service_role` às ferramentas do cliente; todas as ações sensíveis passam pelo servidor MCP com auditoria.

  * Rate limiting e logs estruturados por ação.

## Capacidades MCP

* Consultas tipadas (SDK supabase-js) com respeito às policies RLS.

* Execução de Edge Functions (ex.: `sessions/start`, `payments/credits`, `enforcement/penalize`).

* Operações em Storage (upload de evidências fiscais) com escopos por bucket.

* Canal Realtime para `sessions` e dashboards admin.

* (Opcional) Management API para tarefas administrativas (apenas com `sbp_*`, limitado e auditado).

## Testes de Validação

* Listar `zones`, criar/ler `vehicles` do usuário autenticado (RLS).

* Iniciar/estender/encerrar `sessions` via Edge Functions.

* Emitir `penalties` (fiscal) com upload em Storage e leitura auditável.

* Realtime: receber eventos de mudança de `sessions`.

## Segurança e Conformidade

* Segredos em `.env` e secrets do MCP/CI; `docs/credenciais.md` **fora do versionamento**.

* Rotação imediata das chaves expostas; auditoria das ações MCP.

* LGPD: acesso mínimo, anonimização em ambientes de teste, retenção definida.

## Próximos Passos

* Mapear variáveis por ambiente e inserir no config do MCP do IDE.

* Ativar capacidades: consultas, Edge Functions, Storage e Realtime.

* Executar testes de validação com contas de demo (staging) e ajustar policies RLS conforme necessário.

