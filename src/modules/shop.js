// ==========================================
// APLIKASI SHOPPING & KELOLA TOKO (SHOP.JS)
// ==========================================

const ShopModule = {
    initShopData() {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.shopData) {
            window.gameState.shopData = {
                myStore: null,
                publicStores: []
            };
        }
        if (!Array.isArray(window.gameState.shopData.publicStores)) {
            window.gameState.shopData.publicStores = [];
        }

        // Default Toko Kota Resmi (jika daftar toko publik masih kosong)
        if (window.gameState.shopData.publicStores.length === 0) {
            window.gameState.shopData.publicStores = [
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
                },
                {
                    storeId: 'store_official_2',
                    ownerNik: 'TG-100020',
                    storeName: 'Warung Kuliner Nusantara',
                    category: 'Kuliner',
                    income: 45000,
                    items: [
                        { id: 'item_nasgor', name: 'Nasi Goreng Spesial', price: 1500, type: 'food', vitRestore: 30, desc: 'Pemulih vitality +30%' },
                        { id: 'item_es_teh', name: 'Es Teh Manis', price: 500, type: 'drink', vitRestore: 15, desc: 'Pemulih vitality +15%' }
                    ]
                }
            ];
        }
    },

    // SINKRONISASI TOKO SAYA KE DAFTAR PUBLIC STORES MARKETPLACE
    syncMyStoreToPublic() {
        this.initShopData();
        const myStore = window.gameState.shopData.myStore;
        if (!myStore) return;

        const publicStores = window.gameState.shopData.publicStores;
        const existingIdx = publicStores.findIndex(s => s.storeId === myStore.storeId || s.ownerNik === myStore.ownerNik);

        if (existingIdx !== -1) {
            publicStores[existingIdx] = myStore; // Update data toko di marketplace
        } else {
            publicStores.push(myStore); // Tambahkan toko baru ke marketplace publik
        }
    },

    // Pendaftaran Toko Baru Warga
    registerStorePrompt() {
        this.initShopData();
        const userNik = window.gameState?.user?.identity?.nik || 'TG-USER';
        const storeName = prompt("Masukkan Nama Toko Kamu:");
        if (!storeName || !storeName.trim()) return;

        const category = prompt("Pilih Kategori (Kuliner / Otomotif / Elektronik / General):") || "General";

        const newStore = {
            storeId: 'store_' + Date.now(),
            ownerNik: userNik,
            storeName: storeName.trim(),
            category: category.trim(),
            income: 0,
            items: []
        };

        window.gameState.shopData.myStore = newStore;
        this.syncMyStoreToPublic();

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Toko "${storeName}" berhasil didaftarkan!`, 'success');
        if (typeof openApp === 'function') openApp('shop');
    },

    // Tambah Produk Jualan di Toko Saya
    addStoreItemPrompt() {
        this.initShopData();
        const myStore = window.gameState.shopData.myStore;
        if (!myStore) {
            if (typeof showToast === 'function') showToast('Kamu belum mendaftarkan toko!', 'error');
            return;
        }

        const itemName = prompt("Nama Barang / Produk Jualan:");
        if (!itemName || !itemName.trim()) return;

        const priceStr = prompt("Harga Jual (Crest):");
        const price = parseInt(priceStr);
        if (isNaN(price) || price <= 0) {
            if (typeof showToast === 'function') showToast('Harga tidak valid!', 'error');
            return;
        }

        const isFood = confirm("Apakah ini Makanan/Minuman? (OK = Ya, Cancel = Barang/Kendaraan)");

        myStore.items.push({
            id: 'item_custom_' + Date.now(),
            name: itemName.trim(),
            price: price,
            type: isFood ? 'food' : 'asset',
            vitRestore: isFood ? 25 : 0,
            desc: isFood ? 'Makanan pemulih vitality' : 'Barang / Aset toko'
        });

        this.syncMyStoreToPublic();

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Produk "${itemName}" berhasil dipajang di toko!`, 'success');
        if (typeof openApp === 'function') openApp('shop');
    },

    // Hapus Produk Jualan
    deleteStoreItem(idx) {
        this.initShopData();
        const myStore = window.gameState.shopData.myStore;
        if (!myStore || !myStore.items || !myStore.items[idx]) return;

        const deletedName = myStore.items[idx].name;
        myStore.items.splice(idx, 1);

        this.syncMyStoreToPublic();

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Barang "${deletedName}" dihapus dari toko.`, 'info');
        if (typeof openApp === 'function') openApp('shop');
    },

    // Beli Barang dari Toko Manapun di Marketplace
    buyFromStore(storeIndex, itemIndex) {
        this.initShopData();
        const publicStores = window.gameState.shopData.publicStores;
        const store = publicStores[storeIndex];
        if (!store || !store.items || !store.items[itemIndex]) return;

        const item = store.items[itemIndex];
        const currentCrest = window.gameState?.crest || 0;

        if (currentCrest < item.price) {
            if (typeof showToast === 'function') showToast(`Saldo Crest kurang! Butuh ${item.price.toLocaleString()} C`, 'error');
            return;
        }

        // Potong Saldo Pembeli & Tambah Pendapatan Pemilik Toko
        window.gameState.crest -= item.price;
        store.income = (store.income || 0) + item.price;

        if (window.gameState.shopData.myStore && window.gameState.shopData.myStore.storeId === store.storeId) {
            window.gameState.shopData.myStore.income = store.income;
        }

        // Masukkan Barang ke Tas Inventaris Pembeli
        if (!window.gameState.economy) window.gameState.economy = {};
        if (!Array.isArray(window.gameState.economy.inventory)) window.gameState.economy.inventory = [];

        window.gameState.economy.inventory.push({
            instanceId: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            id: item.id,
            name: item.name,
            type: item.type || 'food',
            vitRestore: item.vitRestore || 20,
            isEquipped: false
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil membeli ${item.name}! Masuk ke Tas Aset.`, 'success');
        if (typeof openApp === 'function') openApp('shop');
    },

    // Render Tampilan Aplikasi IgnaShopee
    renderShopAppUI() {
        try {
            this.initShopData();
            this.syncMyStoreToPublic();

            const myStore = window.gameState.shopData.myStore;
            const stores = window.gameState.shopData.publicStores || [];

            // 1. DASHBOARD TOKO SAYA (PENJUAL)
            let merchantHtml = '';
            if (myStore) {
                let myItemsHtml = '';
                if (!myStore.items || myStore.items.length === 0) {
                    myItemsHtml = `<p class="text-[10px] text-slate-500 py-2">Belum ada barang jualan. Klik "+ Tambah Produk".</p>`;
                } else {
                    myStore.items.forEach((item, idx) => {
                        myItemsHtml += `
                            <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs border border-white/5">
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
                    <div class="glass-ios p-4 rounded-3xl border border-amber-500/40 space-y-3 bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider"><i class="fa-solid fa-store mr-1"></i> ${myStore.storeName}</h4>
                                <span class="text-[9px] text-slate-400">Kategori: ${myStore.category}</span>
                            </div>
                            <div class="text-right">
                                <span class="text-[8px] text-slate-400 uppercase font-mono block">Total Pendapatan</span>
                                <span class="text-xs font-mono font-bold text-emerald-400">+${(myStore.income || 0).toLocaleString()} C</span>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-white/10 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold text-slate-300">Daftar Produk Toko Kamu (${myStore.items ? myStore.items.length : 0})</span>
                                <button onclick="ShopModule.addStoreItemPrompt()" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg shadow-md transition-all">+ Tambah Produk</button>
                            </div>
                            <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                ${myItemsHtml}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                merchantHtml = `
                    <div class="glass-card p-3.5 rounded-2xl flex items-center justify-between border border-amber-500/30">
                        <div>
                            <h5 class="text-xs font-bold text-white">Ingin Buka Toko Sendiri?</h5>
                            <p class="text-[10px] text-slate-400">Daftarkan tokomu & raih pendapatan dari pembeli lain.</p>
                        </div>
                        <button onclick="ShopModule.registerStorePrompt()" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shrink-0 transition-all">
                            Buka Toko
                        </button>
                    </div>
                `;
            }

            // 2. DAFTAR SEMUA TOKO DI MARKETPLACE KOTA
            let storesHtml = '';
            if (stores.length === 0) {
                storesHtml = `<p class="text-[10px] text-slate-500 text-center py-6">Belum ada toko lain terdaftar.</p>`;
            } else {
                stores.forEach((st, sIdx) => {
                    let itemsList = '';
                    if (!st.items || st.items.length === 0) {
                        itemsList = `<p class="text-[9px] text-slate-500 py-1">Toko ini belum memiliki barang jualan.</p>`;
                    } else {
                        st.items.forEach((it, iIdx) => {
                            itemsList += `
                                <div class="glass-card p-2 rounded-xl flex items-center justify-between text-xs border border-white/5">
                                    <div>
                                        <h6 class="font-bold text-white text-[11px]">${it.name}</h6>
                                        <span class="text-[9px] text-emerald-400 font-mono">${it.price.toLocaleString()} C</span>
                                    </div>
                                    <button onclick="ShopModule.buyFromStore(${sIdx}, ${iIdx})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded-lg shadow-md transition-all">Beli</button>
                                </div>
                            `;
                        });
                    }

                    storesHtml += `
                        <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-2">
                            <div class="flex items-center justify-between border-b border-white/5 pb-1.5">
                                <div>
                                    <h5 class="text-xs font-bold text-sky-300"><i class="fa-solid fa-shop mr-1.5 text-amber-400"></i>${st.storeName}</h5>
                                    <span class="text-[8px] text-slate-400 font-mono">Owner NIK: ${st.ownerNik || '-'}</span>
                                </div>
                                <span class="text-[8px] px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-bold uppercase">${st.category || 'General'}</span>
                            </div>
                            <div class="space-y-1.5">${itemsList}</div>
                        </div>
                    `;
                });
            }

            return `
                <div class="space-y-4">
                    ${merchantHtml}

                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">🛍 Marketplace Toko Kota (${stores.length})</h4>
                        <div class="space-y-3 max-h-80 overflow-y-auto pr-1">${storesHtml}</div>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('[ShopUI Error]:', err);
            return `<div class="p-4 text-center text-rose-400 text-xs font-bold">Terjadi kesalahan pada IgnaShopee: ${err.message}</div>`;
        }
    }
};

window.ShopModule = ShopModule;
