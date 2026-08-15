# 🌐 Como Publicar o Site Arco Iris Pet Shop

Este é um **site estático** (HTML, CSS, JS e imagens) — não precisa de servidor de aplicação,
banco de dados ou PHP. Qualquer hospedagem de sites estáticos funciona.

---

## 🆓 Opção 1 — Grátis e Simples: Netlify (arrastar e soltar)

Sem pagar nada e sem precisar de terminal/Git. Ideal para começar.

1. Acesse **https://app.netlify.com** e crie uma conta (pode entrar com GitHub/Google).
2. Clique em **"Add new site" → "Deploy manually"** (ou "Drag and drop").
3. Arraste a **pasta `arcoirispetshop`** para a área indicada.
   ⚠️ Arraste a **pasta inteira** (a que contém `index.html`), não apenas os arquivos soltos.
   ⚠️ **Não** necessariamente inclua a pasta `images` vazia de fotos originais — o site usa
   só os arquivos de `images/` que você já tem. Pode publicar a pasta inteira mesmo assim.
4. Aguarde o upload. O Netlify gera um endereço tipo `https://SEU-SITE.netlify.app`.
5. Pronto! Seu site está no ar.

### Atualizar depois
Refaça o "drag and drop" da pasta sempre que mudar algo, ou conecte um repositório Git
para atualização automática.

---

## 🆓 Opção 2 — Grátis: GitHub Pages

Mais "técnico", mas também gratuito e com atualização fácil.

1. Crie uma conta em **https://github.com**.
2. Crie um repositório novo (ex.: `arcoirispetshop`).
3. Envie a pasta `arcoirispetshop` para esse repositório.
4. Em **Settings → Pages**, em "Branch", selecione `main` e a pasta `/(root)` → **Save**.
5. Em alguns minutos o site fica no ar em `https://SEU-USUARIO.github.io/arcoirispetshop/`.

---

## 💳 Opção 3 — Hospedagem Paga com Domínio Próprio (recomendado para empresa)

Ideal quando você quiser um nome profissional, ex.: `arcoirispetshop.com.br`.

Hospedagens comuns no Brasil: **Hostinger, HostGator, KingHost, Locaweb, Hostinger**.

Passos gerais:
1. Escolha um plano de hospedagem (os "Planos de Site"/hospedagem compartilhada servem).
2. **Compre um domínio** (ex.: `arcoirispetshop.com.br`).
3. No painel da hospedagem, use o **Gerenciador de Arquivos** (File Manager):
   - Vá até a pasta pública (normalmente `public_html/` ou `www/`).
   - **Envie** o conteúdo da pasta `arcoirispetshop` para lá
     (o `index.html` deve ficar **direto na raiz** de `public_html`).
4. A hospedagem normalmente instala SSL automático (HTTPS).
5. Seu site fica em `https://arcoirispetshop.com.br`.

---

## 📁 O que enviar (certo vs. errado)

**Envie estes arquivos/pastas na raiz do host:**

```
public_html/            <- "pasta pública"
 ├── index.html         <- PÁGINA PRINCIPAL (obrigatório na raiz)
 ├── style.css
 ├── script.js
 ├── admin.html
 ├── admin.css
 ├── admin.js
 ├── LOGO.JPG           <- opcional (usados em páginas/seções)
 ├── LOGO.png
 └── images/            <- IMAGENS do site (foto1.jpg a foto9.jpg)
      ├── foto1.jpg
      ├── foto2.jpg
      └── ... (até foto9.jpg)
```

🔑 O `index.html` **tem que estar na raiz** da pasta pública, senão a hospedagem
não encontra a página inicial.

---

## ⚠️ Importante sobre o painel de administração (admin.html)

O painel (`admin.html`) **salva tudo no navegador** usando `localStorage`
(slides do banner, vídeos e mídias). Isso tem uma consequência importante:

### O que acontece depois de publicar
- Quando você abre `https://SEU-SITE/admin.html` e altera os banners/vídeos, os dados
  ficam gravados **somente no navegador daquele computador/celular**.
- Um visitante que abre o site em outro dispositivo **não vê** essas alterações:
  ele vê os slides padrão que estão gravados no `index.html`.
- O "login" do painel é **fictício** (`admin`/senha que você definir em `admin.js`) —
  ele só controla quem pode abrir a tela; não protege dados no servidor.

### Como fazer, então, para valer para todos?
Como o projeto é 100% estático, o jeito correto é:
1. Abrir `admin.html` **no seu computador** (ou no arquivo publicado) e montar os banners/vídeos.
2. Depois, **copiar esses dados para dentro do `index.html`** (os slides padrão) e
   **republicar a pasta** (novo "drag and drop" no Netlify / upload na hospedagem).
3. Todo visitante passará a ver o novo conteúdo.

### Se você quiser um "gerenciamento real" (todos veem as mudanças)
Para o painel alterar o site para **todos os visitantes de uma vez** (com login de verdade,
banco de dados, sessões), é preciso um **backend** — ex.: Netlify Functions, um pequeno
servidor Node, ou Firebase/Supabase. Isso é mais avançado. **Posso te ajudar a montar isso**
se for o caminho que você quer.

---

## ✅ Checklist final antes de publicar

- [ ] Teste o site localmente: abra `index.html` no navegador.
- [ ] Verique o banner (agora com 9 fotos, começando pela foto 4).
- [ ] Confira os links do WhatsApp e do Google Maps.
- [ ] Confirme que as 9 imagens existem em `images/`.
- [ ] Escolha um método acima e publique a pasta inteira.

Dúvidas? Posso te ajudar a configurar qualquer uma das opções passo a passo.
