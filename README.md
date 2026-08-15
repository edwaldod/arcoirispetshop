# Arco Iris Pet Shop — Backend + Painel Admin

Site do Arco Iris Pet Shop com **backend em Node.js + Express**.
O painel administrativo agora salva as alterações **no servidor**,
então as mudanças (banners, vídeos, mídias) valem para **todos os visitantes**.

---

## 📁 Estrutura

```
arcoirispetshop-backend/
├── server.js           # Servidor Express (+ API REST)
├── package.json        # Dependências e comando "npm start"
├── .env.example        # Modelo de configuração (copiar para .env)
├── .gitignore          # Ignora node_modules, uploads, data, .env
├── data/               # db.json (dados salvos) — criado automaticamente
├── uploads/            # Arquivos enviados pelo painel — criado automático
└── public/             # Site (index.html, admin.html, css, js, imagens)
```

---

## 🚀 Rodar localmente (para testar)

Pré-requisito: [Node.js](https://nodejs.org) instalado (versão 16 ou superior).

```powershell
# 1) Entrar na pasta do backend
cd d:\CURSOINSTALACAO\arcoirispetshop-backend

# 2) Instalar as dependências
npm install

# 3) (Opcional) criar o arquivo .env — veja a seção abaixo

# 4) Iniciar o servidor
npm start
```

Abra no navegador:
- Site: `http://localhost:3000/`
- Painel: `http://localhost:3000/admin.html`

> **Importante:** rodando localmente com o backend, o painel usa a API
> (por padrão `admin` / `123456`). Altere a senha no `.env` antes de publicar!

---

## 🔐 Arquivo `.env` (segurança)

Copie `.env.example` para `.env` (na pasta do backend) e preencha:

```env
# Usuário e senha do painel (mude a senha!)
ADMIN_USER=admin
ADMIN_PASS=minha-senha-forte

# Segredo p/ assinar o token de login (gere um valor aleatório)
AUTH_SECRET=troque-por-um-valor-aleatorio-longo
```

Para gerar um `AUTH_SECRET` aleatório:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📍 Como a autenticação funciona?

- `/admin.html` pede login → chama `POST /api/login`.
- O servidor valida usuário/senha e devolve um **token** assinado (HMAC).
- O painel guarda o token e envia como `Authorization: Bearer <token>`
  em todas as requisições de escrita (`PUT`, `POST`, `DELETE`).
- As leituras do site (`GET /api/slides`, `/api/videos`, `/api/media`)
  são **públicas** — o site público só lê, nunca escreve.

---

## 🧠 Pontos importantes

1. **Dados ficam em `data/db.json`** (e arquivos em `uploads/`).
   Faça **backup regular** dessas duas pastas.
2. **NUNCA** publique o `.env` verdadeiro ou a pasta `node_modules`.
3. O site **fallback para localStorage** quando o backend não está acessível
   (ex.: abrindo o `public/index.html` direto como arquivo estático).
4. Upload de mídia: no backend os arquivos vão para `uploads/` e aparecem
   via URL `/uploads/...`.

---

# 🟠 Guia de deploy no HostGator EasyPanel

O HostGator EasyPanel permite rodar **aplicações Node.js** rapidinho.
Siga o passo a passo:

## Passo 1 — Preparar o projeto local

1. Garanta que a pasta `arcoirispetshop-backend` contém:
   - `server.js`, `package.json`, `.env.example`, `public/`
2. Crie o arquivo `.env` com a senha do painel e o `AUTH_SECRET`
   (veja a seção acima).

## Passo 2 — Subir os arquivos para o HostGator

Você pode usar **Gerenciador de Arquivos** do painel ou **FTP**:

1. Acesse o **EasyPanel** do HostGator e abra o **Gerenciador de Arquivos**.
2. Vá até a pasta do seu site (Ex.: `~/nodejs-app/` ou a raiz indicada
   pelo plano — cada plano Node.js tem um caminho específico de app).
3. Envie **tudo** da pasta `arcoirispetshop-backend` para essa pasta:
   `server.js`, `package.json`, `.env`, `.env.example`, `public/` (e crie
   `data/` e `uploads/` vazios se preferir — o servidor também cria sozinho).

> ⚠️ **Não** envie a pasta `node_modules` nem `data/db.json` de teste.

## Passo 3 — Definir o Node.js e rodar

No EasyPanel, crie/edite a sua aplicação Node:

| Campo              | Valor                                   |
|--------------------|-----------------------------------------|
| Node version       | 16 ou 18 (recomendado 18)               |
| Comando de start   | `npm start`                             |
| Pasta raiz do app  | a pasta onde está o `server.js`         |

Salve. O painel normalmente **instala as dependências** automaticamente
(ou use o botão **"Instalar dependências"** / terminal do painel com `npm install`).

## Passo 4 — Testar

- Acesse o domínio/subdomínio atribuído pela HostGator.
- Abra `https://seu-dominio/admin.html` e faça login.
- Faça uma alteração (ex.: troque um vídeo) e depois abra a página do site
  como **outra pessoa/outro navegador** → a mudança deve aparecer. ✅

---

## ❓ Solução de problemas

| Problema | Causa / Solução |
|----------|-----------------|
| A página mostra "Modo local (sem servidor)" | O navegador não alcançou `/api/health`. Confira se o app Node está rodando e se o domínio aponta para ele. |
| Login não funciona | Usuário/senha errados. Lembre que valem os do `.env` do servidor, não os do seu PC. |
| Upload "muito grande" | No backend o limite é 15MB por arquivo. |
| 404 em `/uploads/...` | O arquivo não existe em `uploads/` no servidor — faça o upload de novo pelo painel. |
| Imagens quebradas após publicar | Reenvie as mídias pelo painel publicado (as URLs de `uploads` são do servidor, não da sua máquina). |
