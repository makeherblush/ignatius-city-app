// ==========================================
// MODUL EKONOMI, TOKO & INVENTARIS (ECONOMY.JS)
// ==========================================

const EconomyModule = {
    // --- FITUR BELI BARANG DI MAPS / TOKO ---
    buyItem(itemId, currentLocId = null) {
        const item = (window.ITEMS_DATABASE || []).find(i => i.id === itemId);
        if (!item) {
            if (typeof showToast === 'function') showToast('Barang tidak ditemukan!', 'error');
            return;
        }

        if (!window.gameState) window.gameState = {};
        if (!window.gameState.economy) window.gameState.economy = {};
        if (!window.gameState.economy.inventory) window.gameState.economy.inventory = [];

        if ((window.gameState.crest || 0) < item.price) {
            if (typeof showToast === 'function') showToast(`Saldo Crest kurang! Butuh ${item.price.toLocaleString()} C`, 'error');
            return;
        }

        // Potong Saldo & Masukkan Barang ke Tas Inventaris
        window.gameState.crest -= item.price;
        window.gameState.economy.inventory.push({
            instanceId: Date.now() + Math.random(),
            id: item.id,
            name: item.name,
            type: item.type || 'food',
            vitRestore: item.vitRestore || 20,
            boughtAt: new Date().toLocaleDateString('id-ID')
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil membeli ${item.name}! Masuk ke Tas Inventaris.`, 'success');

        // Re-render tampilan lokasi jika pembeli berada di peta
        if (currentLocId && window.MapModule && typeof window.MapModule.openLocationDetail === 'function') {
            window.MapModule.openLocationDetail(currentLocId);
        }
    },

    // --- FITUR PAKAI / MAKAN BARANG DARI TAS ---
    useItem(instanceId) {
    if (!window.gameState?.economy?.inventory) return;

    const inv = window.gameState.economy.inventory;
    const itemIndex = inv.findIndex(i => i.instanceId === instanceId || i.id === instanceId);

    if (itemIndex === -1) {
        if (typeof showToast === 'function') showToast('Barang tidak ditemukan di Tas!', 'error');
        return;
    }

    const item = inv[itemIndex];
    const isConsumable = item.type === 'food' || item.type === 'drink' || item.isConsumable === true;

    if (isConsumable) {
        // MAKANAN / MINUMAN: Habis dimakan & Menambah Vitality
        const vitGain = item.vitRestore || 20;
        window.gameState.vitality = Math.min(100, (window.gameState.vitality || 0) + vitGain);
        inv.splice(itemIndex, 1); // Hapus dari tas

        if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
        if (typeof showToast === 'function') showToast(`Mengonsumsi ${item.name} (+${vitGain}% Vitality)`, 'success');
    } else {
        // KENDARAAN / ASET / BARANG: Tidak hilang! Hanya ganti status
        item.isEquipped = !item.isEquipped;
        if (typeof showToast === 'function') showToast(`${item.name} ${item.isEquipped ? 'sekarang digunakan / dikendarai' : 'disimpan di bagasi'}`, 'info');
    }

    if (typeof window.saveState === 'function') window.saveState();
    if (typeof openApp === 'function') openApp('inventory');
}
    
    // --- RENDER APLIKASI TAS & ASET KEPEMILIKAN ---
    renderInventoryAppUI() {
        const inv = window.gameState?.economy?.inventory || [];
        const licenses = window.gameState?.user?.legal?.licenses || [];
        const identity = window.gameState?.user?.identity || {};

        // Render Item Makanan & Barang di Tas
        let invHtml = '';
        if (inv.length === 0) {
            invHtml = `<p class="text-[10px] text-slate-500 text-center py-6">Tas kamu masih kosong. Beli makanan / barang di Peta Kota!</p>`;
        } else {
            inv.forEach((item) => {
                invHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between border border-white/10">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base shrink-0">
                                <i class="fa-solid fa-utensils"></i>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-white">${item.name}</h5>
                                <span class="text-[9px] text-emerald-400 font-semibold">+${item.vitRestore || 20}% Vitality</span>
                            </div>
                        </div>
                        <button onclick="EconomyModule.useItem(${item.instanceId})" class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md">
                            Gunakan / Makan
                        </button>
                    </div>
                `;
            });
        }

        // Render Lisensi & Surat Kepemilikan
        let licHtml = '';
        if (licenses.length === 0) {
            licHtml = `<p class="text-[10px] text-slate-500 py-2">Belum ada dokumen kepemilikan.</p>`;
        } else {
            licenses.forEach(licId => {
                licHtml += `
                    <div class="p-2 glass-card rounded-xl flex items-center justify-between text-xs">
                        <span class="font-bold text-sky-300 text-[11px]"><i class="fa-solid fa-certificate mr-1.5 text-amber-400"></i>${licId}</span>
                        <span class="text-[9px] text-emerald-400 font-bold">Sah & Aktif</span>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-amber-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-amber-950/60">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-box-archive text-amber-400 text-base"></i>
                            <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider">TAS & ASET WARGA</h4>
                        </div>
                        <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[8px] font-bold rounded">INVENTARIS</span>
                    </div>
                    <p class="text-[10px] text-slate-300">Daftar item konsumsi, persediaan obat, kendaraan, & lisensi kepemilikan.</p>
                </div>

                <!-- TAB ITEM INVENTARIS -->
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">🎒 Makanan, Minuman & Barang Tas (${inv.length})</h4>
                    <div class="space-y-2 max-h-60 overflow-y-auto">
                        ${invHtml}
                    </div>
                </div>

                <!-- TAB KEPEMILIKAN DOKUMEN & KENDARAAN -->
                <div class="space-y-2 pt-2 border-t border-white/10">
                    <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">📜 Surat Kepemilikan & Lisensi</h4>
                    <div class="space-y-1.5">
                        ${licHtml}
                    </div>
                </div>
            </div>
        `;
    }
};

window.EconomyModule = EconomyModule;
