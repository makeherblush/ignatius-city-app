// ==========================================
// MODUL EKONOMI & BISNIS PASIF (ECONOMY.JS)
// ==========================================

// Daftar katalog bisnis yang bisa dibeli pemain
const BUSINESS_CATALOG = [
    {
        id: 'coffee_shop',
        name: 'Kedai Kopi Karsa',
        icon: 'fa-mug-hot',
        baseCost: 5000,
        baseIncomePerSec: 25, // 25 Crest / detik
        upgradeCostMultiplier: 1.6, // Biaya upgrade naik 60% per level
        incomeMultiplier: 1.35,      // Pendapatan naik 35% per level
        requiredLicense: null
    },
    {
        id: 'laundromat',
        name: 'Lestari Laundromat',
        icon: 'fa-shirt',
        baseCost: 20000,
        baseIncomePerSec: 110,
        upgradeCostMultiplier: 1.65,
        incomeMultiplier: 1.35,
        requiredLicense: 'BUSINESS_UMKM'
    },
    {
        id: 'minimarket',
        name: 'CrestMart 24 Jam',
        icon: 'fa-store',
        baseCost: 75000,
        baseIncomePerSec: 450,
        upgradeCostMultiplier: 1.7,
        incomeMultiplier: 1.4,
        requiredLicense: 'BUSINESS_UMKM'
    },
    {
        id: 'restaurant',
        name: 'Restoran Nusantara',
        icon: 'fa-utensils',
        baseCost: 250000,
        baseIncomePerSec: 1600,
        upgradeCostMultiplier: 1.75,
        incomeMultiplier: 1.4,
        requiredLicense: 'BUSINESS_CORP'
    },
    {
        id: 'tech_startup',
        name: 'CrestTech Digital',
        icon: 'fa-laptop-code',
        baseCost: 1000000,
        baseIncomePerSec: 7200,
        upgradeCostMultiplier: 1.8,
        incomeMultiplier: 1.45,
        requiredLicense: 'BUSINESS_CORP'
    }
];

// Inisialisasi array bisnis yang dimiliki pemain di window scope jika belum ada
if (typeof window.playerBusinesses === 'undefined') {
    window.playerBusinesses = [];
}

/**
 * Membeli tempat usaha baru dari katalog
 * @param {string} businessTypeId - ID dari catalog bisnis
 */
function buyBusiness(businessTypeId) {
    const catalogItem = BUSINESS_CATALOG.find(b => b.id === businessTypeId);
    if (!catalogItem) return;

    // Cek apakah sudah memiliki bisnis tipe ini
    const existing = window.playerBusinesses.find(b => b.typeId === businessTypeId);
    if (existing) {
        if (typeof Toast !== 'undefined') Toast.warning('Kamu sudah memiliki bisnis ini! Gunakan fitur Upgrade.');
        return;
    }

    // Cek saldo Crest
    if (window.playerCrest < catalogItem.baseCost) {
        if (typeof Toast !== 'undefined') Toast.error(`Crest tidak cukup! Butuh ${catalogItem.baseCost.toLocaleString()} Crest.`);
        return;
    }

    // Potong saldo & tambahkan bisnis ke akun pemain
    window.playerCrest -= catalogItem.baseCost;
    window.playerBusinesses.push({
        id: `biz_${Date.now()}`,
        typeId: catalogItem.id,
        level: 1,
        uncollectedIncome: 0,
        purchasedAt: new Date().toISOString()
    });

    if (typeof Toast !== 'undefined') {
        Toast.success(`🎉 Berhasil membeli ${catalogItem.name}! Business Pasif aktif.`);
    }

    refreshEconomyUI();
}

/**
 * Meningkatkan level tempat usaha (Upgrade Level)
 * @param {string} instanceId - ID unik bisnis milik pemain
 */
function upgradeBusiness(instanceId) {
    const biz = window.playerBusinesses.find(b => b.id === instanceId);
    if (!biz) return;

    const catalog = BUSINESS_CATALOG.find(c => c.id === biz.typeId);
    if (!catalog) return;

    const upgradeCost = calculateUpgradeCost(catalog.baseCost, biz.level, catalog.upgradeCostMultiplier);

    if (window.playerCrest < upgradeCost) {
        if (typeof Toast !== 'undefined') {
            Toast.error(`Gagal upgrade! Butuh ${Math.floor(upgradeCost).toLocaleString()} Crest.`);
        }
        return;
    }

    window.playerCrest -= upgradeCost;
    biz.level += 1;

    if (typeof Toast !== 'undefined') {
        Toast.success(`⬆️ ${catalog.name} berhasil naik ke Level ${biz.level}!`);
    }

    refreshEconomyUI();
}

/**
 * Klaim pendapatan pasif yang tertampung di 1 bisnis tertentu
 * @param {string} instanceId
 */
function collectBusinessIncome(instanceId) {
    const biz = window.playerBusinesses.find(b => b.id === instanceId);
    if (!biz || biz.uncollectedIncome <= 0) {
        if (typeof Toast !== 'undefined') Toast.info('Belum ada hasil bisnis yang bisa ditarik.');
        return;
    }

    const amount = Math.floor(biz.uncollectedIncome);
    window.playerCrest += amount;
    biz.uncollectedIncome = 0;

    if (typeof Toast !== 'undefined') {
        Toast.success(`💵 Berhasil menarik +${amount.toLocaleString()} Crest!`);
    }

    refreshEconomyUI();
}

