/* ==========================================
   NACHO IGNA - Script de Migración Inicial
   ==========================================
   
   INSTRUCCIONES:
   1. Abrí admin.html en el navegador
   2. Logueate con tu email y contraseña de Firebase
   3. Abrí la consola del navegador (F12 → Console)
   4. Copiá y pegá TODO este código en la consola
   5. Presioná Enter
   6. Esperá a que diga "MIGRACIÓN COMPLETA"
   7. Recargá la página para ver los datos
   
   NOTA: Ejecutar UNA SOLA VEZ. Si lo ejecutás dos
   veces, se duplicarán los datos.
   ========================================== */

(async function migrateData() {
    const db = firebase.firestore();
    
    console.log('🚀 Iniciando migración de datos...');
    
    // ---- 1. VENUES: Boliches & Bares ----
    const bares = [
        'Cruza Recoleta',
        'La Mala Pub',
        'Behind Bar',
        'Maldini Dot',
        'Aribau',
        'Taiwan (Chinito)',
        'Mamba Club',
        'Nob3l Bar',
        'The Laundry (Soho y Housebar)',
    ];
    
    console.log('📍 Migrando boliches y bares...');
    for (let i = 0; i < bares.length; i++) {
        await db.collection('venues').add({
            name: bares[i],
            category: 'bares',
            order: i + 1,
        });
    }
    console.log(`   ✅ ${bares.length} bares migrados`);
    
    // ---- 2. VENUES: Shows ----
    const shows = ['EUPHORIA', 'Fiesta Marta', 'Fiesta Curupa'];
    
    console.log('🎉 Migrando shows...');
    for (let i = 0; i < shows.length; i++) {
        await db.collection('venues').add({
            name: shows[i],
            category: 'shows',
            order: i + 1,
        });
    }
    console.log(`   ✅ ${shows.length} shows migrados`);
    
    // ---- 3. CONFIG: Redes sociales ----
    console.log('🔗 Migrando configuración de redes sociales...');
    await db.collection('config').doc('main').set({
        instagram: 'https://www.instagram.com/nachoignaa/',
        youtube: 'https://www.youtube.com/channel/UCLgStMWiK7lfUWBo0Eq337g',
        spotify: 'https://open.spotify.com/intl-es/artist/7CDiQho6vZLwcwIzsInqIW?si=9FNpxl62T4GGd5qSdn3Drw',
        whatsapp: 'https://wa.me/5491151362029',
    });
    console.log('   ✅ Config migrada');
    
    // ---- 4. FECHAS de ejemplo (opcional, borrar si no querés) ----
    console.log('📅 Migrando fechas de ejemplo...');
    const fechasEjemplo = [
        { date: '2026-04-03', name: 'CRUZA RECOLETA', location: 'Buenos Aires' },
        { date: '2026-04-04', name: 'LA MALA PUB', location: 'Buenos Aires' },
        { date: '2026-04-05', name: 'MALDINI DOT', location: 'Buenos Aires' },
    ];
    
    for (const fecha of fechasEjemplo) {
        await db.collection('fechas').add({
            ...fecha,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    }
    console.log(`   ✅ ${fechasEjemplo.length} fechas migradas`);
    
    console.log('');
    console.log('========================================');
    console.log('🎉 MIGRACIÓN COMPLETA');
    console.log('========================================');
    console.log('');
    console.log('Recargá la página (F5) para ver los datos.');
    console.log('Las fotos de la galería y del hero debés');
    console.log('subirlas manualmente desde el panel de admin.');
})();
