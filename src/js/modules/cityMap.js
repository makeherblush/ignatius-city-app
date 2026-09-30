// ==========================================
// MODUL PETA KOTA & 911 EMERGENCY (CITYMAP.JS)
// ==========================================

// Catalog Tempat Penting di Kota Crestville
const CITY_LOCATIONS = [
    {
        id: 'city_hall',
        name: 'Balai Kota & Capil',
        district: 'Pusat Kota',
        icon: 'fa-building-columns',
        badgeColor: 'sky',
        description: 'Pusat administrasi kependudukan, pendaftaran KTP Digital, dan penerbitan lisensi sipil.',
        actionLabel: 'Kunjungi Capil',
        actionTab: 'admin'
    },
    {
        id: 'hospital',
        name: 'RSUD Medika Crestville',
        district: 'Sektor Utara',
        icon: 'fa-hospital',
        badgeColor: 'rose',
        description: 'Fasilitas kesehatan utama kota. Tempat pemulihan Vitality dan tempat kerja Tenaga Medis.',
        actionLabel: 'Berobat (Pulih Vitality)',
        healCost: 1000,
        healAmount: 50
    },
    {
        id: 'police_station',
        name: 'Polres Crestville',
        district: 'Pusat Kota',
        icon: 'fa-shield-halved',
        badgeColor: 'blue',
        description: 'Markas kepolisian kota untuk pengurusan SIM, pelaporan kejahatan, dan ketertiban umum.',
        actionLabel: 'Lapor Keamanan'
    },
    {
        id: 'business_district',
        name: 'Kawasan Bisnis CBD',
        district: 'Sektor Selatan',
        icon: 'fa-city',
        badgeColor: 'emerald',
        description: 'Pusat perkantoran eksekutif, restoran, dan lokasi investasi unit bisnis pasif.',
        actionLabel: 'Kelola Bisnis',
        actionTab: 'economy'
    },
    {
        id: 'industrial_port',
        name: 'Pelabuhan & Area Industri',
        district: 'Sektor Timur',
        icon: 'fa-ship',
        badgeColor: 'amber',
        description: 'Pusat pengiriman logistik skala besar, kontraktor bangunan, dan pabrik manufaktur.',
        actionLabel: 'Cek Pekerjaan',
        actionTab: 'jobs'
    },
    {
        id: 'international_airport',
        name: 'Bandara Internasional Crest',
        district: 'Sektor Barat',
        icon: 'fa-plane-departure',
        badgeColor: 'indigo',
        description: 'Hub penerbangan komersial internasional dan markas penerbangan para pilot.',
        actionLabel: 'Area Maskapai'
    }
];

// Layanan Panggilan Darurat 911
const EMERGENCY_SERVICES = [
    {
        id: 'ambulance',
        name: 'Ambulans Gawat Darurat',
        icon: 'fa-truck-medical',
        cost: 2500,
        vitalityRestored: 100,
        description: 'Penanganan medis darurat instan. Memulihkan Vitality hingga 100% secara langsung.'
    },
    {
        id: 'police_dispatch',
        name: 'Patroli Kepolisian Respon Cepat',
        icon: 'fa-handcuffs',
        cost: 1500,
        vitalityRestored: 0,
        description: 'Panggilan penertiban dan perlindungan keamanan darurat dari gangguan kriminal.'
    },
    {
        id: 'fire_brigade',
        name: 'Pemadam Kebakaran (Damkar)',
        icon: 'fa-fire-extinguisher',
        cost: 2000,
        vitalityRestored: 0,
        description: 'Penyelamatan darurat, penanganan bahaya, dan evakuasi insiden tempat usaha.'
    }
];

// State Lokasi Pemain saat ini
if (typeof window.playerCityState === 'undefined') {
    window.playerCityState = {
        currentLocation: 'city_hall',
        lastEmergencyCall: null
    };
}

/**
 * Panggilan Emergency Service 911
 * @param {string} serviceId 
 */
function call911(serviceId) {
    const service = EMERGENCY_SERVICES.find(s => s.id === serviceId);
    if (!service) return;

    // Cek kecukupan saldo Crest
    if (window.playerCrest < service.cost) {
        if (typeof Toast !== 'undefined') {
            Toast.error(`📞 911: Panggilan ${service.name} butuh ${service.cost.toLocaleString()} Crest!`);
        }
        return;
    }

    // Potong biaya & proses efek layanan
    window.playerCrest -= service.cost;

    if (service.vitalityRestored > 0) {
        const maxVitality = 100;
        window.playerVitality = Math.min(maxVitality, window.playerVitality + service.vitalityRestored);
    }

    window.playerCityState.lastEmergencyCall = new Date().toLocaleTimeString('id-ID');

    if (typeof Toast !== 'undefined') {
        Toast.success(`🚨 911 DISPATCH: ${service.name} dalam perjalanan! (+${service.vitalityRestored} Vitality)`);
    }

    refreshCityMapUI();
}

/**
 * Mengunjungi / Berinteraksi dengan Lokasi Kota
 * @param {string} locationId 
 */
