// ==========================================
// MODUL CAPIL & KTP DIGITAL (ADMIN.JS)
// ==========================================

// Daftar Sertifikasi & Lisensi Resmi Kota
const CIVIL_LICENSES = [
    { id: 'LICENSE_DRIVER', name: 'SIM A (Pengemudi)', cost: 2500, icon: 'fa-id-card' },
    { id: 'LICENSE_HEAVY_EQUIPMENT', name: 'Lisensi Alat Berat', cost: 7500, icon: 'fa-truck-monster' },
    { id: 'LICENSE_PILOT', name: 'Lisensi Penerbang (Pilot)', cost: 25000, icon: 'fa-plane' },
    { id: 'LICENSE_MEDICAL', name: 'Izin Praktik Medis', cost: 15000, icon: 'fa-user-nurse' },
    { id: 'LICENSE_EXECUTIVE', name: 'Sertifikasi Eksekutif Business', cost: 50000, icon: 'fa-user-tie' }
];

/**
 * Membuat NIK Acak Unik untuk Warga Kota
 */
function generateNIK() {
    const prefix = '3273'; // Kode Wilayah Crestville
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
    return `${prefix}${randomNum}`;
}

/**
 * Mendapatkan Data Pengguna (Integrasi Telegram WebApp & Fallback Otomatis)
 */
function getTelegramUserData() {
    let tgUser = null;
    if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
        tgUser = Telegram.WebApp.initDataUnsafe.user;
    }
    return tgUser;
}

/**
 * Memproses Pendaftaran KTP Digital dengan Integrasi Telegram & Pilihan Gender
 */
function registerKTP(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById('ktp-input-name');
    const genderSelect = document.getElementById('ktp-select-gender');

    let fullName = nameInput ? nameInput.value.trim() : '';
    const gender = genderSelect ? genderSelect.value : 'Laki-laki';

    // Cek data dari Telegram jika input kosong
    const tgUser = getTelegramUserData();
    if (!fullName && tgUser) {
        fullName = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
    }

    if (!fullName) {
        if (typeof Toast !== 'undefined') Toast.warning('Harap masukkan nama lengkap Anda!');
        return;
    }

    // Biaya Administrasi Pendaftaran KTP (500 Crest) - Bisa di-skip jika pendaftaran pertama, atau ikuti sistem asli
    const adminFee = 500;
    if (window.playerCrest < adminFee) {
        // Jika pemain baru dan crest 0, berikan kelonggaran atau potong jika cukup
        if (window.playerCrest > 0) {
            window.playerCrest -= adminFee;
        }
    } else {
        window.playerCrest -= adminFee;
    }

    // Tentukan ID unik (Gunakan ID Telegram jika ada, jika tidak buat NIK lokal)
    const citizenId = tgUser ? `TG-${tgUser.id}` : generateNIK();

    // Simpan data pendaftaran ke state
    window.playerAdmin = {
        hasKTP: true,
        nik: citizenId,
        fullName: fullName,
        gender: gender,
        city: 'Kota Crestville',
        registeredAt: new Date().toLocaleDateString('id-ID'),
        licenses: window.playerAdmin?.licenses || []
    };

    if (typeof Toast !== 'undefined') {
        Toast.success(`🪪 KTP Digital atas nama ${fullName} berhasil diterbitkan!`);
    }

    // Otomatis arahkan ke Peta Kota setelah KTP jadi
    if (typeof switchTab === 'function') {
        switchTab('citymap');
    }

    refreshAdminUI();
}

/**
 * Membeli Lisensi Sipil / Profesi
 * @param {string} licenseId 
 */
function buyLicense(licenseId) {
    if (!window.playerAdmin || !window.playerAdmin.hasKTP) {
        if (typeof Toast !== 'undefined') Toast.warning('Anda wajib memiliki KTP Digital terlebih dahulu!');
        return;
    }

    const lic = CIVIL_LICENSES.find(l => l.id === licenseId);
    if (!lic) return;

    if (window.playerAdmin.licenses.includes(licenseId)) {
        if (typeof Toast !== 'undefined') Toast.info('Anda sudah memiliki lisensi ini.');
        return;
    }

    if (window.playerCrest < lic.cost) {
        if (typeof Toast !== 'undefined') Toast.error(`Crest tidak cukup! Butuh ${lic.cost.toLocaleString()} Crest.`);
        return;
    }

    window.playerCrest -= lic.cost;
    window.playerAdmin.licenses.push(licenseId);

    if (typeof Toast !== 'undefined') {
        Toast.success(`📜 Berhasil memperoleh ${lic.name}!`);
    }

    refreshAdminUI();
}

/**
 * Mengecek apakah pemain memiliki lisensi tertentu
 * @param {string} licenseId 
 * @returns {boolean}
 */
function hasRequiredLicense(licenseId) {
    return window.playerAdmin && window.playerAdmin.licenses && window.playerAdmin.licenses.includes(licenseId);
}

