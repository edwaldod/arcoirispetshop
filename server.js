/* ============================================================
   ARCO IRIS PET SHOP — Backend (Node.js + Express)
   ------------------------------------------------------------
   Serve o site estático (public/) e expõe uma API REST para o
   painel administrativo. Os dados ficam salvos em data/db.json
   no servidor, então as alterações valem para TODOS os visitantes.

   Variáveis de ambiente (opcional — veja .env.example):
     PORT         porta do servidor (padrão: process.env.PORT ou 3000)
     ADMIN_USER   usuário do painel (padrão: admin)
     ADMIN_PASS   senha do painel (padrão: 123456)  -> MUDE ISSO!
     AUTH_SECRET  segredo p/ assinar o token de login (padrão: aleatório)
   ============================================================ */

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');

const app = express();

// ------------------------------------------------------------
// PASTAS
// ------------------------------------------------------------
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

for (const dir of [UPLOADS_DIR, DATA_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || '123456';
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

const MAX_SLIDES = 9;
const VIDEO_COUNT = 4;

// ------------------------------------------------------------
// BANCO DE DADOS (JSON simples no disco)
// ------------------------------------------------------------
function defaultDb() {
  return {
    media: [],            // [{ id, name, type, file }]  -> file é o nome do arquivo em /uploads
    slides: new Array(MAX_SLIDES).fill(null), // slots fixos Banner 1..9
    videos: [
      { id: 1, title: 'Vídeo 1', url: '' },
      { id: 2, title: 'Vídeo 2', url: '' },
      { id: 3, title: 'Vídeo 3', url: '' },
      { id: 4, title: 'Vídeo 4', url: '' }
    ]
  };
}

let DB = null;

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    DB = defaultDb();
    saveDb();
    return;
  }
  try {
    DB = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    DB = defaultDb();
    saveDb();
    return;
  }
  // Garante que as estruturas existam (mesmo se o arquivo for antigo/incoerente)
  if (!Array.isArray(DB.media)) DB.media = [];
  if (!Array.isArray(DB.slides) || DB.slides.length < MAX_SLIDES) {
    const s = new Array(MAX_SLIDES).fill(null);
    (Array.isArray(DB.slides) ? DB.slides : []).forEach((x, i) => { if (i < MAX_SLIDES && x) s[i] = x; });
    DB.slides = s;
  }
  if (!Array.isArray(DB.videos) || DB.videos.length < VIDEO_COUNT) {
    const v = defaultDb().videos;
    (Array.isArray(DB.videos) ? DB.videos : []).forEach((x, i) => {
      if (i < VIDEO_COUNT && x) v[i] = { id: i + 1, title: x.title || v[i].title, url: x.url || '' };
    });
    DB.videos = v.slice(0, VIDEO_COUNT);
  }
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(DB, null, 2));
  } catch (e) {
    console.error('Erro ao salvar db.json:', e.message);
  }
}

// ------------------------------------------------------------
// AUTENTICAÇÃO (login que devolve um token assinado)
// ------------------------------------------------------------
function signToken() {
  const payload = `${ADMIN_USER}|${Date.now()}`;
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

function verifyToken(token) {
  try {
    const decoded = Buffer.from(String(token), 'base64url').toString('utf8');
    const idx = decoded.lastIndexOf('.');
    if (idx < 0) return false;
    const payload = decoded.slice(0, idx);
    const sig = decoded.slice(idx + 1);
    const expect = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
    if (sig !== expect) return false;
    const [user] = payload.split('|');
    return user === ADMIN_USER;
  } catch (e) {
    return false;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Não autorizado. Faça login no painel.' });
  }
  next();
}

// ------------------------------------------------------------
// MIDDLEWARES
// ------------------------------------------------------------
app.use(express.json({ limit: '2mb' }));
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// ------------------------------------------------------------
// UPLOAD DE MÍDIAS (multer)
// ------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = 'media-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // até 15MB por arquivo
});

