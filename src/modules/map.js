// ==========================================
// ENGINE PETA INTERAKTIF KOTA (MAP.JS)
// ==========================================

const MapModule = {
    renderMapUI() {
        let locationsHtml = '';

        (window.LOCATIONS_DATABASE || []).forEach(loc => {
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
                    <p class="text-[10px] text-slate-300">Pilih lokasi tujuan untuk mengakses fasilitas, minimarket, ujian SIM, atau tempat santai.</p>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">📍 Destinasi & Fasilitas Kota</h4>
                    <div class="space-y-2">
                        ${locationsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    openLocationDetail(locId) {
        const loc = (window.LOCATIONS_DATABASE || []).find(l => l.id === locId);
        if (!loc) return;

        const body = document.getElementById('app-window-body');
        const title = document.getElementById('app-window-title');
        if (!body || !title) return;

        title.textContent = loc.name;

        // Render Lisensi / Layanan
        let licensesHtml = '';
        if (loc.licenses && loc.licenses.length > 0) {
            loc.licenses.forEach(licId => {
                const lic = (window.LICENSES_DATABASE || []).find(l => l.id === licId);
                const owned = (window.gameState?.user?.legal?.licenses || []).includes(licId);

                if (lic) {
                    licensesHtml += `
                        <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div>
                                <h5 class="font-bold text-white text-[11px]">${lic.name}</h5>
                                <span class="text-[9px] text-slate-400 font-mono">${lic.cost > 0 ? lic.cost.toLocaleString() + ' C' : 'Gratis'}</span>
                            </div>
                            ${owned ? `
                                <span class="text-[9px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/20 rounded">Aktif</span>
                            ` : `
                                <button onclick="AdminModule.applyLicense('${lic.id}'); MapModule.openLocationDetail('${loc.id}');" class="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-lg shadow-md">
                                    Ambil
                                </button>
                            `}
                        </div>
                    `;
                }
            });
        }

        // Render Toko Barang (FIXED CLICK CLICKABLE)
        let itemsHtml = '';
        if (loc.items && loc.items.length > 0) {
            loc.items.forEach(itemId => {
                const item = (window.ITEMS_DATABASE || []).find(i => i.id === itemId);
                if (item) {
                    itemsHtml += `
                        <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div>
                                <h5 class="font-bold text-white text-[11px]">${item.name}</h5>
                                <p class="text-[9px] text-slate-400">${item.desc}</p>
                            </div>
                            <button onclick="EconomyModule.buyItem('${item.id}', '${loc.id}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg shadow-md">
                                Beli (${item.price.toLocaleString()} C)
                            </button>
                        </div>
                    `;
                }
            });
        }

        // Render Aktivitas Tempat
        let activitiesHtml = '';
        if (loc.activities && loc.activities.length > 0) {
            loc.activities.forEach(act => {
                activitiesHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                            <h5 class="font-bold text-white text-[11px]">${act.name}</h5>
                            <p class="text-[9px] text-slate-400">${act.desc}</p>
                        </div>
                        <button onclick="MapModule.doActivity('${act.id}', '${loc.id}')" class="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] rounded-lg shadow-md">
                            Mulai
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

                ${activitiesHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-wider">🎣 Aktivitas Tempat</h4>
                        <div class="space-y-2">${activitiesHtml}</div>
                    </div>
                ` : ''}

                ${licensesHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">📜 Pengurusan SIM & Layanan</h4>
                        <div class="space-y-2">${licensesHtml}</div>
                    </div>
                ` : ''}

                ${itemsHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">🛍️ Barang Toko & Makanan</h4>
                        <div class="space-y-2">${itemsHtml}</div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    doActivity(actId, locId) {
        if (actId === 'act_fish') {
            if ((window.gameState?.vitality || 0) < 8) {
                if (typeof showToast === 'function') showToast('Vitality tidak cukup buat mancing!', 'error');
                return;
            }
            window.gameState.vitality -= 8;
            window.gameState.crest = (window.gameState.crest || 0) + 350;
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast('Dapat Ikan Gurame! Dijual (+350 C, -8% Vit)', 'success');
        } else if (actId === 'act_relax') {
            window.gameState.vitality = Math.min(100, (window.gameState.vitality || 0) + 15);
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast('Bersantai di taman (+15% Vit)', 'success');
        }

        this.openLocationDetail(locId);
    }
};

window.MapModule = MapModule;
