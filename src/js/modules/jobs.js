// ==========================================
// MODUL BURSA KERJA & VITALITY (JOBS.JS)
// ==========================================

// Catalog 17 Pekerjaan dengan Tingkat Kesulitan, Syarat, dan Imbalan
const JOBS_CATALOG = [
    // --- TINGKAT DASAR (UNSKILLED / ENTRY) ---
    {
        id: 'scavenger',
        title: 'Pemulung Sampah',
        category: 'Pemula',
        icon: 'fa-dumpster',
        income: 250,
        vitalityCost: 10,
        requiredLicense: null,
        description: 'Mengumpulkan barang bekas di area kota.'
    },
    {
        id: 'dishwasher',
        title: 'Pencuci Piring Resto',
        category: 'Pemula',
        icon: 'fa-soap',
        income: 450,
        vitalityCost: 12,
        requiredLicense: null,
        description: 'Bekerja kasar di dapur restoran lokal.'
    },
    {
        id: 'retail_staff',
        title: 'Karyawan Minimarket',
        category: 'Pemula',
        icon: 'fa-basket-shopping',
        income: 850,
        vitalityCost: 15,
        requiredLicense: 'KTP_DIGITAL',
        description: 'Melayani pembeli dan menata stok barang.'
    },
    {
        id: 'ojek_courier',
        title: 'Kurir Paket & Makanan',
        category: 'Pemula',
        icon: 'fa-box',
        income: 1100,
        vitalityCost: 15,
        requiredLicense: 'SIM_C',
        description: 'Mengantar paket pelanggan tepat waktu.'
    },

    // --- TINGKAT MENENGAH (SKILLED / DRIVING & TECH) ---
    {
        id: 'ojek_driver',
        title: 'Pengemudi Ojek Online',
        category: 'Menengah',
        icon: 'fa-motorcycle',
        income: 1400,
        vitalityCost: 16,
        requiredLicense: 'SIM_C',
        description: 'Menerima orderan penumpang keliling kota.'
    },
    {
        id: 'barista',
        title: 'Barista Kafe',
        category: 'Menengah',
        icon: 'fa-mug-hot',
        income: 1600,
        vitalityCost: 14,
        requiredLicense: 'CERT_BARISTA',
        description: 'Meracik kopi berkualitas untuk pelanggan.'
    },
    {
        id: 'taxi_driver',
        title: 'Supir Taksi Online',
        category: 'Menengah',
        icon: 'fa-car',
        income: 2200,
        vitalityCost: 18,
        requiredLicense: 'SIM_A',
        description: 'Mengantar penumpang menggunakan mobil pribadi.'
    },
    {
        id: 'security_guard',
        title: 'Satpam / Security',
        category: 'Menengah',
        icon: 'fa-shield-halved',
        income: 2800,
        vitalityCost: 20,
        requiredLicense: 'CERT_SECURITY',
        description: 'Menjaga keamanan gedung perbankan dan mall.'
    },
    {
        id: 'pc_technician',
        title: 'Teknisi Komputer',
        category: 'Menengah',
        icon: 'fa-screwdriver-wrench',
        income: 3500,
        vitalityCost: 18,
        requiredLicense: 'CERT_IT',
        description: 'Memperbaiki kerusakan hardware & software client.'
    },

    // --- TINGKAT PROFESIONAL (PROFESSIONAL / SPECIALIST) ---
    {
        id: 'graphic_designer',
        title: 'Desainer Grafis Freelance',
        category: 'Profesional',
        icon: 'fa-palette',
        income: 4800,
        vitalityCost: 15,
        requiredLicense: 'CERT_IT',
        description: 'Mengerjakan aset visual dan branding usaha.'
    },
    {
        id: 'construction_contractor',
        title: 'Kontraktor Bangunan',
        category: 'Profesional',
        icon: 'fa-helmet-safety',
        income: 6200,
        vitalityCost: 25,
        requiredLicense: 'LICENSE_CONSTRUCTION',
        description: 'Mengawasi proyek renovasi dan pembangunan properti.'
    },
    {
        id: 'software_engineer',
        title: 'Software Engineer',
        category: 'Profesional',
        icon: 'fa-code',
        income: 8500,
        vitalityCost: 20,
        requiredLicense: 'CERT_IT',
        description: 'Mengembangkan aplikasi dan sistem korporat.'
    },
    {
        id: 'nurse',
        title: 'Perawat Medis',
        category: 'Profesional',
        icon: 'fa-user-nurse',
        income: 9500,
        vitalityCost: 22,
        requiredLicense: 'LICENSE_MEDICAL',
        description: 'Membantu penanganan pasien di Rumah Sakit Kota.'
    },

    // --- TINGKAT TINGGI / EKSEKUTIF (EXECUTIVE / EXPERT) ---
    {
        id: 'lawyer',
        title: 'Pengacara Hukum',
        category: 'Eksekutif',
        icon: 'fa-scale-balanced',
        income: 14000,
        vitalityCost: 22,
        requiredLicense: 'LICENSE_LAW',
        description: 'Mendampingi klien dalam sengketa hukum dan bisnis.'
    },
    {
        id: 'specialist_doctor',
        title: 'Dokter Spesialis',
        category: 'Eksekutif',
        icon: 'fa-stethosocpe',
        income: 22000,
        vitalityCost: 25,
        requiredLicense: 'LICENSE_MEDICAL',
        description: 'Melakukan penanganan medis spesialis dan operasi.'
    },
    {
        id: 'airline_pilot',
        title: 'Pilot Maskapai Komersial',
        category: 'Eksekutif',
        icon: 'fa-plane',
        income: 35000,
        vitalityCost: 30,
        requiredLicense: 'LICENSE_AVIATION',
        description: 'Menerbangkan pesawat penerbangan domestik & internasional.'
    },
    {
        id: 'corporate_ceo',
        title: 'Direktur Utama (CEO)',
        category: 'Eksekutif',
        icon: 'fa-user-tie',
        income: 65000,
        vitalityCost: 35,
        requiredLicense: 'LICENSE_EXECUTIVE',
        description: 'Memimpin ekspansi bisnis korporasi skala nasional.'
    }
];

