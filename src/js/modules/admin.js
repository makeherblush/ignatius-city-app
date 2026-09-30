// ==========================================
// MODUL ADMINISTRASI KTP & LISENSI (ADMIN.JS)
// ==========================================

// Catalog Lisensi & Sertifikat Keahlian Sipil
const LICENSES_CATALOG = [
    {
        id: 'SIM_C',
        name: 'SIM C (Motor)',
        category: 'Izin Mengemudi',
        icon: 'fa-motorcycle',
        cost: 1500,
        description: 'Syarat wajib untuk pekerjaan Kurir Paket & Ojek Online.'
    },
    {
        id: 'SIM_A',
        name: 'SIM A (Mobil)',
        category: 'Izin Mengemudi',
        icon: 'fa-car',
        cost: 3500,
        description: 'Syarat wajib untuk pekerjaan Supir Taksi Online.'
    },
    {
        id: 'CERT_BARISTA',
        name: 'Sertifikat Barista',
        category: 'Keahlian Khusus',
        icon: 'fa-mug-hot',
        cost: 5000,
        description: 'Membuka bursa kerja Barista Kafe.'
    },
    {
        id: 'CERT_SECURITY',
        name: 'Sertifikat Gada Pratama',
        category: 'Keahlian Khusus',
        icon: 'fa-shield-halved',
        cost: 8000,
        description: 'Sertifikat resmi kualifikasi Petugas Keamanan (Satpam).'
    },
    {
        id: 'CERT_IT',
        name: 'Sertifikat Komputer & IT',
        category: 'Keahlian Khusus',
        icon: 'fa-laptop-code',
        cost: 15000,
        description: 'Membuka pekerjaan Teknisi PC, Desainer Grafis, & Software Engineer.'
    },
    {
        id: 'LICENSE_CONSTRUCTION',
        name: 'Izin Usaha Konstruksi',
        category: 'Lisensi Profesi',
        icon: 'fa-helmet-safety',
        cost: 35000,
        description: 'Syarat wajib untuk melamar sebagai Kontraktor Bangunan.'
    },
    {
        id: 'LICENSE_MEDICAL',
        name: 'Surat Tanda Registrasi (STR) Medis',
        category: 'Lisensi Profesi',
        icon: 'fa-user-nurse',
        cost: 75000,
        description: 'Syarat profesi Perawat Medis dan Dokter Spesialis.'
    },
    {
        id: 'LICENSE_LAW',
        name: 'Izin Praktik Advokat',
        category: 'Lisensi Profesi',
        icon: 'fa-scale-balanced',
        cost: 120000,
        description: 'Syarat wajib untuk berpraktik sebagai Pengacara Hukum.'
    },
    {
        id: 'LICENSE_AVIATION',
        name: 'Lisensi Pilot Komersial (CPL)',
        category: 'Lisensi Profesi',
        icon: 'fa-plane',
        cost: 250000,
        description: 'Izin resmi menerbangkan pesawat maskapai komersial.'
    },
    {
        id: 'LICENSE_EXECUTIVE',
        name: 'Sertifikat Manajemen Korporat',
        category: 'Lisensi Eksekutif',
        icon: 'fa-user-tie',
        cost: 500000,
        description: 'Kualifikasi tertinggi untuk jabatan Direktur Utama (CEO).'
    }
];

// Inisialisasi state admin pemain
if (typeof window.playerAdmin === 'undefined') {
    window.playerAdmin = {
        hasKTP: false,
        nik: null,
        fullName: 'Warga Kota',
        gender: 'Laki-laki',
        city: 'Kota Crestville',
        registeredAt: null,
        licenses: []
    };
}

/**
 * Generate NIK Acak Berdasarkan Format Standar KTP
 */
function generateNIK() {
    const prefix = '3273'; // Kode Wilayah Contoh
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000);
    return `${prefix}${randomDigits}`;
}

/**
 * Proses Pendaftaran KTP Digital Pertama Kali
 * @param {Event} event 
 */
function registerKTP(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById('ktp-input-name');
    const genderInput = document.getElementById('ktp-input-gender');

    const fullName = nameInput ? nameInput.value.trim() : '';
    const gender = genderInput ? genderInput.value : 'Laki-laki';

    if (!fullName) {
        if (typeof Toast !== 'undefined') Toast.error('Masukkan nama lengkap sesuai identitas!');
        return;
    }

    // Biaya Administrasi KTP (Contoh: 500 Crest)
    const ktpFee = 500;
    if (window.playerCrest < ktpFee) {
        if (typeof Toast !== 'undefined') Toast.error(`Crest tidak cukup untuk biaya admin! (Butuh ${ktpFee} Crest)`);
        return;
    }

    window.playerCrest -= ktpFee;
    window.playerAdmin.hasKTP = true;
    window.playerAdmin.nik = generateNIK();
    window.playerAdmin.fullName = fullName;
    window.playerAdmin.gender = gender;
    window.playerAdmin.registeredAt = new Date().toLocaleDateString('id-ID');

    if (typeof Toast !== 'undefined') {
        Toast.success('🪪 Selamat! KTP Digital kamu berhasil terbit.');
    }

    refreshAdminUI();
}

/**
 * Pembelian Lisensi Sipil / Sertifikat Keahlian
 * @param {string} licenseId 
 */
