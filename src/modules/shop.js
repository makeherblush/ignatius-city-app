// ==========================================
// APLIKASI SHOPPING & KELOLA TOKO (SHOP.JS) - UPGRADED CITY DATABASE
// ==========================================

const ShopModule = {
    initCityDatabase() {
        if (!window.cityState) window.cityState = {};
        if (!window.cityState.marketplace) {
            window.cityState.marketplace = {
                stores: {},
                products: {},
                orders: {}
            };
        }

        // Inisialisasi Toko Resmi Kota jika database masih kosong
        const stores = window.cityState.marketplace.stores;
        if (Object.keys(stores).length === 0) {
            const defaultStores = [
                {
                    storeId: 'store_official_1',
                    ownerId: 'user_official_auto',
                    storeName: 'Igna Auto Motors',
                    category: 'Otomotif & Kendaraan',
                    status: 'open',
                    income: 150000
                },
                {
                    storeId: 'store_official_2',
                    ownerId: 'user_official_kuliner',
                    storeName: 'Warung Kuliner Nusantara',
                    category: 'Kuliner',
                    status: 'open',
                    income: 45000
                }
            ];

            defaultStores.forEach(st => {
                stores[st.storeId] = st;
            });

            // Inisialisasi Produk Resmi Kota
            const products = window.cityState.marketplace.products;
            const defaultProducts = [
                {
                    productId: 'prod_car_1',
                    storeId: 'store_official_1',
                    sellerId: 'user_official_auto',
                    name: 'Mobil Sport GT',
                    price: 45000,
                    type: 'vehicle',
                    desc: 'Kendaraan mewah 4 roda',
                    status: 'active'
                },
                {
                    productId: 'prod_bike_1',
                    storeId: 'store_official_1',
                    sellerId: 'user_official_auto',
                    name: 'Motor Matic 150cc',
                    price: 12000,
                    type: 'vehicle',
                    desc: 'Motor praktis keliling kota',
                    status: 'active'
                },
                {
                    productId: 'prod_nasgor',
                    storeId: 'store_official_2',
                    sellerId: 'user_official_kuliner',
                    name: 'Nasi Goreng Spesial',
                    price: 1500,
                    type: 'food',
                    vitRestore: 30,
                    desc: 'Pemulih vitality +30%',
                    status: 'active'
                },
                {
                    productId: 'prod_es_teh',
                    storeId: 'store_official_2',
                    sellerId: 'user_official_kuliner',
                    name: 'Es Teh Manis',
                    price: 500,
                    type: 'drink',
                    vitRestore: 15,
                    desc: 'Pemulih vitality +15%',
                    status: 'active'
                }
            ];

            defaultProducts.forEach(prod => {
                products[prod.productId] = prod;
            });
        }
    },

    // Pendaftaran Toko Baru Warga ke CityDatabase
    registerStorePrompt() {
        this.initCityDatabase();
        const userId = window.gameState?.user?.identity?.userId || window.gameState?.user?.identity?.nik || 'user_local';
        const storeName = prompt("Masukkan Nama Toko Kamu:");
        if (!storeName || !storeName.trim()) return;

        const category = prompt("Pilih Kategori (Kuliner / Otomotif / Elektronik / General):") || "General";
        const storeId = 'store_' + Date.now();

        // Simpan ke cityState.marketplace.stores (Shared World)
        window.cityState.marketplace.stores[storeId] = {
            storeId: storeId,
            ownerId: userId,
            storeName: storeName.trim(),
            category: category.trim(),
            status: "open",
            income: 0
        };

        // Simpan referensi toko pribadi di gameState user untuk akses cepat
        if (!window.gameState) window.gameState = {};
        window.gameState.myStoreId = storeId;

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Toko "${storeName}" berhasil didaftarkan ke City Database!`, 'success');
        if (typeof openApp === 'function') openApp('shop');
    },

    // Tambah Produk Jualan di CityDatabase.marketplace.products
    addStoreItemPrompt() {
        this.initCityDatabase();
        const userId = window.gameState?.user?.identity?.userId || window.gameState?.user?.identity?.nik || 'user_local';
        
        // Cari toko milik user ini di cityState
        const myStoreId = window.gameState?.myStoreId || Object.values(window.cityState.marketplace.stores).find(s => s.ownerId === userId)?.storeId;

        if (!myStoreId) {
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
        const productId = 'prod_' + Date.now();

        window.cityState.marketplace.products[productId] = {
            productId: productId,
            storeId: myStoreId,
            sellerId: userId,
            name: itemName.trim(),
            price: price,
            type: isFood ? 'food' : 'asset',
            vitRestore: isFood ? 25 : 0,
            desc: isFood ? 'Makanan pemulih vitality' : 'Barang / Aset toko',
            status: 'active'
        };

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Produk "${itemName}" berhasil dipajang di marketplace kota!`, 'success');
        if (typeof openApp === 'function') openApp('shop');
    },

    // Hapus Produk Jualan berdasarkan productId
    deleteProduct(productId) {
        this.initCityDatabase();
        const product = window.cityState.marketplace.products[productId];
        if (!product) return;

        const deletedName = product.name;
        delete window.cityState.marketplace.products[productId];

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Barang "${deletedName}" dihapus dari toko.`, 'info');
        if (typeof openApp === 'function') openApp('shop');
    },

    // Beli Barang Menggunakan ID Produk & EconomyService Transfer
    buyProduct(productId) {
        this.initCityDatabase();
        const product = window.cityState.marketplace.products[productId];
        if (!product) {
            if (typeof showToast === 'function') showToast('Produk tidak ditemukan!', 'error');
            return;
        }

        const store = window.cityState.marketplace.stores[product.storeId];
        const currentCrest = window.gameState?.crest || 0;

        if (currentCrest < product.price) {
            if (typeof showToast === 'function') showToast(`Saldo Crest kurang! Butuh ${product.price.toLocaleString()} C`, 'error');
            return;
        }

        const buyerId = window.gameState?.user?.identity?.userId || window.gameState?.user?.identity?.nik || 'user_local';
        const orderId = 'order_' + Date.now();

        // 1. Eksekusi transfer via EconomyService (jika ada) atau potong saldo langsung
        if (window.EconomyService && typeof window.EconomyService.transfer === 'function') {
            window.EconomyService.transfer({
                from: buyerId,
                to: product.sellerId,
                amount: product.price,
                reason: 'marketplace_purchase',
                referenceId: orderId
            });
        } else {
            // Fallback manual transfer
            window.gameState.crest -= product.price;
            if (store) {
                store.income = (store.income || 0) + product.price;
            }
        }

        // 2. Buat Catatan Order di CityDatabase
        window.cityState.marketplace.orders[orderId] = {
            orderId,
            buyerId,
            sellerId: product.sellerId,
            storeId: product.storeId,
            productId: product.productId,
            quantity: 1,
            total: product.price,
            status: "paid",
            createdAt: Date.now()
        };

        // 3. Masukkan Barang ke Tas Inventaris Pembeli
        if (!window.gameState.economy) window.gameState.economy = {};
        if (!Array.isArray(window.gameState.economy.inventory)) window.gameState.economy.inventory = [];

        window.gameState.economy.inventory.push({
            instanceId: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            id: product.productId,
            name: product.name,
            type: product.type || 'food',
            vitRestore: product.vitRestore || 20,
            isEquipped: false
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil membeli ${product.name}! Masuk ke Tas Aset.`, 'success');
        if (typeof openApp === 'function') openApp('shop');
    },

    // Render Tampilan Aplikasi IgnaShopee berbasis CityDatabase
    renderShopAppUI() {
        try {
            this.initCityDatabase();

            const userId = window.gameState?.user?.identity?.userId || window.gameState?.user?.identity?.nik || 'user_local';
            const stores = window.cityState.marketplace.stores || {};
            const products = window.cityState.marketplace.products || {};

            let myStoreId = window.gameState?.myStoreId || Object.values(stores).find(s => s.ownerId === userId)?.storeId;
            let myStore = myStoreId ? stores[myStoreId] : null;

            // 1. DASHBOARD TOKO SAYA
            let merchantHtml = '';
            if (myStore) {
                let myProductsHtml = '';
                const myStoreProducts = Object.values(products).filter(p => p.storeId === myStore.storeId);

                if (myStoreProducts.length === 0) {
                    myProductsHtml = `<p class="text-[10px] text-slate-500 py-2">Belum ada barang jualan. Klik "+ Tambah Produk".</p>`;
                } else {
                    myStoreProducts.forEach(prod => {
                        myProductsHtml += `
                            <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs border border-white/5">
                                <div>
                                    <h5 class="font-bold text-white">${prod.name}</h5>
                                    <span class="text-[9px] text-amber-400 font-mono">${prod.price.toLocaleString()} C</span>
                                </div>
                                <button onclick="ShopModule.deleteProduct('${prod.productId}')" class="text-[10px] text-rose-400 font-bold hover:underline">Hapus</button>
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
                                <span class="text-[10px] font-bold text-slate-300">Daftar Produk Toko Kamu (${myStoreProducts.length})</span>
                                <button onclick="ShopModule.addStoreItemPrompt()" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg shadow-md transition-all">+ Tambah Produk</button>
                            </div>
                            <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                ${myProductsHtml}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                merchantHtml = `
                    <div class="glass-card p-3.5 rounded-2xl flex items-center justify-between border border-amber-500/30">
                        <div>
                            <h5 class="text-xs font-bold text-white">Ingin Buka Toko Sendiri?</h5>
                            <p class="text-[10px] text-slate-400">Daftarkan tokomu ke City Database & raih pendapatan.</p>
                        </div>
                        <button onclick="ShopModule.registerStorePrompt()" class="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shrink-0 transition-all">
                            Buka Toko
                        </button>
                    </div>
                `;
            }

            // 2. DAFTAR SEMUA TOKO & PRODUK DARI CITY DATABASE
            let storesHtml = '';
            const storeList = Object.values(stores);

            if (storeList.length === 0) {
                storesHtml = `<p class="text-[10px] text-slate-500 text-center py-6">Belum ada toko terdaftar di kota.</p>`;
            } else {
                storeList.forEach(st => {
                    const storeProducts = Object.values(products).filter(p => p.storeId === st.storeId);
                    let itemsList = '';

                    if (storeProducts.length === 0) {
                        itemsList = `<p class="text-[9px] text-slate-500 py-1">Toko ini belum memiliki barang jualan.</p>`;
                    } else {
                        storeProducts.forEach(it => {
                            itemsList += `
                                <div class="glass-card p-2 rounded-xl flex items-center justify-between text-xs border border-white/5">
                                    <div>
                                        <h6 class="font-bold text-white text-[11px]">${it.name}</h6>
                                        <span class="text-[9px] text-emerald-400 font-mono">${it.price.toLocaleString()} C</span>
                                    </div>
                                    <button onclick="ShopModule.buyProduct('${it.productId}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded-lg shadow-md transition-all">Beli</button>
                                </div>
                            `;
                        });
                    }

                    storesHtml += `
                        <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-2">
                            <div class="flex items-center justify-between border-b border-white/5 pb-1.5">
                                <div>
                                    <h5 class="text-xs font-bold text-sky-300"><i class="fa-solid fa-shop mr-1.5 text-amber-400"></i>${st.storeName}</h5>
                                    <span class="text-[8px] text-slate-400 font-mono">Owner ID: ${st.ownerId || '-'}</span>
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
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">🛍 Marketplace Kota (${storeList.length} Toko)</h4>
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
