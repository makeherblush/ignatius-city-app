// ==========================================
// APLIKASI SHOPPING & KELOLA TOKO (SHOP.JS)
// ==========================================

const ShopModule = {
    initShopData() {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.shopData) {
            window.gameState.shopData = {
                myStore: null, // Stores user merchant data
                publicStores: [
                    {
                        storeId: 'store_official_1',
                        ownerNik: 'TG-8853198899',
                        storeName: 'Igna Auto Motors',
                        category: 'Otomotif & Kendaraan',
                        income: 150000,
                        items: [
                            { id: 'item_car_1', name: 'Mobil Sport GT', price: 45000, type: 'vehicle', desc: 'Kendaraan mewah 4 roda' },
                            { id: 'item_bike_1', name: 'Motor Matic 150cc', price: 12000, type: 'vehicle', desc: 'Motor praktis keliling kota' }
                        ]
                    }
                ]
            };
        }
    },

    registerStorePrompt() {
        this.initShopData();
        const storeName = prompt("Masukkan Nama Toko Kamu:");
        if (!storeName) return;

        const category = prompt("Pilih Kategori (Kuliner / Otomotif / Elektronik / General):") || "General";

        window.gameState.shopData.myStore = {
            storeId: 'store_' + Date.now(),
            ownerNik: window.gameState?.user?.identity?.nik || 'TG-USER',
            storeName: storeName,
            category: category,
            income: 0,
            items: []
        };

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Toko "${storeName}" resmi terdaftar!`, 'success');
        openApp('shop');
    },

    addStoreItemPrompt() {
        this.initShopData();
        const myStore = window.gameState.shopData.myStore;
        if (!myStore) return;

        const itemName = prompt("Nama Barang Jualan:");
        if (!itemName) return;

        const priceStr = prompt("Harga Jual (Crest):");
        const price = parseInt(priceStr);
        if (isNaN(price) || price <= 0) {
            if (typeof showToast === 'function') showToast('Harga tidak valid!', 'error');
            return;
        }

        const isFood = confirm("Apakah ini Makanan/Minuman yang bisa dimakan? (OK = Ya, Cancel = Barang/Aset)");

        myStore.items.push({
            id: 'item_custom_' + Date.now(),
            name: itemName,
            price: price,
            type: isFood ? 'food' : 'asset',
            vitRestore: isFood ? 25 : 0,
            desc: isFood ? 'Makanan pemulih vitality' : 'Barang inventaris'
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Barang ${itemName} berhasil dipajang di toko!`, 'success');
        openApp('shop');
    },

    deleteStoreItem(idx) {
        this.initShopData();
        const myStore = window.gameState.shopData.myStore;
        if (!myStore || !myStore.items[idx]) return;

        const deletedName = myStore.items[idx].name;
        myStore.items.splice(idx, 1);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Barang ${deletedName} dihapus dari toko.`, 'info');
        openApp('shop');
    },

    buyFromStore(storeIndex, itemIndex) {
        this.initShopData();
        const store = window.gameState.shopData.publicStores[storeIndex];
        if (!store) return;

        const item = store.items[itemIndex];
        if (!item) return;

        if ((window.gameState.crest || 0) < item.price) {
            if (typeof showToast === 'function') showToast('Saldo Crest tidak cukup!', 'error');
            return;
        }

        // Potong Uang Pembeli
        window.gameState.crest -= item.price;
        store.income += item.price;

        // Masukkan ke Tas Pembeli
        if (!window.gameState.economy) window.gameState.economy = {};
        if (!window.gameState.economy.inventory) window.gameState.economy.inventory = [];

        window.gameState.economy.inventory.push({
            instanceId: Date.now() + Math.random(),
            id: item.id,
            name: item.name,
            type: item.type,
            vitRestore: item.vitRestore || 20,
            isEquipped: false
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil membeli ${item.name}! Masuk ke Tas Aset.`, 'success');
        openApp('shop');
    },

    renderShopAppUI() {
        this.initShopData();
        const myStore = window.gameState.shopData.myStore;
        const stores = window.gameState.shopData.publicStores || [];

        // 1. TAMPILAN DASHBOARD PENJUAL (JIKA SUDAH PUNYA TOKO)
        let merchantHtml = '';
        if (myStore) {
            let myItemsHtml = '';
            if (myStore.items.length === 0) {
                myItemsHtml = `<p class="text-[10px] text-slate-500 py-2">Belum ada barang jualan. Klik "+ Tambah Barang".</p>`;
            } else {
                myStore.items.forEach((item, idx) => {
                    myItemsHtml += `
                        <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div>
                                <h5 class="font-bold text-white">${item.name}</h5>
                                <span class="text-[9px] text-amber-400 font-mono">${item.price.toLocaleString()} C</span>
                            </div>
                            <button onclick="ShopModule.deleteStoreItem(${idx})" class="text-[10px] text-rose-400 font-bold hover:underline">Hapus</button>
                        </div>
                    `;
                });
            }

            merchantHtml = `
                <div class="glass-ios p-4 rounded-3xl border border-amber-500/40 space-y-3 bg-gradient-to-br from-slate-900 to-amber-950/60">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider">🏪 ${myStore.storeName}</h4>
                            <span class="text-[9px] text-slate-400">Kategori: ${myStore.category}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[8px] text-slate-400 uppercase font-mono block">Total Income</span>
                            <span class="text-xs font-mono font-bold text-emerald-400">+${myStore.income.toLocaleString()} C</span>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-white/10 space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-bold text-slate-300">Daftar Produk Toko Kamu</span>
                            <button onclick="ShopModule.addStoreItemPrompt()" class="px-2 py-1 bg-amber-500 text-slate-950 font-bold text-[9px] rounded-lg shadow-md">+ Tambah Barang</button>
                        </div>
                        <div class="space-y-1.5 max-h-36 overflow-y-auto">
                            ${myItemsHtml}
                        </div>
                    </div>
                </div>
            `;
        } else {
            merchantHtml = `
                <div class="glass-card p-3 rounded-2xl flex items-center justify-between border border-amber-500/30">
                    <div>
                        <h5 class="text-xs font-bold text-white">Ingin Buka Toko Sendiri?</h5>
                        <p class="text-[10px] text-slate-400">Daftarkan tokomu & raih pendapatan dari warga lain.</p>
                    </div>
                    <button onclick="ShopModule.registerStorePrompt()" class="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shrink-0">
                        Buka Toko
                    </button>
                </div>
            `;
        }

        // 2. TAMPILAN MARKETPLACE PEMBELI
        let storesHtml = '';
        stores.forEach((st, sIdx) => {
            let itemsList = '';
            st.items.forEach((it, iIdx) => {
                itemsList += `
                    <div class="glass-card p-2 rounded-xl flex items-center justify-between text-xs">
                        <div>
                            <h6 class="font-bold text-white text-[11px]">${it.name}</h6>
                            <span class="text-[9px] text-emerald-400 font-mono">${it.price.toLocaleString()} C</span>
                        </div>
                        <button onclick="ShopModule.buyFromStore(${sIdx}, ${iIdx})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded-lg shadow-md">Beli</button>
                    </div>
                `;
            });

            storesHtml += `
                <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-2">
                    <div class="flex items-center justify-between">
                        <h5 class="text-xs font-bold text-sky-300"><i class="fa-solid fa-store mr-1.5 text-amber-400"></i>${st.storeName}</h5>
                        <span class="text-[8px] px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-mono">${st.category}</span>
                    </div>
                    <div class="space-y-1.5">${itemsList}</div>
                </div>
            `;
        });

        return `
            <div class="space-y-4">
                ${merchantHtml}

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">🛍️️ Toko Kota & Marketplace</h4>
                    <div class="space-y-3">${storesHtml}</div>
                </div>
            </div>
        `;
    }
};

window.ShopModule = ShopModule;
