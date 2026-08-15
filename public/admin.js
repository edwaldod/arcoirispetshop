// ============================================================
// PAINEL ADMINISTRATIVO — Arco Iris Pet Shop
// Gerencia vídeos e fotos do banner do site.
//
// PERSISTÊNCIA:
//   - Com backend (servidor), usa a API REST via Api (api.js).
//   - Sem backend, cai para localStorage (modo estático).
// As alterações salvas valem para TODOS os visitantes quando o
// backend estiver publicado (Ex.: HostGator EasyPanel).
// ============================================================

// Chaves de armazenamento (mantidas p/ compatibilidade)
const STORE_MEDIA = 'ai_media';
const STORE_SLIDES = 'ai_slides';
const STORE_VIDEOS = 'ai_videos';

// Limite de slides do banner rotativo
const MAX_SLIDES = 9;
// Índices fixos dos 4 vídeos (1 a 4)
const VIDEO_COUNT = 4;

// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================
const loginScreen = document.getElementById('loginScreen');
const panel = document.getElementById('panel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const slidesManager = document.getElementById('slidesManager');
const mediaGrid = document.getElementById('mediaGrid');
const slidesCountEl = document.getElementById('slidesCount');
const videosEditor = document.getElementById('videosEditor');

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');

// Modal
const slideModal = document.getElementById('slideModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const slideForm = document.getElementById('slideForm');
const slideType = document.getElementById('slideType');
const slideMediaSelect = document.getElementById('slideMediaSelect');
const slideMediaUrl = document.getElementById('slideMediaUrl');
const deleteSlideBtn = document.getElementById('deleteSlideBtn');

// Upload
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

// Toast
const toastEl = document.getElementById('toast');

// Estado
let currentSlides = [];
let currentMedia = [];
let currentVideos = []; // array de 4 { id, title, url }
let editingIndex = null;
let backendAvailable = false;

// ============================================================
// AUTENTICAÇÃO
// ============================================================
function isAuthed() { return Api.isLoggedIn(); }

function enterAdmin() {
    loginScreen.hidden = true;
    panel.hidden = false;
    initPanel();
}

function exitAdmin() {
    Api.logout();
    loginScreen.hidden = false;
    panel.hidden = true;
}

// Já autenticado? Vai direto ao painel.
if (isAuthed()) {
    enterAdmin();
} else {
    loginScreen.hidden = false;
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();
    const ok = await Api.login(u, p);
    if (ok) {
        loginError.hidden = true;
        loginForm.reset();
        enterAdmin();
    } else {
        loginError.hidden = false;
    }
});

logoutBtn.addEventListener('click', exitAdmin);

// ============================================================
// INICIALIZAÇÃO DO PAINEL (carrega do backend / localStorage)
// ============================================================
async function initPanel() {
    if (toastEl) toastEl.hidden = true;
    // Verifica se há backend
    backendAvailable = await Api.isBackend();
    if (backendAvailable) {
        toast('Conectado ao servidor. Alterações valem para todos.', 'success');
    } else {
        toast('Modo local (sem servidor). Alterações ficam só neste navegador.', '');
    }

    currentMedia = await Api.getMedia();
    currentSlides = await Api.getSlides();
    currentVideos = await Api.getVideos();
    document.getElementById('userLabel').textContent = 'admin';
    renderSlides();
    renderMedia();
    renderVideos();
    populateMediaSelect();
    hideToastSoon();
}

function hideToastSoon() {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { if (toastEl) toastEl.hidden = true; }, 4000);
}

// ============================================================
// TABS
// ============================================================
tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
});

// ============================================================
// RENDERIZA OS 9 SLOTS DE BANNER
// ============================================================
function renderSlides() {
    if (!slidesManager) return;
    const filled = currentSlides.filter(s => !!s).length;
    if (slidesCountEl) slidesCountEl.textContent = `${filled} / ${MAX_SLIDES}`;

    slidesManager.innerHTML = currentSlides.map((s, i) => {
        const num = i + 1; // Banner 1..9
        if (!s) {
            return `
            <div class="slide-card empty">
                <div class="slot-badge">Banner ${num}</div>
                <div class="thumb empty-thumb">🖼</div>
                <div class="info">
                    <span class="type-tag empty-tag">vazio</span>
                    <h4>Banner ${num} — sem imagem</h4>
                    <p>Clique em "Preencher" para adicionar.</p>
                </div>
                <div class="actions">
                    <button class="slide-edit" onclick="openEditSlide(${i})">➕ Preencher</button>
                </div>
            </div>`;
        }
        const thumb = s.type === 'video'
            ? '🎥'
            : `<img src="${esc(s.media)}" alt="">`;
        return `
        <div class="slide-card">
            <div class="slot-badge">Banner ${num}</div>
            <div class="thumb">${thumb}</div>
            <div class="info">
                <span class="type-tag ${s.type}">${s.type}</span>
                <h4>${esc(s.title || 'Sem título')}</h4>
                <p>${esc(s.media || '—')}</p>
            </div>
            <div class="actions">
                <button class="slide-edit" onclick="openEditSlide(${i})">✏️ Editar</button>
                <button class="slide-clear" onclick="clearSlide(${i})">🗑 Limpar</button>
            </div>
        </div>`;
    }).join('');
}

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

