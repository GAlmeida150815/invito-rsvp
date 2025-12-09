# Invito RSVP

Sistema completo de gestão de eventos e confirmações de presença (RSVP) com aplicação mobile multiplataforma e API backend.

## 📋 Funcionalidades

### Administração de Eventos

- **Autenticação de Organizadores**: Sistema de login/registro seguro com JWT
- **Criação de Events**: Criar eventos com título, descrição, localização, data e capacidade máxima
- **Banner Personalizado**: Upload de imagens em Base64 para banner do evento
- **Gestão de Convidados**: Adicionar convidados com nome, email e título (Sr., Sra., etc.)
- **Códigos de Convite Únicos**: Geração automática de códigos únicos para cada convidado
- **Envio de Convites por Email**: Integração com Resend para envio automático de convites
- **Dashboard Administrativo**: Visualização e gestão de todos os eventos
- **Detalhes do Evento**: Acesso a informações detalhadas e lista de convidados por evento

### Experiência do Convidado

- **Confirmação de Presença**: Interface simples para aceitar/recusar convites usando código único
- **Acesso sem Autenticação**: Convidados acedem diretamente via código de convite
- **Status de Confirmação**: Acompanhamento do estado (PENDING, CONFIRMED, DECLINED)

### Interface Mobile

- **Multiplataforma**: Suporte para iOS, Android e Web
- **Navegação Intuitiva**: Barra inferior para mobile e sidebar para web
- **Componentes Reutilizáveis**: Cards de eventos, chips personalizados, filtros
- **Gestão de Estado Global**: Contextos para autenticação, modais e notificações toast
- **Tema Consistente**: Sistema de cores e estilo unificado

## 🛠️ Tecnologias Usadas

### Backend (Server)

- **Node.js** com **TypeScript**: Ambiente de execução e tipagem estática
- **Express**: Framework web para API REST
- **Prisma ORM**: Object-Relational Mapping com SQLite
- **SQLite**: Base de dados relacional leve
- **JWT (jsonwebtoken)**: Autenticação com tokens
- **bcryptjs**: Hash seguro de passwords
- **Resend**: Serviço de envio de emails
- **CORS**: Middleware para controlo de acesso
- **dotenv**: Gestão de variáveis de ambiente
- **Nodemon**: Hot reload durante desenvolvimento

### Frontend (Mobile)

- **React Native**: Framework para aplicações móveis
- **Expo**: Plataforma de desenvolvimento e build (~54.0.27)
- **Expo Router**: Sistema de navegação baseado em ficheiros (~6.0.17)
- **TypeScript**: Tipagem estática
- **React Native Paper**: Biblioteca de componentes UI Material Design
- **React Navigation**: Navegação com bottom tabs
- **AsyncStorage**: Armazenamento local persistente
- **Expo Image Picker**: Seleção de imagens
- **Pager View**: Navegação swipe entre páginas
- **Gesture Handler & Reanimated**: Gestos e animações fluidas

## 🗄️ Estrutura da Base de Dados

### User (Organizadores)

```
- id: String (UUID, PK)
- name: String
- email: String (único)
- password: String (hash)
- events: Event[] (relação)
```

### Event (Eventos)

```
- id: String (UUID, PK)
- title: String
- description: String? (opcional)
- bannerBase64: String? (imagem em Base64)
- location: String
- date: DateTime
- rsvpDeadline: DateTime? (prazo para confirmação)
- maxCapacity: Int (capacidade máxima)
- createdAt: DateTime (automático)
- organizerId: String (FK -> User)
- organizer: User (relação)
- guests: Guest[] (relação)
```

### Guest (Convidados)

```
- id: String (UUID, PK)
- name: String
- email: String
- title: String? (Sr., Sra., Mna., Mn., etc.)
- inviteCode: String (único)
- status: String (default: "PENDING")
- createdAt: DateTime (automático)
- eventId: String (FK -> Event)
- event: Event (relação, cascade delete)
```

**Relações:**

- User 1:N Event (um organizador pode ter vários eventos)
- Event 1:N Guest (um evento pode ter vários convidados)
- Guest N:1 Event (cascade delete - convidados são eliminados com o evento)

## 📝 TODO

### Funcionalidades Futuras