function visitCityLocation(locationId) {
    const loc = CITY_LOCATIONS.find(l => l.id === locationId);
    if (!loc) return;

    window.playerCityState.currentLocation = loc.id;

    // Aksi Berobat / Pemulihan Vitality di Rumah Sakit
    if (loc.healCost && loc.healAmount) {
        if (window.playerCrest < loc.healCost) {
            if (typeof Toast !== 'undefined') Toast.error(`Crest tidak cukup untuk berobat! (Butuh ${loc.healCost} Crest)`);
            return;
        }
        if (window.playerVitality >= 100) {
            if (typeof Toast !== 'undefined') Toast.info('Vitality kamu sudah penuh!');
            return;
        }

        window.playerCrest -= loc.healCost;
        window.playerVitality = Math.min(100, window.playerVitality + loc.healAmount);

        if (typeof Toast !== 'undefined') {
            Toast.success(`🏥 Berobat di ${loc.name}! (+${loc.healAmount} Vitality)`);
        }
        refreshCityMapUI();
        return;
    }

    // Navigasi Otomatis ke Tab Terkait jika ada
    if (loc.actionTab && typeof switchTab === 'function') {
        switchTab(loc.actionTab);
        if (typeof Toast !== 'undefined') {
            Toast.info(`🚗 Bepergian menuju ${loc.name}...`);
        }
        return;
    }

    if (typeof Toast !== 'undefined') {
        Toast.info(`📍 Kamu saat ini berada di ${loc.name} (${loc.district}).`);
    }
    refreshCityMapUI();
}

/**
 * Refresh UI Global & UI Peta Kota
 */
function refreshCityMapUI() {
    if (typeof updateUI === 'function') updateUI();
    renderCityMapUI();
}

/**
 * Render Tampilan Peta Kota dan Layanan 911 ke DOM
 */
function renderCityMapUI() {
    const container = document.getElementById('citymap-tab-container');
    if (!container) return;

    // 1. Render Kartu Lokasi Kota
    let locationsHtml = '';
    CITY_LOCATIONS.forEach(loc => {
        const isCurrent = window.playerCityState.currentLocation === loc.id;

        locationsHtml += `
            <div class="p-4 bg-slate-900/80 rounded-2xl border ${isCurrent ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-500/10' : 'border-slate-800'} flex flex-col justify-between gap-3 transition-all">
                <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-${loc.badgeColor}-500/10 border border-${loc.badgeColor}-500/30 flex items-center justify-center text-${loc.badgeColor}-400 shrink-0">
                            <i class="fa-solid ${loc.icon} text-lg"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-100 text-sm leading-tight">${loc.name}</h4>
                            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">${loc.district}</span>
                        </div>
                    </div>
                    ${isCurrent ? `
                        <span class="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30 shrink-0">Lokasi Anda</span>
                    ` : ''}
                </div>

                <p class="text-xs text-slate-400 leading-relaxed">${loc.description}</p>

                <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    ${loc.healCost ? `
                        <span class="text-xs font-mono font-bold text-amber-400">${loc.healCost.toLocaleString()} Crest</span>
                    ` : '<span></span>'}
                    <button onclick="visitCityLocation('${loc.id}')" 
                        class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all active:scale-95">
                        ${loc.actionLabel}
                    </button>
                </div>
            </div>
        `;
    });

    // 2. Render Layanan 911
    let emergencyHtml = '';
    EMERGENCY_SERVICES.forEach(serv => {
        emergencyHtml += `
            <div class="p-3 bg-slate-950/80 rounded-xl border border-rose-900/40 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                        <i class="fa-solid ${serv.icon}"></i>
                    </div>
                    <div>
                        <h5 class="font-bold text-slate-200 text-xs">${serv.name}</h5>
                        <p class="text-[10px] text-slate-400 leading-snug">${serv.description}</p>
                    </div>
                </div>
                <button onclick="call911('${serv.id}')" class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 shrink-0 transition-all active:scale-95">
                    📞 ${serv.cost.toLocaleString()} C
                </button>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="space-y-6">
            <!-- Panel Layanan Darurat 911 -->
            <div class="p-5 bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 rounded-2xl border border-rose-500/30 space-y-4">
                <div class="flex items-center justify-between border-b border-rose-500/20 pb-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-phone-volume text-rose-500 text-lg animate-pulse"></i>
                        <h3 class="font-bold text-slate-100 text-sm tracking-wide">PUSAT PANGGILAN DARURAT 911</h3>
                    </div>
                    <span class="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold rounded-md border border-rose-500/30">SIAGA 24/7</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    ${emergencyHtml}
                </div>
            </div>

            <!-- Katalog Tempat Penting & Navigasi -->
            <div>
                <h3 class="text-base font-bold text-slate-100 mb-3">🗺️ Peta Navigasi Kota & Destinasi</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${locationsHtml}
                </div>
            </div>
        </div>
    `;
}

// Inisialisasi awal saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderCityMapUI();
});