function buyLicense(licenseId) {
    // 1. Wajib memiliki KTP Digital terlebih dahulu
    if (!window.playerAdmin.hasKTP) {
        if (typeof Toast !== 'undefined') {
            Toast.warning('🪪 Kamu wajib membuat KTP Digital terlebih dahulu di Dinas Kependudukan!');
        }
        return;
    }

    const item = LICENSES_CATALOG.find(l => l.id === licenseId);
    if (!item) return;

    // 2. Cek apakah lisensi sudah dimiliki
    if (window.playerAdmin.licenses.includes(licenseId)) {
        if (typeof Toast !== 'undefined') Toast.info('Kamu sudah memiliki lisensi ini!');
        return;
    }

    // 3. Cek Saldo Crest
    if (window.playerCrest < item.cost) {
        if (typeof Toast !== 'undefined') {
            Toast.error(`Crest tidak cukup! Butuh ${item.cost.toLocaleString()} Crest.`);
        }
        return;
    }

    // 4. Potong Crest & Tambah Lisensi
    window.playerCrest -= item.cost;
    window.playerAdmin.licenses.push(licenseId);

    if (typeof Toast !== 'undefined') {
        Toast.success(`📜 Berhasil menerbitkan ${item.name}!`);
    }

    refreshAdminUI();
}

/**
 * Refresh UI Global & UI Modul Admin
 */
function refreshAdminUI() {
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderJobsUI === 'function') renderJobsUI(); // Update status lisensi di bursa kerja
    renderAdminUI();
}

/**
 * Render Tampilan Kartu KTP Digital & Daftar Lisensi ke DOM
 */
function renderAdminUI() {
    const container = document.getElementById('admin-tab-container');
    if (!container) return;

    const admin = window.playerAdmin;

    // 1. HTML Tampilan KTP (Form Pendaftaran vs Kartu KTP Aktif)
    let ktpHtml = '';
    if (!admin.hasKTP) {
        ktpHtml = `
            <div class="p-5 bg-slate-900/90 rounded-2xl border border-amber-500/30 space-y-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <i class="fa-solid fa-address-card text-lg"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-100 text-sm">Pendaftaran KTP Digital</h4>
                        <p class="text-xs text-slate-400">Biaya Administrasi: <b class="text-amber-400 font-mono">500 Crest</b></p>
                    </div>
                </div>

                <form onsubmit="registerKTP(event)" class="space-y-3">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Nama Lengkap</label>
                        <input type="text" id="ktp-input-name" placeholder="Masukkan nama warga..." required 
                            class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/50">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Jenis Kelamin</label>
                        <select id="ktp-input-gender" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/50">
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20">
                        <i class="fa-solid fa-id-card"></i> Terbitkan KTP Digital
                    </button>
                </form>
            </div>
        `;
    } else {
        ktpHtml = `
            <div class="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/80 rounded-2xl border border-sky-500/30 shadow-2xl relative overflow-hidden space-y-4">
                <div class="flex items-center justify-between border-b border-sky-500/20 pb-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-id-card text-sky-400 text-lg"></i>
                        <span class="text-xs font-bold uppercase tracking-wider text-sky-300">KTP Digital Republik Crestville</span>
                    </div>
                    <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30">VERIFIED</span>
                </div>

                <div class="grid grid-cols-3 gap-3 items-center">
                    <div class="col-span-1 flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        <i class="fa-solid fa-user-tie text-4xl text-sky-400 my-2"></i>
                        <span class="text-[10px] text-slate-400 font-mono">ID STATUS</span>
                    </div>

                    <div class="col-span-2 space-y-1.5 text-xs">
                        <div>
                            <p class="text-[10px] text-slate-500 uppercase font-mono">NIK</p>
                            <p class="font-mono font-bold text-sky-400 text-sm tracking-wide">${admin.nik}</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-slate-500 uppercase font-mono">Nama Lengkap</p>
                            <p class="font-bold text-slate-100">${admin.fullName}</p>
                        </div>
                        <div class="flex justify-between">
                            <div>
                                <p class="text-[10px] text-slate-500 uppercase font-mono">Gender</p>
                                <p class="text-slate-300">${admin.gender}</p>
                            </div>
                            <div>
                                <p class="text-[10px] text-slate-500 uppercase font-mono">Kota</p>
                                <p class="text-slate-300">${admin.city}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 2. HTML Katalog Lisensi Sipil
    let licensesHtml = '';
    LICENSES_CATALOG.forEach(item => {
        const isOwned = admin.licenses.includes(item.id);

        licensesHtml += `
            <div class="p-4 bg-slate-900/80 rounded-2xl border ${isOwned ? 'border-emerald-500/30' : 'border-slate-800'} flex flex-col justify-between gap-3">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${isOwned ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'} border flex items-center justify-center">
                            <i class="fa-solid ${item.icon} text-lg"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-100 text-sm">${item.name}</h4>
                            <span class="text-[10px] font-semibold text-slate-400 uppercase">${item.category}</span>
                        </div>
                    </div>
                    ${isOwned ? `
                        <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">Dimiliki</span>
                    ` : ''}
                </div>

                <p class="text-xs text-slate-400 leading-relaxed">${item.description}</p>

                <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-amber-400">${item.cost.toLocaleString()} Crest</span>
                    ${!isOwned ? `
                        <button onclick="buyLicense('${item.id}')" class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-lg shadow-sky-600/20">
                            Beli Lisensi
                        </button>
                    ` : `
                        <button disabled class="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-default">
                            Terverifikasi
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    // Gabungkan ke container utama
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Bagian Identitas KTP -->
            <div>
                <h3 class="text-base font-bold text-slate-100 mb-3">🪪 Dinas Kependudukan & Catatan Sipil</h3>
                ${ktpHtml}
            </div>

            <!-- Bagian Katalog Lisensi -->
            <div>
                <h3 class="text-base font-bold text-slate-100 mb-3">📜 Bursa Lisensi & Sertifikasi Sipil</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${licensesHtml}
                </div>
            </div>
        </div>
    `;
}

// Inisialisasi awal saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderAdminUI();
});
