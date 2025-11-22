# Sistema de Zona Azul Digital (ZAD)

Este repositório contém o código fonte do Sistema de Zona Azul Digital, atualmente em processo de migração para uma arquitetura moderna com Nuxt.js e Supabase.

## 📁 Estrutura do Projeto

O projeto está organizado da seguinte forma:

### `/nuxt-app` (Aplicação Principal)
A nova versão do sistema, desenvolvida com tecnologias modernas para produção.
- **Framework**: Nuxt 4
- **Linguagem**: TypeScript
- **UI**: Nuxt UI / Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)

### `/legacy_prototype` (Protótipo Legado)
A versão original estática do sistema, mantida para referência e consulta de regras de negócio.
- **Arquivos**: `index.html`, `fiscal.html`, `admin.html`, `main.js`
- **Tecnologia**: HTML/JS Vanilla + LocalStorage
- **Status**: Depreciado (apenas para referência)

### `/supabase`
Configurações do backend, incluindo migrações de banco de dados e Edge Functions.

## 🚀 Como Rodar (Nova Versão)

Para desenvolver na nova versão do sistema:

1. Acesse a pasta do aplicativo:
   ```bash
   cd nuxt-app
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📚 Documentação

- A documentação do protótipo legado pode ser encontrada em `legacy_prototype/documentacao.md`.
- A documentação da nova arquitetura será mantida na pasta `docs/` (em construção).