// Label Lisensi untuk UI
const LICENSE_NAMES = {
    'KTP_DIGITAL': 'KTP Digital',
    'SIM_A': 'SIM A (Mobil)',
    'SIM_C': 'SIM C (Motor)',
    'CERT_BARISTA': 'Sertifikat Barista',
    'CERT_SECURITY': 'Sertifikat Gada Pratama',
    'CERT_IT': 'Sertifikat Komputer & IT',
    'LICENSE_CONSTRUCTION': 'Izin Usaha Konstruksi',
    'LICENSE_MEDICAL': 'Surat Tanda Registrasi (STR) Medis',
    'LICENSE_LAW': 'Izin Praktik Advokat',
    'LICENSE_AVIATION': 'Lisensi Pilot (CPL)',
    'LICENSE_EXECUTIVE': 'Sertifikat Manajemen Korporat'
};

/**
 * Memeriksa apakah pemain memiliki lisensi yang dibutuhkan
 * @param {string|null} requiredLicense 
 * @returns {boolean}
 */
function hasRequiredLicense(requiredLicense) {
    if (!requiredLicense) return true;

    // Ambil lisensi milik pemain dari window.playerAdmin
    const playerLicenses = (window.playerAdmin && window.playerAdmin.licenses) ? window.playerAdmin.licenses : [];

    // Jika butuh KTP Digital
    if (requiredLicense === 'KTP_DIGITAL') {
        return window.playerAdmin && window.playerAdmin.hasKTP === true;
    }

    return playerLicenses.includes(requiredLicense);
}

/**
 * Eksekusi Aksi Bekerja
 * @param {string} jobId - ID pekerjaan yang dipilih
 */
function workJob(jobId) {
    const job = JOBS_CATALOG.find(j => j.id === jobId);
    if (!job) return;

    // 1. Cek Ketersediaan Vitality
    if (window.playerVitality < job.vitalityCost) {
        if (typeof Toast !== 'undefined') {
            Toast.error(`⚡ Vitality tidak cukup! Butuh ${job.vitalityCost} Vitality. Istirahat di Rumah atau Beli Makanan!`);
        }
        return;
    }

    // 2. Cek Lisensi / Syarat
    if (!hasRequiredLicense(job.requiredLicense)) {
        const licenseName = LICENSE_NAMES[job.requiredLicense] || job.requiredLicense;
        if (typeof Toast !== 'undefined') {
            Toast.warning(`📜 Syarat Kurang! Kamu wajib memiliki ${licenseName} di Menu Admin Sipil.`);
        }
        return;
    }

    // 3. Kurangi Vitality & Tambahkan Gaji Crest
    window.playerVitality -= job.vitalityCost;
    window.playerCrest += job.income;

    // 4. Feedback Notifikasi
    if (typeof Toast !== 'undefined') {
        Toast.success(`💼 Berhasil bekerja sebagai ${job.title}! (+${job.income.toLocaleString()} Crest, -${job.vitalityCost} Vit)`);
    }

    // 5. Update Tampilan UI Global
    if (typeof updateUI === 'function') updateUI();
    renderJobsUI();
}

/**
 * Render Katalog 17 Pekerjaan ke DOM Container
 */
function renderJobsUI() {
    const container = document.getElementById('jobs-list-container');
    if (!container) return;

    let html = '';

    JOBS_CATALOG.forEach(job => {
        const canWork = window.playerVitality >= job.vitalityCost;
        const meetsLicense = hasRequiredLicense(job.requiredLicense);
        const licenseName = job.requiredLicense ? (LICENSE_NAMES[job.requiredLicense] || job.requiredLicense) : null;

        html += `
            <div class="p-4 bg-slate-900/80 rounded-2xl border ${meetsLicense ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/30 opacity-75'} flex flex-col justify-between gap-3 transition-all">
                <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                            <i class="fa-solid ${job.icon} text-lg"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-100 text-sm leading-tight">${job.title}</h4>
                            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">${job.category}</span>
                        </div>
                    </div>
                    <span class="text-xs font-mono font-bold text-emerald-400 shrink-0">+${job.income.toLocaleString()}</span>
                </div>

                <p class="text-xs text-slate-400 leading-relaxed">${job.description}</p>

                <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                            <i class="fa-solid fa-bolt text-[10px]"></i> -${job.vitalityCost} Vit
                        </span>
                        ${licenseName ? `
                            <span class="text-[10px] px-2 py-0.5 rounded-md ${meetsLicense ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'} font-medium">
                                ${meetsLicense ? '✓ ' + licenseName : '🔒 ' + licenseName}
                            </span>
                        ` : ''}
                    </div>

                    <button onclick="workJob('${job.id}')" 
                        class="px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                            meetsLicense && canWork 
                            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 active:scale-95' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }">
                        Bekerja
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Inisialisasi awal saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderJobsUI();
});
