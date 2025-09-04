# 🚀 Investment Ranking - Sistema de Ranking de Ações

Sistema completo para análise e ranking de ações brasileiras baseado em dividendos e análise fundamentalista.

## ✨ Funcionalidades

- 🔐 **Autenticação** com Supabase
- 📊 **Ranking automático** das melhores ações para dividendos
- 🔄 **Atualização automática** via cron-job.org
- 📱 **Interface responsiva** com Tailwind CSS e shadcn/ui
- 🚀 **API REST** para integração
- 📈 **Análise fundamentalista** automatizada

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Cron:** cron-job.org
- **Deploy:** Vercel (recomendado)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd investment
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Cron Job
CRON_SECRET_TOKEN=seu_token_secreto_para_cron
```

### 4. Configure o Supabase

Siga as instruções em [supabase-setup.md](./supabase-setup.md)

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📋 Configuração do Cron Job

### 1. Acesse cron-job.org

- Crie uma conta em [cron-job.org](https://cron-job.org)
- Configure um novo cron job

### 2. Configure o endpoint

- **URL:** `https://seu-dominio.com/api/cron`
- **Método:** POST
- **Headers:** `Authorization: Bearer seu_token_secreto_para_cron`
- **Frequência:** A cada 6 horas

### 3. Teste o cron job

```bash
curl -X POST https://seu-dominio.com/api/cron \
  -H "Authorization: Bearer seu_token_secreto_para_cron"
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # Endpoints da API
│   │   ├── auth/          # Autenticação
│   │   ├── cron/          # Cron job
│   │   └── ranking/       # Ranking das ações
│   ├── dashboard/         # Dashboard principal
│   ├── login/             # Página de login
│   └── page.tsx           # Página inicial
├── components/             # Componentes React
│   ├── ui/                # Componentes shadcn/ui
│   └── RankCard.tsx       # Card de ação
├── lib/                    # Utilitários
│   ├── supabase/          # Cliente Supabase
│   └── utils.ts           # Funções utilitárias
├── services/               # Serviços de negócio
│   ├── stockService.ts    # Serviço de ações
│   └── rankingService.ts  # Serviço de ranking
└── types/                  # Tipos TypeScript
    └── index.ts           # Definições de tipos
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

## 📊 API Endpoints

### GET /api/ranking
Retorna o ranking das ações (requer autenticação)

### POST /api/cron
Executa atualização do ranking (requer token de cron)

### POST /api/auth/login
Endpoint de login

### POST /api/auth/logout
Endpoint de logout

## 🎯 Como Funciona

### 1. Coleta de Dados
- Sistema busca dados de ações do Status Invest
- Coleta histórico de preços, dividendos e lucros
- Aplica rate limiting para evitar bloqueios

### 2. Processamento
- Filtra ações com histórico completo (10 anos)
- Valida lucro líquido positivo
- Calcula métricas de dividendos
- Gera score baseado em análise fundamentalista

### 3. Ranking
- Ordena por distância do preço ideal
- Prioriza ações com opções
- Retorna top 10 melhores oportunidades

### 4. Atualização
- Cron job executa automaticamente
- Atualiza dados no Supabase
- Mantém ranking sempre atualizado

## 🔒 Segurança

- **Autenticação** obrigatória para acesso ao ranking
- **Token secreto** para execução de cron jobs
- **Rate limiting** nas APIs externas
- **Validação** de dados em todas as entradas

## 📱 Interface

- **Login** simples e intuitivo
- **Dashboard** responsivo com cards de ações
- **Ranking** visual com métricas claras
- **Atualização** manual e automática

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

- **Netlify:** Suporte completo ao Next.js
- **Railway:** Deploy simples e rápido
- **DigitalOcean:** App Platform

## 🐛 Troubleshooting

### Erro de Conexão com Supabase
- Verifique as variáveis de ambiente
- Confirme se o projeto está ativo
- Teste a conexão no console

### Cron Job não Executa
- Verifique o token de autorização
- Confirme se a URL está correta
- Teste o endpoint manualmente

### Erro de Build
- Execute `npm run lint` para verificar erros
- Verifique se todas as dependências estão instaladas
- Confirme se o TypeScript está configurado

## 📈 Próximos Passos

- [ ] Dashboard com gráficos
- [ ] Notificações de oportunidades
- [ ] Histórico de rankings
- [ ] Exportação de dados
- [ ] API para terceiros
- [ ] App mobile

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Issues:** [GitHub Issues](link-para-issues)
- **Email:** seu-email@exemplo.com
- **Documentação:** [Wiki](link-para-wiki)

---

**Desenvolvido com ❤️ para investidores brasileiros**
# Dashboard-Investment