/**
 * Klaim seluruh pendapatan dari semua bisnis sekaligus (Tombol 'Klaim Semua')
 */
function collectAllBusinessIncome() {
    let totalCollected = 0;

    window.playerBusinesses.forEach(biz => {
        if (biz.uncollectedIncome > 0) {
            totalCollected += Math.floor(biz.uncollectedIncome);
            biz.uncollectedIncome = 0;
        }
    });

    if (totalCollected <= 0) {
        if (typeof Toast !== 'undefined') Toast.info('Tidak ada hasil bisnis yang bisa ditarik.');
        return;
    }

    window.playerCrest += totalCollected;

    if (typeof Toast !== 'undefined') {
        Toast.success(`💰 Berhasil klaim total +${totalCollected.toLocaleString()} Crest dari seluruh bisnis!`);
    }

    refreshEconomyUI();
}

/**
 * Rumus menghitung biaya upgrade berdasarkan level saat ini
 */
function calculateUpgradeCost(baseCost, currentLevel, multiplier) {
    return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
}

/**
 * Rumus menghitung pendapatan per detik berdasarkan level saat ini
 */
function calculateIncomePerSec(baseIncome, currentLevel, multiplier) {
    return Math.floor(baseIncome * Math.pow(multiplier, currentLevel - 1));
}

/**
 * Ticker Utama Ekonomi: Dijalankan setiap 1 detik (1000ms) oleh game loop
 */
function tickEconomy() {
    if (!window.playerBusinesses || window.playerBusinesses.length === 0) return;

    window.playerBusinesses.forEach(biz => {
        const catalog = BUSINESS_CATALOG.find(c => c.id === biz.typeId);
        if (catalog) {
            const incomePerSec = calculateIncomePerSec(catalog.baseIncomePerSec, biz.level, catalog.incomeMultiplier);
            biz.uncollectedIncome += incomePerSec;
        }
    });

    // Update tampilan jika UI bisnis sedang aktif
    renderBusinessesUI();
}

/**
 * Helper untuk menyegarkan UI global dan komponen bisnis
 */
function refreshEconomyUI() {
    if (typeof updateUI === 'function') updateUI();
    renderBusinessesUI();
}

/**
 * Render elemen UI Bisnis ke DOM
 */
function renderBusinessesUI() {
    const container = document.getElementById('businesses-list-container');
    if (!container) return;

    let html = '';

    BUSINESS_CATALOG.forEach(catalog => {
        const owned = window.playerBusinesses.find(b => b.typeId === catalog.id);

        if (owned) {
            // Tampilan Bisnis yang SUDAH dimiliki
            const currentIncome = calculateIncomePerSec(catalog.baseIncomePerSec, owned.level, catalog.incomeMultiplier);
            const nextUpgradeCost = calculateUpgradeCost(catalog.baseCost, owned.level, catalog.upgradeCostMultiplier);
            const uncollected = Math.floor(owned.uncollectedIncome);

            html += `
                <div class="p-4 bg-slate-900/80 rounded-2xl border border-emerald-500/30 flex flex-col justify-between gap-3 relative overflow-hidden">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <i class="fa-solid ${catalog.icon} text-lg"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-100 text-sm">${catalog.name}</h4>
                                <span class="text-[11px] font-mono text-emerald-400">Lvl ${owned.level} • +${currentIncome.toLocaleString()}/detik</span>
                            </div>
                        </div>
                        <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">Aktif</span>
                    </div>

                    <div class="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] text-slate-400 uppercase font-medium">Kas Belum Ditarik</p>
                            <p class="text-sm font-bold font-mono text-amber-400">+${uncollected.toLocaleString()} Crest</p>
                        </div>
                        <button onclick="collectBusinessIncome('${owned.id}')" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20">
                            Tarik Kas
                        </button>
                    </div>

                    <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                        <span class="text-[11px] text-slate-400">Upgrade Lvl ${owned.level + 1}: <b class="text-slate-200">${nextUpgradeCost.toLocaleString()}</b></span>
                        <button onclick="upgradeBusiness('${owned.id}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all">
                            <i class="fa-solid fa-arrow-up text-xs text-sky-400"></i> Upgrade
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Tampilan Bisnis yang BELUM dimiliki (Katalog Beli)
            html += `
                <div class="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3 opacity-90 hover:opacity-100 transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            <i class="fa-solid ${catalog.icon} text-lg"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-200 text-sm">${catalog.name}</h4>
                            <span class="text-[11px] text-slate-400">+${catalog.baseIncomePerSec.toLocaleString()} Crest/detik</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span class="text-xs font-mono font-bold text-amber-400">${catalog.baseCost.toLocaleString()} Crest</span>
                        <button onclick="buyBusiness('${catalog.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20">
                            Beli Usaha
                        </button>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

// Inisialisasi Ticker Otomatis Setiap 1 Detik
document.addEventListener('DOMContentLoaded', () => {
    setInterval(tickEconomy, 1000);
    renderBusinessesUI();
});
