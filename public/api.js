/* ============================================================
   ARCO IRIS PET SHOP — Camada de API (compartilhada)
   ------------------------------------------------------------
   Centraliza o acesso ao backend (REST) e, caso o backend não
   exista/pare, cai para o localStorage (modo estático antigo).
   Assim o site funciona igual antes quando aberto direto,
   mas usa o servidor quando estiver publicado.

   Chaves de localStorage (mantidas para compatibilidade):
     ai_media  ai_slides  ai_videos  ai_admin_token
   ============================================================ */

window.Api = (function () {
  // ----------------------------------------------------------
  // Utilitários
  // ----------------------------------------------------------
  function getLS(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function setLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignora */ }
  }

  async function http(method, url, body, isForm) {
    const opts = { method, headers: {} };
    const token = getToken();
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body !== undefined) {
      if (isForm) {
        opts.body = body; // FormData -> multer define o content-type
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
    }
    const res = await fetch(url, opts);
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
    return { ok: res.ok, status: res.status, json };
  }

  // Detecta se há backend disponível (no mesmo domínio)
  let backendChecked = false;
  async function isBackend() {
    try {
      const res = await fetch('/api/health', { method: 'GET' });
      if (res.ok) return true;
    } catch (e) { /* sem backend */ }
    backendChecked = true;
    return false;
  }

  // ----------------------------------------------------------
  // Token de autenticação
  // ----------------------------------------------------------
  function getToken() {
    try { return localStorage.getItem('ai_admin_token') || ''; } catch (e) { return ''; }
  }
  function setToken(t) {
    try { t ? localStorage.setItem('ai_admin_token', t) : localStorage.removeItem('ai_admin_token'); } catch (e) { /* ignora */ }
  }

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------
  // Retorna true se autenticou. Em modo estático (sem backend),
  // valida contra as credenciais locais antigas.
  async function login(user, pass) {
    const usingBackend = await isBackend();
    if (usingBackend) {
      const { ok, json } = await http('POST', '/api/login', { user, pass });
      if (ok && json && json.token) {
        setToken(json.token);
        return true;
      }
      return false;
    }
    // Fallback estático (nunca usar em produção — deixa o usuário trocar)
    if (user === 'admin' && pass === '123456') {
      setToken('local-fallback-login');
      return true;
    }
    return false;
  }

  function logout() { setToken(''); }

  function isLoggedIn() { return !!getToken(); }

  // ----------------------------------------------------------
  // Slides (9 slots fixos)
  // ----------------------------------------------------------
  async function getSlides() {
    if (await isBackend()) {
      const { ok, json } = await http('GET', '/api/slides');
      if (ok && json && Array.isArray(json.slides)) return json.slides;
    }
    // Fallback: lê do localStorage
    const raw = getLS('ai_slides', []);
    const slots = new Array(9).fill(null);
    if (Array.isArray(raw)) raw.forEach((s, i) => { if (i < 9 && s && s.media) slots[i] = s; });
    else if (raw && typeof raw === 'object') {
      for (let i = 1; i <= 9; i++) if (raw[i] && raw[i].media) slots[i - 1] = raw[i];
    }
    return slots;
  }

  async function setSlides(slides) {
    if (await isBackend()) {
      const clean = new Array(9).fill(null);
      slides.slice(0, 9).forEach((s, i) => { if (s && s.media) clean[i] = s; });
      const { ok } = await http('PUT', '/api/slides', { slides: clean });
      return ok;
    }
    setLS('ai_slides', slides);
    return true;
  }

  // ----------------------------------------------------------
  // Vídeos (4 vídeos fixos)
  // ----------------------------------------------------------
  async function getVideos() {
    const defaults = [1, 2, 3, 4].map((i) => ({ id: i, title: 'Vídeo ' + i, url: '' }));
    if (await isBackend()) {
      const { ok, json } = await http('GET', '/api/videos');
      if (ok && Array.isArray(json && json.videos)) {
        return defaults.map((d, i) => {
          const p = json.videos[i] || {};
          return { id: d.id, title: p.title || d.title, url: p.url || '' };
        });
      }
    }
    const raw = getLS('ai_videos', []);
    if (Array.isArray(raw) && raw.length >= 4) {
      return defaults.map((d, i) => {
        const p = raw[i] || {};
        return { id: d.id, title: p.title || d.title, url: p.url || '' };
      });
    }
    return defaults;
  }

  async function setVideos(videos) {
    if (await isBackend()) {
      const out = [1, 2, 3, 4].map((i) => {
        const v = (videos && videos[i - 1]) || {};
        return { id: i, title: v.title || 'Vídeo ' + i, url: String(v.url || '').trim() };
      });
      const { ok } = await http('PUT', '/api/videos', { videos: out });
      return ok;
    }
    setLS('ai_videos', videos);
    return true;
  }

  // ----------------------------------------------------------
  // Mídias (biblioteca) — no backend vira arquivo em /uploads
  // ----------------------------------------------------------
  async function getMedia() {
    if (await isBackend()) {
      const { ok, json } = await http('GET', '/api/media');
      if (ok && Array.isArray(json && json.media)) return json.media;
    }
    return getLS('ai_media', []);
  }

  // Faz upload. Em modo backend devolve { item, url }; em modo estático
  // devolve item com data-URL (igual ao comportamento antigo).
  async function uploadMedia(file) {
    if (await isBackend()) {
      const fd = new FormData();
      fd.append('file', file);
      const { ok, json } = await http('POST', '/api/media', fd, true);
      if (ok && json) return { item: json.item, url: json.url };
      return null;
    }
    // Fallback estático: converte em data-URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        resolve({ item: { name: file.name, type, data: reader.result }, url: reader.result });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // Remove uma mídia (por id no backend; por índice no modo estático)
  async function deleteMedia(id, index) {
    if (await isBackend()) {
      if (!id) return false;
      const { ok } = await http('DELETE', '/api/media/' + encodeURIComponent(id));
      return ok;
    }
    const arr = getLS('ai_media', []);
    if (typeof index === 'number' && index >= 0 && index < arr.length) {
      arr.splice(index, 1);
      setLS('ai_media', arr);
      return true;
    }
    return false;
  }

  // ----------------------------------------------------------
  // Helper: converte link para embed (compartilhado por todos)
  // ----------------------------------------------------------
  function toEmbedUrl(input) {
    if (!input) return '';
    const url = String(input).trim();
    if (!url) return '';
    if (url.indexOf('plugins/video.php') > -1) return url;
    if (url.indexOf('/embed') > -1) return url;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i);
    if (yt) return 'https://www.youtube.com/embed/' + yt[1];
    if (url.indexOf('facebook.com/') > -1) {
      const clean = url.split('?')[0];
      const enc = encodeURIComponent(clean);
      return 'https://www.facebook.com/plugins/video.php?height=314&href=' + enc + '&show_text=false&width=560';
    }
    const ig = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/i);
    if (ig) return 'https://www.instagram.com/' + ig[1] + '/embed';
    return url;
  }

  // Resolve a URL de exibição de uma mídia da biblioteca
  function mediaUrl(m) {
    if (!m) return '';
    if (m.data) return m.data;              // modo estático (data-URL)
    if (m.file) return '/uploads/' + m.file; // modo backend
    return '';
  }

  return {
    isBackend,
    getToken, setToken,
    login, logout, isLoggedIn,
    getSlides, setSlides,
    getVideos, setVideos,
    getMedia, uploadMedia, deleteMedia,
    toEmbedUrl, mediaUrl
  };
})();