// Limpa um slot (Banner i) específico
async function clearSlide(i) {
    if (i < 0 || i >= MAX_SLIDES || !currentSlides[i]) return;
    if (!confirm('Limpar o Banner ' + (i + 1) + '?')) return;
    currentSlides[i] = null;
    const ok = await Api.setSlides(currentSlides);
    renderSlides();
    toast(`Banner ${i + 1} limpo.`, ok ? 'success' : 'error');
}

// ============================================================
// MODAL — PREENCHER / EDITAR UM SLOT DE BANNER (i = 0..8)
// ============================================================
function openEditSlide(i) {
    editingIndex = i;
    const s = currentSlides[i];
    const num = i + 1;

    if (!s) {
        modalTitle.textContent = `Preencher Banner ${num}`;
        slideForm.reset();
        slideType.value = 'image';
        deleteSlideBtn.hidden = true;
    } else {
        modalTitle.textContent = `Trocar imagem do Banner ${num}`;
        slideForm.reset();
        slideType.value = s.type;
        slideMediaUrl.value = s.media || '';
        deleteSlideBtn.hidden = false;
    }
    toggleTypeFields();
    populateMediaSelect();
    showModal();
}

function showModal() { slideModal.hidden = false; }
function hideModal() { slideModal.hidden = true; editingIndex = null; }

modalClose.addEventListener('click', hideModal);
slideModal.addEventListener('click', (e) => { if (e.target === slideModal) hideModal(); });

function toggleTypeFields() { void slideType.value; }

slideType.addEventListener('change', populateMediaSelect);

function populateMediaSelect() {
    const type = slideType.value;
    let opts = '<option value="">— Selecione da biblioteca —</option>';
    const imgs = currentMedia.filter(m => m.type === 'image');
    const vids = currentMedia.filter(m => m.type === 'video');
    const render = (m, idx, label) => `<option value="${esc(Api.mediaUrl(m))}">${label} ${idx + 1}${m.name ? ' — ' + esc(m.name) : ''}</option>`;

    if (type === 'image') {
        imgs.forEach((m, idx) => { opts += render(m, idx, 'Imagem'); });
        if (vids.length) {
            opts += `<optgroup label="Vídeos">${vids.map((m, idx) => render(m, idx, 'Vídeo')).join('')}</optgroup>`;
        }
    } else {
        vids.forEach((m, idx) => { opts += render(m, idx, 'Vídeo'); });
        if (imgs.length) {
            opts += `<optgroup label="Imagens">${imgs.map((m, idx) => render(m, idx, 'Imagem')).join('')}</optgroup>`;
        }
    }
    slideMediaSelect.innerHTML = opts;
}

// Ao escolher uma mídia da biblioteca, preenche o campo URL
slideMediaSelect.addEventListener('change', () => {
    if (slideMediaSelect.value) slideMediaUrl.value = slideMediaSelect.value;
});

// ============================================================
// SALVAR SLIDE
// ============================================================
slideForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const media = slideMediaUrl.value.trim();
    if (!media) {
        toast('Escolha ou informe uma imagem/vídeo.', 'error');
        return;
    }
    const data = {
        type: slideType.value,
        title: '',
        text: '',
        badge: '',
        media: media,
        link: '',
        btnText: '',
        active: true
    };

    if (editingIndex !== null) {
        currentSlides[editingIndex] = data;
        const ok = await Api.setSlides(currentSlides);
        renderSlides();
        hideModal();
        toast(`Banner ${editingIndex + 1} salvo com sucesso!`, ok ? 'success' : 'error');
    }
});

deleteSlideBtn.addEventListener('click', async () => {
    if (editingIndex === null) return;
    if (!confirm('Limpar o Banner ' + (editingIndex + 1) + '?')) return;
    currentSlides[editingIndex] = null;
    const ok = await Api.setSlides(currentSlides);
    renderSlides();
    hideModal();
    toast(`Banner ${editingIndex + 1} limpo.`, ok ? 'success' : 'error');
});

