/* ==========================================
   NACHO IGNA - Admin Panel JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ===================== SECURITY =====================
    // Simple hash for password storage (not production-grade crypto,
    // but sufficient for client-side-only admin)
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + '_nachoigna_salt_2026');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Default password: "nacho2026" — Nacho should change this immediately
    const DEFAULT_HASH = null; // Will be set on first use

    async function getStoredHash() {
        const stored = localStorage.getItem('nachoigna_adminHash');
        if (stored) return stored;
        // Set default password on first access
        const defaultHash = await hashPassword('nacho2026');
        localStorage.setItem('nachoigna_adminHash', defaultHash);
        return defaultHash;
    }

    // ===================== DOM REFS =====================
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginPassword = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const togglePass = document.getElementById('togglePass');

    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');

    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');

    const confirmOverlay = document.getElementById('confirmOverlay');
    const confirmText = document.getElementById('confirmText');
    const confirmCancel = document.getElementById('confirmCancel');
    const confirmOk = document.getElementById('confirmOk');

    let confirmCallback = null;

    // ===================== LOGIN =====================
    // Check session
    const isLoggedIn = sessionStorage.getItem('nachoigna_auth') === 'true';
    if (isLoggedIn) {
        showAdmin();
    }

    loginBtn.addEventListener('click', handleLogin);
    loginPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    togglePass.addEventListener('click', () => {
        const isPass = loginPassword.type === 'password';
        loginPassword.type = isPass ? 'text' : 'password';
        togglePass.querySelector('i').className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
    });

    async function handleLogin() {
        const password = loginPassword.value.trim();
        if (!password) {
            loginError.textContent = 'Ingresá la contraseña';
            return;
        }

        const hash = await hashPassword(password);
        const storedHash = await getStoredHash();

        if (hash === storedHash) {
            sessionStorage.setItem('nachoigna_auth', 'true');
            loginError.textContent = '';
            showAdmin();
        } else {
            loginError.textContent = 'Contraseña incorrecta';
            loginPassword.value = '';
            loginPassword.focus();
        }
    }

    function showAdmin() {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'flex';
        loadAllData();
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('logoutBtnMobile').addEventListener('click', logout);

    function logout() {
        sessionStorage.removeItem('nachoigna_auth');
        location.reload();
    }

    // ===================== SIDEBAR / TABS =====================
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tab = link.dataset.tab;
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
            // Close mobile sidebar
            sidebar.classList.remove('open');
            removeSidebarBackdrop();
        });
    });

    // Mobile sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (sidebar.classList.contains('open')) {
                addSidebarBackdrop();
            } else {
                removeSidebarBackdrop();
            }
        });
    }

    function addSidebarBackdrop() {
        if (document.querySelector('.sidebar-backdrop')) return;
        const bd = document.createElement('div');
        bd.className = 'sidebar-backdrop active';
        bd.addEventListener('click', () => {
            sidebar.classList.remove('open');
            removeSidebarBackdrop();
        });
        document.body.appendChild(bd);
    }

    function removeSidebarBackdrop() {
        const bd = document.querySelector('.sidebar-backdrop');
        if (bd) bd.remove();
    }

    // ===================== TOAST =====================
    function showToast(msg, type = 'success') {
        toastText.textContent = msg;
        toast.style.background = type === 'success' ? '#22c55e' : '#ef4444';
        toast.querySelector('i').className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ===================== CONFIRM DIALOG =====================
    function showConfirm(text, callback) {
        confirmText.textContent = text;
        confirmCallback = callback;
        confirmOverlay.classList.add('active');
    }

    confirmCancel.addEventListener('click', () => {
        confirmOverlay.classList.remove('active');
        confirmCallback = null;
    });

    confirmOk.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        confirmOverlay.classList.remove('active');
        confirmCallback = null;
    });

    // ===================== DATA HELPERS =====================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text || ''));
        return div.innerHTML;
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    // ===================== FECHAS MANAGEMENT =====================
    let fechas = [];
    const fechaForm = document.getElementById('fechaForm');
    const fechaFormTitle = document.getElementById('fechaFormTitle');
    const fechaDate = document.getElementById('fechaDate');
    const fechaName = document.getElementById('fechaName');
    const fechaLocation = document.getElementById('fechaLocation');
    const fechaEditId = document.getElementById('fechaEditId');
    const addFechaBtn = document.getElementById('addFechaBtn');
    const cancelFechaBtn = document.getElementById('cancelFechaBtn');
    const saveFechaBtn = document.getElementById('saveFechaBtn');
    const fechasAdminList = document.getElementById('fechasAdminList');
    const fechasAdminEmpty = document.getElementById('fechasAdminEmpty');

    function loadFechas() {
        try {
            fechas = JSON.parse(localStorage.getItem('nachoigna_fechas') || '[]');
        } catch {
            fechas = [];
        }
        renderFechasAdmin();
    }

    function saveFechas() {
        localStorage.setItem('nachoigna_fechas', JSON.stringify(fechas));
    }

    function renderFechasAdmin() {
        const sorted = [...fechas].sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sorted.length === 0) {
            fechasAdminEmpty.style.display = 'block';
            // Clear only data items, keep the empty state
            document.querySelectorAll('#fechasAdminList .data-item').forEach(el => el.remove());
            return;
        }

        fechasAdminEmpty.style.display = 'none';
        // Clear previous items
        document.querySelectorAll('#fechasAdminList .data-item').forEach(el => el.remove());

        sorted.forEach(f => {
            const d = new Date(f.date + 'T00:00:00');
            const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

            const item = document.createElement('div');
            item.className = 'data-item';
            item.innerHTML = `
                <div class="data-item-info">
                    <span class="data-item-date">${escapeHtml(dateStr)}</span>
                    <span class="data-item-name">${escapeHtml(f.name)}</span>
                    <span class="data-item-location">${escapeHtml(f.location)}</span>
                </div>
                <div class="data-item-actions">
                    <button class="edit-btn" title="Editar"><i class="fas fa-pen"></i></button>
                    <button class="delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
            `;

            item.querySelector('.edit-btn').addEventListener('click', () => editFecha(f.id));
            item.querySelector('.delete-btn').addEventListener('click', () => {
                showConfirm('¿Eliminar esta fecha?', () => {
                    fechas = fechas.filter(x => x.id !== f.id);
                    saveFechas();
                    renderFechasAdmin();
                    showToast('Fecha eliminada');
                });
            });

            fechasAdminList.appendChild(item);
        });
    }

    addFechaBtn.addEventListener('click', () => {
        fechaFormTitle.textContent = 'Nueva Fecha';
        fechaEditId.value = '';
        fechaDate.value = '';
        fechaName.value = '';
        fechaLocation.value = '';
        fechaForm.style.display = 'block';
        fechaDate.focus();
    });

    cancelFechaBtn.addEventListener('click', () => {
        fechaForm.style.display = 'none';
    });

    saveFechaBtn.addEventListener('click', () => {
        const date = fechaDate.value;
        const name = fechaName.value.trim();
        const location = fechaLocation.value.trim();

        if (!date || !name || !location) {
            showToast('Completá todos los campos', 'error');
            return;
        }

        const editId = fechaEditId.value;

        if (editId) {
            // Edit existing
            const idx = fechas.findIndex(f => f.id === editId);
            if (idx !== -1) {
                fechas[idx] = { ...fechas[idx], date, name, location };
            }
        } else {
            // Add new
            fechas.push({ id: generateId(), date, name, location });
        }

        saveFechas();
        renderFechasAdmin();
        fechaForm.style.display = 'none';
        showToast(editId ? 'Fecha actualizada' : 'Fecha agregada');
    });

    function editFecha(id) {
        const f = fechas.find(x => x.id === id);
        if (!f) return;

        fechaFormTitle.textContent = 'Editar Fecha';
        fechaEditId.value = f.id;
        fechaDate.value = f.date;
        fechaName.value = f.name;
        fechaLocation.value = f.location;
        fechaForm.style.display = 'block';
        fechaDate.focus();
    }

    // ===================== GALLERY MANAGEMENT =====================
    let gallery = [];
    const galleryUpload = document.getElementById('galleryUpload');
    const galleryAdminGrid = document.getElementById('galleryAdminGrid');
    const galleryAdminEmpty = document.getElementById('galleryAdminEmpty');

    function loadGallery() {
        try {
            gallery = JSON.parse(localStorage.getItem('nachoigna_gallery') || '[]');
        } catch {
            gallery = [];
        }
        renderGalleryAdmin();
    }

    function saveGallery() {
        try {
            localStorage.setItem('nachoigna_gallery', JSON.stringify(gallery));
        } catch (e) {
            showToast('Error: almacenamiento lleno. Eliminá algunas fotos.', 'error');
        }
    }

    function renderGalleryAdmin() {
        // Clear items
        document.querySelectorAll('#galleryAdminGrid .gallery-admin-item').forEach(el => el.remove());

        if (gallery.length === 0) {
            galleryAdminEmpty.style.display = 'block';
            return;
        }

        galleryAdminEmpty.style.display = 'none';

        gallery.forEach((photo, i) => {
            const item = document.createElement('div');
            item.className = 'gallery-admin-item';

            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = escapeHtml(photo.alt || 'Foto');

            const overlay = document.createElement('div');
            overlay.className = 'delete-overlay';

            const btn = document.createElement('button');
            btn.innerHTML = '<i class="fas fa-trash"></i>';
            btn.title = 'Eliminar foto';
            btn.addEventListener('click', () => {
                showConfirm('¿Eliminar esta foto?', () => {
                    gallery.splice(i, 1);
                    saveGallery();
                    renderGalleryAdmin();
                    showToast('Foto eliminada');
                });
            });

            overlay.appendChild(btn);
            item.appendChild(img);
            item.appendChild(overlay);
            galleryAdminGrid.appendChild(item);
        });
    }

    galleryUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;

            // Resize to reduce storage
            try {
                const dataUrl = await resizeImage(file, 1200, 0.8);
                gallery.push({
                    id: generateId(),
                    src: dataUrl,
                    alt: file.name.replace(/\.[^/.]+$/, '')
                });
            } catch (err) {
                console.error('Error processing image:', err);
            }
        }

        saveGallery();
        renderGalleryAdmin();
        showToast(`${files.length} foto(s) subida(s)`);
        galleryUpload.value = '';
    });

    function resizeImage(file, maxWidth, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width;
                    let h = img.height;

                    if (w > maxWidth) {
                        h = (h / w) * maxWidth;
                        w = maxWidth;
                    }

                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ===================== PRESSKIT MANAGEMENT =====================
    const presskitTextarea = document.getElementById('presskitTextarea');
    const presskitCharCount = document.getElementById('presskitCharCount');
    const savePresskitBtn = document.getElementById('savePresskitBtn');

    function loadPresskit() {
        try {
            const config = JSON.parse(localStorage.getItem('nachoigna_config') || '{}');
            if (config.presskitBio) {
                presskitTextarea.value = config.presskitBio;
                presskitCharCount.textContent = config.presskitBio.length;
            }
        } catch {}
    }

    presskitTextarea.addEventListener('input', () => {
        presskitCharCount.textContent = presskitTextarea.value.length;
    });

    savePresskitBtn.addEventListener('click', () => {
        const bio = presskitTextarea.value.trim();
        if (!bio) {
            showToast('La biografía no puede estar vacía', 'error');
            return;
        }

        const config = JSON.parse(localStorage.getItem('nachoigna_config') || '{}');
        config.presskitBio = bio;
        localStorage.setItem('nachoigna_config', JSON.stringify(config));
        showToast('Biografía guardada');
    });

    // ===================== CONFIG MANAGEMENT =====================
    const cfgInstagram = document.getElementById('cfgInstagram');
    const cfgYoutube = document.getElementById('cfgYoutube');
    const cfgSpotify = document.getElementById('cfgSpotify');
    const cfgWhatsapp = document.getElementById('cfgWhatsapp');
    const cfgHeroDesc = document.getElementById('cfgHeroDesc');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const changePassBtn = document.getElementById('changePassBtn');
    const cfgNewPass = document.getElementById('cfgNewPass');
    const cfgConfirmPass = document.getElementById('cfgConfirmPass');

    // Hero images
    const heroUpload = document.getElementById('heroUpload');
    const heroPreviewRow = document.getElementById('heroPreviewRow');
    let heroImages = [];

    function loadConfig() {
        try {
            const config = JSON.parse(localStorage.getItem('nachoigna_config') || '{}');
            cfgInstagram.value = config.instagram || '';
            cfgYoutube.value = config.youtube || '';
            cfgSpotify.value = config.spotify || '';
            cfgWhatsapp.value = config.whatsapp || '';
            cfgHeroDesc.value = config.heroDescription || '';
        } catch {}

        // Hero images
        try {
            heroImages = JSON.parse(localStorage.getItem('nachoigna_heroImages') || '[]');
        } catch {
            heroImages = [];
        }
        renderHeroPreview();
    }

    saveConfigBtn.addEventListener('click', () => {
        const config = JSON.parse(localStorage.getItem('nachoigna_config') || '{}');
        config.instagram = cfgInstagram.value.trim();
        config.youtube = cfgYoutube.value.trim();
        config.spotify = cfgSpotify.value.trim();
        config.whatsapp = cfgWhatsapp.value.trim();
        config.heroDescription = cfgHeroDesc.value.trim();
        localStorage.setItem('nachoigna_config', JSON.stringify(config));
        showToast('Configuración guardada');
    });

    changePassBtn.addEventListener('click', async () => {
        const newPass = cfgNewPass.value;
        const confirmPass = cfgConfirmPass.value;

        if (!newPass || newPass.length < 4) {
            showToast('La contraseña debe tener al menos 4 caracteres', 'error');
            return;
        }

        if (newPass !== confirmPass) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        const hash = await hashPassword(newPass);
        localStorage.setItem('nachoigna_adminHash', hash);
        cfgNewPass.value = '';
        cfgConfirmPass.value = '';
        showToast('Contraseña cambiada exitosamente');
    });

    // Hero image upload
    heroUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            if (!file.type.startsWith('image/') || heroImages.length >= 3) continue;
            try {
                const dataUrl = await resizeImage(file, 1920, 0.7);
                heroImages.push(dataUrl);
            } catch (err) {
                console.error(err);
            }
        }
        // Keep max 3
        heroImages = heroImages.slice(0, 3);
        try {
            localStorage.setItem('nachoigna_heroImages', JSON.stringify(heroImages));
        } catch {
            showToast('Error: imágenes demasiado grandes', 'error');
        }
        renderHeroPreview();
        showToast('Fotos del hero actualizadas');
        heroUpload.value = '';
    });

    function renderHeroPreview() {
        heroPreviewRow.innerHTML = '';
        heroImages.forEach((src, i) => {
            const item = document.createElement('div');
            item.className = 'hero-preview-item';
            item.innerHTML = `
                <img src="${src}" alt="Hero ${i + 1}">
                <button class="hero-delete" title="Eliminar"><i class="fas fa-times"></i></button>
            `;
            item.querySelector('.hero-delete').addEventListener('click', () => {
                heroImages.splice(i, 1);
                localStorage.setItem('nachoigna_heroImages', JSON.stringify(heroImages));
                renderHeroPreview();
                showToast('Foto eliminada');
            });
            heroPreviewRow.appendChild(item);
        });
    }

    // ===================== LOAD ALL =====================
    function loadAllData() {
        loadFechas();
        loadGallery();
        loadPresskit();
        loadConfig();
    }
});
