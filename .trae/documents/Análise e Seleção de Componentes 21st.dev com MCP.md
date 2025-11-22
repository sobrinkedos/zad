## Objetivo
- Selecionar e padronizar componentes modernos do 21st.dev para o ZAD, garantindo visual consistente, acessibilidade e integração com Supabase.

## Diagnóstico do Stack Atual
- Front‑end atual em páginas estáticas (`index.html`, `admin.html`, `fiscal.html`) com Tailwind via CDN, Feather Icons e Chart.js.
- Lógica em `main.js` e módulos de administração (`admin-supabase.js`), além de Edge Functions no Supabase.
- Documento interno indica intenção de migrar para React + TypeScript, o que alinha melhor com os componentes do 21st.dev.

## Critérios de Seleção
- Compatibilidade com React + TypeScript e Tailwind.
- Acessibilidade (ARIA, foco, navegação por teclado).
- Responsividade mobile‑first com bom suporte a desktop.
- Suporte a tema claro/escuro e personalização por tokens.
- Qualidade visual, simplicidade de integração e manutenção.

## Catálogo Prioritário por Tela
- Motorista: App Bar, Auth Card, Form Inputs com labels flutuantes, Cards de Zona, Segmented Control de tempo, Modal de créditos, Toast/Notification, Bottom Navigation, Empty States, Skeleton.
- Admin: App Shell (Navbar/Sidebar), KPI Cards, Tab Group, Data Table (listagens), Modal/Form, Badges/Chips, Charts wrapper, Toast, Breadcrumbs, Pagination.
- Fiscal: App Shell leve, Lista/Detail, Scanner/Upload (evidências), Modal de confirmação, Badges.

## Fluxo com MCP (21st.dev)
- Exploração: usar "Component Inspiration" para buscar variações por categoria (ex.: "auth form", "bottom navigation", "data table", "modal form").
- Shortlist: 2–3 opções por categoria com prós/contras e ajuste visual ao branding (Inter, azuis/púrpuras/âmbares já usados).
- Geração: usar "Component Builder" para obter o snippet TSX dos selecionados.
- Refinos: aplicar "Component Refiner" para adequar detalhes (estados, responsividade, acessibilidade, dark mode).
- Logos: quando necessário, usar "Logo Search" para ícones/marcas.

## Design Tokens & Theming
- Tipografia: `Inter` com escala de 12–18–24–32.
- Cores base: Azul (motorista), Púrpura (admin), Vermelho (fiscal), Âmbar (créditos).
- Bordas/raios: suaves (rounded‑lg/‑xl), sombra média.
- Espaçamento: 4/8/12/16.
- Estados: success/error/warning/info alinhados às mensagens atuais.

## Integração Gradual
- Criar base React + Vite e montar em divs raiz das páginas existentes (islands), iniciando por Motorista.
- Converter blocos: Auth → Componentes 21st.dev; Modais → Modal/Form; Lists → Data/List Item; Navegação → Bottom Nav.
- Introduzir React Router para telas do Admin, mantendo Chart.js inicialmente.
- Encapsular serviços (AuthService, VehicleService, ParkingService) em hooks/context.

## Acessibilidade e i18n
- Garantir roles/labels nos componentes importados.
- Navegação por teclado em modais, tabs e segmented controls.
- Mensagens/labels em pt‑BR com fallback.

## Validação
- Story/Playground local para cada componente.
- Testes de interação básicos (focus/keyboard, abertura/fechamento de modal, seleção de tempo, toasts).
- Checagem visual em light/dark.

## Entregáveis
- Lista de componentes selecionados por categoria com links do 21st.dev.
- Snippets TSX gerados pelo MCP prontos para integração.
- Guia curto de tokens/temas e mapa de substituição por tela.
- Plano de migração incremental (Motorista → Admin → Fiscal).