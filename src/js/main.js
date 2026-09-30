// ==========================================
// MODUL PENGONTROL UTAMA & NAVIGASI (MAIN.JS)
// ==========================================

/**
 * Sistem Notifikasi Toast Mengambang
 */
const Toast = {
    show(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        let bgClass = 'bg-slate-900 border-slate-700 text-slate-100';
        let icon = 'fa-circle-info text-sky-400';

        if (type === 'success') {
            bgClass = 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10';
            icon = 'fa-circle-check text-emerald-400';
        } else if (type === 'error') {
            bgClass = 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-500/10';
            icon = 'fa-circle-exclamation text-rose-400';
        } else if (type === 'warning') {
            bgClass = 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-500/10';
            icon = 'fa-triangle-exclamation text-amber-400';
        }

        toast.className = `pointer-events-auto px-4 py-3 rounded-xl border ${bgClass} shadow-xl flex items-center gap-3 text-xs font-medium transition-all duration-300 translate-y-2 opacity-0`;
        toast.innerHTML = `
            <i class="fa-solid ${icon} text-base shrink-0"></i>
            <span class="leading-snug">${message}</span>
        `;

        container.appendChild(toast);

        // Animasi Masuk
        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);

        // Animasi Keluar & Hapus
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
};

// Ekspos Toast ke window scope
window.Toast = Toast;

/**
 * Pengendali Navigasi Tab
 * @param {string} tabName - ID tab yang dituju (misal: 'jobs', 'admin', 'citymap', 'property')
 */
function switchTab(tabName) {
    // 1. Sembunyikan semua konten tab
    const tabs = document.querySelectorAll('.game-tab-content');
    tabs.forEach(tab => {
        tab.classList.add('hidden');
    });

    // 2. Nonaktifkan semua tombol navigasi aktif
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('bg-sky-600', 'text-white', 'shadow-lg', 'shadow-sky-600/20');
        btn.classList.add('bg-slate-900', 'text-slate-400', 'hover:bg-slate-800', 'hover:text-slate-200');
    });

    // 3. Tampilkan tab yang dipilih
    const activeTab = document.getElementById(`${tabName}-tab`);
    if (activeTab) {
        activeTab.classList.remove('hidden');
    }

    // 4. Tandai tombol navigasi aktif
    const activeBtn = document.getElementById(`nav-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-slate-900', 'text-slate-400', 'hover:bg-slate-800', 'hover:text-slate-200');
        activeBtn.classList.add('bg-sky-600', 'text-white', 'shadow-lg', 'shadow-sky-600/20');
    }

    // 5. Panggil fungsi render spesifik jika tersedia di modul terkait
    if (tabName === 'jobs' && typeof renderJobsUI === 'function') renderJobsUI();
    if (tabName === 'admin' && typeof renderAdminUI === 'function') renderAdminUI();
    if (tabName === 'citymap' && typeof renderCityMapUI === 'function') renderCityMapUI();
    if (tabName === 'property' && typeof renderPropertyUI === 'function') renderPropertyUI();
}

// Ekspos switchTab ke window scope
window.switchTab = switchTab;

/**
 * Pembaruan Tampilan Header Global (Crest & Vitality)
 */
function updateUI() {
    // Update Saldo Crest
    const crestElements = document.querySelectorAll('.global-crest-display');
    crestElements.forEach(el => {
        if (typeof Formatters !== 'undefined') {
            el.textContent = Formatters.crest(window.playerCrest);
        } else {
            el.textContent = `${(window.playerCrest || 0).toLocaleString()} Crest`;
        }
    });

    // Update Bar Vitality
    const vitalityBars = document.querySelectorAll('.global-vitality-bar');
    const vitalityTexts = document.querySelectorAll('.global-vitality-text');
    const currentVit = window.playerVitality || 0;
    
    // Ambil max vitality dari modul properti jika ada, default 100
    let maxVit = 100;
    if (typeof getMaxVitality === 'function') {
        maxVit = getMaxVitality();
    }

    const percentage = Math.max(0, Math.min(100, (currentVit / maxVit) * 100));

    vitalityBars.forEach(bar => {
        bar.style.width = `${percentage}%`;
    });

    vitalityTexts.forEach(txt => {
        txt.textContent = `${Math.floor(currentVit)} / ${maxVit} Vit`;
    });
}

// Ekspos updateUI ke window scope
window.updateUI = updateUI;

/**
 * Inisialisasi Awal Saat Aplikasi Dimuat
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Crestville] Memuat sistem permainan...');
    
    // Perbarui UI awal
    updateUI();

    // Buka tab default (Jobs atau City Map)
    switchTab('citymap');
});