- [ ] **Perfis Customizáveis**: Permitir organizadores personalizarem perfis e preferências
- [ ] **Múltiplos Convites por Email**: Suportar convite de famílias inteiras num único email
- [ ] **Realtime Updates (SOCKETS)**: Atualizações em tempo real de confirmações e alterações
- [ ] **Edição de Eventos**: Permitir modificar detalhes de eventos já criados
- [ ] **Analytics**: Dashboard com estatísticas e métricas dos eventos
  - Taxa de confirmação
  - Gráficos de presença
  - Histórico de eventos
  - Tendências de resposta

### Melhorias Técnicas

- [ ] Migração para PostgreSQL/MySQL em produção
- [ ] Testes unitários e de integração
- [ ] CI/CD pipeline
- [ ] Documentação da API (Swagger/OpenAPI)
- [ ] Rate limiting e segurança avançada
- [ ] Notificações push
- [ ] Modo offline no mobile

## ✅ Pré-requisitos

Antes de começar, certifica-te que tens instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Expo CLI** (opcional, mas recomendado)
  ```bash
  npm install -g expo-cli
  ```
- **Git** para clone do repositório
- **Conta Resend** (para envio de emails) - https://resend.com

## 📦 Instalação

### 1. Clone do Repositório

```bash
git clone <url-do-repositório>
cd neuronio-rsvp
```

### 2. Instalação do Backend (Server)

```bash
# Navegar para a pasta do servidor
cd server

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar ficheiro .env na pasta server com:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="sua-chave-secreta-aqui"
# RESEND_API_KEY=sua-api-key-do-resend
# APP_URL=http://192.168.1.x:8081

# IMPORTANTE: Para aceder ao servidor tanto em web como mobile,
# substitui "localhost" pelo teu endereço IPv4 local (ex: 192.168.1.X)
# Encontra o teu IPv4 com: ipconfig (Windows) ou ifconfig (Mac/Linux)

# Executar migrações da base de dados
npx prisma migrate dev

# (Opcional) Gerar Prisma Client
npx prisma generate
```

### 3. Instalação do Frontend (Mobile)

```bash
# Navegar para a pasta mobile (a partir da raiz)
cd ../mobile

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar ficheiro .env na pasta server com:
# EXPO_PUBLIC_API_URL=http://192.168.1.x:3000

# IMPORTANTE: Para aceder ao servidor tanto em web como mobile,
# substitui "localhost" pelo teu endereço IPv4 local (ex: 192.168.1.X)
# Encontra o teu IPv4 com: ipconfig (Windows) ou ifconfig (Mac/Linux)
```

## 🚀 Correr a Aplicação

### Backend (Server)

```bash
# Na pasta server/
npm run dev
```

O servidor irá iniciar em `http://localhost:3000` (ou porta configurada).

⚠️ **IMPORTANTE**: Para que a aplicação mobile consiga comunicar com o servidor, **não uses `localhost`**. Em vez disso:

1. Descobre o teu endereço IPv4 local:

   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

   Procura por algo como `192.168.x.x` ou `10.0.x.x`

2. Configura a URL da API no ficheiro `.env` com o teu IPv4:

   ```typescript
   EXPO_PUBLIC_API_URL=http://192.168.1.x:3000
   ```

3. O servidor e a aplicação mobile devem estar na **mesma rede Wi-Fi**

**Comandos úteis:**

- `npm run studio` - Abrir Prisma Studio para visualizar/editar dados

### Frontend (Mobile)

```bash
# Na pasta mobile/
npm start
```

Isto irá iniciar o Metro Bundler do Expo. A partir daqui podes:

- Pressionar `w` - Abrir no navegador web
- Pressionar `a` - Abrir no emulador Android
- Pressionar `i` - Abrir no simulador iOS
- Escanear QR code com a app **Expo Go** no telemóvel

**Comandos alternativos:**

```bash
npm run web      # Apenas web
npm run android  # Apenas Android
npm run ios      # Apenas iOS
```

## 📁 Estrutura das Pastas

