// ==========================================
// MODUL PENYIMPANAN DATA (STORAGE SYSTEM)
// ==========================================

const SAVE_KEY = 'CIVIL_SIM_SAVE_DATA_V1';
const AUTO_SAVE_INTERVAL = 10000; // Auto-save setiap 10 detik

/**
 * Mengumpulkan seluruh status variabel game menjadi 1 objek data
 */
function getGameStateObject() {
    return {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        playerCrest: typeof playerCrest !== 'undefined' ? playerCrest : 10000,
        playerVitality: typeof playerVitality !== 'undefined' ? playerVitality : 100,
        playerBills: typeof playerBills !== 'undefined' ? playerBills : [],
        playerBusinesses: typeof playerBusinesses !== 'undefined' ? playerBusinesses : [],
        playerAdmin: typeof playerAdmin !== 'undefined' ? playerAdmin : {},
        playerHousing: typeof playerHousing !== 'undefined' ? playerHousing : {},
        ownedCommercials: typeof ownedCommercials !== 'undefined' ? ownedCommercials : []
    };
}

/**
 * Menyimpan data game ke localStorage
 * @param {boolean} isManual - Penanda apakah aksi dipanggil secara manual oleh tombol
 */
function saveGame(isManual = false) {
    try {
        const data = getGameStateObject();
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));

        updateSaveBadgeStatus(isManual ? '✅ Progress Tersimpan!' : '💾 Auto-Saved');

        if (isManual) {
            alert('🎉 Game berhasil disimpan ke browser!');
        }
    } catch (error) {
        console.error('Gagal menyimpan game:', error);
        updateSaveBadgeStatus('⚠️ Gagal Menyimpan');
    }
}

/**
 * Memuat data simpanan dari localStorage saat game dibuka
 */
function loadGame() {
    try {
        const rawData = localStorage.getItem(SAVE_KEY);
        if (!rawData) {
            console.log('Belum ada save data lokal. Menggunakan nilai bawaan.');
            return false;
        }

        const data = JSON.parse(rawData);

        // Restore variabel global jika ada dalam simpanan
        if (data.playerCrest !== undefined) window.playerCrest = data.playerCrest;
        if (data.playerVitality !== undefined) window.playerVitality = data.playerVitality;
        if (data.playerBills !== undefined) window.playerBills = data.playerBills;
        if (data.playerBusinesses !== undefined) window.playerBusinesses = data.playerBusinesses;
        if (data.playerAdmin !== undefined) window.playerAdmin = data.playerAdmin;
        if (data.playerHousing !== undefined) window.playerHousing = data.playerHousing;
        if (data.ownedCommercials !== undefined) window.ownedCommercials = data.ownedCommercials;

        // Render ulang semua UI terkait
        refreshAllUI();
        console.log('Save data berhasil dimuat:', data);
        return true;
    } catch (error) {
        console.error('Gagal memuat save data:', error);
        return false;
    }
}

/**
 * Mengeksport data simpanan menjadi file JSON yang bisa diunduh
 */
function exportSaveData() {
    try {
        const data = getGameStateObject();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        const fileName = `CivilSim_Save_${new Date().toISOString().slice(0, 10)}.json`;
        const downloadLink = document.createElement('a');

        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        updateSaveBadgeStatus('📥 File JSON Diunduh');
    } catch (error) {
        alert('Gagal mengeksport data simpanan!');
        console.error(error);
    }
}

/**
 * Mengimpor data simpanan dari file JSON yang diunggah pemain
 */
function importSaveData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            // Validasi sederhana struktur file
            if (data.playerCrest === undefined || !data.playerAdmin) {
                throw new Error('Format file JSON tidak sesuai standar game!');
            }

            // Timpa data lokal & variabel game
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            loadGame();

            alert('🚀 Import Save Data berhasil! Seluruh progress telah diperbarui.');
            event.target.value = ''; // Reset input file
        } catch (error) {
            alert(`⚠️ Gagal Mengimpor Data: ${error.message}`);
            event.target.value = '';
        }
    };

    reader.readAsText(file);
}

/**
 * Menghapus data simpanan dan mengembalikan ke keadaan awal
 */
function resetGameSave() {
    if (confirm('🚨 PERINGATAN: Apakah kamu yakin ingin menghapus seluruh progress game?\nData yang dihapus tidak bisa dikembalikan!')) {
        localStorage.removeItem(SAVE_KEY);
        location.reload(); // Reload halaman untuk mereset variabel
    }
}

/**
 * Helper untuk memperbarui indikator status di UI
 */
function updateSaveBadgeStatus(message) {
    const badge = document.getElementById('save-status-badge');
    if (!badge) return;

    badge.innerText = message;
    setTimeout(() => {
        badge.innerText = '💾 Auto-Save: Aktif';
    }, 3000);
}

/**
 * Memicu pembaruan seluruh tampilan komponen UI setelah data dimuat
 */
function refreshAllUI() {
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderBillsUI === 'function') renderBillsUI();
    if (typeof renderBusinessesUI === 'function') renderBusinessesUI();
    if (typeof renderAdminUI === 'function') renderAdminUI();
    if (typeof renderCityMapUI === 'function') renderCityMapUI();
    if (typeof renderPropertyUI === 'function') renderPropertyUI();
}

/**
 * Inisialisasi Auto-Save & Memuat data saat aplikasi dibuka
 */
function initSaveSystem() {
    loadGame();

    // Jalankan timer Auto-Save setiap 10 detik
    setInterval(() => {
        saveGame(false);
    }, AUTO_SAVE_INTERVAL);
}

// Inisialisasi otomatis setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
    initSaveSystem();
});
