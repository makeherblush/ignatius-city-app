// ==========================================
// MODUL KEPEMILIKAN PROPERTI (PROPERTY.JS)
// ==========================================

// Catalog Properti & Tempat Tinggal di Crestville
const PROPERTY_CATALOG = [
    {
        id: 'boarding_room',
        name: 'Kamar Kos Sederhana',
        category: 'Sewa',
        icon: 'fa-bed',
        price: 1200,
        type: 'rent', // 'rent' atau 'buy'
        vitalityBonus: 10, // Menambah max vitality
        description: 'Kamar kos murah untuk pemula. Cukup untuk tidur dan memulihkan stamina harian.'
    },
    {
        id: 'small_apartment',
        name: 'Apartemen Studio',
        category: 'Sewa',
        icon: 'fa-building',
        price: 4500,
        type: 'rent',
        vitalityBonus: 25,
        description: 'Apartemen minimalis di pusat kota dengan fasilitas memadai.'
    },
    {
        id: 'suburban_house',
        name: 'Rumah Pinggir Kota',
        category: 'Beli',
        icon: 'fa-house',
        price: 35000,
        type: 'buy',
        vitalityBonus: 45,
        requiredLicense: 'KTP_DIGITAL',
        description: 'Rumah pribadi dengan halaman kecil. Bebas biaya sewa bulanan.'
    },
    {
        id: 'luxury_apartment',
        name: 'Apartemen Luxury CBD',
        category: 'Beli',
        icon: 'fa-building-user',
        price: 120000,
        type: 'buy',
        vitalityBonus: 70,
        requiredLicense: 'KTP_DIGITAL',
        description: 'Hunian mewah di kawasan bisnis dengan pemandangan kota.'
    },
    {
        id: 'hillside_villa',
        name: 'Vila Perbukitan',
        category: 'Beli',
        icon: 'fa-house-chimney-window',
        price: 450000,
        type: 'buy',
        vitalityBonus: 100,
        requiredLicense: 'KTP_DIGITAL',
        description: 'Vila megah di perbukitan dengan kolam renang pribadi.'
    },
    {
        id: 'penthouse_suite',
        name: 'Penthouse Eksekutif',
        category: 'Beli',
        icon: 'fa-city',
        price: 1500000,
        type: 'buy',
        vitalityBonus: 150,
        requiredLicense: 'LICENSE_EXECUTIVE',
        description: 'Hunian puncak tertinggi di Crestville khusus kelas eksekutif.'
    }
];

// State Properti Pemain
if (typeof window.playerProperties === 'undefined') {
    window.playerProperties = {
        activeResidence: 'boarding_room', // ID tempat tinggal aktif
        ownedProperties: ['boarding_room'] // ID semua properti yang dimiliki
    };
}

/**
 * Menghitung Total Maksimum Vitality Pemain berdasarkan Properti Aktif
 * @returns {number}
 */
function getMaxVitality() {
    const baseVitality = 100;
    const activeProp = PROPERTY_CATALOG.find(p => p.id === window.playerProperties.activeResidence);
    const bonus = activeProp ? activeProp.vitalityBonus : 0;
    return baseVitality + bonus;
}

/**
 * Membeli atau Menyewa Properti
 * @param {string} propertyId 
 */
function buyProperty(propertyId) {
    const prop = PROPERTY_CATALOG.find(p => p.id === propertyId);
    if (!prop) return;

    // 1. Cek Ketersediaan KTP / Lisensi
    if (prop.requiredLicense && typeof hasRequiredLicense === 'function') {
        if (!hasRequiredLicense(prop.requiredLicense)) {
            if (typeof Toast !== 'undefined') {
                Toast.warning(`📜 Syarat Kurang! Wajib memiliki ${prop.requiredLicense} untuk membeli ini.`);
            }
            return;
        }
    }

    // 2. Cek apakah sudah dimiliki
    if (window.playerProperties.ownedProperties.includes(propertyId)) {
        // Jika sudah dimiliki, jadikan sebagai tempat tinggal aktif
        setActiveResidence(propertyId);
        return;
    }

    // 3. Cek Saldo Crest
    if (window.playerCrest < prop.price) {
        if (typeof Toast !== 'undefined') {
            Toast.error(`Crest tidak cukup! Butuh ${prop.price.toLocaleString()} Crest.`);
        }
        return;
    }

    // 4. Potong Crest & Tambah Properti
    window.playerCrest -= prop.price;
    window.playerProperties.ownedProperties.push(propertyId);
    window.playerProperties.activeResidence = propertyId;

    if (typeof Toast !== 'undefined') {
        Toast.success(`🏡 Berhasil mendapatkan ${prop.name}! Max Vitality bertambah +${prop.vitalityBonus}.`);
    }

    refreshPropertyUI();
}

/**
 * Mengatur tempat tinggal utama/aktif
 * @param {string} propertyId 
 */