// ============================================================
// UPLOAD DE MÍDIAS
// ============================================================
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
    fileInput.value = '';
});

async function handleFiles(files) {
    for (const file of Array.from(files)) {
        // Em modo estático o arquivo vira data-URL no localStorage (limite 3MB).
        // No backend o limite é 15MB. Mostramos aviso amigável conforme o modo.
        const limit = backendAvailable ? 15 * 1024 * 1024 : 3 * 1024 * 1024;
        if (file.size > limit) {
            toast(`"${file.name}" é muito grande (máx. ${limit / 1024 / 1024}MB).`, 'error');
            continue;
        }
        toast(`Enviando "${file.name}"...`, '');
        const result = await Api.uploadMedia(file);
        if (!result) {
            toast(`Falha ao enviar "${file.name}".`, 'error');
            continue;
        }
        currentMedia.push(result.item);
        renderMedia();
        populateMediaSelect();
        toast(`"${file.name}" adicionado à biblioteca.`, 'success');
        await new Promise(r => setTimeout(r, 50));
    }
}

function renderMedia() {
    if (currentMedia.length === 0) {
        mediaGrid.innerHTML = '<p style="color:#8a91a4;text-align:center;grid-column:1/-1;padding:2rem 0;">Nenhuma mídia enviada ainda.</p>';
        return;
    }
    mediaGrid.innerHTML = currentMedia.map((m, i) => {
        const isVideo = m.type === 'video';
        const src = Api.mediaUrl(m);
        const thumb = isVideo
            ? `<video src="${esc(src)}" muted></video>`
            : `<img src="${esc(src)}" alt="">`;
        return `
        <div class="media-item">
            <div class="thumb">${thumb}</div>
            <div class="meta">
                <small>${esc(m.name || (isVideo ? 'Vídeo' : 'Imagem'))}</small>
                <button class="del" onclick="deleteMedia(${i})" title="Excluir">🗑</button>
            </div>
        </div>`;
    }).join('');
}

async function deleteMedia(i) {
    if (!confirm('Excluir esta mídia da biblioteca?')) return;
    const m = currentMedia[i];
    const ok = await Api.deleteMedia(m && m.id, i);
    if (ok) {
        currentMedia.splice(i, 1);
        renderMedia();
        populateMediaSelect();
        toast('Mídia excluída.', 'success');
    } else {
        toast('Não foi possível excluir.', 'error');
    }
}

// ============================================================
// VÍDEOS (4 vídeos fixos, trocados pelo admin)
// ============================================================
function toEmbedUrl(input) { return Api.toEmbedUrl(input); }

// Renderiza os 4 cards de vídeo
function renderVideos() {
    if (!videosEditor) return;
    videosEditor.innerHTML = currentVideos.map((v, i) => {
        const embed = toEmbedUrl(v.url);
        const preview = embed
            ? `<div class="vid-frame"><iframe src="${esc(embed)}" width="100%" height="220" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe></div>`
            : `<div class="vid-empty">Sem vídeo — cole o link abaixo</div>`;
        return `
        <div class="video-ed-card">
            <div class="video-ed-head">
                <span class="video-ed-num">${i + 1}</span>
                <h4>Vídeo ${i + 1}</h4>
            </div>
            <div class="video-ed-preview">${preview}</div>
            <label for="videoUrl${i}">Link (Facebook / Instagram / YouTube)</label>
            <input type="url" id="videoUrl${i}" class="video-url"
                   value="${esc(v.url)}"
                   placeholder="https://www.facebook.com/reel/...">
            <button class="btn btn-primary btn-save-video" onclick="saveVideo(${i})">💾 Salvar Vídeo ${i + 1}</button>
        </div>`;
    }).join('');
}

// Salva o URL do vídeo i (0..3)
async function saveVideo(i) {
    const input = document.getElementById('videoUrl' + i);
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) {
        currentVideos[i].url = '';
        const ok = await Api.setVideos(currentVideos);
        renderVideos();
        toast(`Vídeo ${i + 1} removido.`, ok ? 'success' : 'error');
        return;
    }
    if (!toEmbedUrl(raw)) {
        toast('Informe um link válido do Facebook, Instagram ou YouTube.', 'error');
        return;
    }
    currentVideos[i].url = raw;
    const ok = await Api.setVideos(currentVideos);
    renderVideos();
    toast(`Vídeo ${i + 1} salvo com sucesso!`, ok ? 'success' : 'error');
}

// ============================================================
// TOAST
// ============================================================
let toastTimer;
function toast(msg, type = 'success') {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = 'toast ' + type;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { if (toastEl) toastEl.hidden = true; }, 3000);
}
