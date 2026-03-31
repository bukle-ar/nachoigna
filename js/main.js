/* ==========================================
   NACHO IGNA - Main JavaScript
   Reads data from Firebase Firestore
   ========================================== */

document.addEventListener('DOMContentLoaded', async () => {
    'use strict';

    // ===================== FIREBASE INIT =====================
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // ===================== DEFAULT CONFIG =====================
    const DEFAULT_CONFIG = {
        instagram: 'https://www.instagram.com/nachoignaa/',
        youtube: 'https://www.youtube.com/channel/UCLgStMWiK7lfUWBo0Eq337g',
        spotify: 'https://open.spotify.com/intl-es/artist/7CDiQho6vZLwcwIzsInqIW?si=9FNpxl62T4GGd5qSdn3Drw',
        whatsapp: 'https://wa.me/5491151362029',
    };

    // ===================== DATA LOADING =====================
    async function loadConfig() {
        try {
            const doc = await db.collection('config').doc('main').get();
            if (doc.exists) {
                return { ...DEFAULT_CONFIG, ...doc.data() };
            }
        } catch (err) {
            console.error('Error cargando config:', err);
        }
        return DEFAULT_CONFIG;
    }

    async function loadFechas() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];

            const snapshot = await db.collection('fechas')
                .where('date', '>=', todayStr)
                .orderBy('date', 'asc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error('Error cargando fechas:', err);
            return [];
        }
    }

    async function loadGallery() {
        try {
            const snapshot = await db.collection('gallery')
                .orderBy('order', 'asc')
                .get();
            const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return photos.length > 0 ? photos : [];
        } catch {
            return [];
        }
    }

    async function loadVenues() {
        try {
            const snapshot = await db.collection('venues')
                .orderBy('order', 'asc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch {
            return [];
        }
    }

    async function loadHeroImages() {
        try {
            const snapshot = await db.collection('heroImages')
                .orderBy('order', 'asc')
                .get();
            return snapshot.docs.map(doc => doc.data().src);
        } catch {
            return [];
        }
    }

    // ===================== LOAD ALL DATA =====================
    const [config, fechas, gallery, venuesList, heroImageUrls] = await Promise.all([
        loadConfig(),
        loadFechas(),
        loadGallery(),
        loadVenues(),
        loadHeroImages(),
    ]);

    // ===================== APPLY CONFIG =====================
    function setSocialLinks() {
        const mappings = [
            { ids: ['heroInstagram', 'contactInstagram', 'mobileInstagram'], url: config.instagram },
            { ids: ['heroYoutube', 'contactYoutube', 'mobileYoutube'], url: config.youtube },
            { ids: ['heroSpotify', 'contactSpotify', 'mobileSpotify'], url: config.spotify },
            { ids: ['heroWhatsapp', 'contactWhatsapp', 'mobileWhatsapp'], url: config.whatsapp },
        ];

        mappings.forEach(({ ids, url }) => {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el && url) el.href = url;
            });
        });
    }
    setSocialLinks();

    // ===================== HERO BACKGROUND SLIDESHOW =====================
    const heroBgContainer = document.getElementById('heroBgContainer');
    let currentSlide = 0;
    let slides = [];

    const fallbackGradients = [
        'linear-gradient(135deg, #1a0011 0%, #3d0a2e 30%, #0a0a0a 70%, #1a0505 100%)',
        'linear-gradient(225deg, #0a0a0a 0%, #2d0a0a 30%, #1a0033 70%, #0a0a0a 100%)',
        'linear-gradient(45deg, #1a0033 0%, #0a0a0a 40%, #3d0a0a 80%, #0a0a0a 100%)',
    ];

    if (heroImageUrls.length > 0) {
        // Crear un slide por cada foto subida
        heroImageUrls.forEach((url, i) => {
            const slide = document.createElement('div');
            slide.className = 'hero-bg-slide';
            slide.style.backgroundImage = `url(${url})`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
            if (i === 0) slide.classList.add('active');
            heroBgContainer.appendChild(slide);
        });
    } else {
        // Sin fotos: mostrar gradientes de fallback
        fallbackGradients.forEach((gradient, i) => {
            const slide = document.createElement('div');
            slide.className = 'hero-bg-slide';
            slide.style.background = gradient;
            if (i === 0) slide.classList.add('active');
            heroBgContainer.appendChild(slide);
        });
    }

    slides = heroBgContainer.querySelectorAll('.hero-bg-slide');

    if (slides.length > 1) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // ===================== PARTICLES =====================
    const particlesContainer = document.getElementById('heroParticles');

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 1;
        const x = Math.random() * 100;
        const duration = Math.random() * 8 + 6;
        const colors = ['rgba(212,22,60,0.6)', 'rgba(107,33,168,0.6)', 'rgba(139,92,246,0.4)', 'rgba(255,26,62,0.4)'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            background: ${color};
            animation-duration: ${duration}s;
            animation-delay: ${Math.random() * 4}s;
            box-shadow: 0 0 ${size * 3}px ${color};
        `;

        particlesContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, (duration + 4) * 1000);
    }

    setInterval(() => {
        if (particlesContainer.children.length < 20) {
            createParticle();
        }
    }, 600);

    // ===================== NAVIGATION =====================
    const nav = document.getElementById('mainNav');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(l => l.classList.remove('active'));
                mobileLinks.forEach(l => l.classList.remove('active'));
                document.querySelector(`.nav-link[data-section="${id}"]`)?.classList.add('active');
                document.querySelector(`.mobile-link[data-section="${id}"]`)?.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ===================== SCROLL ANIMATIONS =====================
    const animateElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // ===================== SECURITY HELPERS =====================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text || ''));
        return div.innerHTML;
    }

    // ===================== FECHAS =====================
    const fechasList = document.getElementById('fechasList');
    const fechasEmpty = document.getElementById('fechasEmpty');

    function formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}`;
    }

    function renderFechas() {
        if (fechas.length === 0) {
            fechasList.style.display = 'none';
            fechasEmpty.style.display = 'block';
            return;
        }

        fechasEmpty.style.display = 'none';
        fechasList.style.display = 'flex';
        fechasList.innerHTML = '';

        fechas.forEach((fecha, i) => {
            const item = document.createElement('div');
            item.className = 'fecha-item';
            item.setAttribute('data-animate', 'fade-up');
            item.style.transitionDelay = `${i * 0.08}s`;

            const safeName = escapeHtml(fecha.name);
            const safeLocation = escapeHtml(fecha.location);

            item.innerHTML = `
                <span class="fecha-date">${formatDate(fecha.date)}</span>
                <span class="fecha-name">${safeName}</span>
                <span class="fecha-location">${safeLocation}</span>
            `;

            fechasList.appendChild(item);
            observer.observe(item);
        });
    }

    renderFechas();

    // ===================== VENUES =====================
    function renderVenues() {
        const baresGrid = document.getElementById('venuesBaresGrid');
        const showsGrid = document.getElementById('venuesShowsGrid');
        if (!baresGrid || !showsGrid) return;

        const bares = venuesList.filter(v => v.category === 'bares');
        const shows = venuesList.filter(v => v.category === 'shows');

        baresGrid.innerHTML = bares.map(v =>
            `<div class="venue-card"><span>${escapeHtml(v.name)}</span></div>`
        ).join('');

        showsGrid.innerHTML = shows.map(v =>
            `<div class="venue-card venue-card--fiesta"><span>${escapeHtml(v.name)}</span></div>`
        ).join('');
    }

    renderVenues();

    // ===================== GALLERY =====================
    const galeriaGrid = document.getElementById('galeriaGrid');
    const galeriaEmpty = document.getElementById('galeriaEmpty');
    let lightboxIndex = 0;

    function renderGallery() {
        if (gallery.length === 0) {
            galeriaGrid.style.display = 'none';
            galeriaEmpty.style.display = 'block';
            return;
        }

        galeriaEmpty.style.display = 'none';
        galeriaGrid.style.display = 'grid';
        galeriaGrid.innerHTML = '';

        gallery.forEach((photo, i) => {
            const item = document.createElement('div');
            item.className = 'galeria-item';
            item.setAttribute('data-animate', 'fade-up');
            item.style.transitionDelay = `${i * 0.06}s`;

            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = escapeHtml(photo.alt || 'Foto de presentación');
            img.loading = 'lazy';

            item.appendChild(img);
            item.addEventListener('click', () => openLightbox(i));

            galeriaGrid.appendChild(item);
            observer.observe(item);
        });
    }

    renderGallery();

    // ===================== LIGHTBOX =====================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    function openLightbox(index) {
        if (gallery.length === 0) return;
        lightboxIndex = index;
        lightboxImg.src = gallery[lightboxIndex].src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxIndex = (lightboxIndex - 1 + gallery.length) % gallery.length;
        lightboxImg.src = gallery[lightboxIndex].src;
    });

    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        lightboxIndex = (lightboxIndex + 1) % gallery.length;
        lightboxImg.src = gallery[lightboxIndex].src;
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
    });


    // ===================== RIDER MODAL =====================
    const openRiderBtn = document.getElementById('openRiderBtn');
    const closeRiderBtn = document.getElementById('closeRiderBtn');
    const riderModal = document.getElementById('riderModal');
    const riderModalBackdrop = document.getElementById('riderModalBackdrop');
    const riderZoomOverlay = document.getElementById('riderZoomOverlay');
    const riderZoomBackdrop = document.getElementById('riderZoomBackdrop');
    const riderZoomClose = document.getElementById('riderZoomClose');
    const riderZoomImg = document.getElementById('riderZoomImg');

    if (openRiderBtn) {
        openRiderBtn.addEventListener('click', () => {
            riderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    function closeRider() {
        riderModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function closeZoom() {
        riderZoomOverlay.classList.remove('active');
    }

    if (closeRiderBtn) closeRiderBtn.addEventListener('click', closeRider);
    if (riderModalBackdrop) riderModalBackdrop.addEventListener('click', closeRider);
    if (riderZoomClose) riderZoomClose.addEventListener('click', closeZoom);
    if (riderZoomBackdrop) riderZoomBackdrop.addEventListener('click', closeZoom);

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.rider-photo-zoom');
        if (!btn) return;
        const src = btn.dataset.zoom;
        if (src && riderZoomImg) {
            riderZoomImg.src = src;
            riderZoomOverlay.classList.add('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRider();
            closeZoom();
        }
    });
});
