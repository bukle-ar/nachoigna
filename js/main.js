/* ==========================================
   NACHO IGNA - Main JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ===================== CONFIG =====================
    // Default social links - Nacho can update these in admin
    const DEFAULT_CONFIG = {
        instagram: 'https://www.instagram.com/nachoignaa/',
        youtube: 'https://www.youtube.com/channel/UCLgStMWiK7lfUWBo0Eq337g',
        spotify: 'https://open.spotify.com/intl-es/artist/7CDiQho6vZLwcwIzsInqIW?si=9FNpxl62T4GGd5qSdn3Drw',
        whatsapp: 'https://wa.me/5491151362029',
    };

    // ===================== DATA LOADING =====================
    function loadConfig() {
        try {
            const saved = localStorage.getItem('nachoigna_config');
            return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
        } catch {
            return DEFAULT_CONFIG;
        }
    }

    function loadFechas() {
    return [
        { id: '1', date: '2026-04-03', name: 'CRUZA RECOLETA', location: 'Buenos Aires' },
        { id: '2', date: '2026-04-04', name: 'LA MALA PUB', location: 'Buenos Aires' },
        { id: '3', date: '2026-04-05', name: 'MALDINI DOT', location: 'Buenos Aires' },
    ];
}


    /*function loadFechas() {
        try {
            const saved = localStorage.getItem('nachoigna_fechas');
            if (saved) {
                const fechas = JSON.parse(saved);
                // Filter future dates and sort
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return fechas
                    .filter(f => new Date(f.date) >= today)
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
            }
            return [];
        } catch {
            return [];
        }
    }
        */

    function loadGallery() {
        try {
            const saved = localStorage.getItem('nachoigna_gallery');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) return parsed;
            }
        } catch {}
        // Fotos por defecto desde assets/gallery/
        return [
            { id: '1', src: 'assets/gallery/foto-01.jpg', alt: 'Show' },
            { id: '2', src: 'assets/gallery/foto-02.jpg', alt: 'Show' },
            { id: '3', src: 'assets/gallery/foto-03.jpg', alt: 'Show' },
            { id: '4', src: 'assets/gallery/foto-04.jpg', alt: 'Show' },
            { id: '5', src: 'assets/gallery/foto-05.jpg', alt: 'Show' },
            { id: '6', src: 'assets/gallery/foto-06.jpg', alt: 'Show' },
        ];
    }

    // ===================== APPLY CONFIG =====================
    const config = loadConfig();

    // Social links - apply to all instances
    function setSocialLinks() {
        const mappings = [
            { ids: ['heroInstagram', 'contactInstagram', 'footerInstagram', 'mobileInstagram'], url: config.instagram },
            { ids: ['heroYoutube', 'contactYoutube', 'footerYoutube', 'mobileYoutube'], url: config.youtube },
            { ids: ['heroSpotify', 'contactSpotify', 'footerSpotify', 'mobileSpotify'], url: config.spotify },
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

    // Hero description
    const heroDesc = document.getElementById('heroDescription');
    if (heroDesc && config.heroDescription) {
        heroDesc.textContent = config.heroDescription;
    }

    // Presskit bio
    const presskitBio = document.getElementById('presskitBio');
    if (presskitBio && config.presskitBio) {
        presskitBio.textContent = config.presskitBio;
    }

    // ===================== HERO BACKGROUND SLIDESHOW =====================
    const slides = document.querySelectorAll('.hero-bg-slide');
    let currentSlide = 0;

    // Check if admin uploaded hero images
    const heroImages = (() => {
    const saved = (() => {
        try {
            const s = localStorage.getItem('nachoigna_heroImages');
            return s ? JSON.parse(s) : [];
        } catch { return []; }
    })();
    if (saved.length > 0) return saved;
    // Fotos por defecto desde assets/
    return [
        'assets/hero-01.jpeg',
        'assets/hero-02.JPEG',
        'assets/hero-03.JPEG',
        'assets/hero-04.JPEG'
    ];
    })();
    if (heroImages.length > 0) {
        // Replace gradient slides with actual images
        slides.forEach((slide, i) => {
            if (heroImages[i % heroImages.length]) {
                slide.style.background = 'none';
                slide.style.backgroundImage = `url(${heroImages[i % heroImages.length]})`;
                slide.style.backgroundSize = 'cover';
                slide.style.backgroundPosition = 'center';
            }
        });
    }

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, 5000);

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

    // Throttle particle creation
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

    // Scroll effect on nav
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        nav.classList.toggle('scrolled', scrollY > 80);
        lastScroll = scrollY;
    }, { passive: true });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
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

    // ===================== FECHAS =====================
    const fechasList = document.getElementById('fechasList');
    const fechasEmpty = document.getElementById('fechasEmpty');
    const fechas = loadFechas();

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

            // Sanitize output
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

    // ===================== GALLERY =====================
    const galeriaGrid = document.getElementById('galeriaGrid');
    const galeriaEmpty = document.getElementById('galeriaEmpty');
    const gallery = loadGallery();
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

    // ===================== FOOTER TOP =====================
    const footerTop = document.getElementById('footerTop');
    if (footerTop) {
        footerTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===================== SECURITY HELPERS =====================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

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

    // Zoom buttons — delegación de eventos
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
