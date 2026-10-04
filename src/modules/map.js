// ==========================================
// ENGINE MAPS, NAVIGASI KOTA & MINI-GAMES V2 (MAP.JS) - UPDATED
// ==========================================

const MapModule = {
    currentFilter: 'all',
    searchQuery: '',

    // REGISTRY KATALOG NAMA ITEM MANUSIAWI
    ITEM_CATALOG_DB: {
        'item_medkit': { id: 'item_medkit', name: 'Kotak P3K Medkit', price: 1500, desc: 'Memulihkan +50% Vitality' },
        'item_bandage': { id: 'item_bandage', name: 'Pembalut Perban Dokter', price: 500, desc: 'Memulihkan +20% Vitality' },
        'item_bread': { id: 'item_bread', name: 'Roti Tawar Fresh', price: 250, desc: 'Memulihkan +15% Vitality' },
        'item_water': { id: 'item_water', name: 'Air Mineral Botol', price: 150, desc: 'Memulihkan +10% Vitality' },
        'item_coffee': { id: 'item_coffee', name: 'Kopi Hitam Mantap', price: 400, desc: 'Memulihkan +25% Vitality' },
        'item_energy_drink': { id: 'item_energy_drink', name: 'Minuman Energi GT', price: 800, desc: 'Memulihkan +40% Vitality' },
        'item_sandwich': { id: 'item_sandwich', name: 'Sandwich Daging Sapi', price: 600, desc: 'Memulihkan +30% Vitality' },
        'item_car_1': { id: 'item_car_1', name: 'Mobil Sedan Sport GT', price: 150000, desc: 'Kendaraan roda 4 kecepatan tinggi', type: 'car' },
        'item_bike_1': { id: 'item_bike_1', name: 'Motor Matic 150cc', price: 35000, desc: 'Kendaraan roda 2 lincah & hemat BBM', type: 'bike' }
    },

    // REGISTRY MINI-GAMES (DITAMBAH SIM A & JENJANG SECURITY)
    MINIGAME_REGISTRY: {
        'cert_exam_law': { title: '⚖️ Ujian Sertifikasi Hukum', icon: 'fa-gavel', handler: 'startCertExam', args: ['law'], fee: 2500 },
        'cert_exam_med': { title: '🩺 Ujian Izin Praktek Medis', icon: 'fa-stethoscope', handler: 'startCertExam', args: ['med'], fee: 3000 },
        'cert_exam_it': { title: '💻 Ujian Sertifikasi IT & Cyber', icon: 'fa-code', handler: 'startCertExam', args: ['it'], fee: 2000 },
        'cert_exam_security_pratama': { title: '🛡️ Ujian Security Pratama', icon: 'fa-user-shield', handler: 'startCertExam', args: ['security_pratama'], fee: 1500 },
        'cert_exam_security_utama': { title: '🛡️ Ujian Kualifikasi Security Utama', icon: 'fa-shield-halved', handler: 'startCertExam', args: ['security_utama'], fee: 2500 },
        'fishing_game': { title: '🎣 Mancing Mania Danau', icon: 'fa-fish', handler: 'startFishingGame', args: [], fee: 0 },
        'spin_wheel': { title: '🎰 Roda Jackpot Kasino', icon: 'fa-arrows-spin', handler: 'startSpinWheel', args: [], fee: 500 },
        'barista_game': { title: '☕ Racik Kopi Bistro', icon: 'fa-mug-hot', handler: 'startBaristaGame', args: [], fee: 0 },
        'shooting_range': { title: '🎯 Latihan Menembak Target', icon: 'fa-crosshair', handler: 'startShootingRange', args: [], fee: 0 },
        'sim_quiz_c': { title: '📝 Ujian Teori SIM C (Motor)', icon: 'fa-file-pen', handler: 'startSimQuiz', args: ['C'], fee: 1000 },
        'sim_quiz_a': { title: '📝 Ujian Teori SIM A (Mobil)', icon: 'fa-car', handler: 'startSimQuiz', args: ['A'], fee: 1500 }
    },

    ensureState() {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.map) {
            window.gameState.map = {
                currentLocId: 'loc_capil',
                favorites: ['loc_cafe', 'loc_bank'],
                recent: ['loc_capil']
            };
        }

        const mapState = window.gameState.map;
        if (!mapState.currentLocId) mapState.currentLocId = 'loc_capil';
        if (!Array.isArray(mapState.favorites)) mapState.favorites = [];
        if (!Array.isArray(mapState.recent)) mapState.recent = [];
    },

    getLocationsList() {
        if (window.LOCATIONS_DATABASE && Array.isArray(window.LOCATIONS_DATABASE) && window.LOCATIONS_DATABASE.length >= 10) {
            return window.LOCATIONS_DATABASE;
        }

        return [
            {
                id: 'loc_cert_center',
                name: 'Gedung LSK Pusat Sertifikasi',
                category: 'Pendidikan',
                district: 'Downtown',
                address: 'Jl. Pemuda No. 12, Level 4',
                coordinates: { x: 120, y: 340 },
                openHours: { open: 8, close: 17 },
                desc: 'Pusat ujian sertifikasi hukum, medis, IT, & kualifikasi profesi resmi.',
                iconFa: 'fa-graduation-cap',
                color: 'from-emerald-600 to-teal-900',
                npc: { name: 'Prof. Supriadi', role: 'Kepala LSK', dialog: 'Lulus ujian sertifikasi untuk membuka jenjang karir tingkat tinggi di kota.' },
                licenses: ['Sertifikat Hukum', 'Izin Praktek Medis', 'Sertifikat IT & Cyber', 'Sertifikat Security Pratama', 'Sertifikat Security Utama'],
                minigames: ['cert_exam_law', 'cert_exam_med', 'cert_exam_it', 'cert_exam_security_pratama', 'cert_exam_security_utama']
            },
            {
                id: 'loc_capil',
                name: 'Kantor Dukcapil Central',
                category: 'Layanan Publik',
                district: 'Civic Center',
                address: 'Jl. Merdeka Barat No. 1',
                coordinates: { x: 100, y: 200 },
                openHours: { open: 7, close: 18 },
                desc: 'Integrasi KTP Digital, KK, Pernikahan, & Legalitas Warga.',
                iconFa: 'fa-landmark',
                color: 'from-sky-600 to-blue-800',
                npc: { name: 'Pak Budi', role: 'Petugas Dukcapil', dialog: 'Pastikan data dokumen identitas kamu selalu diperbarui secara resmi.' },
                licenses: ['SIM A (Mobil)', 'SIM C (Motor)'],
                items: []
            },
            {
                id: 'loc_polres',
                name: 'Polres Patrolex Ignatius',
                category: 'Keamanan',
                district: 'Civic Center',
                address: 'Jl. Bhayangkara No. 9',
                coordinates: { x: 180, y: 220 },
                openHours: { open: 0, close: 24 },
                desc: 'Markas kepolisian, tempat pendaftaran SIM, & arena tes menembak.',
                iconFa: 'fa-shield-halved',
                color: 'from-indigo-600 to-slate-900',
                npc: { name: 'Apt. Roy', role: 'Kanit Lantas', dialog: 'Utamakan keselamatan berkendara. Lengkapi kendaraan dengan SIM aktif.' },
                licenses: ['SIM A (Mobil)', 'SIM C (Motor)', 'Sertifikat Security Pratama'],
                minigames: ['sim_quiz_c', 'sim_quiz_a', 'shooting_range']
            },
            {
                id: 'loc_hospital',
                name: 'RSUD Medika Utama',
                category: 'Kesehatan',
                district: 'Central',
                address: 'Jl. Kesehatan No. 45',
                coordinates: { x: 250, y: 150 },
                openHours: { open: 0, close: 24 },
                desc: 'Pusat penanganan pasien darurat IGD & konsultasi medis.',
                iconFa: 'fa-hospital',
                color: 'from-rose-600 to-red-900',
                npc: { name: 'dr. Sarah', role: 'Dokter Spesialis IGD', dialog: 'Jagalah Vitality tubuhmu dengan baik agar tidak kolaps saat aktivitas.' },
                items: ['item_medkit', 'item_bandage']
            },
            {
                id: 'loc_minimarket',
                name: 'Minimarket 24/7 Express',
                category: 'Shopping',
                district: 'Commercial Area',
                address: 'Jl. Sudirman No. 88',
                coordinates: { x: 300, y: 280 },
                openHours: { open: 0, close: 24 },
                desc: 'Penyedia kebutuhan harian, makanan siap saji, & minuman energi.',
                iconFa: 'fa-basket-shopping',
                color: 'from-amber-500 to-amber-700',
                npc: { name: 'Mbak Maya', role: 'Kasir Utama', dialog: 'Selamat belanja! Nikmati promo makanan penambah Vitality hari ini.' },
                items: ['item_bread', 'item_water', 'item_coffee', 'item_energy_drink']
            },
            {
                id: 'loc_park',
                name: 'Taman Rindang & Danau Kota',
                category: 'Rekreasi',
                district: 'North Park',
                address: 'Kawasan Danau Barat',
                coordinates: { x: 400, y: 100 },
                openHours: { open: 5, close: 22 },
                desc: 'Taman kota asri untuk bersantai dan area memancing ikan langka.',
                iconFa: 'fa-tree',
                color: 'from-emerald-600 to-teal-800',
                npc: { name: 'Pak Karto', role: 'Pemancing Mania', dialog: 'Danau ini menyimpan ikan Gurame Emas berharga mahal jika kamu sabar.' },
                minigames: ['fishing_game']
            },
            {
                id: 'loc_cafe',
                name: 'Ignatius Coffee & Bistro',
                category: 'Food',
                district: 'Downtown',
                address: 'Jl. Central Avenue No. 21',
                coordinates: { x: 420, y: 280 },
                openHours: { open: 7, close: 23 },
                desc: 'Kafe modern tempat nongkrong, meracik kopi, & memulihkan energi.',
                iconFa: 'fa-mug-hot',
                color: 'from-amber-800 to-amber-950',
                npc: { name: 'Rian', role: 'Head Barista', dialog: 'Seduhan kopi berkualitas tinggi akan menjaga fokus dan stamina aktivitasmu.' },
                items: ['item_coffee', 'item_sandwich'],
                minigames: ['barista_game']
            },
            {
                id: 'loc_casino',
                name: 'Grand Spin Arena',
                category: 'Entertainment',
                district: 'Entertainment District',
                address: 'Jl. Executive No. 777',
                coordinates: { x: 500, y: 450 },
                openHours: { open: 18, close: 4 },
                desc: 'Arena permainan ketangkasan dan Roda Jackpot berhadiah Crest.',
                iconFa: 'fa-dice',
                color: 'from-purple-600 to-slate-950',
                npc: { name: 'Jack', role: 'Pit Boss', dialog: 'Cobalah keberuntunganmu di Roda Jackpot hari ini!' },
                minigames: ['spin_wheel']
            },
            {
                id: 'loc_dealer',
                name: 'Showroom Otomotif GT',
                category: 'Shopping',
                district: 'Commercial Area',
                address: 'Jl. Auto Boulevard No. 12',
                coordinates: { x: 350, y: 380 },
                openHours: { open: 8, close: 20 },
                desc: 'Pusat jual beli mobil sport, motor matic, & garasi resmi.',
                iconFa: 'fa-car',
                color: 'from-cyan-600 to-blue-900',
                npc: { name: 'Sales Kevyn', role: 'Senior Consultant', dialog: 'Memiliki kendaraan pribadi mempercepat perjalananmu melintasi kota.' },
                items: ['item_car_1', 'item_bike_1']
            },
            {
                id: 'loc_bank',
                name: 'Gedung Bank Central',
                category: 'Bank',
                district: 'Downtown',
                address: 'Jl. Financial Plaza No. 5',
                coordinates: { x: 220, y: 310 },
                openHours: { open: 8, close: 16 },
                desc: 'Layanan perbankan digital, tabungan harian, & investasi deposito.',
                iconFa: 'fa-building-columns',
                color: 'from-yellow-600 to-amber-900',
                npc: { name: 'Teller Anisa', role: 'Customer Service', dialog: 'Simpan dana cadanganmu di Tabungan Berbunga agar aman dan produktif.' }
            }
        ];
    },

    calculateDistance(loc1, loc2) {
        if (!loc1 || !loc2 || !loc1.coordinates || !loc2.coordinates) return 1.0;
        const dx = loc1.coordinates.x - loc2.coordinates.x;
        const dy = loc1.coordinates.y - loc2.coordinates.y;
        const distKm = Math.sqrt(dx * dx + dy * dy) / 100;
        return parseFloat(Math.max(0.2, distKm).toFixed(1));
    },

    calculateTravelTime(distKm, mode = 'walk') {
        let speedKmH = 4.0;
        if (mode === 'bike') speedKmH = 15.0;
        if (mode === 'car') speedKmH = 40.0;

        const timeMinutes = Math.ceil((distKm / speedKmH) * 60);
        return Math.max(1, timeMinutes);
    },

    isLocationOpen(loc) {
        if (!loc.openHours) return true;
        const currentHour = new Date().getHours();
        const { open, close } = loc.openHours;

        if (open === 0 && close === 24) return true;
        if (open < close) {
            return currentHour >= open && currentHour < close;
        } else {
            return currentHour >= open || currentHour < close;
        }
    },

    // NAVIGASI DENGAN VALIDASI KENDARAAN & SIM
    startNavigation(targetLocId, transportMode = 'walk') {
        this.ensureState();
        const locations = this.getLocationsList();
        const currentLoc = locations.find(l => l.id === window.gameState.map.currentLocId) || locations[1];
        const targetLoc = locations.find(l => l.id === targetLocId);

        if (!targetLoc) return;

        if (currentLoc.id === targetLoc.id) {
            if (typeof showToast === 'function') showToast(`Kamu sudah berada di ${targetLoc.name}!`, 'info');
            return;
        }

        const vehicles = window.gameState.economy?.vehicles || [];
        const licenses = window.gameState.user?.legal?.licenses || [];

        if (transportMode === 'car') {
            const hasCar = vehicles.some(v => v.type === 'car' || v.id?.includes('car') || v.name?.toLowerCase().includes('mobil'));
            const hasSimA = licenses.includes('SIM A (Mobil)');
            if (!hasCar) {
                if (typeof showToast === 'function') showToast('Kamu belum punya Mobil! Beli di Showroom Otomotif dulu.', 'error');
                return;
            }
            if (!hasSimA) {
                if (typeof showToast === 'function') showToast('🔒 Kamu punya Mobil, tetapi belum memiliki SIM A dari Polres/Dukcapil!', 'error');
                return;
            }
        } else if (transportMode === 'bike') {
            const hasBike = vehicles.some(v => v.type === 'bike' || v.id?.includes('bike') || v.name?.toLowerCase().includes('motor'));
            const hasSimC = licenses.includes('SIM C (Motor)');
            if (!hasBike) {
                if (typeof showToast === 'function') showToast('Kamu belum punya Motor! Beli di Showroom Otomotif dulu.', 'error');
                return;
            }
            if (!hasSimC) {
                if (typeof showToast === 'function') showToast('🔒 Kamu punya Motor, tetapi belum memiliki SIM C dari Polres/Dukcapil!', 'error');
                return;
            }
        }

        const distKm = this.calculateDistance(currentLoc, targetLoc);
        const etaMinutes = this.calculateTravelTime(distKm, transportMode);

        window.gameState.map.currentLocId = targetLoc.id;

        if (!window.gameState.map.recent.includes(targetLoc.id)) {
            window.gameState.map.recent.unshift(targetLoc.id);
            if (window.gameState.map.recent.length > 5) window.gameState.map.recent.pop();
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('keypad');

        if (typeof window.showIOSNotification === 'function') {
            window.showIOSNotification(
                'Tiba di Lokasi',
                `Kamu telah sampai di ${targetLoc.name} (${distKm} km via ${transportMode}).`,
                'Apple Maps',
                'fa-location-arrow'
            );
        }

        this.openLocationDetail(targetLoc.id);
    },

    toggleFavorite(locId) {
        this.ensureState();
        const favs = window.gameState.map.favorites;
        const index = favs.indexOf(locId);

        if (index !== -1) {
            favs.splice(index, 1);
            if (typeof showToast === 'function') showToast('Dihapus dari Lokasi Favorit', 'info');
        } else {
            favs.push(locId);
            if (typeof showToast === 'function') showToast('Disimpan ke Lokasi Favorit ⭐', 'success');
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof openApp === 'function') openApp('citymap');
    },

    callEmergency(type) {
        const typeLabels = {
            medical: { title: '🚑 Ambulans IGD RSUD', msg: 'Tim Medis IGD meluncur ke lokasimu.' },
            police: { title: '🚓 Unit Patroli Polres', msg: 'Tim Lantas & Reskrim dikirim ke posisi GPS.' },
            fire: { title: '🔥 Pemadam Kebakaran', msg: 'Armada Damkar meluncur ke lokasi kejadian.' }
        };

        const service = typeLabels[type] || typeLabels.police;

        if (typeof playAudioSfx === 'function') playAudioSfx('siren');
        if (typeof showToast === 'function') showToast(`🚨 Panggilan Darurat 911: ${service.title}`, 'error');

        if (typeof window.showIOSNotification === 'function') {
            window.showIOSNotification(
                'EMERGENCY DISPATCH 911',
                `${service.msg} Estimasi Tiba: 2 Menit.`,
                'Polres & IGD Center',
                'fa-triangle-exclamation'
            );
        }
    },

    renderMapUI() {
        this.ensureState();
        const locations = this.getLocationsList();
        const currentLocId = window.gameState.map.currentLocId;
        const currentLoc = locations.find(l => l.id === currentLocId) || locations[1];
        const favIds = window.gameState.map.favorites;

        // PERBAIKAN: PENCARIAN TERMASUK ADDRESS & KATEGORI LENGKAP
        let filtered = locations.filter(loc => {
            const matchesCat = this.currentFilter === 'all' || loc.category.toLowerCase() === this.currentFilter.toLowerCase();
            const q = (this.searchQuery || '').toLowerCase();
            const matchesSearch = !q || 
                loc.name.toLowerCase().includes(q) || 
                loc.district.toLowerCase().includes(q) || 
                loc.address.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });

        let placesHtml = '';
        if (filtered.length === 0) {
            placesHtml = `<p class="text-[10px] text-slate-500 text-center py-4">Tidak ada lokasi yang cocok dengan pencarian.</p>`;
        } else {
            filtered.forEach(loc => {
                const dist = this.calculateDistance(currentLoc, loc);
                const isOpen = this.isLocationOpen(loc);
                const isFav = favIds.includes(loc.id);
                const isCurrent = loc.id === currentLoc.id;

                placesHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between border ${isCurrent ? 'border-sky-400 bg-sky-950/30' : 'border-white/10'} hover:border-white/30 transition-all cursor-pointer">
                        <div onclick="MapModule.openLocationDetail('${loc.id}')" class="flex items-center gap-3 flex-1">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${loc.color || 'from-sky-600 to-blue-800'} flex items-center justify-center text-white text-lg shadow-md shrink-0 relative">
                                <i class="fa-solid ${loc.iconFa || 'fa-location-dot'}"></i>
                                ${isCurrent ? '<div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-400 border-2 border-black rounded-full"></div>' : ''}
                            </div>
                            <div>
                                <div class="flex items-center gap-1.5">
                                    <h5 class="text-xs font-bold text-white">${loc.name}</h5>
                                    ${isFav ? '<i class="fa-solid fa-star text-amber-400 text-[9px]"></i>' : ''}
                                </div>
                                <p class="text-[9px] text-slate-400 leading-tight">
                                    📍 ${loc.district} · <span class="text-sky-300 font-mono font-bold">${dist} km</span> · 
                                    <span class="${isOpen ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}">${isOpen ? 'Buka' : 'Tutup'}</span>
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-1">
                            <button onclick="MapModule.toggleFavorite('${loc.id}')" class="p-2 text-slate-400 hover:text-amber-400 text-xs transition-all" title="Simpan Favorit">
                                <i class="fa-${isFav ? 'solid text-amber-400' : 'regular'} fa-star"></i>
                            </button>
                            <button onclick="MapModule.openLocationDetail('${loc.id}')" class="p-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white rounded-xl text-xs font-bold transition-all">
                                Go
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <div class="relative w-full h-40 rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 p-4 flex flex-col justify-between"
                     style="background-image: radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80'); background-size: cover; background-position: center;">
                    
                    <div class="flex justify-between items-start z-10">
                        <div>
                            <span class="text-[9px] font-mono font-extrabold text-sky-400 uppercase tracking-widest block flex items-center gap-1">
                                <i class="fa-solid fa-location-crosshairs animate-pulse"></i> LOKASI KAMU SEKARANG
                            </span>
                            <h3 class="text-sm font-bold text-white drop-shadow-md">📍 ${currentLoc.name}</h3>
                            <p class="text-[9px] text-slate-300 font-medium">${currentLoc.district} · ${currentLoc.address}</p>
                        </div>

                        <span class="px-2.5 py-1 bg-black/60 backdrop-blur-md text-emerald-300 text-[9px] font-bold rounded-full border border-emerald-500/30">
                            28°C Clear
                        </span>
                    </div>

                    <div class="flex items-center justify-between gap-1.5 z-10 pt-2 border-t border-white/10">
                        <span class="text-[8px] text-slate-300 font-bold uppercase tracking-wider">Darurat 911:</span>
                        <div class="flex gap-1">
                            <button onclick="MapModule.callEmergency('medical')" class="px-2 py-0.5 bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-[8px] rounded-lg border border-rose-400/40">🚑 Medis</button>
                            <button onclick="MapModule.callEmergency('police')" class="px-2 py-0.5 bg-blue-600/80 hover:bg-blue-500 text-white font-bold text-[8px] rounded-lg border border-blue-400/40">🚓 Polisi</button>
                            <button onclick="MapModule.callEmergency('fire')" class="px-2 py-0.5 bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-[8px] rounded-lg border border-amber-400/40">🔥 Damkar</button>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="relative">
                        <input type="text" value="${this.searchQuery}" oninput="MapModule.searchQuery = this.value; if(typeof openApp==='function') openApp('citymap');" 
                               placeholder="🔍 Cari lokasi, jalan, atau distrik kota..." 
                               class="w-full px-4 py-2.5 bg-slate-900/90 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium shadow-inner">
                    </div>

                    <!-- PERBAIKAN: KATEGORI FILTER LENGKAP -->
                    <div class="flex gap-1.5 overflow-x-auto pb-2 text-[10px] font-bold whitespace-nowrap touch-pan-x scrollbar-none">
                        <button onclick="MapModule.currentFilter='all'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='all' ? 'bg-sky-500 text-white' : 'glass-card text-slate-400'}">Semua</button>
                        <button onclick="MapModule.currentFilter='Food'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Food' ? 'bg-amber-500 text-slate-950' : 'glass-card text-slate-400'}">☕ Kuliner</button>
                        <button onclick="MapModule.currentFilter='Shopping'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Shopping' ? 'bg-emerald-500 text-slate-950' : 'glass-card text-slate-400'}">🛍 Belanja</button>
                        <button onclick="MapModule.currentFilter='Bank'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Bank' ? 'bg-yellow-500 text-slate-950' : 'glass-card text-slate-400'}">🏦 Bank</button>
                        <button onclick="MapModule.currentFilter='Kesehatan'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Kesehatan' ? 'bg-rose-500 text-white' : 'glass-card text-slate-400'}">🏥 Kesehatan</button>
                        <button onclick="MapModule.currentFilter='Keamanan'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Keamanan' ? 'bg-indigo-500 text-white' : 'glass-card text-slate-400'}">🛡️️ Polisi</button>
                        <button onclick="MapModule.currentFilter='Pendidikan'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Pendidikan' ? 'bg-teal-500 text-slate-950' : 'glass-card text-slate-400'}">🎓 Pendidikan</button>
                        <button onclick="MapModule.currentFilter='Layanan Publik'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Layanan Publik' ? 'bg-blue-500 text-white' : 'glass-card text-slate-400'}">🏛️️ Publik</button>
                        <button onclick="MapModule.currentFilter='Rekreasi'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Rekreasi' ? 'bg-green-500 text-slate-950' : 'glass-card text-slate-400'}">🌳 Rekreasi</button>
                        <button onclick="MapModule.currentFilter='Entertainment'; openApp('citymap');" class="px-3.5 py-1.5 rounded-xl shrink-0 ${this.currentFilter==='Entertainment' ? 'bg-purple-500 text-white' : 'glass-card text-slate-400'}">🎰 Hiburan</button>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between items-center text-xs font-bold text-slate-300">
                        <span>📍 Destinasi Terdekat (${filtered.length})</span>
                    </div>
                    <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                        ${placesHtml}
                    </div>
                </div>
            </div>
        `;
    },

    openLocationDetail(locId) {
        this.ensureState();
        const locations = this.getLocationsList();
        const loc = locations.find(l => l.id === locId) || locations[0];
        const currentLocId = window.gameState.map.currentLocId;
        const currentLoc = locations.find(l => l.id === currentLocId) || locations[1];

        const isArrived = (currentLocId === loc.id);
        const isOpen = this.isLocationOpen(loc);

        const body = document.getElementById('app-window-body');
        const title = document.getElementById('app-window-title');
        if (!body || !title) return;

        title.textContent = loc.name;

        const distKm = this.calculateDistance(currentLoc, loc);
        const walkMin = this.calculateTravelTime(distKm, 'walk');
        const bikeMin = this.calculateTravelTime(distKm, 'bike');
        const carMin = this.calculateTravelTime(distKm, 'car');

        let npcHtml = '';
        if (loc.npc) {
            npcHtml = `
                <div class="glass-card p-3 rounded-2xl border border-amber-500/30 flex items-center gap-3 bg-amber-950/20">
                    <div class="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg border border-amber-500/40 shrink-0">
                        <i class="fa-solid fa-user-tie"></i>
                    </div>
                    <div>
                        <h6 class="text-[10px] font-bold text-amber-300 uppercase">${loc.npc.name} (${loc.npc.role})</h6>
                        <p class="text-[10px] text-slate-200 italic">"${loc.npc.dialog}"</p>
                    </div>
                </div>
            `;
        }

        // PERBAIKAN: LOKASI TUTUP / BELUM SAMPAI MENCONTROLLER AKTIVITAS
        let minigamesHtml = '';
        if (loc.minigames && loc.minigames.length > 0) {
            loc.minigames.forEach(mgKey => {
                const spec = this.MINIGAME_REGISTRY[mgKey];
                if (spec) {
                    const isDisabled = !isArrived || !isOpen;
                    let lockReason = '';
                    if (!isArrived) lockReason = '🔒 Belum Sampai';
                    else if (!isOpen) lockReason = '🔒 Tempat Tutup';

                    minigamesHtml += `
                        <button ${isDisabled ? 'disabled' : ''} onclick="MapModule.executeMiniGame('${mgKey}', '${loc.id}')" 
                                class="w-full p-3 glass-card ${isDisabled ? 'opacity-40 cursor-not-allowed border-slate-700' : 'hover:border-amber-400 active:scale-95'} text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between transition-all">
                            <span class="flex items-center gap-2">
                                <i class="fa-solid ${spec.icon} text-amber-300 text-sm"></i> ${spec.title}
                            </span>
                            <span class="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono font-bold">
                                ${isDisabled ? lockReason : (spec.fee > 0 ? spec.fee.toLocaleString() + ' C' : 'GRATIS')}
                            </span>
                        </button>
                    `;
                }
            });
        }

        let itemsHtml = '';
        if (loc.items && loc.items.length > 0) {
            loc.items.forEach(itemId => {
                const itemSpec = (window.ITEMS_DATABASE || []).find(i => i.id === itemId) || this.ITEM_CATALOG_DB[itemId] || { id: itemId, name: 'Barang Toko', price: 500, desc: 'Barang kebutuhan warga' };
                const isDisabled = !isArrived || !isOpen;
                let lockReason = !isArrived ? '🔒 Belum Sampai' : '🔒 Tutup';

                itemsHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs border border-white/5">
                        <div>
                            <h5 class="font-bold text-white text-[11px]">${itemSpec.name}</h5>
                            <p class="text-[9px] text-slate-400">${itemSpec.desc} • <span class="text-sky-300 font-bold">${itemSpec.price.toLocaleString()} C</span></p>
                        </div>
                        <button ${isDisabled ? 'disabled' : ''} onclick="EconomyModule.buyItem('${itemSpec.id}', '${loc.id}')" 
                                class="px-3 py-1.5 ${isDisabled ? 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'} font-bold text-[10px] rounded-xl shadow-md transition-all">
                            ${isDisabled ? lockReason : 'Beli'}
                        </button>
                    </div>
                `;
            });
        }

        body.innerHTML = `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-white/20 space-y-2 bg-gradient-to-br ${loc.color || 'from-slate-800 to-slate-900'} shadow-xl">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-lg shrink-0">
                            <i class="fa-solid ${loc.iconFa || 'fa-location-dot'}"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-white">${loc.name}</h3>
                            <span class="text-[9px] text-amber-300 font-mono font-bold uppercase tracking-wider">${loc.district} · ${loc.address}</span>
                            <p class="text-[10px] text-slate-200 pt-0.5 leading-tight opacity-90">${loc.desc}</p>
                            <p class="text-[9px] pt-1 font-bold ${isOpen ? 'text-emerald-300' : 'text-rose-400'}">
                                Status: ${isOpen ? '🟢 Buka' : '🔴 Tutup (Jam Operasional: ' + loc.openHours.open + ':00 - ' + loc.openHours.close + ':00)'}
                            </p>
                        </div>
                    </div>
                </div>

                ${!isArrived ? `
                    <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[10px] text-amber-300 font-semibold flex items-center gap-2">
                        <i class="fa-solid fa-lock text-sm shrink-0"></i>
                        <span>Kamu belum berada di lokasi ini. Gunakan tombol navigasi di bawah untuk bepergian ke lokasi ini terlebih dahulu.</span>
                    </div>
                ` : `
                    <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-[10px] text-emerald-300 font-bold flex items-center gap-2">
                        <i class="fa-solid fa-circle-check text-sm shrink-0"></i>
                        <span>Kamu sedang berada di lokasi ini. Semua layanan toko & ujian aktif!</span>
                    </div>
                `}

                <div class="glass-card p-3 rounded-2xl space-y-2 border border-sky-500/30">
                    <div class="flex items-center justify-between text-xs font-bold text-white">
                        <span>🗺️ Navigasi Perjalanan Ke Lokasi Ini</span>
                        <span class="text-sky-400 font-mono">${distKm} km</span>
                    </div>

                    <div class="grid grid-cols-3 gap-2 pt-1">
                        <button onclick="MapModule.startNavigation('${loc.id}', 'walk')" class="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded-xl border border-white/10 flex flex-col items-center justify-center transition-all active:scale-95">
                            <span>🚶 Jalan Kaki</span>
                            <span class="text-[8px] text-sky-300 font-mono">${walkMin} mnt</span>
                        </button>
                        <button onclick="MapModule.startNavigation('${loc.id}', 'bike')" class="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded-xl border border-white/10 flex flex-col items-center justify-center transition-all active:scale-95">
                            <span>🚲 Sepeda / Motor</span>
                            <span class="text-[8px] text-sky-300 font-mono">${bikeMin} mnt</span>
                        </button>
                        <button onclick="MapModule.startNavigation('${loc.id}', 'car')" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-xl shadow-lg flex flex-col items-center justify-center transition-all active:scale-95">
                            <span>🚗 Naik Mobil</span>
                            <span class="text-[8px] text-white font-mono font-bold">${carMin} mnt</span>
                        </button>
                    </div>
                </div>

                ${npcHtml}

                ${minigamesHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fa-solid fa-award"></i> Layanan Ujian & Aktivitas
                        </h4>
                        <div class="space-y-2">${minigamesHtml}</div>
                    </div>
                ` : ''}

                ${itemsHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">🛍️ Katalog Toko & Barang</h4>
                        <div class="space-y-2">${itemsHtml}</div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    executeMiniGame(key, locId) {
        const spec = this.MINIGAME_REGISTRY[key];
        if (!spec) return;

        if (typeof this[spec.handler] === 'function') {
            this[spec.handler](...spec.args, locId);
        }
    },

    startCertExam(certType, locId) {
        const body = document.getElementById('app-window-body');
        if (!body) return;

        const EXAM_BANKS = {
            law: {
                title: 'UJIAN SERTIFIKASI HUKUM & ADVOKAT',
                certName: 'Sertifikat Hukum',
                fee: 2500,
                questions: [
                    { q: 'Dokumen tertulis resmi pemerintah yang menjadi bukti identitas tunggal warga adalah?', options: ['A. KTP / NIK Resmi', 'B. Nota Minimarket', 'C. Struk Parkir'], correct: 0 },
                    { q: 'Asal-usul hukum tertinggi yang mengatur tata tertib dan hak warga negara adalah?', options: ['A. Undang-Undang Dasar', 'B. Janji Lisan', 'C. Peraturan Toko'], correct: 0 }
                ]
            },
            med: {
                title: 'UJIAN IZIN PRAKTEK MEDIS (DOKTER)',
                certName: 'Izin Praktek Medis',
                fee: 3000,
                questions: [
                    { q: 'Tindakan pertolongan pertama pada pasien pingsan karena Vitality 0% adalah?', options: ['A. Penanganan Darurat IGD & Medkit', 'B. Dibiarkan di trotoar', 'C. Diberi sanksi tilang'], correct: 0 }
                ]
            },
            it: {
                title: 'UJIAN SERTIFIKASI IT & CYBER SECURITY',
                certName: 'Sertifikat IT & Cyber',
                fee: 2000,
                questions: [
                    { q: 'Bahasa pemrograman gaya UI yang digunakan pada arsitektur web modern adalah?', options: ['A. CSS / Tailwind CSS', 'B. Karburator', 'C. Oli Mesin'], correct: 0 }
                ]
            },
            security_pratama: {
                title: 'UJIAN KUALIFIKASI SECURITY PRATAMA',
                certName: 'Sertifikat Security Pratama',
                fee: 1500,
                questions: [
                    { q: 'Tugas dasar seorang satuan pengamanan tingkat pratama di area komersial?', options: ['A. Melakukan patroli pos & menyambut tamu', 'B. Menutup seluruh kota', 'C. Mengabaikan laporan'], correct: 0 }
                ]
            },
            security_utama: {
                title: 'UJIAN KUALIFIKASI SECURITY UTAMA (LANJUTAN)',
                certName: 'Sertifikat Security Utama',
                fee: 2500,
                prerequisite: 'Sertifikat Security Pratama',
                questions: [
                    { q: 'Tindakan mitigasi lanjutan saat terjadi ancaman keamanan level tinggi di gedung?', options: ['A. Koordinasi pengamanan internal & hubungi 911 Polres', 'B. Sembunyikan kunci', 'C. Lari meninggalkan lokasi'], correct: 0 }
                ]
            }
        };

        const bank = EXAM_BANKS[certType] || EXAM_BANKS.law;

        // Cek prasyarat sertifikat bertingkat
        if (bank.prerequisite) {
            const hasPrereq = window.gameState.user?.legal?.licenses?.includes(bank.prerequisite);
            if (!hasPrereq) {
                if (typeof showToast === 'function') showToast(`Membutuhkan ${bank.prerequisite} terlebih dahulu!`, 'error');
                return;
            }
        }

        if (window.EconomyModule && typeof window.EconomyModule.pay === 'function') {
            const paid = window.EconomyModule.pay({
                amount: bank.fee,
                merchant: 'LSK Pusat Sertifikasi',
                description: `Pendaftaran Ujian ${bank.certName}`
            });
            if (!paid) return;
        }

        let currentQ = 0;
        let score = 0;

        const renderQuestion = () => {
            const qObj = bank.questions[currentQ];
            let optionsHtml = '';

            qObj.options.forEach((optText, idx) => {
                optionsHtml += `
                    <button onclick="window.handleExamAns(${idx === qObj.correct})" class="w-full p-3 glass-card rounded-xl text-xs text-left font-bold text-white hover:border-emerald-400 transition-all active:scale-95">
                        ${optText}
                    </button>
                `;
            });

            body.innerHTML = `
                <div class="glass-ios p-5 rounded-3xl border border-emerald-500/40 space-y-4 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
                    <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <h4 class="text-xs font-bold text-emerald-300 uppercase">${bank.title}</h4>
                        <span class="text-[9px] font-mono text-amber-300 font-bold">Soal ${currentQ + 1}/${bank.questions.length}</span>
                    </div>

                    <div class="space-y-3">
                        <p class="text-xs font-bold text-white leading-relaxed">${qObj.q}</p>
                        <div class="space-y-2 pt-1">${optionsHtml}</div>
                    </div>
                </div>
            `;
        };

        window.handleExamAns = (isCorrect) => {
            if (isCorrect) score += 100 / bank.questions.length;
            currentQ++;

            if (currentQ < bank.questions.length) {
                renderQuestion();
            } else {
                delete window.handleExamAns;
                const passed = score >= 70;

                if (passed) {
                    if (!window.gameState.user) window.gameState.user = {};
                    if (!window.gameState.user.legal) window.gameState.user.legal = { licenses: [] };
                    if (!window.gameState.user.legal.licenses.includes(bank.certName)) {
                        window.gameState.user.legal.licenses.push(bank.certName);
                    }

                    if (typeof window.saveState === 'function') window.saveState();
                    if (typeof playAudioSfx === 'function') playAudioSfx('unlock');
                    if (typeof showToast === 'function') showToast(`LULUS UJIAN (${Math.round(score)}%)! ${bank.certName} Terbit!`, 'success');
                } else {
                    if (typeof showToast === 'function') showToast(`GAGAL UJIAN (${Math.round(score)}%). Minimal kelulusan 70%.`, 'error');
                }

                this.openLocationDetail(locId);
            }
        };

        renderQuestion();
    },

    startFishingGame(locId) {
        if ((window.gameState?.vitality || 0) < 5) {
            if (typeof showToast === 'function') showToast('Vitality kurang buat mancing!', 'error');
            return;
        }

        const body = document.getElementById('app-window-body');
        if (!body) return;

        body.innerHTML = `
            <div class="glass-ios p-5 rounded-3xl border border-emerald-500/40 text-center space-y-4 bg-gradient-to-br from-slate-900 to-teal-950">
                <div class="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto text-3xl border border-teal-400/40 animate-bounce">
                    <i class="fa-solid fa-fish"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-white">DANAU MANCING MANIA</h3>
                    <p class="text-[10px] text-slate-300">Tarik kail tepat saat umpan dimakan ikan!</p>
                </div>

                <div id="fish-status-area" class="py-4 glass-card rounded-2xl border border-white/10 space-y-2">
                    <p id="fish-prompt-text" class="text-xs font-bold text-amber-300">Melempar kail ke danau...</p>
                    <div class="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <div id="fish-progress-bar" class="bg-teal-400 h-full rounded-full transition-all duration-300 w-0"></div>
                    </div>
                </div>

                <button id="btn-pull-fish" onclick="MapModule.pullFishHook('${locId}')" disabled class="w-full py-3 bg-slate-700 text-slate-400 font-bold text-xs rounded-xl shadow-lg transition-all">
                    Tunggu Umpan Dimakan...
                </button>
            </div>
        `;

        setTimeout(() => {
            const bar = document.getElementById('fish-progress-bar');
            const text = document.getElementById('fish-prompt-text');
            const btn = document.getElementById('btn-pull-fish');

            if (bar && text && btn) {
                bar.style.width = '100%';
                text.textContent = '🚨 IKAN MENGGIGIT! TARIK SEKARANG!';
                text.className = 'text-xs font-extrabold text-rose-400 animate-pulse';
                btn.disabled = false;
                btn.className = 'w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg animate-bounce transition-all';
                btn.textContent = '🎣 TARIK KAIL SEKARANG!';
            }
        }, 2000);
    },

    pullFishHook(locId) {
        window.gameState.vitality = Math.max(0, (window.gameState.vitality || 100) - 5);

        const fishList = [
            { name: 'Ikan Lele Lokal', rewardCrest: 600 },
            { name: 'Ikan Nila Merah', rewardCrest: 900 },
            { name: 'Ikan Gurame Emas (Rare)', rewardCrest: 2500 }
        ];

        const caught = fishList[Math.floor(Math.random() * fishList.length)];

        if (window.EconomyModule && typeof window.EconomyModule.addIncome === 'function') {
            window.EconomyModule.addIncome({
                amount: caught.rewardCrest,
                source: 'Taman Danau Kota',
                description: `Hasil Jual ${caught.name}`
            });
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Dapat ${caught.name}! (+${caught.rewardCrest.toLocaleString()} C)`, 'success');

        this.openLocationDetail(locId);
    },

    startSpinWheel(locId) {
        if (window.EconomyModule && typeof window.EconomyModule.pay === 'function') {
            const paid = window.EconomyModule.pay({
                amount: 500,
                merchant: 'Grand Spin Casino',
                description: 'Taruhan Spin Wheel'
            });
            if (!paid) return;
        }

        const rewards = [0, 200, 500, 1000, 2500, 5000];
        const prize = rewards[Math.floor(Math.random() * rewards.length)];

        if (prize > 0 && window.EconomyModule && typeof window.EconomyModule.addIncome === 'function') {
            window.EconomyModule.addIncome({
                amount: prize,
                source: 'Grand Spin Casino',
                description: 'Hadiah Jackpot Spin Wheel'
            });
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (prize > 500) {
            if (typeof playAudioSfx === 'function') playAudioSfx('cash');
            if (typeof showToast === 'function') showToast(`JACKPOT! Menang ${prize.toLocaleString()} C`, 'success');
        } else {
            if (typeof showToast === 'function') showToast(`Dapat ${prize.toLocaleString()} C`, 'info');
        }

        this.openLocationDetail(locId);
    },

    startBaristaGame(locId) {
        const body = document.getElementById('app-window-body');
        if (!body) return;

        body.innerHTML = `
            <div class="glass-ios p-4 rounded-3xl border border-amber-500/40 text-center space-y-3 bg-gradient-to-br from-slate-900 to-amber-950">
                <h4 class="text-xs font-bold text-amber-300 uppercase">☕ RACIK ESPRESSO SPECIAL</h4>
                <p class="text-[10px] text-slate-300">Pilih racikan kopi terbaik untuk pengunjung bistro!</p>

                <div class="grid grid-cols-2 gap-2 pt-2">
                    <button onclick="MapModule.finishCoffeeRecipe(1, '${locId}')" class="p-3 glass-card rounded-2xl text-xs font-bold text-white hover:border-amber-400 active:scale-95">
                        ☕ Espresso + Susu Murni
                    </button>
                    <button onclick="MapModule.finishCoffeeRecipe(2, '${locId}')" class="p-3 glass-card rounded-2xl text-xs font-bold text-white hover:border-amber-400 active:scale-95">
                        🧊 Ice Caramel Macchiato
                    </button>
                </div>
            </div>
        `;
    },

    finishCoffeeRecipe(type, locId) {
        const rewardCrest = type === 1 ? 800 : 1200;

        if (window.EconomyModule && typeof window.EconomyModule.addIncome === 'function') {
            window.EconomyModule.addIncome({
                amount: rewardCrest,
                source: 'Ignatius Coffee',
                description: 'Honor Racik Barista'
            });
        }

        window.gameState.vitality = Math.min(100, (window.gameState.vitality || 0) + 15);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Kopi sukses diracik! (+${rewardCrest} C, +15% Vit)`, 'success');

        this.openLocationDetail(locId);
    },

    startShootingRange(locId) {
        if ((window.gameState?.vitality || 0) < 10) {
            if (typeof showToast === 'function') showToast('Vitality tidak cukup!', 'error');
            return;
        }

        window.gameState.vitality -= 10;
        if (!window.gameState.jobState) window.gameState.jobState = {};
        window.gameState.jobState.jobXp = (window.gameState.jobState.jobXp || 0) + 30;

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast('Selesai Latihan Menembak! (+30 XP Karir)', 'success');

        this.openLocationDetail(locId);
    },

    // UJIAN SIM DIPISAH SIM C DAN SIM A DENGAN BIAYA & VALIDASI
    startSimQuiz(simType, locId) {
        const body = document.getElementById('app-window-body');
        if (!body) return;

        const isCar = simType === 'A';
        const licenseName = isCar ? 'SIM A (Mobil)' : 'SIM C (Motor)';
        const fee = isCar ? 1500 : 1000;

        if (window.EconomyModule && typeof window.EconomyModule.pay === 'function') {
            const paid = window.EconomyModule.pay({
                amount: fee,
                merchant: 'Polres Lantas',
                description: `Biaya Pendaftaran ${licenseName}`
            });
            if (!paid) return;
        }

        body.innerHTML = `
            <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-3 bg-gradient-to-br from-slate-900 to-sky-950">
                <div class="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 class="text-xs font-bold text-sky-300 uppercase">📝 UJIAN TEORI ${licenseName}</h4>
                </div>

                <div class="space-y-2">
                    <p class="text-xs font-bold text-white leading-relaxed">
                        ${isCar ? 'Batas kecepatan maksimal di dalam kawasan padat permukiman kota adalah?' : 'Warna lampu lalu lintas yang menandakan kendaraan wajib berhenti adalah?'}
                    </p>
                    <div class="space-y-1.5 pt-1">
                        <button onclick="MapModule.answerSimQuiz(true, '${simType}', '${locId}')" class="w-full p-2.5 glass-card rounded-xl text-xs text-left font-bold text-white hover:border-sky-400">
                            ${isCar ? 'A. 40 km/jam' : 'A. Merah'}
                        </button>
                        <button onclick="MapModule.answerSimQuiz(false, '${simType}', '${locId}')" class="w-full p-2.5 glass-card rounded-xl text-xs text-left font-bold text-slate-300 hover:border-sky-400">
                            ${isCar ? 'B. 180 km/jam' : 'B. Hijau Klakson'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    answerSimQuiz(isCorrect, simType, locId) {
        const licenseName = simType === 'A' ? 'SIM A (Mobil)' : 'SIM C (Motor)';
        if (isCorrect) {
            if (!window.gameState.user) window.gameState.user = {};
            if (!window.gameState.user.legal) window.gameState.user.legal = { licenses: [] };
            if (!window.gameState.user.legal.licenses.includes(licenseName)) {
                window.gameState.user.legal.licenses.push(licenseName);
            }
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof playAudioSfx === 'function') playAudioSfx('unlock');
            if (typeof showToast === 'function') showToast(`SELAMAT! ${licenseName} Resmi Terbit!`, 'success');
        } else {
            if (typeof showToast === 'function') showToast('Jawaban salah! Ujian Gagal.', 'error');
        }

        this.openLocationDetail(locId);
    }
};

MapModule.ensureState();
window.MapModule = MapModule;
