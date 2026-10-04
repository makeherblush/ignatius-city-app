// ==========================================
// ENGINE PETA INTERAKTIF KOTA (MAP.JS)
// ==========================================

const MapModule = {
    getLocationsList() {
        if (window.LOCATIONS_DATABASE && window.LOCATIONS_DATABASE.length > 0) {
            return window.LOCATIONS_DATABASE;
        }
        // Fallback Lengkap Destinasi Kota
        return [
            { id: 'loc_capil', name: 'Kantor Dukcapil', category: 'Layanan Publik', desc: 'Pengurusan KTP Digital, KK, & Pernikahan', iconFa: 'fa-landmark', color: 'bg-sky-600', licenses: ['SIM A (Mobil)', 'SIM C (Motor)'] },
            { id: 'loc_polres', name: 'Polres Ignatius', category: 'Keamanan', desc: 'Ujian SIM, izin senjata api, & kepolisian', iconFa: 'fa-shield-halved', color: 'bg-indigo-600', licenses: ['Sertifikat Security Pratama', 'Izin Senjata Api'] },
            { id: 'loc_hospital', name: 'RSUD Kota Ignatius', category: 'Kesehatan', desc: 'IGD 24 jam & konsultasi medis', iconFa: 'fa-hospital', color: 'bg-rose-600', items: ['item_medkit', 'item_bandage'] },
            { id: 'loc_minimarket', name: 'Minimarket Serba Ada', category: 'Perbelanjaan', desc: 'Beli makanan, minuman, & perlengkapan', iconFa: 'fa-basket-shopping', color: 'bg-amber-600', items: ['item_bread', 'item_water', 'item_coffee', 'item_energy_drink'] },
            { id: 'loc_dealer', name: 'Dealer Otomotif Utama', category: 'Showroom', desc: 'Pusat pembelian mobil & motor kota', iconFa: 'fa-car', color: 'bg-emerald-600', items: ['item_car_1', 'item_bike_1'] },
            { id: 'loc_cafe', name: 'Ignatius Coffee Shop', category: 'Tempat Santai', desc: 'Nongkrong & pulihkan Vitality warga', iconFa: 'fa-mug-hot', color: 'bg-yellow-700', items: ['item_coffee', 'item_sandwich'] },
            { id: 'loc_park', name: 'Taman Kota Rindang', category: 'Fasilitas Umum', desc: 'Area memancing & bersantai gratis', iconFa: 'fa-tree', color: 'bg-teal-600' },
            { id: 'loc_bank', name: 'Gedung Bank Central', category: 'Keuangan', desc: 'Layanan tabungan, bunga, & deposito', iconFa: 'fa-building-columns', color: 'bg-amber-700' }
        ];
    },

    renderMapUI() {
        const locations = this.getLocationsList();
        let locationsHtml = '';

        locations.forEach(loc => {
            locationsHtml += `
                <div onclick="MapModule.openLocationDetail('${loc.id}')" class="glass-card p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-sky-400/50 transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${loc.color || 'bg-sky-600'} flex items-center justify-center text-white text-lg shadow-md shrink-0">
                            <i class="fa-solid ${loc.iconFa || 'fa-location-dot'}"></i>
                        </div>
                        <div>
                            <h5 class="text-xs font-bold text-white">${loc.name}</h5>
                            <p class="text-[10px] text-slate-400 leading-tight">${loc.desc}</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-xs text-slate-500"></i>
                </div>
            `;
        });

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-2">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-map-location-dot text-sky-400 text-base"></i>
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">Peta Navigasi Kota</h4>
                    </div>
                    <p class="text-[10px] text-slate-300">Pilih lokasi tujuan untuk mengakses fasilitas, minimarket, dealer, atau tempat santai.</p>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">📍 Destinasi & Fasilitas Kota (${locations.length})</h4>
                    <div class="space-y-2 max-h-80 overflow-y-auto">${locationsHtml}</div>
                </div>
            </div>
        `;
    },

    openLocationDetail(locId) {
        const locations = this.getLocationsList();
        let loc = locations.find(l => l.id === locId) || locations[0];

        const body = document.getElementById('app-window-body');
        const title = document.getElementById('app-window-title');
        if (!body || !title) return;

        title.textContent = loc.name;

        let licensesHtml = '';
        if (loc.licenses && loc.licenses.length > 0) {
            loc.licenses.forEach(licId => {
                const owned = (window.gameState?.user?.legal?.licenses || []).includes(licId);
                licensesHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                            <h5 class="font-bold text-white text-[11px]">${licId}</h5>
                            <span class="text-[9px] text-slate-400 font-mono">1.500 C</span>
                        </div>
                        ${owned ? `
                            <span class="text-[9px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/20 rounded">Dimiliki</span>
                        ` : `
                            <button onclick="AdminModule.applyLicense('${licId}'); MapModule.openLocationDetail('${loc.id}');" class="px-2.5 py-1 bg-sky-600 text-white font-bold text-[10px] rounded-lg shadow-md">
                                Terbitkan
                            </button>
                        `}
                    </div>
                `;
            });
        }

        let itemsHtml = '';
        if (loc.items && loc.items.length > 0) {
            loc.items.forEach(itemId => {
                const item = (window.ITEMS_DATABASE || []).find(i => i.id === itemId) || { id: itemId, name: itemId, price: 500, desc: 'Barang toko' };
                itemsHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                            <h5 class="font-bold text-white text-[11px]">${item.name}</h5>
                            <p class="text-[9px] text-slate-400">${item.desc}</p>
                        </div>
                        <button onclick="EconomyModule.buyItem('${item.id}', '${loc.id}')" class="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg shadow-md">
                            Beli (${item.price.toLocaleString()} C)
                        </button>
                    </div>
                `;
            });
        }

        body.innerHTML = `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-white/20 space-y-2">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl ${loc.color || 'bg-sky-600'} flex items-center justify-center text-white text-2xl shadow-lg">
                            <i class="fa-solid ${loc.iconFa || 'fa-location-dot'}"></i>
                        </div>
                        <div>
                            <h3 class="text-xs font-bold text-white">${loc.name}</h3>
                            <span class="text-[9px] text-sky-400 font-bold uppercase tracking-wider">${loc.category}</span>
                            <p class="text-[10px] text-slate-300 pt-0.5 leading-tight">${loc.desc}</p>
                        </div>
                    </div>
                </div>

                ${licensesHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">📜 Layanan Dokumen & SIM</h4>
                        <div class="space-y-2">${licensesHtml}</div>
                    </div>
                ` : ''}

                ${itemsHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">🛍️ Toko & Barang Dijual</h4>
                        <div class="space-y-2">${itemsHtml}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }
};

window.MapModule = MapModule;
