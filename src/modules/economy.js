// ==========================================
// MODUL EKONOMI, TOKO & INVENTARIS (ECONOMY.JS)
// ==========================================

const EconomyModule = {
    // Memastikan state economy & inventory selalu siap tanpa crash
    ensureState() {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.economy) window.gameState.economy = {};
        if (!Array.isArray(window.gameState.economy.inventory)) {
            window.gameState.economy.inventory = [];
        }
        if (typeof window.gameState.crest !== 'number') {
            window.gameState.crest = 0;
        }
        if (typeof window.gameState.vitality !== 'number') {
            window.gameState.vitality = 100;
        }
    },

    // Beli Barang dari Peta / Toko
    buyItem(itemId, currentLocId = null) {
        this.ensureState();
        const items = window.ITEMS_DATABASE || [];
        const item = items.find(i => String(i.id) === String(itemId));
        
        if (!item) {
            if (typeof showToast === 'function') showToast('Barang tidak ditemukan!', 'error');
            return;
        }

        if (window.gameState.crest < item.price) {
            if (typeof showToast === 'function') showToast(`Saldo Crest kurang! Butuh ${item.price.toLocaleString()} C`, 'error');
            return;
        }

        // Potong Saldo & Masukkan ke Tas
        window.gameState.crest -= item.price;
        
        const uniqueId = 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        
        window.gameState.economy.inventory.push({
            instanceId: uniqueId,
            id: item.id,
            name: item.name || 'Barang',
            type: item.type || 'food',
            vitRestore: Number(item.vitRestore) || 0,
            desc: item.desc || '',
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
        this.ensureState();
        const inv = window.gameState.economy.inventory;
        const itemIndex = inv.findIndex(i => String(i.instanceId) === String(instanceId) || String(i.id) === String(instanceId));

        if (itemIndex === -1) {
            if (typeof showToast === 'function') showToast('Barang tidak ditemukan di Tas!', 'error');
            return;
        }

        const item = inv[itemIndex];
        const isFoodOrDrink = item.type === 'food' || item.type === 'drink' || (Number(item.vitRestore) > 0);

        if (isFoodOrDrink) {
            // MAKANAN / MINUMAN: Habis dimakan & Menambah Vitality (Maksimal 100)
            const vitGain = Number(item.vitRestore) || 20;
            window.gameState.vitality = Math.min(100, window.gameState.vitality + vitGain);
            
            // Hapus 1 unit dari tas
            inv.splice(itemIndex, 1);

            if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
            if (typeof showToast === 'function') showToast(`Mengonsumsi ${item.name} (+${vitGain}% Vitality)`, 'success');
        } else {
            // KENDARAAN / ASET / SENJATA: TIDAK HILANG! Cuma ganti status Pakai/Simpan
            item.isEquipped = !item.isEquipped;
            if (typeof showToast === 'function') {
                showToast(`${item.name} ${item.isEquipped ? 'sekarang digunakan / dikendarai' : 'disimpan di bagasi'}`, 'info');
            }
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof openApp === 'function') openApp('inventory');
    },

    // Buang Aset dari Tas (opsional)
    removeItem(instanceId) {
        this.ensureState();
        const inv = window.gameState.economy.inventory;
        const itemIndex = inv.findIndex(i => String(i.instanceId) === String(instanceId));

        if (itemIndex !== -1) {
            const name = inv[itemIndex].name;
            inv.splice(itemIndex, 1);
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`${name} dibuang dari tas.`, 'info');
            if (typeof openApp === 'function') openApp('inventory');
        }
    },

    // Render UI Tas & Aset Warga
    renderInventoryAppUI() {
        try {
            this.ensureState();

            const inv = window.gameState.economy.inventory;
            const userLegal = window.gameState?.user?.legal || {};
            const licenses = Array.isArray(userLegal.licenses) ? userLegal.licenses : [];

            // 1. Render Barang & Makanan
            let invHtml = '';
            if (inv.length === 0) {
                invHtml = `<div class="glass-card p-4 rounded-2xl text-center text-slate-400 text-xs">Tas kamu masih kosong. Beli makanan atau aset di Peta / IgnaShopee!</div>`;
            } else {
                inv.forEach((item) => {
                    const isFood = item.type === 'food' || item.type === 'drink' || (Number(item.vitRestore) > 0);
                    const instId = item.instanceId || item.id;
                    const isEquipped = Boolean(item.isEquipped);

                    invHtml += `
                        <div class="glass-card p-3 rounded-2xl flex items-center justify-between border ${isEquipped ? 'border-sky-400/60 bg-sky-950/20' : 'border-white/10'}">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl ${isFood ? 'bg-amber-500/20 text-amber-400' : (isEquipped ? 'bg-sky-500/30 text-sky-300' : 'bg-slate-800 text-slate-300')} flex items-center justify-center text-lg shrink-0">
                                    <i class="fa-solid ${isFood ? 'fa-utensils' : (item.type === 'vehicle' ? 'fa-car' : 'fa-box')}"></i>
                                </div>
                                <div>
                                    <h5 class="text-xs font-bold text-white">${item.name || 'Barang'}</h5>
                                    <p class="text-[9px] ${isFood ? 'text-emerald-400 font-semibold' : 'text-slate-400'}">
                                        ${isFood ? `+${item.vitRestore || 20}% Vitality` : (isEquipped ? '🟢 Sedang Digunakan' : '⚪ Tersimpan di Tas')}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <button onclick="EconomyModule.useItem('${instId}')" class="px-3 py-1.5 ${isFood ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : (isEquipped ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white')} font-bold text-xs rounded-xl shadow-md transition-all">
                                    ${isFood ? 'Makan' : (isEquipped ? 'Lepas' : 'Gunakan')}
                                </button>
                                ${!isFood ? `
                                    <button onclick="EconomyModule.removeItem('${instId}')" class="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs rounded-xl transition-all" title="Buang Barang">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
            }

            // 2. Render Lisensi & Sertifikat Resmi
            let licHtml = '';
            if (licenses.length === 0) {
                licHtml = `<p class="text-[10px] text-slate-500 py-1">Belum ada dokumen kepemilikan / SIM terbit.</p>`;
            } else {
                licenses.forEach(licId => {
                    licHtml += `
                        <div class="p-2.5 glass-card rounded-xl flex items-center justify-between text-xs border border-white/5">
                            <span class="font-bold text-sky-300 text-[11px] flex items-center gap-2">
                                <i class="fa-solid fa-certificate text-amber-400 text-xs"></i>
                                ${licId}
                            </span>
                            <span class="text-[8px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded border border-emerald-500/30">SAH & RESMI</span>
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
                        <p class="text-[10px] text-slate-300">Gunakan makanan untuk pulihkan Vitality. Kendaraan & barang aset tidak akan hilang saat digunakan.</p>
                    </div>

                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">🎒 Isi Tas (${inv.length})</h4>
                        </div>
                        <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                            ${invHtml}
                        </div>
                    </div>

                    <div class="space-y-2 pt-2 border-t border-white/10">
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">📜 Surat Kepemilikan & SIM</h4>
                        <div class="space-y-1.5 max-h-36 overflow-y-auto">
                            ${licHtml}
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('[InventoryUI Error]:', err);
            return `<div class="p-4 text-center text-rose-400 text-xs font-bold">Terjadi kesalahan pada modul Tas: ${err.message}</div>`;
        }
    }
};

window.EconomyModule = EconomyModule;
