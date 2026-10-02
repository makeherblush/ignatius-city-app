// ==========================================
// MASTER DATABASE PEKERJAAN & INTERACTIVE APPS
// ==========================================

window.JOBS_DATABASE = [
    // --- PEKERJAAN SAMPINGAN ---
    { id: 'side_scavenger', title: 'Pemulung Sampah Rapi', category: 'sampingan', pay: 250, vitalityCost: 10, requiredLicense: null, customAppId: null, iconPng: 'assets/images/icons/scavenger.png', iconFa: 'fa-dumpster', desc: 'Sampingan ramah pemula tanpa syarat.' },
    { id: 'side_newspaper', title: 'Loper Koran Pagi', category: 'sampingan', pay: 500, vitalityCost: 12, requiredLicense: null, customAppId: null, iconPng: 'assets/images/icons/paper.png', iconFa: 'fa-newspaper', desc: 'Pengantar warta harian warga.' },
    { id: 'side_ojek', title: 'Ojek Online Sampingan', category: 'sampingan', pay: 850, vitalityCost: 15, requiredLicense: 'SIM_C', customAppId: 'app_driver_express', iconPng: 'assets/images/icons/ojek.png', iconFa: 'fa-motorcycle', desc: 'Narik penumpang via Driver Express.' },
    { id: 'side_courier', title: 'Kurir Paket Kilat Malam', category: 'sampingan', pay: 1200, vitalityCost: 18, requiredLicense: 'SIM_C', customAppId: 'app_driver_express', iconPng: 'assets/images/icons/courier.png', iconFa: 'fa-box', desc: 'Pengiriman paket logistik kilat.' },

    // --- PEKERJAAN TETAP & PROFESI (LENGKAP APK INTERAKTIF) ---
    { id: 'prof_doc_gen', title: 'Dokter Umum RSUD Medika', category: 'tetap', division: 'Medis RSUD', pay: 14000, vitalityCost: 20, requiredLicense: 'STR_GENERAL', customAppId: 'app_halodoc', iconPng: 'assets/images/icons/doc_gen.png', iconFa: 'fa-user-doctor', desc: 'Akses Apk Halodoc Medika untuk konsultasi & resep.' },
    { id: 'prof_doc_surg', title: 'Dokter Spesialis Bedah', category: 'tetap', division: 'Medis RSUD', pay: 22000, vitalityCost: 25, requiredLicense: 'STR_SPECIALIST', customAppId: 'app_halodoc', iconPng: 'assets/images/icons/doc_surg.png', iconFa: 'fa-syringe', desc: 'Akses Apk Halodoc & IGD Bedah Pasien Koma.' },
    { id: 'prof_nurse', title: 'Perawat Medis IGD', category: 'tetap', division: 'Medis RSUD', pay: 9500, vitalityCost: 18, requiredLicense: 'STR_GENERAL', customAppId: 'app_halodoc', iconPng: 'assets/images/icons/nurse.png', iconFa: 'fa-user-nurse', desc: 'Akses Halodoc & Penanganan Ambulans.' },
    { id: 'prof_police_patrol', title: 'Petugas Lantas & Patroli', category: 'tetap', division: 'Polres Ignatius', pay: 12500, vitalityCost: 20, requiredLicense: 'SIM_A', customAppId: 'app_police_hub', iconPng: 'assets/images/icons/police.png', iconFa: 'fa-shield-halved', desc: 'Akses Polres Hub untuk e-Tilang & Patroli.' },
    { id: 'prof_police_detective', title: 'Detektif Penyidik Polres', category: 'tetap', division: 'Polres Ignatius', pay: 16500, vitalityCost: 22, requiredLicense: 'SIM_A', customAppId: 'app_police_hub', iconPng: 'assets/images/icons/detective.png', iconFa: 'fa-magnifying-glass-chart', desc: 'Akses Polres Hub untuk Input DPO & Kasus.' },
    { id: 'prof_lawyer_advocate', title: 'Pengacara Publik / Advokat', category: 'tetap', division: 'Pengadilan', pay: 18500, vitalityCost: 22, requiredLicense: 'LICENSE_LAW', customAppId: 'app_legal_court', iconPng: 'assets/images/icons/lawyer.png', iconFa: 'fa-scale-balanced', desc: 'Akses E-Court Sidang & Pendampingan Warga.' },
    { id: 'prof_judge', title: 'Hakim Agung Pengadilan', category: 'tetap', division: 'Pengadilan', pay: 28000, vitalityCost: 25, requiredLicense: 'LICENSE_LAW', customAppId: 'app_legal_court', iconPng: 'assets/images/icons/judge.png', iconFa: 'fa-landmark-flag', desc: 'Akses E-Court untuk Ketok Palu Persidangan.' },
    { id: 'prof_ceo', title: 'Chief Executive Officer (CEO)', category: 'tetap', division: 'Direksi PT', pay: 55000, vitalityCost: 30, requiredLicense: 'CERT_EXECUTIVE', customAppId: 'app_corp_manager', iconPng: 'assets/images/icons/ceo.png', iconFa: 'fa-user-tie', desc: 'Akses Corp Manager untuk Payroll & Proyek.' },
    { id: 'prof_journalist', title: 'Wartawan Warta Ignatius', category: 'tetap', division: 'Penerbitan', pay: 11500, vitalityCost: 16, requiredLicense: 'CERT_JOURNALIST', customAppId: 'app_press_news', iconPng: 'assets/images/icons/reporter.png', iconFa: 'fa-newspaper', desc: 'Akses Press News untuk Terbitkan Berita Kota.' }
];
