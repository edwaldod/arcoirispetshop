/* ===== Arco Iris Pet Shop · interações ===== */

/* ---- Alternar tema claro / escuro ---- */
(function () {
    const STORAGE_KEY = 'arcopetshop-theme';
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');

    // Lê a preferência salva; se não houver, segue o sistema (prefers-color-scheme)
    function getInitialTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') return saved;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        root.classList.toggle('dark-mode', theme === 'dark');
        if (btn) {
            const label = theme === 'dark'
                ? 'Mudar para o tema claro'
                : 'Mudar para o tema escuro';
            btn.setAttribute('aria-label', label);
            btn.setAttribute('title', label);
        }
    }

    // Aplica o tema inicial o quanto antes
    const initial = getInitialTheme();
    applyTheme(initial);

    if (btn) {
        btn.addEventListener('click', () => {
            const isDark = root.classList.contains('dark-mode');
            const next = isDark ? 'light' : 'dark';
            applyTheme(next);
            try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
        });
    }

    // Segue mudanças do sistema apenas quando o usuário ainda não escolheu manualmente
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
})();

// Ano no rodapé
document.addEventListener('DOMContentLoaded', () => {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});

// Menu mobile
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Fecha o menu ao clicar em um link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Fecha o menu ao clicar fora
document.addEventListener('click', (e) => {
    if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

// Formulário de contato → abre WhatsApp com mensagem pronta
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = (document.getElementById('nome')?.value || '').trim();
        const telefone = (document.getElementById('telefone')?.value || '').trim();
        const mensagem = (document.getElementById('mensagem')?.value || '').trim();

        // Validação simples
        if (!nome || !telefone || !mensagem) {
            alert('Preencha todos os campos para continuar 😊');
            return;
        }

        const texto = `Olá, Arco Iris Pet Shop! 🐾%0A%0A*Nome:* ${encodeURIComponent(nome)}%0A*Telefone:* ${encodeURIComponent(telefone)}%0A*Mensagem:* ${encodeURIComponent(mensagem)}`;

        const wa = `https://wa.me/5519974197990?text=${texto}`;
        window.open(wa, '_blank');
    });
}

// Destaca o link ativo na navegação conforme a rolagem
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-link');

if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        },
        { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
}

// ============================================================
// HERO BANNER ROTATIVO
// Suporta os slides padrão (HTML) e os slides gerenciados pelo
// painel admin (localStorage, chave 'ai_slides').
// ============================================================
const slider = document.getElementById('heroSlider');
const dotsWrap = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');

let currentSlide = 0;
let slideInterval;

// Cria um slide (imagem ou vídeo) a partir dos dados do admin
function buildSlideNode(data) {
    const slide = document.createElement('div');
    slide.className = 'slide';

    const media = document.createElement('div');
    media.className = 'slide-media';

    if (data.type === 'video') {
        const video = document.createElement('video');
        video.src = data.media;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        video.setAttribute('aria-hidden', 'true');
        media.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = data.media;
        img.alt = data.title || 'Slide do banner';
        img.loading = 'lazy';
        media.appendChild(img);
    }

    slide.appendChild(media);

    const overlay = document.createElement('div');
    overlay.className = 'slide-overlay';
    slide.appendChild(overlay);

    const content = document.createElement('div');
    content.className = 'container slide-content';

    if (data.badge) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.innerHTML = `${data.badge}`;
        content.appendChild(badge);
    }

    if (data.title) {
        const h = document.createElement('h1');
        h.innerHTML = data.title;
        content.appendChild(h);
    }

    if (data.text) {
        const p = document.createElement('p');
        p.className = 'hero-sub';
        p.innerHTML = data.text;
        content.appendChild(p);
    }

    if (data.link) {
        const actions = document.createElement('div');
        actions.className = 'hero-actions';
        const a = document.createElement('a');
        a.href = data.link;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'btn btn-primary';
        a.textContent = data.btnText || 'Saiba mais';
        actions.appendChild(a);
        content.appendChild(actions);
    }

    slide.appendChild(content);
    return slide;
}

// Reconstrói os pontinhos de navegação
function rebuildDots() {
    if (!dotsWrap) return;
    const total = slider.querySelectorAll('.slide').length;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const d = document.createElement('span');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.setAttribute('data-index', i);
        d.addEventListener('click', () => { showSlide(i); resetTimer(); });
        dotsWrap.appendChild(d);
    }
}