```
neuronio-rsvp/
│
├── server/                      # Backend API
│   ├── prisma/                  # Configuração Prisma ORM
│   │   ├── schema.prisma        # Schema da base de dados
│   │   └── migrations/          # Histórico de migrações
│   │       └── [timestamps]/    # Ficheiros SQL de migração
│   │
│   ├── src/                     # Código fonte do servidor
│   │   ├── index.ts             # Entry point da aplicação
│   │   ├── lib/                 # Bibliotecas e utilitários
│   │   │   ├── email.ts         # Serviço de envio de emails
│   │   │   └── prisma.ts        # Cliente Prisma
│   │   └── routes/              # Rotas da API
│   │       ├── index.ts         # Agregador de rotas
│   │       ├── auths.ts         # Endpoints de autenticação
│   │       ├── events.ts        # Endpoints de eventos
│   │       └── guests.ts        # Endpoints de convidados
│   │
│   ├── package.json             # Dependências do servidor
│   ├── tsconfig.json            # Configuração TypeScript
│   └── prisma.config.ts         # Configuração Prisma
│
└── mobile/                      # Aplicação Mobile (React Native)
    ├── app/                     # Navegação baseada em ficheiros (Expo Router)
    │   ├── _layout.tsx          # Layout root
    │   ├── index.tsx            # Página inicial
    │   ├── +not-found.tsx       # Página 404
    │   ├── (admin)/             # Grupo de rotas administrativas
    │   │   ├── dashboard.tsx    # Dashboard de eventos
    │   │   └── event/
    │   │       └── [id].tsx     # Detalhes do evento (rota dinâmica)
    │   └── guest/               # Rotas de convidados
    │       └── [code].tsx       # RSVP via código único
    │
    ├── assets/                  # Recursos estáticos
    │   └── images/              # Imagens da aplicação
    │
    ├── components/              # Componentes React reutilizáveis
    │   ├── CustomChip.tsx       # Chip personalizado
    │   ├── EventCard.tsx        # Card de evento
    │   ├── FilterBar.tsx        # Barra de filtros
    │   ├── ScreenContainer.tsx  # Container de ecrã
    │   ├── native/              # Componentes específicos por plataforma
    │   │   ├── AdaptivePager.tsx      # Pager para native
    │   │   └── AdaptivePager.web.tsx  # Pager para web
    │   └── ui/                  # Componentes de UI
    │       ├── MobileBottomBar.tsx    # Barra inferior mobile
    │       ├── MobileHeader.tsx       # Cabeçalho mobile
    │       └── WebSidebar.tsx         # Sidebar para web
    │
    ├── constants/               # Constantes da aplicação
    │   └── theme.ts             # Tema e cores
    │
    ├── context/                 # Contextos React (estado global)
    │   ├── AuthContext.tsx      # Gestão de autenticação
    │   ├── ModalContext.tsx     # Gestão de modais
    │   └── ToastContext.tsx     # Gestão de notificações
    │
    ├── hooks/                   # Custom React Hooks
    │   ├── use-color-scheme.ts      # Hook de esquema de cores (native)
    │   ├── use-color-scheme.web.ts  # Hook de esquema de cores (web)
    │   └── use-theme-color.ts       # Hook de cores do tema
    │
    ├── services/                # Serviços externos
    │   └── api.ts               # Cliente API (comunicação com backend)
    │
    ├── types/                   # Definições TypeScript
    │   ├── auth.types.ts        # Tipos de autenticação
    │   ├── event.types.ts       # Tipos de eventos
    │   ├── guest.types.ts       # Tipos de convidados
    │   └── ui.types.ts          # Tipos de UI
    │
    ├── scripts/                 # Scripts utilitários
    │   └── reset-project.js     # Reset do projeto
    │
    ├── app.json                 # Configuração Expo
    ├── babel.config.js          # Configuração Babel
    ├── eslint.config.js         # Configuração ESLint
    ├── tsconfig.json            # Configuração TypeScript
    ├── expo-env.d.ts            # Tipos Expo
    ├── package.json             # Dependências mobile
    └── README.md                # Documentação mobile
```

### Convenções de Estrutura

**Backend (server/):**

- `routes/` - Cada ficheiro representa um conjunto de endpoints relacionados
- `lib/` - Serviços partilhados e configurações
- `prisma/` - Schema e migrações da base de dados

**Frontend (mobile/):**

- `app/` - Navegação file-based do Expo Router
  - Pastas `()` são grupos de rota (não aparecem no URL)
  - Ficheiros `[]` são rotas dinâmicas
- `components/` - Componentes reutilizáveis organizados por tipo
- `context/` - Estado global com React Context
- `services/` - Lógica de comunicação com APIs externas
- `types/` - Definições TypeScript centralizadas

---

**Desenvolvido com ❤️ para gestão eficiente de eventos e confirmações**