function setActiveResidence(propertyId) {
    if (!window.playerProperties.ownedProperties.includes(propertyId)) return;

    window.playerProperties.activeResidence = propertyId;
    
    if (typeof Toast !== 'undefined') {
        const prop = PROPERTY_CATALOG.find(p => p.id === propertyId);
        Toast.info(`🏠 Tempat tinggal aktif diubah ke ${prop ? prop.name : 'Properti'}.`);
    }

    refreshPropertyUI();
}

/**
 * Istirahat di tempat tinggal untuk memulihkan Vitality penuh
 */
function restAtHome() {
    const maxVit = getMaxVitality();
    
    if (window.playerVitality >= maxVit) {
        if (typeof Toast !== 'undefined') Toast.info('Vitality kamu sudah dalam kondisi maksimal!');
        return;
    }

    window.playerVitality = maxVit;

    if (typeof Toast !== 'undefined') {
        Toast.success(`🛌 Beristirahat di rumah... Vitality pulih sepenuhnya (${maxVit}/${maxVit})!`);
    }

    refreshPropertyUI();
}

/**
 * Refresh UI Global & Modul Properti
 */
function refreshPropertyUI() {
    if (typeof updateUI === 'function') updateUI();
    renderPropertyUI();
}

/**
 * Render Tampilan Properti ke DOM
 */
function renderPropertyUI() {
    const container = document.getElementById('property-tab-container');
    if (!container) return;

    const props = window.playerProperties;
    const maxVit = getMaxVitality();
    const activeProp = PROPERTY_CATALOG.find(p => p.id === props.activeResidence);

    let listHtml = '';
    PROPERTY_CATALOG.forEach(item => {
        const isOwned = props.ownedProperties.includes(item.id);
        const isActive = props.activeResidence === item.id;

        listHtml += `
            <div class="p-4 bg-slate-900/80 rounded-2xl border ${isActive ? 'border-amber-500 bg-amber-950/10' : isOwned ? 'border-emerald-500/30' : 'border-slate-800'} flex flex-col justify-between gap-3">
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${isActive ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : isOwned ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400'} border flex items-center justify-center shrink-0">
                            <i class="fa-solid ${item.icon} text-lg"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-100 text-sm">${item.name}</h4>
                            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">${item.category}</span>
                        </div>
                    </div>
                    ${isActive ? `
                        <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">Ditempati</span>
                    ` : isOwned ? `
                        <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">Dimiliki</span>
                    ` : ''}
                </div>

                <p class="text-xs text-slate-400 leading-relaxed">${item.description}</p>

                <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div class="flex flex-col">
                        <span class="text-[10px] text-slate-500 uppercase font-mono">Bonus Vitality</span>
                        <span class="text-xs font-mono font-bold text-amber-400">+${item.vitalityBonus} Max Vit</span>
                    </div>

                    ${!isOwned ? `
                        <button onclick="buyProperty('${item.id}')" class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-lg shadow-sky-600/20">
                            ${item.type === 'rent' ? 'Sewa' : 'Beli'} (${item.price.toLocaleString()} C)
                        </button>
                    ` : !isActive ? `
                        <button onclick="setActiveResidence('${item.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all">
                            Pindah Kemari
                        </button>
                    ` : `
                        <button disabled class="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs cursor-default border border-amber-500/30">
                            Hunian Aktif
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="space-y-6">
            <!-- Header Ringkasan Hunian -->
            <div class="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 rounded-2xl border border-amber-500/30 space-y-4">
                <div class="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div class="flex items-center gap-3">
                        <i class="fa-solid fa-house-user text-amber-400 text-xl"></i>
                        <div>
                            <h3 class="font-bold text-slate-100 text-sm">Tempat Tinggal Aktif</h3>
                            <p class="text-xs text-slate-400">${activeProp ? activeProp.name : 'Kos'}</p>
                        </div>
                    </div>
                    <button onclick="restAtHome()" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2">
                        <i class="fa-solid fa-bed"></i> Istirahat (Pulihkan Vit)
                    </button>
                </div>

                <div class="grid grid-cols-2 gap-3 text-xs">
                    <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span class="text-[10px] text-slate-500 uppercase font-mono block">Max Vitality Saat Ini</span>
                        <span class="text-sm font-bold font-mono text-amber-400">${maxVit} Vit</span>
                    </div>
                    <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span class="text-[10px] text-slate-500 uppercase font-mono block">Properti Dimiliki</span>
                        <span class="text-sm font-bold font-mono text-emerald-400">${props.ownedProperties.length} Unit</span>
                    </div>
                </div>
            </div>

            <!-- Katalog Properti -->
            <div>
                <h3 class="text-base font-bold text-slate-100 mb-3">🏡 Pasar Real Estate & Properti</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${listHtml}
                </div>
            </div>
        </div>
    `;
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    renderPropertyUI();
});
