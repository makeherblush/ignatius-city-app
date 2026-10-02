// ==========================================
// MASTER DATABASE LISENSI & SERTIFIKASI
// ==========================================

window.LICENSES_DATABASE = [
    // --- SIPIL & IDENTITAS ---
    { id: 'KTP_DIGITAL', name: 'KTP Digital Ignatius', category: 'Identitas', cost: 0, iconPng: 'assets/images/icons/ktp.png', iconFa: 'fa-address-card', desc: 'Identitas resmi warga negara Kota Ignatius.' },
    { id: 'PASSPORT_INT', name: 'Paspor Komersial Internasional', category: 'Identitas', cost: 10000, iconPng: 'assets/images/icons/passport.png', iconFa: 'fa-passport', desc: 'Izin bepergian dan perjalanan dinas luar kota.' },

    // --- LISENSI BERKENDARA & TRANSPORTASI ---
    { id: 'SIM_C', name: 'SIM C (Motor)', category: 'Berkendara', cost: 1500, iconPng: 'assets/images/icons/sim_c.png', iconFa: 'fa-motorcycle', desc: 'Izin mengendarai sepeda motor & ojek online.' },
    { id: 'SIM_A', name: 'SIM A (Mobil)', category: 'Berkendara', cost: 3000, iconPng: 'assets/images/icons/sim_a.png', iconFa: 'fa-car', desc: 'Izin mengendarai mobil pribadi, taksi, & patroli.' },
    { id: 'SIM_B1', name: 'SIM B1 (Truk & Bus)', category: 'Berkendara', cost: 6000, iconPng: 'assets/images/icons/sim_b1.png', iconFa: 'fa-truck', desc: 'Izin mengemudi kendaraan angkutan barang & kargo.' },
    { id: 'LICENSE_PILOT_CPL', name: 'Lisensi Pilot Komersial (CPL)', category: 'Penerbangan', cost: 80000, iconPng: 'assets/images/icons/pilot.png', iconFa: 'fa-plane', desc: 'Izin menerbangkan pesawat penumpang & kargo.' },
    { id: 'LICENSE_PILOT_HELI', name: 'Lisensi Pilot Helikopter', category: 'Penerbangan', cost: 60000, iconPng: 'assets/images/icons/heli.png', iconFa: 'fa-helicopter', desc: 'Izin mengemudikan helikopter darurat & medis.' },
    { id: 'LICENSE_CAPTAIN', name: 'Lisensi Nahkoda Laut', category: 'Pelayaran', cost: 50000, iconPng: 'assets/images/icons/ship.png', iconFa: 'fa-ship', desc: 'Izin pelayaran kargo & transportasi laut.' },

    // --- DOKTER & KESEHATAN ---
    { id: 'STR_GENERAL', name: 'STR Medis Umum', category: 'Profesi Medis', cost: 15000, iconPng: 'assets/images/icons/str_general.png', iconFa: 'fa-user-nurse', desc: 'Lisensi praktek Dokter Umum & Perawat RSUD.' },
    { id: 'STR_SPECIALIST', name: 'STR Spesialis Bedah IGD', category: 'Profesi Medis', cost: 35000, iconPng: 'assets/images/icons/str_spec.png', iconFa: 'fa-stethoscope', desc: 'Lisensi Dokter Bedah untuk pasien pingsan/koma.' },
    { id: 'STR_PHARMA', name: 'STR Apoteker Medis', category: 'Profesi Medis', cost: 20000, iconPng: 'assets/images/icons/str_pharma.png', iconFa: 'fa-pills', desc: 'Izin racik resep obat & suplemen stamina.' },

    // --- HUKUM & KEAMANAN ---
    { id: 'LICENSE_LAW', name: 'Izin Praktik Advokat', category: 'Profesi Hukum', cost: 30000, iconPng: 'assets/images/icons/lawyer.png', iconFa: 'fa-scale-balanced', desc: 'Izin mendampingi persidangan Pengacara & Jaksa.' },
    { id: 'LICENSE_NOTARY', name: 'Izin Notaris & PPAT', category: 'Profesi Hukum', cost: 40000, iconPng: 'assets/images/icons/notary.png', iconFa: 'fa-signature', desc: 'Legalitas pengurusan akta sewa & properti.' },
    { id: 'CERT_SECURITY_1', name: 'Sertifikat Security Pratama', category: 'Keamanan', cost: 5000, iconPng: 'assets/images/icons/sec1.png', iconFa: 'fa-shield', desc: 'Izin tugas Satpam ruko & fasilitas publik.' },
    { id: 'CERT_SECURITY_2', name: 'Sertifikat Security Utama', category: 'Keamanan', cost: 18000, iconPng: 'assets/images/icons/sec2.png', iconFa: 'fa-user-shield', desc: 'Izin Pengawal Pribadi (VIP Bodyguard).' },
    { id: 'LICENSE_FIREARM_INST', name: 'Lisensi Instruktur Menembak', category: 'Keamanan', cost: 50000, iconPng: 'assets/images/icons/gun.png', iconFa: 'fa-crosshairs', desc: 'Izin instruktur pelatihan lapangan Polres.' },

    // --- PERIZINAN BISNIS & UMKM ---
    { id: 'NIB_FOOD', name: 'NIB Kuliner & Restoran', category: 'Perizinan Bisnis', cost: 8000, iconPng: 'assets/images/icons/nib_food.png', iconFa: 'fa-utensils', desc: 'Izin mendirikan kedai, warung, & resto.' },
    { id: 'NIB_RETAIL', name: 'NIB Ritel & Minimarket', category: 'Perizinan Bisnis', cost: 15000, iconPng: 'assets/images/icons/nib_retail.png', iconFa: 'fa-store', desc: 'Izin mendirikan minimarket 24 jam.' },
    { id: 'NIB_CONSTRUCTION', name: 'NIB Jasa Konstruksi', category: 'Perizinan Bisnis', cost: 50000, iconPng: 'assets/images/icons/nib_const.png', iconFa: 'fa-helmet-safety', desc: 'Izin proyek pembangunan & kontraktor.' },
    { id: 'NIB_INSURANCE', name: 'Izin Perusahaan Asuransi', category: 'Perizinan Bisnis', cost: 150000, iconPng: 'assets/images/icons/ins_company.png', iconFa: 'fa-file-contract', desc: 'Izin operasional penyedia polis asuransi.' },
    { id: 'LICENSE_REALTOR', name: 'Izin Agen Real Estate', category: 'Perizinan Bisnis', cost: 12000, iconPng: 'assets/images/icons/realtor.png', iconFa: 'fa-house-user', desc: 'Izin broker transaksi sewa kos & vila.' },
    { id: 'NIB_SECURITY_AGENCY', name: 'Izin Agensi Keamanan', category: 'Perizinan Bisnis', cost: 45000, iconPng: 'assets/images/icons/sec_agency.png', iconFa: 'fa-building-shield', desc: 'Izin penyedia jasa penyaluran satpam.' },

    // --- SERTIFIKASI KEUANGAN & IT ---
    { id: 'CERT_ACCOUNTANT', name: 'Sertifikasi Akuntan Publik', category: 'Sertifikasi', cost: 25000, iconPng: 'assets/images/icons/cert_acc.png', iconFa: 'fa-calculator', desc: 'Auditor pembukuan keuangan PT & ruko.' },
    { id: 'CERT_FINANCE', name: 'Sertifikasi Financial Advisor', category: 'Sertifikasi', cost: 20000, iconPng: 'assets/images/icons/cert_fin.png', iconFa: 'fa-chart-line', desc: 'Konsultan portofolio & investasi P2P.' },
    { id: 'CERT_CYBER', name: 'Sertifikasi Cyber Security', category: 'Teknologi', cost: 30000, iconPng: 'assets/images/icons/cyber.png', iconFa: 'fa-user-secret', desc: 'Pengawas jaringan & keamanan Crest Pay.' },
    { id: 'CERT_SOFTWARE', name: 'Sertifikasi Software Architect', category: 'Teknologi', cost: 35000, iconPng: 'assets/images/icons/soft.png', iconFa: 'fa-code', desc: 'Pengembang modul & aplikasi bisnis.' },
    { id: 'CERT_ARCHITECT', name: 'Sertifikasi Arsitek Utama', category: 'Sertifikasi', cost: 40000, iconPng: 'assets/images/icons/arch.png', iconFa: 'fa-compass-drafting', desc: 'Perancang cetak biru & tata ruang kota.' },
    { id: 'CERT_JOURNALIST', name: 'Sertifikasi Jurnalistik Utama', category: 'Sertifikasi', cost: 10000, iconPng: 'assets/images/icons/news.png', iconFa: 'fa-newspaper', desc: 'Izin wartawan resmi Warta Ignatius.' },
    { id: 'CERT_EXECUTIVE', name: 'Sertifikasi Manajemen Exec', category: 'Profesi Eksekutif', cost: 100000, iconPng: 'assets/images/icons/ceo.png', iconFa: 'fa-user-tie', desc: 'Syarat wajib menduduki jabatan CEO PT.' }
];