/**
 * Refresh UI Global & Capil
 */
function refreshAdminUI() {
    if (typeof updateUI === 'function') updateUI();
    renderAdminUI();
}

/**
 * Render Tampilan Formulir / Kartu KTP Digital
 */
function renderAdminUI() {
    const container = document.getElementById('admin-tab-container') || document.getElementById('admin-tab');
    if (!container) return;

    const admin = window.playerAdmin || { hasKTP: false };
    const tgUser = getTelegramUserData();
    const defaultName = tgUser ? (tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '')) : '';

    // Tampilan jika BELUM memiliki KTP (Formulir Pendaftaran)
    if (!admin.hasKTP) {
        container.innerHTML = `
            <div class="max-w-md mx-auto p-6 bg-slate-900/90 rounded-2xl border border-sky-500/30 space-y-4 shadow-xl">
                <div class="text-center space-y-1">
                    <div class="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
                        <i class="fa-solid fa-address-card text-2xl"></i>
                    </div>
                    <h3 class="font-bold text-slate-100 text-base">Pendaftaran KTP Digital</h3>
                    <p class="text-xs text-slate-400">Daftarkan identitas resmi Anda sebagai warga Kota Crestville.</p>
                </div>

                <form onsubmit="registerKTP(event)" class="space-y-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                        <input type="text" id="ktp-input-name" value="${defaultName}" placeholder="Masukkan nama Anda..." required
                            class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label>
                        <select id="ktp-select-gender" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500">
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>

                    <div class="pt-2">
                        <button type="submit" class="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95">
                            🪪 Terbitkan KTP Digital & Masuk Kota
                        </button>
                    </div>
                </form>
            </div>
        `;
        return;
    }

    // Tampilan jika SUDAH memiliki KTP Digital (Kartu Identitas + Lisensi)
    let licensesHtml = '';
    CIVIL_LICENSES.forEach(lic => {
        const owned = admin.licenses && admin.licenses.includes(lic.id);
        licensesHtml += `
            <div class="p-3 bg-slate-950/80 rounded-xl border ${owned ? 'border-emerald-500/30' : 'border-slate-800'} flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg ${owned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'} flex items-center justify-center shrink-0">
                        <i class="fa-solid ${lic.icon}"></i>
                    </div>
                    <div>
                        <h5 class="font-bold text-slate-200 text-xs">${lic.name}</h5>
                        <span class="text-[10px] text-slate-400 font-mono">${lic.cost.toLocaleString()} Crest</span>
                    </div>
                </div>

                ${owned ? `
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-md border border-emerald-500/30">Lulus</span>
                ` : `
                    <button onclick="buyLicense('${lic.id}')" class="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-lg transition-all">
                        Ujian Lisensi
                    </button>
                `}
            </div>
        `;
    });

    const avatarIcon = admin.gender === 'Perempuan' ? 'fa-user-nurse' : 'fa-user-tie';

    container.innerHTML = `
        <div class="space-y-6">
            <div class="p-5 bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-900 rounded-2xl border border-sky-500/40 space-y-4 shadow-xl">
                <div class="flex items-center justify-between border-b border-sky-500/20 pb-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-id-card text-sky-400 text-lg"></i>
                        <h3 class="font-bold text-slate-100 text-xs tracking-wider uppercase">KTP DIGITAL REPUBLIK CRESTVILLE</h3>
                    </div>
                    <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-md border border-emerald-500/30">AKTIF</span>
                </div>

                <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div class="w-20 h-24 bg-slate-950 border border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 shrink-0">
                        <i class="fa-solid ${avatarIcon} text-3xl mb-1 text-sky-400"></i>
                        <span class="text-[9px] uppercase font-bold text-slate-500">${admin.gender}</span>
                    </div>

                    <div class="space-y-1.5 text-center sm:text-left w-full">
                        <div>
                            <span class="text-[10px] font-mono text-slate-500 block uppercase">NIK / ID</span>
                            <span class="font-mono font-bold text-sky-400 text-sm tracking-wider">${admin.nik}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                            <div>
                                <span class="text-[10px] text-slate-500 block uppercase">Nama Lengkap</span>
                                <span class="font-bold text-slate-200">${admin.fullName}</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-slate-500 block uppercase">Jenis Kelamin</span>
                                <span class="font-bold text-slate-200">${admin.gender}</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-slate-500 block uppercase">Kota Terdaftar</span>
                                <span class="font-bold text-slate-200">${admin.city}</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-slate-500 block uppercase">Tanggal Pendaftaran</span>
                                <span class="font-bold text-slate-200">${admin.registeredAt}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">📜 Pusat Sertifikasi & Lisensi Sipil</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${licensesHtml}
                </div>
            </div>
        </div>
    `;
}

// Inisialisasi otomatis saat dokumen dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderAdminUI === 'function') {
        renderAdminUI();
    }
});