// ------------------------------------------------------------
// API — LOGIN
// ------------------------------------------------------------
app.post('/api/login', (req, res) => {
  const u = String((req.body && req.body.user) || '').trim();
  const p = String((req.body && req.body.pass) || '').trim();
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    const token = signToken();
    return res.json({ ok: true, user: ADMIN_USER, token });
  }
  return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
});

// ------------------------------------------------------------
// API — SLIDES
// ------------------------------------------------------------
// GET público: devolve os 9 slots (para o site montar o carrossel)
app.get('/api/slides', (req, res) => {
  res.json({ slides: DB.slides });
});

// PUT autenticado: substitui todos os slides
app.put('/api/slides', requireAuth, (req, res) => {
  let slides = req.body && req.body.slides;
  if (!Array.isArray(slides)) {
    return res.status(400).json({ error: 'Formato inválido. Envie { slides: [...] }.' });
  }
  const clean = new Array(MAX_SLIDES).fill(null);
  slides.slice(0, MAX_SLIDES).forEach((s, i) => {
    if (s && s.media) clean[i] = {
      type: s.type === 'video' ? 'video' : 'image',
      title: s.title || '',
      text: s.text || '',
      badge: s.badge || '',
      media: s.media || '',
      link: s.link || '',
      btnText: s.btnText || '',
      active: true
    };
  });
  DB.slides = clean;
  saveDb();
  res.json({ ok: true, slides: DB.slides });
});

// ------------------------------------------------------------
// API — VÍDEOS
// ------------------------------------------------------------
// GET público
app.get('/api/videos', (req, res) => {
  res.json({ videos: DB.videos });
});

// PUT autenticado
app.put('/api/videos', requireAuth, (req, res) => {
  let videos = req.body && req.body.videos;
  if (!Array.isArray(videos)) {
    return res.status(400).json({ error: 'Formato inválido. Envie { videos: [...] }.' });
  }
  const out = [];
  for (let i = 0; i < VIDEO_COUNT; i++) {
    const v = videos[i] || {};
    out.push({ id: i + 1, title: v.title || `Vídeo ${i + 1}`, url: String(v.url || '').trim() });
  }
  DB.videos = out;
  saveDb();
  res.json({ ok: true, videos: DB.videos });
});

// ------------------------------------------------------------
// API — MÍDIAS (upload)
// ------------------------------------------------------------
// GET público
app.get('/api/media', (req, res) => {
  res.json({ media: DB.media });
});

// POST autenticado: faz upload de um arquivo
app.post('/api/media', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  const isVideo = req.file.mimetype.startsWith('video/');
  const item = {
    id: crypto.randomBytes(8).toString('hex'),
    name: req.file.originalname,
    type: isVideo ? 'video' : 'image',
    file: req.file.filename // nome do arquivo em /uploads
  };
  DB.media.push(item);
  saveDb();
  // URL absoluta acessível ao site
  const proto = (req.headers['x-forwarded-proto'] || 'http');
  const host = req.headers.host || `localhost:${PORT}`;
  const url = `${proto}://${host}/uploads/${item.file}`;
  res.json({ ok: true, item, url });
});

// DELETE autenticado
app.delete('/api/media/:id', requireAuth, (req, res) => {
  const id = req.params.id;
  const idx = DB.media.findIndex((m) => m.id === id);
  if (idx < 0) return res.status(404).json({ error: 'Mídia não encontrada.' });
  const [removed] = DB.media.splice(idx, 1);
  // Remove o arquivo físico (melhor esforço)
  if (removed && removed.file) {
    try { fs.unlinkSync(path.join(UPLOADS_DIR, removed.file)); } catch (e) { /* ignora */ }
  }
  saveDb();
  res.json({ ok: true });
});

// ------------------------------------------------------------
// HEALTHCHECK
// ------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ ok: true, name: 'arcoirispetshop', time: new Date().toISOString() }));

// ------------------------------------------------------------
// INICIALIZAÇÃO
// ------------------------------------------------------------
loadDb();

app.listen(PORT, () => {
  console.log(`🚀 Arco Iris Pet Shop backend rodando na porta ${PORT}`);
  console.log(`   Painel: http://localhost:${PORT}/admin.html`);
});
