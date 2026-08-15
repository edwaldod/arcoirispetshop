# 🖥️ Instalar o projeto Arco Iris no seu VPS NVMe 2 (HostGator EasyPanel)

> Cenário: você tem um **VPS NVMe 2** e um colega já instalou um projeto
> "curso". Você quer colocar o **Arco Iris Pet Shop** ao lado, sem quebrar o
> do colega. Guia para iniciante, passo a passo.

---

## ⚠️ Antes de tudo — entenda o EasyPanel da HostGator

O EasyPanel **NÃO é um painel de hospedagem tradicional** (não tem menus tipo
"Node App", "File Manager" ou "FTP"). Ele é **baseado em containers Docker**
e organiza tudo em **Projetos**.

- **Projeto** = um "ambiente" que agrupa: aplicações, banco de dados, variáveis
  de ambiente e domínios.
- **Aplicação** = cada app roda num **container isolado**. O painel suporta
  **Node.js**, Python, PHP, Ruby, Go, Java etc.
- Você publica apps **a partir de um repositório Git** (GitHub/GitLab/Bitbucket)
  ou **templates prontos** (WordPress, n8n, Ghost).
- **Versão gratuita:** até **3 projetos**.

> 🎯 Ou seja: para o Arco Iris você vai **criar um novo Projeto** (ou entrar
> num projeto) e **adicionar uma aplicação Node.js** dentro dele. O seu projeto
> fica **separado** do projeto do curso — por isso não quebra nada.

---

## 🔑 Passo 0 — Acesse o EasyPanel

Há **duas formas** de entrar no painel:

### Via Portal do Cliente (mais fácil)
1. Entre em **https://cliente.hostgator.com.br/**
2. Menu lateral → **VPS e Dedicados**
3. No seu plano **VPS NVMe 2**, em "Acesso rápido", clique no **ícone do
   painel/aplicação** (EasyPanel).
4. Se o navegador mostrar aviso de segurança → **prossiga** (é normal).
5. Se for a primeira vez, crie o **usuário e senha do painel**. Depois, **Login**.

### Via navegador
1. Acesse: `https://SEU_IP_DO_SERVIDOR:3000`
   (ex.: `https://123.456.1.78:3000`)
2. Mesmo processo: aviso de segurança → prossiga → login.

> Vai precisar: **IP do servidor**, e o **usuário/senha do painel** (o da tela
> de login do EasyPanel, não confunda com a senha SSH).

---

## 🧭 Passo 1 — Dê uma olhada (sem mexer em nada)

Dentro do painel, ao entrar num **projeto**, você vê **duas abas ou botões**
(no canto), que é a forma de adicionar coisas:

- **Serviços** — onde se criam os "componentes": **Aplicativo** (sua app),
  **MySQL**, **MariaDB**, **Postgres**, **MongoDB**, **Redis**, **Caixa**,
  **Compose**, **WordPress**.
- **Modelos** — aplicações prontas de um clique (WordPress, n8n, Ghost, etc).
- **Personalizado** — para configurar algo do zero.

> 💡 Você **já criou o projeto `arcoiris`** separado do `curso`. 😄 Agora
> dentro do projeto `arcoiris`, clique em **Serviços → Aplicativo** para criar
> a sua aplicação Node.js (Passo 2 abaixo).

---

## 🆕 Passo 2 — Criar a Aplicação Node.js dentro do projeto `arcoiris`

Dentro do projeto `arcoiris`, clicou em **Services/Serviços → Aplicativo**.
Ele pede o **nome** e depois **criar**. Faça:

1. **Nome do aplicativo:** `arcoiris` (ou `arcoirispetshop`).
2. Clique em **Criar**.

> Após criar, o painel provavelmente vai **perguntar o que fazer** (implantar
> via repositório Git, escolher imagem/linguagem, etc.). Aí você escolhe a
> **linguagem Node.js** e informa:
> - **Comando de build:** `npm install`
> - **Comando de start:** `npm start`
> - **Porta interna (port):** uma porta livre (ex.: `3001`) — NÃO a mesma que
>   o projeto do `curso` usa.

> Se em vez disso ele abrir um **formulário de campos** (variáveis, porte, etc),
> preencha nesse momento. Se não, não tem problema — essas opções você encontra
> depois em **Environment / Variáveis** e **Build** da aplicação (Passos 4 e 5).

---

## 📤 Passo 3 — Fazer o upload do código do Arco Iris

Como o seu código já está num **ZIP** (não num repositório Git), você precisa
inserir os arquivos dentro do container da aplicação. No EasyPanel da HostGator,
as formas típicas são:

### Opção A — Subir o ZIP e extrair (mais garantida)
Dentro do **projeto**, com a aplicação criada:

1. Procure o botão **"Terminal" / "Console"** do contêiner.
2. Leve o ZIP até o servidor. Uma forma é via **SSH/SFTP na VPS** (o EasyPanel
   da HostGator não tem um "File Manager" de upload como o cPanel):
   - Use um cliente SFTP/SSH (FileZilla ou `scp`) para enviar
     `arcoirispetshop-backend-pacote.zip` para uma pasta do servidor.
   - Entre no terminal do container ou da VPS, extraia na pasta de trabalho da
     aplicação e rode `npm install`.

   > Ou seja: o arquivo local entra **via SSH/SFTP**, não por clique no painel.

