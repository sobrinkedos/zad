# Sistema de Zona Azul Digital

Um sistema completo de gerenciamento de estacionamento rotativo (Zona Azul) para municipalidades, desenvolvido com tecnologias web modernas.

## 🚀 Funcionalidades

### Para Motoristas
- **Cadastro e Login**: Sistema de autenticação seguro
- **Gerenciamento de Veículos**: Cadastro de múltiplos veículos por usuário
- **Compra de Créditos**: Pacotes de créditos com múltiplas formas de pagamento
- **Estacionamento Digital**: Início e controle de sessões de estacionamento
- **Notificações**: Alertas de expiração e renovação
- **Histórico**: Registro completo de transações e estacionamentos

### Para Fiscais
- **Verificação de Veículos**: Scan de placas e QR codes
- **Status em Tempo Real**: Visualização imediata da validade do estacionamento
- **Aplicação de Multas**: Registro digital de infrações
- **Estatísticas**: Relatórios de fiscalização do dia
- **Sincronização**: Dados sempre atualizados

### Para Administradores
- **Gestão de Zonas**: CRUD completo de zonas com tarifas diferenciadas
- **Cadastro de Fiscais**: Gerenciamento de usuários fiscais
- **Dashboard Analytics**: Visualização de métricas e gráficos
- **Controle Financeiro**: Relatórios de receitas e transações
- **Configurações**: Ajuste de parâmetros do sistema

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript ES6+
- **Backend**: Node.js com Express.js (simulado no frontend)
- **Banco de Dados**: LocalStorage (SQLite em produção)
- **Autenticação**: JWT (JSON Web Tokens)
- **Gráficos**: Chart.js
- **Ícones**: Feather Icons

## 📁 Estrutura do Projeto

```
/
├── index.html              # App do motorista
├── fiscal.html             # App do fiscal
├── admin.html              # Painel administrativo
├── main.js                 # Lógica principal do sistema
├── documentacao.md         # Documentação técnica completa
├── README.md              # Este arquivo
└── resources/             # Arquivos de mídia
    ├── hero-bg.jpg        # Background do hero
    ├── user-avatar.jpg    # Avatar padrão
    ├── fiscal-avatar.jpg  # Avatar fiscal
    └── admin-avatar.jpg   # Avatar admin
```

## 🚦 Como Usar

### 1. Acesso ao Sistema

#### Motorista
- Acesse `index.html`
- Crie uma conta ou faça login
- Cadastre seus veículos
- Compre créditos
- Inicie sessões de estacionamento

#### Fiscal
- Acesse `fiscal.html`
- Faça login com credenciais fiscais
- Escaneie placas para verificar status
- Aplique multas quando necessário

#### Administrador
- Acesse `admin.html`
- Faça login com credenciais administrativas
- Gerencie zonas, fiscais e visualize métricas

### 2. Funcionalidades Principais

#### Estacionamento
1. Selecione um veículo cadastrado
2. Escolha a zona desejada
3. Defina o tempo de estacionamento
4. Confirme com seus créditos
5. Receba notificações de expiração

#### Fiscalização
1. Digite a placa do veículo
2. Veja o status em tempo real
3. Aplique multa se necessário
4. Registre a infração

#### Administração
1. Cadastre novas zonas com tarifas
2. Gerencie usuários fiscais
3. Acompanhe métricas de uso
4. Visualize relatórios financeiros

## 💡 Demonstração

### Contas de Demonstração

#### Motorista
- **Email**: `demo@user.com`
- **Senha**: `demo123`

#### Fiscal
- **CPF**: `000.000.000-00`
- **Senha**: `demo123`
- **Token**: `FISCAL2024`

#### Administrador
- **Email**: `admin@prefeitura.com`
- **Senha**: `admin123`
- **Código**: `ADMIN2024`

### Fluxo de Teste

1. **Cadastro de Usuário**: Crie uma conta de motorista
2. **Adicionar Veículo**: Cadastre um veículo com placa válida
3. **Comprar Créditos**: Adquira créditos para estacionar
4. **Estacionar**: Inicie uma sessão em uma zona disponível
5. **Fiscalização**: Use o app fiscal para verificar o veículo
6. **Administração**: Acesse o painel admin para ver métricas

## 🎨 Design e Interface

O sistema foi desenvolvido com foco em:
- **Interface Intuitiva**: Experiência do usuário simplificada
- **Design Responsivo**: Adaptado para dispositivos móveis
- **Visual Moderno**: Uso de gradientes e efeitos glassmorphism
- **Acessibilidade**: Contraste adequado e navegação clara

## 🔧 Configuração e Desenvolvimento

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari)
- Servidor web local (para algumas funcionalidades)

### Instalação
1. Clone ou baixe os arquivos
2. Abra `index.html` no navegador
3. Para funcionalidades completas, use um servidor local:
   ```bash
   python -m http.server 8000
   ```

### Desenvolvimento
- O sistema usa LocalStorage para dados (não persistente)
- Em produção, integrar com backend real
- Configurar banco de dados (SQLite, PostgreSQL, etc.)
- Implementar integração de pagamento real

## 📊 Funcionalidades Técnicas

### Validações
- CPF e CNPJ válidos
- Formato de placa de veículo (Mercosul e antigo)
- Email válido
- Senhas seguras

### Segurança
- Autenticação por JWT
- Validação de dados de entrada
- Prevenção de SQL injection
- Logs de auditoria

### Performance
- Carregamento assíncrono
- Atualização em tempo real
- Cache de dados locais
- Otimização de imagens

## 🚀 Próximos Passos

### Funcionalidades Planejadas
- [ ] Integração com gateway de pagamento real
- [ ] Sistema de notificações push
- [ ] App nativo para Android/iOS
- [ ] Integração com sistemas da prefeitura
- [ ] Relatórios mais detalhados
- [ ] Sistema de avaliação de fiscais
- [ ] Suporte multi-idioma

### Melhorias Técnicas
- [ ] Migração para backend real
- [ ] Implementação de cache Redis
- [ ] Sistema de filas para processamento
- [ ] Monitoramento e logs estruturados
- [ ] Testes automatizados
- [ ] CI/CD pipeline

## 📞 Suporte

Para dúvidas ou sugestões:
- Documentação técnica: `documentacao.md`
- Exemplos de uso: Veja as contas de demonstração
- Problemas técnicos: Verifique o console do navegador

## 📄 Licença

Este sistema foi desenvolvido para fins educacionais e demonstração. Para uso em produção, considere:
- Segurança adicional
- Conformidade legal
- Testes extensivos
- Suporte técnico adequado

---

**Desenvolvido com ❤️ para simplificar a gestão de estacionamento urbano**