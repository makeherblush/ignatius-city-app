// ==========================================
// MODUL EKONOMI, TOKO & INVENTARIS (ECONOMY.JS)
// ==========================================

const EconomyModule = {
    // Beli Barang dari Peta / Toko
    buyItem(itemId, currentLocId = null) {
        const items = window.ITEMS_DATABASE || [];
        const item = items.find(i => i.id === itemId);
        
        if (!item) {
            if (typeof showToast === 'function') showToast('Barang tidak ditemukan!', 'error');
            return;
        }

        if (!window.gameState) window.gameState = {};
        if (!window.gameState.economy) window.gameState.economy = { inventory: [] };
        if (!window.gameState.economy.inventory) window.gameState.economy.inventory = [];

        const currentCrest = window.gameState.crest || 0;
        if (currentCrest < item.price) {
            if (typeof showToast === 'function') showToast(`Saldo Crest kurang! Butuh ${item.price.toLocaleString()} C`, 'error');
            return;
        }

        // Potong Saldo & Masukkan ke Tas
        window.gameState.crest -= item.price;
        window.gameState.economy.inventory.push({
            instanceId: Date.now() + Math.floor(Math.random() * 1000),
            id: item.id,
            name: item.name,
            type: item.type || 'food',
            vitRestore: item.vitRestore || 20,
            isEquipped: false
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil membeli ${item.name}!`, 'success');

        if (currentLocId && window.MapModule && typeof window.MapModule.openLocationDetail === 'function') {
            window.MapModule.openLocationDetail(currentLocId);
        }
    },

    // Gunakan / Makan Item di Tas
    useItem(instanceId) {
        if (!window.gameState?.economy?.inventory) return;

        const inv = window.gameState.economy.inventory;
        const itemIndex = inv.findIndex(i => String(i.instanceId) === String(instanceId) || i.id === instanceId);

        if (itemIndex === -1) {
            if (typeof showToast === 'function') showToast('Barang tidak ditemukan di Tas!', 'error');
            return;
        }

        const item = inv[itemIndex];
        const isConsumable = item.type === 'food' || item.type === 'drink' || item.vitRestore > 0;

        if (isConsumable) {
            // MAKANAN / MINUMAN: Habis dimakan & Menambah Vitality
            const vitGain = item.vitRestore || 20;
            window.gameState.vitality = Math.min(100, (window.gameState.vitality || 0) + vitGain);
            inv.splice(itemIndex, 1);

            if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
            if (typeof showToast === 'function') showToast(`Mengonsumsi ${item.name} (+${vitGain}% Vitality)`, 'success');
        } else {
            // KENDARAAN / ASET: Tidak hilang! Hanya switch status pakai
            item.isEquipped = !item.isEquipped;
            if (typeof showToast === 'function') showToast(`${item.name} ${item.isEquipped ? 'sekarang digunakan' : 'disimpan'}`, 'info');
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof openApp === 'function') openApp('inventory');
    },

    // Render UI Tas & Aset Warga
    renderInventoryAppUI() {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.economy) window.gameState.economy = { inventory: [] };
        if (!window.gameState.economy.inventory) window.gameState.economy.inventory = [];

        const inv = window.gameState.economy.inventory;
        const licenses = window.gameState?.user?.legal?.licenses || [];

        let invHtml = '';
        if (inv.length === 0) {
            invHtml = `<p class="text-[10px] text-slate-500 text-center py-6">Tas kamu kosong. Beli makanan / barang di Peta atau IgnaShopee!</p>`;
        } else {
            inv.forEach((item) => {
                const isFood = item.type === 'food' || item.type === 'drink' || item.vitRestore > 0;
                invHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between border border-white/10">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl ${isFood ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'} flex items-center justify-center text-base shrink-0">
                                <i class="fa-solid ${isFood ? 'fa-utensils' : 'fa-box'}"></i>
                            </div>
                            <div>
                                <h5 class="text-xs font-bold text-white">${item.name}</h5>
                                <span class="text-[9px] ${isFood ? 'text-emerald-400' : 'text-sky-300'} font-semibold">
                                    ${isFood ? `+${item.vitRestore || 20}% Vitality` : (item.isEquipped ? 'Sedang Digunakan' : 'Aset Tersimpan')}
                                </span>
                            </div>
                        </div>
                        <button onclick="EconomyModule.useItem('${item.instanceId}')" class="px-3 py-1.5 ${isFood ? 'bg-emerald-500 text-slate-950' : 'bg-sky-600 text-white'} font-bold text-xs rounded-xl shadow-md">
                            ${isFood ? 'Makan / Minum' : (item.isEquipped ? 'Lepas' : 'Gunakan')}
                        </button>
                    </div>
                `;
            });
        }

        let licHtml = '';
        if (licenses.length === 0) {
            licHtml = `<p class="text-[10px] text-slate-500 py-2">Belum ada dokumen kepemilikan / SIM terbit.</p>`;
        } else {
            licenses.forEach(licId => {
                licHtml += `
                    <div class="p-2 glass-card rounded-xl flex items-center justify-between text-xs">
                        <span class="font-bold text-sky-300 text-[11px]"><i class="fa-solid fa-certificate mr-1.5 text-amber-400"></i>${licId}</span>
                        <span class="text-[9px] text-emerald-400 font-bold">Sah & Resmi</span>
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
                    <p class="text-[10px] text-slate-300">Gunakan makanan untuk memulihkan Vitality atau kelola aset kendaraan.</p>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">🎒 Isi Tas & Barang (${inv.length})</h4>
                    <div class="space-y-2 max-h-60 overflow-y-auto">${invHtml}</div>
                </div>

                <div class="space-y-2 pt-2 border-t border-white/10">
                    <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">📜 Lisensi & Dokumen Kepemilikan</h4>
                    <div class="space-y-1.5">${licHtml}</div>
                </div>
            </div>
        `;
    }
};

window.EconomyModule = EconomyModule;
