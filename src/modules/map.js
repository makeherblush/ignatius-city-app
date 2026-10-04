// ==========================================
// ENGINE PETA INTERAKTIF & MINI-GAMES (MAP.JS)
// ==========================================

const MapModule = {
    currentViewMode: 'grid', // 'grid' atau 'list'

    // --- 1. DATABASE LOKASI & DESTINASI KOTA LENGKAP ---
    getLocationsList() {
        if (window.LOCATIONS_DATABASE && Array.isArray(window.LOCATIONS_DATABASE) && window.LOCATIONS_DATABASE.length >= 10) {
            return window.LOCATIONS_DATABASE;
        }

        return [
            {
                id: 'loc_cert_center',
                name: 'Gedung Pusat Sertifikasi (LSK)',
                category: 'Pendidikan & Profesi',
                desc: 'Tempat pengajuan & ujian sertifikasi resmi (Hukum, Medis, IT, Akuntan, Security).',
                iconFa: 'fa-graduation-cap',
                color: 'from-emerald-600 to-teal-900',
                npc: { name: 'Prof. Supriadi (Kepala LSK Kota)', dialog: 'Selamat datang! Ambil ujian sertifikasi di sini untuk memenuhi syarat melamar pekerjaan bergelar.' },
                licenses: ['Sertifikat Hukum', 'Izin Praktek Medis', 'Sertifikat IT & Cyber', 'Sertifikat Akuntan Publik', 'Sertifikat Security Utama'],
                minigames: ['cert_exam_law', 'cert_exam_med', 'cert_exam_it', 'cert_exam_security']
            },
            {
                id: 'loc_capil',
                name: 'Kantor Dukcapil Central',
                category: 'Layanan Publik',
                desc: 'Pusat integrasi KTP Digital, KK, Pernikahan, & Legalitas Warga.',
                iconFa: 'fa-landmark',
                color: 'from-sky-600 to-blue-800',
                npc: { name: 'Pak Budi (Petugas Capil)', dialog: 'Halo warga! Pastikan data KK dan KTP kamu selalu terbarukan ya.' },
                licenses: ['SIM A (Mobil)', 'SIM C (Motor)'],
                items: []
            },
            {
                id: 'loc_polres',
                name: 'Polres Patrolex Ignatius',
                category: 'Keamanan & Lantas',
                desc: 'Markas kepolisian, tempat pendaftaran SIM, & arena tes menembak.',
                iconFa: 'fa-shield-halved',
                color: 'from-indigo-600 to-slate-900',
                npc: { name: 'Apt. Roy (Kanit Lantas)', dialog: 'Selalu patuhi rambu lalu lintas dan gunakan helm saat berkendara!' },
                licenses: ['SIM A (Mobil)', 'SIM C (Motor)', 'Sertifikat Security Pratama', 'Izin Senjata Api'],
                minigames: ['sim_quiz', 'shooting_range']
            },
            {
                id: 'loc_hospital',
                name: 'RSUD Medika Utama',
                category: 'Kesehatan IGD',
                desc: 'Pusat penanganan pasien darurat, konsultasi dokter, & apotek.',
                iconFa: 'fa-hospital',
                color: 'from-rose-600 to-red-900',
                npc: { name: 'dr. Sarah (Spesialis IGD)', dialog: 'Jaga Vitality kamu! Jangan biarkan tubuh terlalu lelah saat bekerja.' },
                items: ['item_medkit', 'item_bandage']
            },
            {
                id: 'loc_minimarket',
                name: 'Minimarket 24/7 Serba Ada',
                category: 'Perbelanjaan',
                desc: 'Toko kelontong modern menyediakan makanan, minuman, & obat.',
                iconFa: 'fa-basket-shopping',
                color: 'from-amber-500 to-amber-700',
                npc: { name: 'Mbak Maya (Kasir)', dialog: 'Selamat datang! Jangan lupa cek promo makanan hari ini ya.' },
                items: ['item_bread', 'item_water', 'item_coffee', 'item_energy_drink']
            },
            {
                id: 'loc_park',
                name: 'Taman Kota Rindang',
                category: 'Area Rekreasi',
                desc: 'Danau santai untuk memancing ikan langka & memulihkan Stamina.',
                iconFa: 'fa-tree',
                color: 'from-emerald-600 to-teal-800',
                npc: { name: 'Pak Karto (Pemancing Mania)', dialog: 'Umpan racikan jagung sangat disukai ikan Gurame Emas di sini!' },
                minigames: ['fishing_game']
            },
            {
                id: 'loc_cafe',
                name: 'Ignatius Coffee & Bistro',
                category: 'Tempat Nongkrong',
                desc: 'Nikmati sajian kopi racikan barista & camilan lezat.',
                iconFa: 'fa-mug-hot',
                color: 'from-amber-800 to-amber-950',
                npc: { name: 'Rian (Master Barista)', dialog: 'Espresso panas dikombinasikan dengan susu murni bikin mood kamu balik lagi.' },
                items: ['item_coffee', 'item_sandwich'],
                minigames: ['barista_game']
            },
            {
                id: 'loc_casino',
                name: 'Arena Hiburan & Spin Luck',
                category: 'Hiburan Malam',
                desc: 'Uji keberuntunganmu memutar Roda Jackpot untuk dapatkan Crest.',
                iconFa: 'fa-dice',
                color: 'from-purple-600 to-slate-950',
                npc: { name: 'Jack (Dealer Kasino)', dialog: 'Satu putaran roda bisa mengubah hidupmu jadi jutawan hari ini!' },
                minigames: ['spin_wheel']
            },
            {
                id: 'loc_dealer',
                name: 'Showroom Otomotif GT',
                category: 'Dealer Kendaraan',
                desc: 'Pusat jual beli mobil sport, motor matic, & garasi impian.',
                iconFa: 'fa-car',
                color: 'from-cyan-600 to-blue-900',
                npc: { name: 'Sales Kevyn', dialog: 'Mobil Sport GT di pameran ini punya kecepatan tinggi dan handling stabil!' },
                items: ['item_car_1', 'item_bike_1']
            },
            {
                id: 'loc_bank',
                name: 'Gedung Bank Central',
                category: 'Keuangan',
                desc: 'Layanan deposito tabungan berbunga 5% & investasi simpanan.',
                iconFa: 'fa-building-columns',
                color: 'from-yellow-600 to-amber-900',
                npc: { name: 'Teller Anisa', dialog: 'Tabungan di Bank Central dijamin aman dan berbunga tiap jam shift.' }
            }
        ];
    },

    // --- 2. SWITCH VIEW MODE (GRID vs LIST) ---
    toggleViewMode(mode) {
        this.currentViewMode = mode;
        if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
        if (typeof openApp === 'function') openApp('citymap');
    },

    // --- 3. RENDER MAIN MAP UI ---
    renderMapUI() {
        const locations = this.getLocationsList();
        let locationsHtml = '';

        if (this.currentViewMode === 'grid') {
            locationsHtml = `<div class="grid grid-cols-2 gap-2.5">`;
            locations.forEach(loc => {
                const hasGame = loc.minigames && loc.minigames.length > 0;
                locationsHtml += `
                    <div onclick="MapModule.openLocationDetail('${loc.id}')" class="group relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br ${loc.color || 'from-slate-800 to-slate-900'} border border-white/15 hover:border-sky-400/80 shadow-lg cursor-pointer transition-all transform active:scale-95 flex flex-col justify-between h-32">
                        <div class="flex justify-between items-start">
                            <div class="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-base shadow-sm">
                                <i class="fa-solid ${loc.iconFa || 'fa-location-dot'}"></i>
                            </div>
                            ${hasGame ? '<span class="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-extrabold text-[7px] rounded-md shadow-md animate-pulse">🎮 UJIAN / GAME</span>' : ''}
                        </div>

                        <div>
                            <span class="text-[8px] text-slate-200 uppercase font-mono font-bold block opacity-80">${loc.category}</span>
                            <h5 class="text-xs font-bold text-white leading-snug drop-shadow">${loc.name}</h5>
                        </div>
                    </div>
                `;
            });
            locationsHtml += `</div>`;
        } else {
            locations.forEach(loc => {
                const hasGame = loc.minigames && loc.minigames.length > 0;
                locationsHtml += `
                    <div onclick="MapModule.openLocationDetail('${loc.id}')" class="glass-card p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-sky-400/50 transition-all">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${loc.color || 'from-sky-600 to-blue-800'} flex items-center justify-center text-white text-lg shadow-md shrink-0">
                                <i class="fa-solid ${loc.iconFa || 'fa-location-dot'}"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-1.5">
                                    <h5 class="text-xs font-bold text-white">${loc.name}</h5>
                                    ${hasGame ? '<span class="px-1 py-0.2 bg-amber-400 text-slate-950 text-[7px] font-bold rounded">UJIAN</span>' : ''}
                                </div>
                                <p class="text-[10px] text-slate-400 leading-tight truncate max-w-[180px]">${loc.desc}</p>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-xs text-slate-500"></i>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-map-location-dot text-sky-400 text-base"></i>
                            <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider">NAVIGASI PETA KOTA</h4>
                        </div>
                        
                        <div class="flex bg-slate-900/80 p-0.5 rounded-xl border border-white/10 text-[9px]">
                            <button onclick="MapModule.toggleViewMode('grid')" class="px-2 py-1 rounded-lg font-bold ${this.currentViewMode === 'grid' ? 'bg-sky-500 text-white' : 'text-slate-400'}">Grid</button>
                            <button onclick="MapModule.toggleViewMode('list')" class="px-2 py-1 rounded-lg font-bold ${this.currentViewMode === 'list' ? 'bg-sky-500 text-white' : 'text-slate-400'}">List</button>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-300">Pilih lokasi di peta untuk berbelanja, mengurus sertifikat profesi, bicara dengan NPC, atau bermain Mini-Games.</p>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">📍 Destinasi Kota (${locations.length})</h4>
                    <div class="max-h-80 overflow-y-auto pr-1">
                        ${locationsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    // --- 4. DETAIL LOKASI & FITUR SERTIFIKASI ---
    openLocationDetail(locId) {
        const locations = this.getLocationsList();
        let loc = locations.find(l => l.id === locId) || locations[0];

        const body = document.getElementById('app-window-body');
        const title = document.getElementById('app-window-title');
        if (!body || !title) return;

        title.textContent = loc.name;

        // NPC Dialog
        let npcHtml = '';
        if (loc.npc) {
            npcHtml = `
                <div class="glass-card p-3 rounded-2xl border border-amber-500/30 flex items-center gap-3 bg-amber-950/20">
                    <div class="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg border border-amber-500/40 shrink-0">
                        <i class="fa-solid fa-user-graduate"></i>
                    </div>
                    <div>
                        <h6 class="text-[10px] font-bold text-amber-300 uppercase">${loc.npc.name}</h6>
                        <p class="text-[10px] text-slate-200 italic">"${loc.npc.dialog}"</p>
                    </div>
                </div>
            `;
        }

        // Mini Games & Cert Exams Triggers
        let miniGamesHtml = '';
        if (loc.minigames && loc.minigames.length > 0) {
            loc.minigames.forEach(mg => {
                if (mg === 'cert_exam_law') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startCertExam('law', '${loc.id}')" class="w-full p-3 bg-gradient-to-r from-amber-600 to-yellow-800 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-gavel text-amber-300 text-sm"></i> ⚖️ Ujian Sertifikasi Hukum (Pengacara)</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">2.500 C</span>
                        </button>
                    `;
                } else if (mg === 'cert_exam_med') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startCertExam('med', '${loc.id}')" class="w-full p-3 bg-gradient-to-r from-rose-600 to-red-800 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-stethoscope text-amber-300 text-sm"></i> 🩺 Ujian Izin Praktek Medis (Dokter)</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">3.000 C</span>
                        </button>
                    `;
                } else if (mg === 'cert_exam_it') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startCertExam('it', '${loc.id}')" class="w-full p-3 bg-gradient-to-r from-cyan-600 to-blue-800 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-code text-amber-300 text-sm"></i> 💻 Ujian Sertifikasi IT & Cyber</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">2.000 C</span>
                        </button>
                    `;
                } else if (mg === 'cert_exam_security') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startCertExam('security', '${loc.id}')" class="w-full p-3 bg-gradient-to-r from-indigo-600 to-slate-800 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-user-shield text-amber-300 text-sm"></i> 🛡️ Ujian Sertifikat Security Utama</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">1.800 C</span>
                        </button>
                    `;
                } else if (mg === 'fishing_game') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startFishingGame('${loc.id}')" class="w-full p-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-fish text-amber-300 text-sm"></i> 🎣 Mancing Mania</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">Bonus Crest</span>
                        </button>
                    `;
                } else if (mg === 'spin_wheel') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startSpinWheel('${loc.id}')" class="w-full p-3 bg-gradient-to-r from-purple-600 to-indigo-800 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-arrows-spin text-amber-300 text-sm"></i> 🎰 Roda Jackpot Kasino</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">500 C</span>
                        </button>
                    `;
                } else if (mg === 'barista_game') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startBaristaGame('${loc.id}')" class="w-full p-3 bg-gradient-to-r from-amber-700 to-yellow-900 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-mug-hot text-amber-300 text-sm"></i> ☕ Racik Kopi Bistro</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">+Vit & Crest</span>
                        </button>
                    `;
                } else if (mg === 'shooting_range') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startShootingRange('${loc.id}')" class="w-full p-3 bg-gradient-to-r from-indigo-700 to-slate-900 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-crosshair text-rose-400 text-sm"></i> 🎯 Latihan Menembak Target</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">+XP Karir</span>
                        </button>
                    `;
                } else if (mg === 'sim_quiz') {
                    miniGamesHtml += `
                        <button onclick="MapModule.startSimQuiz('${loc.id}')" class="w-full p-3 bg-gradient-to-r from-sky-600 to-blue-800 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between hover:brightness-110 transition-all">
                            <span class="flex items-center gap-2"><i class="fa-solid fa-file-pen text-amber-300 text-sm"></i> 📝 Ujian Teori SIM Motor & Mobil</span>
                            <span class="text-[9px] px-2 py-0.5 bg-black/30 rounded font-mono">Lulus = SIM</span>
                        </button>
                    `;
                }
            });
        }

        // Licenses Catalog
        let licensesHtml = '';
        if (loc.licenses && loc.licenses.length > 0) {
            loc.licenses.forEach(licId => {
                const owned = (window.gameState?.user?.legal?.licenses || []).includes(licId);
                licensesHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                            <h5 class="font-bold text-white text-[11px]">${licId}</h5>
                            <span class="text-[9px] text-slate-400 font-mono">2.000 C</span>
                        </div>
                        ${owned ? `
                            <span class="text-[9px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/20 rounded border border-emerald-500/30">Lulus / Dimiliki</span>
                        ` : `
                            <button onclick="AdminModule.applyLicense('${licId}'); MapModule.openLocationDetail('${loc.id}');" class="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-lg shadow-md transition-all">
                                Penerbitan Langsung
                            </button>
                        `}
                    </div>
                `;
            });
        }

        // Items Catalog
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
                        <button onclick="EconomyModule.buyItem('${item.id}', '${loc.id}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg shadow-md transition-all">
                            Beli (${item.price.toLocaleString()} C)
                        </button>
                    </div>
                `;
            });
        }

        body.innerHTML = `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-white/20 space-y-2 bg-gradient-to-br ${loc.color || 'from-slate-800 to-slate-900'}">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-lg shrink-0">
                            <i class="fa-solid ${loc.iconFa || 'fa-location-dot'}"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-white">${loc.name}</h3>
                            <span class="text-[9px] text-amber-300 font-bold uppercase tracking-wider font-mono">${loc.category}</span>
                            <p class="text-[10px] text-slate-200 pt-0.5 leading-tight opacity-90">${loc.desc}</p>
                        </div>
                    </div>
                </div>

                ${npcHtml}

                ${miniGamesHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fa-solid fa-award"></i> Ujian Sertifikasi & Mini-Games
                        </h4>
                        <div class="space-y-2">${miniGamesHtml}</div>
                    </div>
                ` : ''}

                ${licensesHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">📜 Pengurusan Sertifikat & Dokumen</h4>
                        <div class="space-y-2">${licensesHtml}</div>
                    </div>
                ` : ''}

                ${itemsHtml ? `
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">🛍️ Toko & Perlengkapan</h4>
                        <div class="space-y-2">${itemsHtml}</div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // --- 5. LOGIKA UJIAN SERTIFIKASI PROFESI (LSK) ---
    startCertExam(certType, locId) {
        const body = document.getElementById('app-window-body');
        if (!body) return;

        let examTitle = '';
        let cost = 2000;
        let questionText = '';
        let certName = '';
        let options = [];

        if (certType === 'law') {
            examTitle = 'UJIAN SERTIFIKASI HUKUM & ADVOKAT';
            cost = 2500;
            certName = 'Sertifikat Hukum';
            questionText = 'Dokumen tertulis resmi yang diterbitkan pemerintah sebagai bukti identitas diri warga negara adalah?';
            options = [
                { text: 'A. KTP / NIK Resmi', isCorrect: true },
                { text: 'B. Nota Belanja Minimarket', isCorrect: false },
                { text: 'C. Tiket Parkir', isCorrect: false }
            ];
        } else if (certType === 'med') {
            examTitle = 'UJIAN IZIN PRAKTEK MEDIS (DOKTER)';
            cost = 3000;
            certName = 'Izin Praktek Medis';
            questionText = 'Langkah pertolongan pertama paling tepat saat menemui warga yang pingsan karena Vitality habis adalah?';
            options = [
                { text: 'A. Berikan konsumsi pemulih & pertolongan medis IGD', isCorrect: true },
                { text: 'B. Dibiarkan saja di pinggir jalan', isCorrect: false },
                { text: 'C. Ditilang di tempat', isCorrect: false }
            ];
        } else if (certType === 'it') {
            examTitle = 'UJIAN SERTIFIKASI SOFTWARE & CYBER';
            cost = 2000;
            certName = 'Sertifikat IT & Cyber';
            questionText = 'Dalam arsitektur web digital, bahasa yang digunakan untuk memberikan gaya tampilan UI glassmorphism adalah?';
            options = [
                { text: 'A. CSS / Tailwind CSS', isCorrect: true },
                { text: 'B. Bensin Pertamax', isCorrect: false },
                { text: 'C. Mesin Karburator', isCorrect: false }
            ];
        } else if (certType === 'security') {
            examTitle = 'UJIAN KUALIFIKASI SECURITY UTAMA';
            cost = 1800;
            certName = 'Sertifikat Security Utama';
            questionText = 'Tindakan utama petugas keamanan saat melihat potensi kejahatan di area publik adalah?';
            options = [
                { text: 'A. Amankan area & Lapor Polisi via Polres Hub 911', isCorrect: true },
                { text: 'B. Ikut berfoto bersama', isCorrect: false },
                { text: 'C. Tidur di pos ronda', isCorrect: false }
            ];
        }

        const currentCrest = window.gameState?.crest || 0;
        if (currentCrest < cost) {
            if (typeof showToast === 'function') showToast(`Saldo kurang! Biaya ujian ${cost.toLocaleString()} C`, 'error');
            return;
        }

        let optionsHtml = '';
        options.forEach(opt => {
            optionsHtml += `
                <button onclick="MapModule.answerCertExam(${opt.isCorrect}, '${certName}', ${cost}, '${locId}')" class="w-full p-3 glass-card rounded-xl text-xs text-left font-bold text-white hover:border-emerald-400 transition-all">
                    ${opt.text}
                </button>
            `;
        });

        body.innerHTML = `
            <div class="glass-ios p-5 rounded-3xl border border-emerald-500/40 space-y-4 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
                <div class="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 class="text-xs font-bold text-emerald-300 uppercase"><i class="fa-solid fa-graduation-cap mr-1"></i> ${examTitle}</h4>
                    <span class="text-[9px] font-mono text-amber-300 font-bold">Biaya: ${cost.toLocaleString()} C</span>
                </div>

                <div class="space-y-3">
                    <p class="text-xs font-bold text-white leading-relaxed">${questionText}</p>
                    <div class="space-y-2 pt-1">
                        ${optionsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    answerCertExam(isCorrect, certName, cost, locId) {
        if (isCorrect) {
            window.gameState.crest = (window.gameState.crest || 0) - cost;

            if (!window.gameState.user) window.gameState.user = {};
            if (!window.gameState.user.legal) window.gameState.user.legal = { licenses: [] };
            if (!Array.isArray(window.gameState.user.legal.licenses)) window.gameState.user.legal.licenses = [];

            if (!window.gameState.user.legal.licenses.includes(certName)) {
                window.gameState.user.legal.licenses.push(certName);
            }

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof playAudioSfx === 'function') playAudioSfx('unlock');
            if (typeof showToast === 'function') showToast(`LULUS UJIAN! ${certName} Resmi Terbit!`, 'success');
        } else {
            if (typeof showToast === 'function') showToast('Jawaban Salah! Kamu gagal ujian kali ini.', 'error');
        }

        this.openLocationDetail(locId);
    },

    // --- 6. LAIN-LAIN MINI GAMES ---
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
        window.gameState.crest = (window.gameState.crest || 0) + caught.rewardCrest;

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Dapat ${caught.name}! (+${caught.rewardCrest} C)`, 'success');

        this.openLocationDetail(locId);
    },

    startSpinWheel(locId) {
        const currentCrest = window.gameState?.crest || 0;
        if (currentCrest < 500) {
            if (typeof showToast === 'function') showToast('Saldo kurang! Butuh 500 C untuk spin.', 'error');
            return;
        }

        window.gameState.crest -= 500;

        const rewards = [0, 200, 500, 1000, 2500, 5000];
        const prize = rewards[Math.floor(Math.random() * rewards.length)];

        window.gameState.crest += prize;

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
                <p class="text-[10px] text-slate-300">Pilih kombinasi racikan kopi yang tepat!</p>

                <div class="grid grid-cols-2 gap-2 pt-2">
                    <button onclick="MapModule.finishCoffeeRecipe(1, '${locId}')" class="p-3 glass-card rounded-2xl text-xs font-bold text-white hover:border-amber-400">
                        ☕ Espresso + Susu Murni
                    </button>
                    <button onclick="MapModule.finishCoffeeRecipe(2, '${locId}')" class="p-3 glass-card rounded-2xl text-xs font-bold text-white hover:border-amber-400">
                        🧊 Ice Caramel Macchiato
                    </button>
                </div>
            </div>
        `;
    },

    finishCoffeeRecipe(type, locId) {
        const rewardCrest = type === 1 ? 800 : 1200;
        window.gameState.crest = (window.gameState.crest || 0) + rewardCrest;
        window.gameState.vitality = Math.min(100, (window.gameState.vitality || 0) + 15);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Kopi berhasil diracik! (+${rewardCrest} C, +15% Vit)`, 'success');

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

    startSimQuiz(locId) {
        const body = document.getElementById('app-window-body');
        if (!body) return;

        body.innerHTML = `
            <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-3 bg-gradient-to-br from-slate-900 to-sky-950">
                <div class="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 class="text-xs font-bold text-sky-300 uppercase">📝 UJIAN TEORI LANTAS KOTA</h4>
                </div>

                <div class="space-y-2">
                    <p class="text-xs font-bold text-white leading-relaxed">Warna lampu lalu lintas yang menandakan kendaraan wajib berhenti adalah?</p>
                    <div class="space-y-1.5 pt-1">
                        <button onclick="MapModule.answerSimQuiz(true, '${locId}')" class="w-full p-2.5 glass-card rounded-xl text-xs text-left font-bold text-white hover:border-sky-400">A. Merah</button>
                        <button onclick="MapModule.answerSimQuiz(false, '${locId}')" class="w-full p-2.5 glass-card rounded-xl text-xs text-left font-bold text-slate-300 hover:border-sky-400">B. Hijau Klakson</button>
                    </div>
                </div>
            </div>
        `;
    },

    answerSimQuiz(isCorrect, locId) {
        if (isCorrect) {
            if (!window.gameState.user) window.gameState.user = {};
            if (!window.gameState.user.legal) window.gameState.user.legal = { licenses: [] };
            if (!window.gameState.user.legal.licenses.includes('SIM C (Motor)')) {
                window.gameState.user.legal.licenses.push('SIM C (Motor)');
            }
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof playAudioSfx === 'function') playAudioSfx('unlock');
            if (typeof showToast === 'function') showToast('SELAMAT! SIM C Resmi Terbit!', 'success');
        } else {
            if (typeof showToast === 'function') showToast('Jawaban salah! Coba lagi.', 'error');
        }

        this.openLocationDetail(locId);
    }
};

window.MapModule = MapModule;
