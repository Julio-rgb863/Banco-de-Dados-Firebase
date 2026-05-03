# Nimbus — Guia Completo de Deploy e Produção

## Estrutura do Projeto

```
nimbus/
├── index.html               ← Página de login
├── dashboard.html           ← Dashboard principal
├── firebase.json            ← Configuração Firebase Hosting + segurança
├── .firebaserc              ← Alias do projeto Firebase
├── src/
│   └── core/
│       ├── auth.js          ← Firebase Auth (login, registro, providers)
│       ├── theme.js         ← Dark/light theme com persistência
│       └── toast.js         ← Sistema de notificações
└── deploy/
    ├── firestore.rules      ← Regras de segurança Firestore
    └── firestore.indexes.json
```

---

## 1. Pré-requisitos

```bash
# Node.js 18+ necessário
node -v

# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Fazer login
firebase login
```

---

## 2. Primeiro Deploy

```bash
# Dentro da pasta do projeto:
cd nimbus

# Iniciar sessão (se ainda não fez)
firebase login

# Verificar projeto vinculado
firebase projects:list

# Deploy completo (hosting + regras Firestore)
firebase deploy

# Ou só o hosting:
firebase deploy --only hosting

# Só as regras de segurança:
firebase deploy --only firestore:rules
```

Após o deploy, seu app estará em:
- `https://banco-de-dados-julio.web.app`
- `https://banco-de-dados-julio.firebaseapp.com`

---

## 3. Configurar Domínio Personalizado

```
Firebase Console → Hosting → Adicionar domínio personalizado
→ Digite: seudominio.com.br
→ Siga as instruções para adicionar registros DNS:
   - Tipo A: 151.101.1.195 e 151.101.65.195
   - Ou CNAME: banco-de-dados-julio.web.app
```

O SSL (HTTPS) é provisionado automaticamente pelo Firebase (certificado grátis via Let's Encrypt).

---

## 4. Habilitar Provedores no Firebase Console

```
Firebase Console
→ Authentication → Sign-in method → Habilitar:

  ✅ Email/Senha       — já funciona
  ✅ Google            — requer OAuth Client ID
  ✅ GitHub            — requer App ID + Secret do GitHub OAuth
```

### Configurar GitHub OAuth:
1. Acesse: https://github.com/settings/developers → OAuth Apps → New
2. Homepage URL: `https://banco-de-dados-julio.web.app`
3. Callback URL: `https://banco-de-dados-julio.firebaseapp.com/__/auth/handler`
4. Cole o Client ID e Secret no Firebase Console

### Configurar Google:
- No Firebase Console, ao habilitar Google, baixe o `google-services.json` se usar mobile,
  ou apenas salve o Client ID para web (já funciona pelo `firebaseConfig`).

---

## 5. Regras de Segurança Firestore

As regras estão em `deploy/firestore.rules`. Elas garantem:

| Recurso          | Leitura        | Escrita                      |
|------------------|----------------|------------------------------|
| `/users/{uid}`   | Só o dono      | Só o dono, campos controlados|
| `/activity/{id}` | Só o dono      | Só criar (sem editar/deletar)|
| `/settings/{uid}`| Só o dono      | Só o dono                    |
| Tudo mais        | ❌ Bloqueado   | ❌ Bloqueado                  |

Para publicar as regras:
```bash
firebase deploy --only firestore:rules
```

---

## 6. Headers de Segurança (já configurados no firebase.json)

| Header                      | Proteção                              |
|-----------------------------|---------------------------------------|
| `X-Frame-Options`           | Bloqueia clickjacking                 |
| `X-Content-Type-Options`    | Bloqueia MIME sniffing                |
| `X-XSS-Protection`          | Ativa proteção XSS do browser        |
| `Strict-Transport-Security` | Força HTTPS por 2 anos               |
| `Content-Security-Policy`   | Restringe fontes de scripts/estilos  |
| `Referrer-Policy`           | Controla dados enviados no referrer  |
| `Permissions-Policy`        | Bloqueia câmera, microfone, GPS      |

---

## 7. Performance

### Cache automático via firebase.json:
- JS/CSS/Fontes: `max-age=31536000` (1 ano, imutável)
- Imagens: `max-age=86400` (1 dia)
- HTML: sem cache (sempre fresco)

### Otimizações já no código:
- `preconnect` para Google Fonts antes do CSS
- Fontes com `display=swap`
- `will-change: transform` na sidebar
- `backdrop-filter` com `transform: translateZ(0)` para GPU
- Animações com `cubic-bezier` para 60fps
- Imagens com `lazy` loading quando aplicável

---

## 8. SEO

### Páginas públicas (index.html):
- `<meta name="description">` configurado
- `<meta property="og:*">` para redes sociais
- `<title>` descritivo
- `lang="pt-BR"` no HTML
- `<meta name="theme-color">` para mobile

### Páginas protegidas (dashboard.html):
- `<meta name="robots" content="noindex, nofollow">`
- Protegidas por autenticação — não devem ser indexadas

### Para melhorar SEO da landing page:
Crie um `index.html` de marketing separado da página de login,
com conteúdo rico, structured data JSON-LD e sitemap.xml.

---

## 9. Analytics (Google Analytics 4)

### Adicionar ao `index.html` e `dashboard.html` antes do `</head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });
</script>
```

Substitua `G-XXXXXXXXXX` pelo seu Measurement ID do GA4.

### Rastrear eventos de autenticação no auth.js:
```js
// Após login bem-sucedido:
gtag('event', 'login', { method: 'Email' });
gtag('event', 'login', { method: 'Google' });

// Após registro:
gtag('event', 'sign_up', { method: 'Email' });
```

---

## 10. Variáveis de Ambiente (produção vs desenvolvimento)

Para não expor a API Key diretamente no código em projetos maiores,
use o Firebase App Hosting ou crie um arquivo `env.js`:

```js
// env.js (não commitar no git)
export const ENV = {
  apiKey: "...",
  authDomain: "...",
  projectId: "..."
};
```

Adicione ao `.gitignore`:
```
env.js
.env
.env.local
node_modules/
.firebase/
```

---

## 11. Monitoramento de Erros (Sentry)

```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: "https://SEU_DSN@sentry.io/PROJETO",
    environment: "production",
    tracesSampleRate: 0.2
  });
</script>
```

---

## 12. Checklist de Produção

```
✅ Firebase Hosting configurado
✅ Domínio personalizado + SSL
✅ Provedores de auth habilitados (Email, Google, GitHub)
✅ Regras Firestore publicadas
✅ Headers de segurança ativos (firebase.json)
✅ Cache configurado para assets
✅ SEO meta tags nas páginas públicas
✅ noindex nas páginas protegidas
✅ Google Analytics 4 instalado
✅ Monitoramento de erros (Sentry)
✅ .gitignore com credenciais excluídas
✅ HTTPS forçado via HSTS
```

---

## 13. Deploy Rápido (resumo)

```bash
# 1. Instalar CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Deploy completo
firebase deploy

# URL do seu app:
# https://banco-de-dados-julio.web.app
```

---

## Suporte Firebase

- Console: https://console.firebase.google.com/project/banco-de-dados-julio
- Docs Auth: https://firebase.google.com/docs/auth/web/start
- Docs Firestore: https://firebase.google.com/docs/firestore
- Docs Hosting: https://firebase.google.com/docs/hosting
