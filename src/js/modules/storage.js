// ==========================================
// MODUL STORAGE & AUTO-SAVE (STORAGE.JS)
// ==========================================

const SAVE_KEY = 'CRESTVILLE_GAME_SAVE_V1';
const AUTO_SAVE_INTERVAL = 30000; // Auto-save setiap 30 detik

/**
 * Mengumpulkan seluruh state permainan menjadi satu objek tersentralisasi
 * @returns {Object}
 */
function getGameState() {
    return {
        timestamp: new Date().toISOString(),
        playerCrest: window.playerCrest || 0,
        playerVitality: window.playerVitality || 100,
        playerAdmin: window.playerAdmin || {
            hasKTP: false,
            nik: null,
            fullName: 'Warga Kota',
            gender: 'Laki-laki',
            city: 'Kota Crestville',
            registeredAt: null,
            licenses: []
        },
        playerCityState: window.playerCityState || {
            currentLocation: 'city_hall',
            lastEmergencyCall: null
        }
    };
}

/**
 * Menyimpan progres game ke LocalStorage
 * @param {boolean} isAutoSave - Menandai apakah panggilan berasal dari interval otomatis
 */
function saveGame(isAutoSave = false) {
    try {
        const state = getGameState();
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));

        if (!isAutoSave && typeof Toast !== 'undefined') {
            Toast.success('💾 Progres permainan berhasil disimpan!');
        } else if (isAutoSave) {
            console.log('[Auto-Save] Progres berhasil disimpan otomatis.');
        }
    } catch (error) {
        console.error('Gagal menyimpan game:', error);
        if (!isAutoSave && typeof Toast !== 'undefined') {
            Toast.error('Gagal menyimpan data ke LocalStorage!');
        }
    }
}

/**
 * Memuat progres game dari LocalStorage
 */
function loadGame() {
    try {
        const rawData = localStorage.getItem(SAVE_KEY);
        if (!rawData) return false;

        const state = JSON.parse(rawData);

        // Pulihkan nilai variabel global
        if (state.playerCrest !== undefined) window.playerCrest = state.playerCrest;
        if (state.playerVitality !== undefined) window.playerVitality = state.playerVitality;
        if (state.playerAdmin) window.playerAdmin = state.playerAdmin;
        if (state.playerCityState) window.playerCityState = state.playerCityState;

        // Render ulang UI
        if (typeof updateUI === 'function') updateUI();
        if (typeof renderJobsUI === 'function') renderJobsUI();
        if (typeof renderAdminUI === 'function') renderAdminUI();
        if (typeof renderCityMapUI === 'function') renderCityMapUI();

        return true;
    } catch (error) {
        console.error('Gagal memuat data simpanan:', error);
        return false;
    }
}

/**
 * Mengeset ulang (Reset) seluruh data permainan
 */
function resetGame() {
    if (confirm('⚠️️ Apakah kamu yakin ingin mengulang permainan dari awal? Semua data akan dihapus!')) {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    }
}

/**
 * Ekspor data simpanan ke berkas file .json
 */
function exportSaveFile() {
    const state = getGameState();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Crestville_Save_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (typeof Toast !== 'undefined') Toast.success('📥 File simpanan berhasil diunduh!');
}

/**
 * Impor data simpanan dari berkas .json
 * @param {Event} event 
 */
function importSaveFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const state = JSON.parse(e.target.result);
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
            
            if (typeof Toast !== 'undefined') Toast.success('📤 Berhasil mengimpor simpanan! Memuat ulang...');
            setTimeout(() => location.reload(), 1000);
        } catch (err) {
            if (typeof Toast !== 'undefined') Toast.error('File simpanan tidak valid!');
        }
    };
    reader.readAsText(file);
}

/**
 * Menginisialisasi Pemicu Simpan Otomatis & Pemuatan Awal
 */
function initStorageModule() {
    // Memuat data yang ada saat aplikasi dibuka
    const hasLoaded = loadGame();
    if (hasLoaded && typeof Toast !== 'undefined') {
        Toast.info('🎮 Data permainan terakhir berhasil dimuat.');
    }

    // Jalankan interval Auto-Save
    setInterval(() => {
        saveGame(true);
    }, AUTO_SAVE_INTERVAL);
}

// Inisialisasi otomatis setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
    initStorageModule();
});