let slides = slider ? slider.querySelectorAll('.slide') : [];
let dots = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];

function showSlide(index) {
    if (!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    if (dots.length) dots.forEach((d, i) => d.classList.toggle('active', i === index));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');

    // Pausa vídeos de slides não ativos
    slider.querySelectorAll('.slide-media video').forEach((v) => {
        const isActive = v.closest('.slide') === slides[currentSlide];
        if (isActive) { v.play && v.play().catch(() => {}); v.currentTime = 0; }
        else { v.pause && v.pause(); }
    });
}

function nextSlideFn() { showSlide(currentSlide + 1); }
function prevSlideFn() { showSlide(currentSlide - 1); }

function startTimer() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlideFn, 6000);
}
function resetTimer() { clearInterval(slideInterval); startTimer(); }

if (nextBtn) nextBtn.addEventListener('click', () => { nextSlideFn(); resetTimer(); });
if (prevBtn) prevBtn.addEventListener('click', () => { prevSlideFn(); resetTimer(); });

// Aplica os slides gerenciados pelo painel admin.
// Busca do backend (servidor) ou do localStorage (fallback estático).
// Se não houver slides gerenciados, mantém os slides padrão do HTML.
(async function applyAdminSlides() {
    let adminSlides = [];
    try {
        adminSlides = await Api.getSlides();
    } catch (e) { adminSlides = []; }

    // Filtra slots vazios (null) deixados pelos 9 espaços fixos do painel
    if (Array.isArray(adminSlides)) {
        adminSlides = adminSlides.filter((sd) => sd && sd.media);
    }

    if (adminSlides.length > 0 && slider) {
        slider.innerHTML = '';
        adminSlides.forEach((sd) => slider.appendChild(buildSlideNode(sd)));
        rebuildDots();
        slides = slider.querySelectorAll('.slide');
        dots = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];
    }

    if (slides.length) {
        showSlide(0);
        startTimer();
    }
})();

// ============================================================
// SEÇÃO "NOSSOS VÍDEOS" — 4 vídeos gerenciados pelo painel admin
// Lê os 4 vídeos gerenciados pelo admin (backend ou localStorage).
// Se estiverem vazios/ausentes, mantém os iframes padrão do HTML.
(async function applyAdminVideos() {
    // Converte link normal para embed, igual no painel admin
    function toEmbedUrl(input) { return Api.toEmbedUrl(input); }

    let videos = [];
    try {
        videos = await Api.getVideos();
    } catch (e) { videos = []; }

    if (!Array.isArray(videos) || videos.length === 0) return; // sem dados → mantém padrão

    for (let i = 1; i <= 4; i++) {
        const frame = document.getElementById('video-frame-' + i);
        const entry = videos[i - 1];
        if (!frame || !entry) continue;
        const embed = toEmbedUrl(entry.url);
        if (embed) {
            frame.src = embed;
            frame.title = 'Vídeo ' + i + ' do Arco Iris Pet Shop';
        }
    }
})();

// ===== Mensagens bíblicas rotativas no cabeçalho (a cada 2 minutos) =====
(function rotateVerses() {
    const verseEl = document.getElementById('verseText');
    if (!verseEl) return;

    const verses = [
        '"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..." — João 3:16',
        '"Tenho-vos dito isto, para que em mim tenhais paz; no mundo tereis aflições, mas tende bom ânimo, eu venci o mundo." — João 16:33',
        '"Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará." — Salmos 37:5',
        '"O Senhor é o meu pastor; nada me faltará." — Salmos 23:1',
        '"Tudo posso naquele que me fortalece." — Filipenses 4:13',
        '"Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei." — Mateus 11:28',
        '"Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal." — Jeremias 29:11',
        '"Jesus Cristo é o mesmo ontem, e hoje, e eternamente." — Hebreus 13:8',
        '"E conhecereis a verdade, e a verdade vos libertará." — João 8:32',
        '"Em paz também me deitarei e dormirei, porque só tu, Senhor, me fazes habitar em segurança." — Salmos 4:8'
    ];

    let i = 0;
    const INTERVAL_MS = 15000; // 15 segundos
    verseEl.textContent = verses[i];

    setInterval(() => {
        i = (i + 1) % verses.length;
        verseEl.style.opacity = '0';
        verseEl.style.transition = 'opacity .5s ease';
        setTimeout(() => {
            verseEl.textContent = verses[i];
            verseEl.style.opacity = '1';
        }, 500);
    }, INTERVAL_MS);
})();


