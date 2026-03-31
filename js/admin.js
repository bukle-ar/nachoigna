/* ==========================================
   NACHO IGNA - Admin Panel JavaScript
   Firebase Auth + Firestore + Cloudinary
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ===================== FIREBASE INIT =====================
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // ===================== DOM REFS =====================
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginEmail = document.getElementById('loginEmail');
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

    // ===================== AUTH =====================
    auth.onAuthStateChanged((user) => {
        if (user) {
            showAdmin();
        } else {
            loginScreen.style.display = 'flex';
            adminPanel.style.display = 'none';
        }
    });

    loginBtn.addEventListener('click', handleLogin);
    loginPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    loginEmail.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loginPassword.focus();
    });

    togglePass.addEventListener('click', () => {
        const isPass = loginPassword.type === 'password';
        loginPassword.type = isPass ? 'text' : 'password';
        togglePass.querySelector('i').className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
    });

    async function handleLogin() {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            loginError.textContent = 'Completá email y contraseña';
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'INGRESANDO...';

        try {
            await auth.signInWithEmailAndPassword(email, password);
            loginError.textContent = '';
        } catch (error) {
            const messages = {
                'auth/user-not-found': 'Usuario no encontrado',
                'auth/wrong-password': 'Contraseña incorrecta',
                'auth/invalid-email': 'Email inválido',
                'auth/too-many-requests': 'Demasiados intentos. Esperá un momento.',
                'auth/invalid-credential': 'Credenciales inválidas',
            };
            loginError.textContent = messages[error.code] || 'Error de autenticación';
            loginPassword.value = '';
            loginPassword.focus();
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'INGRESAR';
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
        auth.signOut().then(() => location.reload());
    }

    // Reset password
    document.getElementById('resetPassBtn').addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            await auth.sendPasswordResetEmail(user.email);
            showToast('Email de reset enviado a ' + user.email);
        } catch {
            showToast('Error al enviar email', 'error');
        }
    });

    // ===================== SIDEBAR / TABS =====================
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tab = link.dataset.tab;
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
            sidebar.classList.remove('open');
            removeSidebarBackdrop();
        });
    });

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

    // ===================== HELPERS =====================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text || ''));
        return div.innerHTML;
    }

    // ===================== CLOUDINARY UPLOAD =====================
    async function uploadToCloudinary(file, folder = 'gallery') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `nachoigna/${folder}`);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.secure_url;
    }

    // ===================== FECHAS =====================
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

    async function loadFechas() {
        try {
            const snapshot = await db.collection('fechas')
                .orderBy('date', 'asc')
                .get();
            fechas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error('Error cargando fechas:', err);
            fechas = [];
        }
        renderFechasAdmin();
    }

    function renderFechasAdmin() {
        const sorted = [...fechas].sort((a, b) => new Date(a.date) - new Date(b.date));

        document.querySelectorAll('#fechasAdminList .data-item').forEach(el => el.remove());

        if (sorted.length === 0) {
            fechasAdminEmpty.style.display = 'block';
            return;
        }

        fechasAdminEmpty.style.display = 'none';

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
                showConfirm('¿Eliminar esta fecha?', () => deleteFecha(f.id));
            });

            fechasAdminList.appendChild(item);
        });
    }

    async function deleteFecha(id) {
        try {
            await db.collection('fechas').doc(id).delete();
            await loadFechas();
            showToast('Fecha eliminada');
        } catch (err) {
            console.error('Error eliminando fecha:', err);
            showToast('Error al eliminar', 'error');
        }
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

    saveFechaBtn.addEventListener('click', async () => {
        const date = fechaDate.value;
        const name = fechaName.value.trim();
        const location = fechaLocation.value.trim();

        if (!date || !name || !location) {
            showToast('Completá todos los campos', 'error');
            return;
        }

        const editId = fechaEditId.value;
        saveFechaBtn.disabled = true;

        try {
            if (editId) {
                await db.collection('fechas').doc(editId).update({ date, name, location });
            } else {
                await db.collection('fechas').add({
                    date,
                    name,
                    location,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }
            await loadFechas();
            fechaForm.style.display = 'none';
            showToast(editId ? 'Fecha actualizada' : 'Fecha agregada');
        } catch (err) {
            console.error('Error guardando fecha:', err);
            showToast('Error al guardar', 'error');
        }

        saveFechaBtn.disabled = false;
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

    // ===================== VENUES (Presskit) =====================
    let venues = [];

    async function loadVenues() {
        try {
            const snapshot = await db.collection('venues')
                .orderBy('order', 'asc')
                .get();
            venues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error('Error cargando venues:', err);
            venues = [];
        }
        renderVenuesAdmin();
    }

    function renderVenuesAdmin() {
        const baresList = document.getElementById('venuesBaresList');
        const showsList = document.getElementById('venuesShowsList');
        baresList.innerHTML = '';
        showsList.innerHTML = '';

        const bares = venues.filter(v => v.category === 'bares');
        const shows = venues.filter(v => v.category === 'shows');

        renderVenueCategory(bares, baresList);
        renderVenueCategory(shows, showsList);
    }

    function renderVenueCategory(items, container) {
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-state">Sin venues cargados</p>';
            return;
        }

        items.forEach((v, index) => {
            const item = document.createElement('div');
            item.className = 'data-item';
            item.innerHTML = `
                <div class="data-item-info">
                    <span class="data-item-name">${escapeHtml(v.name)}</span>
                </div>
                <div class="data-item-actions">
                    <button class="move-up-btn" title="Subir"><i class="fas fa-arrow-up"></i></button>
                    <button class="move-down-btn" title="Bajar"><i class="fas fa-arrow-down"></i></button>
                    <button class="edit-btn" title="Editar"><i class="fas fa-pen"></i></button>
                    <button class="delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
            `;

            item.querySelector('.move-up-btn').addEventListener('click', () => moveVenue(v.id, v.category, -1));
            item.querySelector('.move-down-btn').addEventListener('click', () => moveVenue(v.id, v.category, 1));
            item.querySelector('.edit-btn').addEventListener('click', () => editVenue(v.id));
            item.querySelector('.delete-btn').addEventListener('click', () => {
                showConfirm('¿Eliminar este venue?', () => deleteVenue(v.id));
            });

            container.appendChild(item);
        });
    }

    async function moveVenue(id, category, direction) {
        const filtered = venues.filter(v => v.category === category);
        const idx = filtered.findIndex(v => v.id === id);
        const newIdx = idx + direction;

        if (newIdx < 0 || newIdx >= filtered.length) return;

        const batch = db.batch();
        batch.update(db.collection('venues').doc(filtered[idx].id), { order: filtered[newIdx].order });
        batch.update(db.collection('venues').doc(filtered[newIdx].id), { order: filtered[idx].order });

        try {
            await batch.commit();
            await loadVenues();
        } catch (err) {
            showToast('Error al reordenar', 'error');
        }
    }

    async function deleteVenue(id) {
        try {
            await db.collection('venues').doc(id).delete();
            await loadVenues();
            showToast('Venue eliminado');
        } catch {
            showToast('Error al eliminar', 'error');
        }
    }

    function editVenue(id) {
        const v = venues.find(x => x.id === id);
        if (!v) return;
        document.getElementById('venueFormTitle').textContent = 'Editar Venue';
        document.getElementById('venueName').value = v.name;
        document.getElementById('venueEditId').value = v.id;
        document.getElementById('venueCategory').value = v.category;
        document.getElementById('venueForm').style.display = 'block';
        document.getElementById('venueName').focus();
    }

    document.getElementById('addVenueBarBtn').addEventListener('click', () => {
        document.getElementById('venueFormTitle').textContent = 'Nuevo Boliche / Bar';
        document.getElementById('venueName').value = '';
        document.getElementById('venueEditId').value = '';
        document.getElementById('venueCategory').value = 'bares';
        document.getElementById('venueForm').style.display = 'block';
        document.getElementById('venueName').focus();
    });

    document.getElementById('addVenueShowBtn').addEventListener('click', () => {
        document.getElementById('venueFormTitle').textContent = 'Nuevo Show / Fiesta';
        document.getElementById('venueName').value = '';
        document.getElementById('venueEditId').value = '';
        document.getElementById('venueCategory').value = 'shows';
        document.getElementById('venueForm').style.display = 'block';
        document.getElementById('venueName').focus();
    });

    document.getElementById('cancelVenueBtn').addEventListener('click', () => {
        document.getElementById('venueForm').style.display = 'none';
    });

    document.getElementById('saveVenueBtn').addEventListener('click', async () => {
        const name = document.getElementById('venueName').value.trim();
        if (!name) {
            showToast('Ingresá un nombre', 'error');
            return;
        }

        const editId = document.getElementById('venueEditId').value;
        const category = document.getElementById('venueCategory').value;
        const btn = document.getElementById('saveVenueBtn');
        btn.disabled = true;

        try {
            if (editId) {
                await db.collection('venues').doc(editId).update({ name });
            } else {
                const maxOrder = venues
                    .filter(v => v.category === category)
                    .reduce((max, v) => Math.max(max, v.order || 0), 0);

                await db.collection('venues').add({
                    name,
                    category,
                    order: maxOrder + 1,
                });
            }
            await loadVenues();
            document.getElementById('venueForm').style.display = 'none';
            showToast(editId ? 'Venue actualizado' : 'Venue agregado');
        } catch (err) {
            showToast('Error al guardar', 'error');
        }

        btn.disabled = false;
    });

    // ===================== GALLERY =====================
    let gallery = [];
    const galleryUpload = document.getElementById('galleryUpload');
    const galleryAdminGrid = document.getElementById('galleryAdminGrid');
    const galleryAdminEmpty = document.getElementById('galleryAdminEmpty');

    async function loadGallery() {
        try {
            const snapshot = await db.collection('gallery')
                .orderBy('order', 'asc')
                .get();
            gallery = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch {
            gallery = [];
        }
        renderGalleryAdmin();
    }

    function renderGalleryAdmin() {
        document.querySelectorAll('#galleryAdminGrid .gallery-admin-item').forEach(el => el.remove());

        if (gallery.length === 0) {
            galleryAdminEmpty.style.display = 'block';
            return;
        }

        galleryAdminEmpty.style.display = 'none';

        gallery.forEach((photo) => {
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
                showConfirm('¿Eliminar esta foto?', async () => {
                    try {
                        await db.collection('gallery').doc(photo.id).delete();
                        await loadGallery();
                        showToast('Foto eliminada');
                    } catch {
                        showToast('Error al eliminar', 'error');
                    }
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

        showToast('Subiendo fotos... puede tardar unos segundos');
        let uploaded = 0;

        for (const file of files) {
                    if (!file.type.startsWith('image/')) continue;
                    
                    // NUEVO: Validación de tamaño máximo (10MB)
                    if (file.size > 10485760) {
                        showToast(`La imagen ${file.name} supera los 10MB permitidos`, 'error');
                        continue; // Salta esta imagen y sigue con la próxima
                    }

                    try {
                const url = await uploadToCloudinary(file, 'gallery');
                const maxOrder = gallery.reduce((max, p) => Math.max(max, p.order || 0), 0);

                await db.collection('gallery').add({
                    src: url,
                    alt: file.name.replace(/\.[^/.]+$/, ''),
                    order: maxOrder + 1 + uploaded,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                });
                uploaded++;
            } catch (err) {
                console.error('Error subiendo imagen:', err);
                showToast('Error al subir ' + file.name, 'error');
            }
        }

        await loadGallery();
        if (uploaded > 0) showToast(`${uploaded} foto(s) subida(s)`);
        galleryUpload.value = '';
    });

    // ===================== HERO IMAGES =====================
    let heroImages = [];
    const heroUpload = document.getElementById('heroUpload');
    const heroPreviewRow = document.getElementById('heroPreviewRow');

    async function loadHeroImages() {
        try {
            const snapshot = await db.collection('heroImages')
                .orderBy('order', 'asc')
                .get();
            heroImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch {
            heroImages = [];
        }
        renderHeroPreview();
    }

    function renderHeroPreview() {
        heroPreviewRow.innerHTML = '';
        heroImages.forEach((img) => {
            const item = document.createElement('div');
            item.className = 'hero-preview-item';
            item.innerHTML = `
                <img src="${escapeHtml(img.src)}" alt="Hero"> 
                <button class="hero-delete" title="Eliminar"><i class="fas fa-times"></i></button>
            `;
            item.querySelector('.hero-delete').addEventListener('click', async () => {
                try {
                    await db.collection('heroImages').doc(img.id).delete();
                    await loadHeroImages();
                    showToast('Foto eliminada');
                } catch {
                    showToast('Error al eliminar', 'error');
                }
            });
            heroPreviewRow.appendChild(item);
        });
    }

    heroUpload.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            for (const file of files) {
                if (!file.type.startsWith('image/') || heroImages.length >= 4) continue;

                // NUEVO: Validación de tamaño máximo (10MB)
                if (file.size > 10485760) {
                    showToast(`La imagen ${file.name} supera los 10MB permitidos`, 'error');
                    continue;
                }

                try {
                showToast('Subiendo foto del hero...');
                const url = await uploadToCloudinary(file, 'hero');
                await db.collection('heroImages').add({
                    src: url,
                    order: heroImages.length + 1,
                });
            } catch (err) {
                console.error(err);
                showToast('Error al subir', 'error');
            }
        }
        await loadHeroImages();
        showToast('Fotos del hero actualizadas');
        heroUpload.value = '';
    });

    // ===================== PRESSKIT / BIOGRAFÍA =====================
    const presskitTextarea = document.getElementById('presskitTextarea');
    const presskitCharCount = document.getElementById('presskitCharCount');
    const savePresskitBtn = document.getElementById('savePresskitBtn');

    async function loadPresskit() {
        try {
            const doc = await db.collection('config').doc('main').get();
            if (doc.exists && doc.data().presskitBio) {
                presskitTextarea.value = doc.data().presskitBio;
                presskitCharCount.textContent = doc.data().presskitBio.length;
            }
        } catch {}
    }

    presskitTextarea.addEventListener('input', () => {
        presskitCharCount.textContent = presskitTextarea.value.length;
    });

    savePresskitBtn.addEventListener('click', async () => {
        const bio = presskitTextarea.value.trim();
        if (!bio) {
            showToast('La biografía no puede estar vacía', 'error');
            return;
        }
        savePresskitBtn.disabled = true;
        try {
            await db.collection('config').doc('main').set(
                { presskitBio: bio },
                { merge: true }
            );
            showToast('Biografía guardada');
        } catch {
            showToast('Error al guardar', 'error');
        }
        savePresskitBtn.disabled = false;
    });

    // ===================== CONFIG (Redes Sociales) =====================
    const cfgInstagram = document.getElementById('cfgInstagram');
    const cfgYoutube = document.getElementById('cfgYoutube');
    const cfgSpotify = document.getElementById('cfgSpotify');
    const cfgWhatsapp = document.getElementById('cfgWhatsapp');
    const saveConfigBtn = document.getElementById('saveConfigBtn');

    async function loadConfig() {
        try {
            const doc = await db.collection('config').doc('main').get();
            if (doc.exists) {
                const data = doc.data();
                cfgInstagram.value = data.instagram || '';
                cfgYoutube.value = data.youtube || '';
                cfgSpotify.value = data.spotify || '';
                cfgWhatsapp.value = data.whatsapp || '';
            }
        } catch (err) {
            console.error('Error cargando config:', err);
        }
    }

    saveConfigBtn.addEventListener('click', async () => {
        saveConfigBtn.disabled = true;
        try {
            await db.collection('config').doc('main').set({
                instagram: cfgInstagram.value.trim(),
                youtube: cfgYoutube.value.trim(),
                spotify: cfgSpotify.value.trim(),
                whatsapp: cfgWhatsapp.value.trim(),
            }, { merge: true });
            showToast('Configuración guardada');
        } catch {
            showToast('Error al guardar', 'error');
        }
        saveConfigBtn.disabled = false;
    });

    // ===================== LOAD ALL =====================
    async function loadAllData() {
        try {
            await Promise.all([
                loadFechas(),
                loadGallery(),
                loadVenues(),
                loadHeroImages(),
                loadPresskit(),
                loadConfig(),
            ]);
        } catch (err) {
            console.error('Error cargando datos:', err);
            showToast('Error al cargar datos', 'error');
        }
    }
});
