// ==========================================
// MODUL EKONOMI V2, TOKO, DOMPET & INVENTARIS (ECONOMY.JS)
// ==========================================

const EconomyModule = {
    // Definisi Taksonomi Kategori Item
    TAXONOMY: {
        FOOD: 'food',
        DRINK: 'drink',
        MEDICINE: 'medicine',
        VEHICLE: 'vehicle',
        ELECTRONICS: 'electronics',
        CLOTHING: 'clothing',
        DOCUMENT: 'document',
        TOOL: 'tool',
        WEAPON: 'weapon'
    },

    // --- 1. ENSURE STATE, MIGRATION & VALIDATION (SAFETY LAYER) ---
    ensureState() {
        if (!window.gameState) window.gameState = {};
        if (typeof window.gameState.crest !== 'number') window.gameState.crest = 0;
        if (typeof window.gameState.vitality !== 'number') window.gameState.vitality = 100;

        if (!window.gameState.economy) window.gameState.economy = {};
        const eco = window.gameState.economy;

        // Versi Schema State Ekonomi
        if (!eco.version) eco.version = 1;

        // A. Wallet & Cash Sync
        if (!eco.wallet) {
            eco.wallet = {
                cash: window.gameState.crest || 0,
                bank: eco.savingsBalance || 0,
                digital: 0
            };
        } else {
            // Selalu jaga sinkronisasi 1:1 antara gameState.crest dan eco.wallet.cash
            eco.wallet.cash = window.gameState.crest;
        }

        // B. Structure Separation
        if (!eco.inventory || typeof eco.inventory !== 'object' || Array.isArray(eco.inventory)) {
            const oldInvArray = Array.isArray(eco.inventory) ? eco.inventory : [];
            eco.inventory = {
                capacity: 30.0, // Maksimal 30 KG
                items: oldInvArray
            };
        }

        if (!Array.isArray(eco.inventory.items)) eco.inventory.items = [];
        if (typeof eco.inventory.capacity !== 'number') eco.inventory.capacity = 30.0;

        if (!Array.isArray(eco.vehicles)) eco.vehicles = [];
        if (!Array.isArray(eco.properties)) eco.properties = [];
        if (!Array.isArray(eco.documents)) eco.documents = [];
        if (!Array.isArray(eco.transactions)) eco.transactions = [];

        // C. JALANKAN MIGRATION SCRIPT JIKA STATE MASIH V1
        if (eco.version < 2) {
            this.migrateStateV1ToV2();
        }
    },

    // Migrasi otomatis state v1 (tumpukan objek terpisah) ke state v2 (stacked & separated assets)
    migrateStateV1ToV2() {
        const eco = window.gameState.economy;
        console.log('[EconomyModule]: Running State Migration V1 -> V2...');

        const rawItems = Array.isArray(eco.inventory.items) ? eco.inventory.items : [];
        const newStackedItems = [];
        const migratedVehicles = [];

        rawItems.forEach(item => {
            const isVehicle = item.type === 'vehicle' || item.category === 'vehicle';
            
            if (isVehicle) {
                // Pindahkan Kendaraan ke Array Vehicles Terpisah
                migratedVehicles.push({
                    instanceId: item.instanceId || 'veh_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    id: item.id || 'veh_default',
                    name: item.name || 'Kendaraan Warga',
                    type: 'vehicle',
                    plate: 'IG-' + Math.floor(1000 + Math.random() * 9000),
                    fuel: 100, // %
                    mileage: Math.floor(Math.random() * 500) + 10, // KM
                    condition: 100, // %
                    garageId: 'garage_central',
                    insurance: true,
                    isEquipped: Boolean(item.isEquipped)
                });
            } else {
                // Stack Item Konsumsi & Barang Biasa
                const existingIndex = newStackedItems.findIndex(i => i.id === item.id);
                if (existingIndex !== -1) {
                    newStackedItems[existingIndex].quantity = (newStackedItems[existingIndex].quantity || 1) + 1;
                } else {
                    newStackedItems.push({
                        instanceId: item.instanceId || 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        id: item.id || 'item_unknown',
                        name: item.name || 'Barang',
                        type: item.type || 'food',
                        category: item.type || 'food',
                        vitRestore: Number(item.vitRestore) || 0,
                        desc: item.desc || '',
                        quantity: 1,
                        unitWeight: item.unitWeight || 0.5,
                        condition: 100,
                        acquiredAt: Date.now()
                    });
                }
            }
        });

        eco.inventory.items = newStackedItems;
        eco.vehicles = [...eco.vehicles, ...migratedVehicles];
        eco.version = 2;

        if (typeof window.saveState === 'function') window.saveState();
        console.log('[EconomyModule]: State Migration V2 Complete!', eco);
    },

    // --- 2. PAYMENT LAYER & TRANSACTIONS ENGINE ---
    pay({ amount, merchant = 'Transaksi Umum', method = 'cash', description = '' }) {
        this.ensureState();
        const eco = window.gameState.economy;
        const totalAmount = Math.abs(amount);

        if (eco.wallet.cash < totalAmount) {
            if (typeof showToast === 'function') {
                showToast(`Pembayaran Gagal! Saldo kurang ${ (totalAmount - eco.wallet.cash).toLocaleString() } C`, 'error');
            }
            return false;
        }

        // Potong Saldo Cash & Sync gameState.crest
        eco.wallet.cash -= totalAmount;
        window.gameState.crest = eco.wallet.cash;

        // Catat Histori Transaksi
        const txId = 'TX-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(1000 + Math.random() * 9000);
        const newTx = {
            id: txId,
            type: 'purchase',
            amount: -totalAmount,
            currency: 'C',
            merchant: merchant,
            description: description || `Pembelian di ${merchant}`,
            timestamp: Date.now()
        };

        eco.transactions.unshift(newTx);
        if (eco.transactions.length > 50) eco.transactions.pop(); // Simpan 50 transaksi terakhir

        if (typeof window.saveState === 'function') window.saveState();
        return newTx;
    },

    // Tambah Pemasukan (Gaji, Hasil Jual, Bonus)
    addIncome({ amount, source = 'Pemasukan', description = '' }) {
        this.ensureState();
        const eco = window.gameState.economy;
        const totalAmount = Math.abs(amount);

        eco.wallet.cash += totalAmount;
        window.gameState.crest = eco.wallet.cash;

        const txId = 'TX-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(1000 + Math.random() * 9000);
        const newTx = {
            id: txId,
            type: 'income',
            amount: totalAmount,
            currency: 'C',
            merchant: source,
            description: description || `Pemasukan dari ${source}`,
            timestamp: Date.now()
        };

        eco.transactions.unshift(newTx);
        if (eco.transactions.length > 50) eco.transactions.pop();

        if (typeof window.saveState === 'function') window.saveState();
        return newTx;
    },

    // --- 3. INVENTORY WEIGHT & CAPACITY SYSTEM ---
    calculateTotalWeight() {
        this.ensureState();
        const items = window.gameState.economy.inventory.items;
        let total = 0;
        items.forEach(item => {
            const weight = Number(item.unitWeight) || 0.5;
            const qty = Number(item.quantity) || 1;
            total += weight * qty;
        });
        return parseFloat(total.toFixed(2));
    },

    // --- 4. PEMBELIAN BARANG (BUY ITEM API) ---
    buyItem(itemId, currentLocId = null) {
        this.ensureState();
        const itemsDb = window.ITEMS_DATABASE || [];
        const itemSpec = itemsDb.find(i => String(i.id) === String(itemId));

        if (!itemSpec) {
            if (typeof showToast === 'function') showToast('Barang tidak ditemukan di katalog!', 'error');
            return;
        }

        const eco = window.gameState.economy;
        const isVehicle = itemSpec.type === 'vehicle' || itemSpec.category === 'vehicle';
        const itemWeight = Number(itemSpec.unitWeight) || (isVehicle ? 0 : 0.5);

        // A. Cek Kapasitas Beban Tas (Kecuali Kendaraan)
        if (!isVehicle) {
            const currentWeight = this.calculateTotalWeight();
            if (currentWeight + itemWeight > eco.inventory.capacity) {
                if (typeof showToast === 'function') {
                    showToast(`Tas Penuh! Beban: ${currentWeight}/${eco.inventory.capacity} KG. Butuh ${itemWeight} KG lagi.`, 'error');
                }
                return;
            }
        }

        // B. Eksekusi Pembayaran
        const paymentResult = this.pay({
            amount: itemSpec.price,
            merchant: 'IgnaShopee / Toko Kota',
            description: `Beli ${itemSpec.name}`
        });

        if (!paymentResult) return; // Pembayaran gagal

        // C. Masukkan ke Inventory atau Garasi Kendaraan
        if (isVehicle) {
            const newVehicle = {
                instanceId: 'veh_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                id: itemSpec.id,
                name: itemSpec.name,
                type: 'vehicle',
                plate: 'IG-' + Math.floor(1000 + Math.random() * 9000),
                fuel: 100,
                mileage: 0,
                condition: 100,
                garageId: 'garage_central',
                insurance: true,
                isEquipped: false
            };
            eco.vehicles.push(newVehicle);

            if (typeof showToast === 'function') showToast(`🎉 ${itemSpec.name} berhasil dibeli & dikirim ke Garasi!`, 'success');
            if (typeof window.showIOSNotification === 'function') {
                window.showIOSNotification('Pembelian Garasi', `${itemSpec.name} (Plat: ${newVehicle.plate}) disimpan di Garasi.`, 'IgnaShopee', 'fa-car');
            }
        } else {
            // Stack Item di Tas
            const existingItem = eco.inventory.items.find(i => i.id === itemSpec.id);
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                eco.inventory.items.push({
                    instanceId: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    id: itemSpec.id,
                    name: itemSpec.name || 'Barang',
                    type: itemSpec.type || 'food',
                    category: itemSpec.type || 'food',
                    vitRestore: Number(itemSpec.vitRestore) || 0,
                    desc: itemSpec.desc || '',
                    quantity: 1,
                    unitWeight: itemWeight,
                    condition: 100,
                    acquiredAt: Date.now()
                });
            }

            if (typeof showToast === 'function') showToast(`Berhasil membeli ${itemSpec.name}!`, 'success');
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');

        if (currentLocId && window.MapModule && typeof window.MapModule.openLocationDetail === 'function') {
            window.MapModule.openLocationDetail(currentLocId);
        }
    },

    // --- 5. PENGGUNAAN ITEM (USE ITEM API - EXACT MATCH) ---
    useItem(instanceId) {
        this.ensureState();
        const inv = window.gameState.economy.inventory.items;

        // PERBAIKAN BUG 10: Pencarian KETAT berdasarkan instanceId unik saja
        const itemIndex = inv.findIndex(i => String(i.instanceId) === String(instanceId));

        if (itemIndex === -1) {
            if (typeof showToast === 'function') showToast('Barang spesifik tidak ditemukan di Tas!', 'error');
            return;
        }

        const item = inv[itemIndex];
        const isConsumable = item.type === 'food' || item.type === 'drink' || item.type === 'medicine' || (Number(item.vitRestore) > 0);

        if (isConsumable) {
            // Pulihkan Vitality Warga
            const vitGain = Number(item.vitRestore) || 20;
            window.gameState.vitality = Math.min(100, window.gameState.vitality + vitGain);

            // Kurangi Quantity Stack
            item.quantity = (item.quantity || 1) - 1;
            if (item.quantity <= 0) {
                inv.splice(itemIndex, 1); // Hapus jika kuantitas habis
            }

            if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
            if (typeof showToast === 'function') showToast(`Mengonsumsi ${item.name} (+${vitGain}% Vitality)`, 'success');
        } else {
            // Equipment / Barang Aset Biasa
            item.isEquipped = !item.isEquipped;
            if (typeof showToast === 'function') {
                showToast(`${item.name} ${item.isEquipped ? 'sekarang aktif digunakan' : 'disimpan'}`, 'info');
            }
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof openApp === 'function') openApp('inventory');
    },

    // --- 6. SISTEM JUAL BARANG (SELL / REFUND SYSTEM) ---
    sellItem(instanceId, qtyToSell = 1) {
        this.ensureState();
        const inv = window.gameState.economy.inventory.items;
        const itemIndex = inv.findIndex(i => String(i.instanceId) === String(instanceId));

        if (itemIndex === -1) {
            if (typeof showToast === 'function') showToast('Barang tidak ditemukan untuk dijual!', 'error');
            return;
        }

        const item = inv[itemIndex];
        const itemsDb = window.ITEMS_DATABASE || [];
        const baseSpec = itemsDb.find(i => String(i.id) === String(item.id));
        const originalPrice = baseSpec ? baseSpec.price : 500;

        // Formula Harga Jual Dinamis: 70% dari harga asli x persen kondisi
        const conditionFactor = (item.condition || 100) / 100;
        const unitSellPrice = Math.floor(originalPrice * 0.7 * conditionFactor);
        const actualQty = Math.min(qtyToSell, item.quantity || 1);
        const totalEarnings = unitSellPrice * actualQty;

        // Kurangi Kuantitas Barang
        item.quantity = (item.quantity || 1) - actualQty;
        if (item.quantity <= 0) {
            inv.splice(itemIndex, 1);
        }

        // Tambah Uang Ke Wallet
        this.addIncome({
            amount: totalEarnings,
            source: 'Pegadaian / Pasar Bekas',
            description: `Jual ${actualQty}x ${item.name}`
        });

        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil menjual ${item.name} (+${totalEarnings.toLocaleString()} C)`, 'success');
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof openApp === 'function') openApp('inventory');
    },

    // --- 7. BUKAN / DRIVE KENDARAAN DI GARASI ---
    toggleVehicleEquip(instanceId) {
        this.ensureState();
        const vehicles = window.gameState.economy.vehicles;
        const veh = vehicles.find(v => String(v.instanceId) === String(instanceId));

        if (!veh) return;

        // Un-equip kendaraan lain
        vehicles.forEach(v => {
            if (v.instanceId !== instanceId) v.isEquipped = false;
        });

        veh.isEquipped = !veh.isEquipped;

        if (typeof showToast === 'function') {
            showToast(`${veh.name} [${veh.plate}] ${veh.isEquipped ? 'sekarang dikendarai 🚗' : 'dikandangkan di Garasi 🅿️'}`, 'info');
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof openApp === 'function') openApp('inventory');
    },

    // --- 8. RENDER MODERN APP UI (TAS, GARASI, DOMPET & TRANSAKSI) ---
    renderInventoryAppUI() {
        try {
            this.ensureState();
            const eco = window.gameState.economy;
            const inv = eco.inventory.items;
            const vehicles = eco.vehicles;
            const transactions = eco.transactions;
            const userLegal = window.gameState?.user?.legal || {};
            const licenses = Array.isArray(userLegal.licenses) ? userLegal.licenses : [];

            const totalWeight = this.calculateTotalWeight();
            const maxWeight = eco.inventory.capacity;
            const weightPercent = Math.min(100, Math.round((totalWeight / maxWeight) * 100));

            // A. Render Barang di Tas
            let invHtml = '';
            if (inv.length === 0) {
                invHtml = `<div class="glass-card p-4 rounded-2xl text-center text-slate-400 text-xs">Tas kamu masih kosong. Beli kebutuhan warga di Peta / IgnaShopee!</div>`;
            } else {
                inv.forEach((item) => {
                    const isFood = item.type === 'food' || item.type === 'drink' || item.type === 'medicine' || (Number(item.vitRestore) > 0);
                    const instId = item.instanceId;
                    const isEquipped = Boolean(item.isEquipped);
                    const qty = item.quantity || 1;
                    const weightTotal = ( (item.unitWeight || 0.5) * qty ).toFixed(1);

                    invHtml += `
                        <div class="glass-card p-3 rounded-2xl flex items-center justify-between border ${isEquipped ? 'border-sky-400/60 bg-sky-950/20' : 'border-white/10'}">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl ${isFood ? 'bg-amber-500/20 text-amber-400' : (isEquipped ? 'bg-sky-500/30 text-sky-300' : 'bg-slate-800 text-slate-300')} flex items-center justify-center text-lg shrink-0">
                                    <i class="fa-solid ${isFood ? 'fa-utensils' : 'fa-box'}"></i>
                                </div>
                                <div>
                                    <h5 class="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span>${item.name || 'Barang'}</span>
                                        ${qty > 1 ? `<span class="px-1.5 py-0.2 bg-sky-500/30 text-sky-300 text-[9px] rounded-full font-mono font-bold">x${qty}</span>` : ''}
                                    </h5>
                                    <p class="text-[9px] ${isFood ? 'text-emerald-400 font-semibold' : 'text-slate-400'}">
                                        ${isFood ? `+${item.vitRestore || 20}% Vitality` : (isEquipped ? '🟢 Sedang Dipakai' : '⚪ Tersimpan')} · <span class="text-slate-500 font-mono">${weightTotal} kg</span>
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <button onclick="EconomyModule.useItem('${instId}')" class="px-3 py-1.5 ${isFood ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : (isEquipped ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white')} font-bold text-xs rounded-xl shadow-md transition-all active:scale-95">
                                    ${isFood ? 'Gunakan' : (isEquipped ? 'Lepas' : 'Pakai')}
                                </button>
                                <button onclick="EconomyModule.sellItem('${instId}', 1)" class="p-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs rounded-xl transition-all" title="Jual Barang (70% Value)">
                                    <i class="fa-solid fa-sack-dollar"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
            }

            // B. Render Kendaraan di Garasi
            let vehHtml = '';
            if (vehicles.length === 0) {
                vehHtml = `<p class="text-[10px] text-slate-500 py-2 text-center">Belum ada kendaraan pribadi. Beli mobil / motor di Showroom Peta!</p>`;
            } else {
                vehicles.forEach((veh) => {
                    const isEquipped = Boolean(veh.isEquipped);
                    vehHtml += `
                        <div class="glass-card p-3 rounded-2xl border ${isEquipped ? 'border-emerald-400/60 bg-emerald-950/20' : 'border-white/10'} space-y-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-base shrink-0">
                                        <i class="fa-solid fa-car"></i>
                                    </div>
                                    <div>
                                        <h5 class="text-xs font-bold text-white">${veh.name}</h5>
                                        <span class="text-[9px] font-mono text-amber-400 font-bold">Plat: ${veh.plate}</span>
                                    </div>
                                </div>
                                <button onclick="EconomyModule.toggleVehicleEquip('${veh.instanceId}')" class="px-3 py-1.5 ${isEquipped ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200'} font-bold text-[10px] rounded-xl shadow-md transition-all">
                                    ${isEquipped ? '🟢 Dikendarai' : '🅿️ Gunakan'}
                                </button>
                            </div>
                            <div class="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[9px] font-mono text-slate-400">
                                <div>⛽ BBM: <span class="text-white font-bold">${veh.fuel}%</span></div>
                                <div>🛠️ Kondisi: <span class="text-white font-bold">${veh.condition}%</span></div>
                                <div>🗺️ Jarak: <span class="text-white font-bold">${veh.mileage} km</span></div>
                            </div>
                        </div>
                    `;
                });
            }

            // C. Render Histori Transaksi Dompet
            let txHtml = '';
            if (transactions.length === 0) {
                txHtml = `<p class="text-[10px] text-slate-500 py-2 text-center">Belum ada histori transaksi dompet.</p>`;
            } else {
                transactions.slice(0, 10).forEach(tx => {
                    const isIncome = tx.amount > 0;
                    const dateStr = new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    txHtml += `
                        <div class="flex items-center justify-between py-1.5 border-b border-white/5 text-[10px]">
                            <div>
                                <span class="font-bold text-white">${tx.merchant}</span>
                                <span class="text-[8px] text-slate-500 block">${tx.description} · ${dateStr}</span>
                            </div>
                            <span class="font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}">
                                ${isIncome ? '+' : ''}${tx.amount.toLocaleString()} C
                            </span>
                        </div>
                    `;
                });
            }

            // D. Render Dokumen & SIM
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
                    <!-- HEADER DOMPET & KAPASITAS TAS -->
                    <div class="glass-ios p-4 rounded-3xl border border-amber-500/40 space-y-3 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/60 shadow-xl">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-wallet text-amber-400 text-base"></i>
                                <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider">DOMPET & INVENTARIS V2</h4>
                            </div>
                            <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[8px] font-bold rounded">RESMI</span>
                        </div>

                        <!-- INDICATOR BEBAN TAS -->
                        <div class="space-y-1">
                            <div class="flex justify-between text-[10px] font-semibold text-slate-300">
                                <span>🎒 Beban Tas Warga</span>
                                <span class="${weightPercent > 85 ? 'text-rose-400 font-bold' : 'text-amber-300'} font-mono">${totalWeight} / ${maxWeight} KG (${weightPercent}%)</span>
                            </div>
                            <div class="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                                <div class="h-full bg-gradient-to-r ${weightPercent > 85 ? 'from-rose-500 to-red-600' : 'from-sky-500 to-amber-400'} transition-all duration-300" style="width: ${weightPercent}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- KENDARAAN GARASI -->
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fa-solid fa-warehouse"></i> 🚗 Garasi Kendaraan (${vehicles.length})
                        </h4>
                        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                            ${vehHtml}
                        </div>
                    </div>

                    <!-- ISI TAS -->
                    <div class="space-y-2 pt-2 border-t border-white/10">
                        <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fa-solid fa-box-open"></i> 🎒 Isi Tas (${inv.length} Jenis Item)
                        </h4>
                        <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                            ${invHtml}
                        </div>
                    </div>

                    <!-- HISTORI TRANSAKSI -->
                    <div class="space-y-2 pt-2 border-t border-white/10">
                        <h4 class="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fa-solid fa-clock-rotate-left"></i> 💳 Mutasi Transaksi Terakhir
                        </h4>
                        <div class="space-y-1 max-h-36 overflow-y-auto pr-1 glass-card p-2 rounded-2xl">
                            ${txHtml}
                        </div>
                    </div>

                    <!-- SURAT & DOKUMEN -->
                    <div class="space-y-2 pt-2 border-t border-white/10">
                        <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fa-solid fa-id-card"></i> 📜 Dokumen Kepemilikan & SIM
                        </h4>
                        <div class="space-y-1.5 max-h-28 overflow-y-auto">
                            ${licHtml}
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('[EconomyModule UI Error]:', err);
            return `<div class="p-4 text-center text-rose-400 text-xs font-bold">Terjadi kesalahan pada modul Ekonomi: ${err.message}</div>`;
        }
    }
};

// Inisialisasi otomatis saat modul dimuat
EconomyModule.ensureState();

window.EconomyModule = EconomyModule;
