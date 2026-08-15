# 🟠 GUIA COMPLETO PARA INICIANTE — Publicar o site no HostGator EasyPanel

Este guia ensina passo a passo (do zero) como colocar o seu site
Arco Iris Pet Shop **com o painel admin funcionando para todos** no
hospedadoino da HostGator usando o **EasyPanel**.

---

## ✅ Parte 0 — O que você precisa antes de começar

1. **Conta de hospedagem HostGator** com pacote que inclua **Node.js**
   (plano com Node App ou VPS/Revenda que ofereça EasyPanel). Se não tiver,
   contrate ou ative o recurso Node.js.
2. **Dados de acesso** que a HostGator envia por e-mail:
   - URL do painel EasyPanel (algo como `https://ipdoseupainel:porta`)
   - Usuário e senha do painel
   - Domínio ou subdomínio do site
3. **Preparar as credenciais do seu painel admin** (usuário e senha) que
   você vai usar para logar em `/admin.html`.

> 💡 Guarde essas informações em um bloco de notas, pois vamos usar agora.

---

## 📁 Parte 1 — Preparar o projeto na sua máquina

Antes de subir, vamos deixar o projeto limpinho e com senha definida.

### 1.1 Crie o arquivo `.env`

Na pasta `arcoirispetshop-backend`, existe um arquivo chamado **`.env.example`**.
Precisamos criar um arquivo `.env` a partir dele, com as suas credenciais.

1. Abra a pasta `arcoirispetshop-backend` no explorador de arquivos.
2. Clique com o botão direito em **`.env.example`** → **Renomear** → mude para **`.env`**
   (ou crie um arquivo novo chamado `.env` com o mesmo conteúdo).
3. Abra o `.env` com o Bloco de Notas e preencha:

```env
ADMIN_USER=admin
ADMIN_PASS=COLOQUE_UMA_SENHA_FORTE_AQUI
AUTH_SECRET=COLOQUE_UM_TEXTO_LONGO_AQUI
```

- `ADMIN_USER`: usuário do painel (pode manter `admin`).
- `ADMIN_PASS`: **mude para uma senha forte**. É essa que você vai digitar
  no `/admin.html` para entrar no painel.
- `AUTH_SECRET`: um texto aleatório longo. Pode ser qualquer coisa, ex.:
  `meuSegredoSuperSecreto123456789!@#`. (Serve para assinar os logins.)

> ⚠️ **NUNCA** envie/revele o `.env` de verdade para ninguém.

### 1.2 (Opcional) Limpar dados de teste

Se você testou localmente e não quer que venham junto, apague as pastas
`data/db.json` e o conteúdo de `uploads/`. Elas serão recriadas sozinhas
no servidor.

---

## 🖥️ Parte 2 — Entrar no EasyPanel e criar a aplicação Node

### 2.1 Acesse o EasyPanel

1. No navegador, abra a **URL do EasyPanel** que a HostGator te enviou.
2. Faça login com **usuário e senha** fornecidos.
3. O EasyPanel tem um menu. Procure por **"Node.js"**, **"Node App"**
   ou **"Aplicações Node"** (o nome pode variar conforme o painel).

### 2.2 Crie uma nova aplicação Node

1. Clique em **"Criar aplicação Node"** / **"Create Node app"**.
2. Preencha os campos:

| Campo | O que colocar |
|-------|---------------|
| **Nome da aplicação** | algo identificável, ex.: `arcoirispetshop` |
| **Versão do Node** | `18` (ou a mais recente estável) |
| **Pasta raiz / Root directory** | a pasta onde vai ficar o `server.js` (ex.: `~/arcoirispetshop` ou a pasta padrão de app) |
| **Comando de inicialização / Start command** | `npm start` |

> Se o painel pedir a **porta**, deixe como **automática** (o EasyPanel
> define a `PORT` para você). O nosso `server.js` já respeita `process.env.PORT`.

3. Salve/confirme. O painel vai **criar a pasta** da aplicação para você.

---

## 📤 Parte 3 — Enviar os arquivos do site

Agora vamos subir os arquivos para a pasta da aplicação criada.

### Opção A — Gerenciador de Arquivos (recomendado para iniciante)

1. No EasyPanel, abra o **"Gerenciador de Arquivos"** / **"File Manager"**.
2. Navegue até a **pasta raiz da sua aplicação Node**
   (a mesma que você informou no campo "Root directory").
3. Clique em **"Enviar" / "Upload"**.
4. Selecione **os arquivos da pasta `arcoirispetshop-backend`** do seu PC.
   **Envie DENTRO da pasta raiz da app**, não em uma subpasta.
5. Garanta que estão lá dentro:
   - `server.js`
   - `package.json`
   - `package-lock.json` (se existir)
   - `.env`  ← o que você criou
   - `public/` (a pasta inteira, com index.html, admin.html, css, js, imagens)