### Opção B — Empurrar pelo Git (recomendado se quiser facilidade)
Se conseguir, suba o código do Arco Iris num repositório **GitHub** e, no
EasyPanel, use **"Deploy from repository"** para apontar a aplicação para ele.
O painel faz o clone, o build e o start automaticamente. (Recomendo, mas se o
Git assusta, fique na Opção A.)

> 📦 O ZIP do Arco Iris (`arcoirispetshop-backend-pacote.zip`) já contém tudo:
> `server.js`, `package.json`, `public/`, `.env.example`, etc. Após extrair na
> pasta da aplicação e rodar `npm install`, está pronto.

---

## ⚙️ Passo 4 — Variáveis de ambiente (.env)

No projeto `arcoiris`, na aba **"Environment Variables" / "Variáveis de
Ambiente"** (ou editando o `.env` no código após o upload), adicione:

```env
ADMIN_USER=admin
ADMIN_PASS=sua_senha_forte_aqui
AUTH_SECRET=um_texto_longo_qualquer_aqui
PORT=3001   # mesma porta interna que você usou ao criar o Aplicativo (Passo 2)
```

Salve e **reinicie a aplicação** se preciso.

---

## ▶️ Passo 5 — Iniciar e conferir

1. Inicie a aplicação (botão **"Start"** / "Restart").
2. Abra os **logs / console**. Deve aparecer:
   ```
   🚀 Arco Iris Pet Shop backend rodando na porta <PORTA>
   ```

---

## 🌐 Passo 6 — Abrir o site e o painel

O EasyPanel cria um **domínio interno** para a sua aplicação (ex.:
`arcoiris.seu-ip.sslip.io` ou um subdomínio temporário).

- **Site público:** a URL que o painel mostra para a sua app (adicione `/`)
- **Painel admin:** a mesma URL + `/admin.html`

Teste:

1. Abra o **painel** (`/admin.html`), faça login com `ADMIN_USER`/`ADMIN_PASS`.
2. Faça uma mudança (ex.: adicione texto na aba Textos).
3. Abra o **site público** numa janela anônima — a mudança deve aparecer. 🎉

> Para um **domínio profissional** (ex.: `www.minhaloja.com`): no item
> **Domains** do projeto, adicione o domínio e aponte o DNS conforme o painel
> instrui. Depois emita o **SSL** (Let's Encrypt) no botão correspondente.

---

## ⚠️ Passo 7 — Não quebrar o projeto do curso

- ✅ O Arco Iris vive num **projeto (`arcoiris`) separado** do projeto do curso.
- ✅ Cada app roda em **container Docker isolado** — não há conflito de arquivos.
- ✅ Só cuide para a **porta interna** da app do Arco Iris **não ser a mesma**
  que a do curso.
- ✅ Não reinicie/apague a aplicação do curso.

---

## 🧰 Solução de problemas (rápida)

| Problema | Solução |
|----------|---------|
| **Não acho "Node App"** | Correto — o EasyPanel não tem esse menu. No projeto, use **Serviços → Aplicativo** e escolha Node.js (Passo 2). |
| **Painel mostra "Modo local / sem servidor"** | A app não está respondendo `/api/health`. Confirme start, porta interna e variáveis. |
| **Porta em uso / já em uso** | A porta interna conflita com o curso. Mude para outra e reinicie. |
| **Dá 404 no site** | `public/index.html` não está na raiz da pasta da aplicação. Ajuste o `public root`. |
| **Não loga no painel** | Use `ADMIN_USER`/`ADMIN_PASS` do `.env`/variáveis no servidor. |
| **Upload quebra / imagem some** | Dê permissão de escrita à pasta `uploads/` e refaça o upload pelo painel publicado. |
| **`ERR_CONNECTION_REFUSED`** | A app não está rodando. Veja os **logs** e reinicie. |

---

## ✅ Checklist final

- [ ] Entrei no EasyPanel com usuário/senha
- [ ] Descobri a **porta** do projeto do curso (para não repetir)
- [ ] Criei o **projeto `arcoiris`** (separado do `curso`)
- [ ] No projeto, usei **Serviços → Aplicativo** e criei a app Node `arcoiris`
      (build `npm install`, start `npm start`, porta nova)
- [ ] Enviei e extraí o ZIP na **pasta da app** (server.js visível na raiz)
      ou conectei pelo Git
- [ ] Rodei `npm install`
- [ ] Criei as variáveis de ambiente (`.env`) com senha forte e secret
- [ ] Iniciei a app — log mostrou a porta
- [ ] Abri `/admin.html`, logei e fiz uma mudança
- [ ] A mudança apareceu no site público 🎉
- [ ] O projeto do **curso continua funcionando** 👍

---

Boa sorte! Se encontrar qualquer erro, me manda o **texto do log** do
EasyPanel que eu te ajudo a resolver.