> 💡 **NÃO** envie a pasta `node_modules` (vem dos seus testes) nem
> `data/db.json`. Elas não servem e serão tratadas no passo de deps.

### Opção B — FTP

1. Abra um cliente FTP (ex.: **FileZilla**).
2. Conecte usando os dados de FTP da HostGator (host, usuário e senha).
3. Navegue até a **pasta raiz da aplicação Node**.
4. Arraste **tudo de dentro** de `arcoirispetshop-backend` para essa pasta.

---

## 🧩 Parte 4 — Instalar as dependências e iniciar

As dependências (express, multer, dotenv) **não** viajam com você —
precisamos instalar no servidor.

### Opção A — Botão "Instalar dependências" do painel
Muitos EasyPanel têm um botão **"Install dependencies" / "npm install"**
junto da aplicação Node. Clique nele e aguarde terminar.

### Opção B — Terminal do painel
Se o painel tiver um **Terminal / Console**:

1. Abra o terminal.
2. Navegue para a pasta da app (ex.: `cd ~/arcoirispetshop`).
3. Rode:
   ```
   npm install
   ```
4. Aguarde a mensagem de sucesso.

### Depois disso
Clique em **"Iniciar / Restart"** na sua aplicação Node.
O servidor vai rodar `npm start` → `node server.js`.

Para conferir se subiu, veja os **logs** da aplicação. Deve aparecer:
```
🚀 Arco Iris Pet Shop backend rodando na porta <PORT>
```

---

## 🌐 Parte 5 — Testar o site

1. O EasyPanel dá a você um **domínio ou subdomínio** de acesso
   (ex.: `arcoirispetshop.seudominio.com.br`).
2. Abra no navegador:
   - **Site público**: `https://arcoirispetshop.seudominio.com.br`
   - **Painel admin**: `https://arcoirispetshop.seudominio.com.br/admin.html`
3. No painel, faça login com o **usuário** e **senha** do `.env`.
4. Mude alguma coisa (ex.: cole um vídeo na aba Vídeos).
5. Abra o **site público como outra pessoa** (outro navegador, tela anônima).
6. A mudança deve aparecer para todos. 🎉

---

## ⚠️ Parte 6 — Como apontar um domínio próprio (SEO, sem porta)

Se quiser usar `www.seuloja.com.br` (domínio bonito e sem números/porta):

1. No EasyPanel, encontre a opção **"Sites / Domains / Add domain"**.
2. Adicione seu domínio e "aponte" (proxy) para a pasta/aplicação Node.
3. No registro da HostGator/Cloudflare, crie um **A record / CNAME** apontando
   para o IP/host do EasyPanel (o painel te dá essas instruções).
4. Depois de propagado, o acesso passa a ser pelo domínio bonito.

> Na dúvida, use o subdomínio que o EasyPanel já te dá — é o caminho
> mais rápido para funcionar.

---

## 🧰 Parte 7 — Solução de problemas

| Problema | O que fazer |
|----------|-------------|
| **Painel mostra "Modo local (sem servidor)"** | O navegador não acessou `/api/health`. Confirme que o app Node está **rodando** e que você abriu via **domínio da app** (não abriu o index.html como arquivo). |
| **Não consigo logar** | Use o `ADMIN_USER`/`ADMIN_PASS` que estão no **`.env` do servidor** (não os do seu PC). |
| **Dá 404 no site** | Os arquivos `public/` podem ter ido para uma subpasta errada. Confira que `index.html` está dentro da pasta raiz da app (via `/public`). |
| **Upload falha ou imagem quebra** | As mídias ficam em `uploads/`. Verifique se a pasta existe e tem permissão de escrita, e refaça o upload pelo painel publicado. |
| **`ERR_CONNECTION_REFUSED`** | A app Node não está rodando. Veja os **logs** no EasyPanel e reinicie. |
| **Mudança não aparece para visitantes** | Confirme que fez login **autenticado** e que a resposta do painel foi "salvo". Dê um **Ctrl+F5** no site público. |

---

## ✅ Checklist final

- [ ] Tenho a URL/senha do EasyPanel
- [ ] Criei o arquivo `.env` com senha e secret
- [ ] Criei a aplicação Node no painel (Node 18, start = `npm start`)
- [ ] Enviei `server.js`, `package.json`, `.env`, `public/` para a pasta raiz
- [ ] Rodei `npm install` no servidor
- [ ] Iniciei/reiniciei a aplicação (log mostrou a porta)
- [ ] Abri `/admin.html`, logei e fiz uma mudança
- [ ] A mudança apareceu no site público 🎉

---

Boa sorte! Se bater em qualquer erro, me manda a mensagem do **log** do
EasyPanel que eu te ajudo a resolver.
