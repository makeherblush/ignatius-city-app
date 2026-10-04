// ==========================================
// IGNATIUS CITY UNIFIED ONLINE OS ENGINE
// FILE: city_online_os_unified.js
// ==========================================

(function () {
    'use strict';

    // --- 1. SANITASI XSS & HELPER UTILITY ---
    const Utils = {
        escapeHTML(str) {
            if (!str || typeof str !== 'string') return str || '';
            return str.replace(/[&<>"']/g, function (m) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[m];
            });
        },

        generateId(prefix = 'ID') {
            return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        },

        getUserIdentity() {
            const user = window.gameState?.user?.identity || {};
            const nik = user.nik || window.gameState?.user?.nik || '3273010000000001';
            const fullName = user.fullName || user.name || 'Warga Ignatius';
            const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`;

            return { nik: String(nik).trim(), name: fullName, avatar };
        }
    };

    // --- 2. UNIFIED CITY STATE INITIALIZATION ---
    function initUnifiedCityState() {
        if (!window.cityState) window.cityState = {};

        const cs = window.cityState;

        if (!cs.users) cs.users = {};
        if (!cs.marketplace) cs.marketplace = { stores: {}, products: {}, orders: {} };
        if (!cs.serviceRequests) cs.serviceRequests = {};
        if (!cs.notifications) cs.notifications = {}; // userId -> array of notifications
        if (!cs.police) cs.police = { tickets: [], dpoList: [] };
        if (!cs.health) cs.health = { emergencyCalls: [] };
        if (!cs.bank) cs.bank = { accounts: {}, loans: [] };
        if (!cs.government) cs.government = { documents: [] };
        if (!cs.news) cs.news = { articles: [] };

        // Pre-fill Marketplace jika kosong
        if (Object.keys(cs.marketplace.stores).length === 0) {
            cs.marketplace.stores['store_official_1'] = {
                storeId: 'store_official_1',
                ownerId: 'user_official_auto',
                storeName: 'Igna Auto Motors',
                category: 'Otomotif & Kendaraan',
                status: 'open',
                income: 150000
            };
            cs.marketplace.stores['store_official_2'] = {
                storeId: 'store_official_2',
                ownerId: 'user_official_kuliner',
                storeName: 'Warung Kuliner Nusantara',
                category: 'Kuliner',
                status: 'open',
                income: 45000
            };

            cs.marketplace.products['prod_car_1'] = {
                productId: 'prod_car_1',
                storeId: 'store_official_1',
                sellerId: 'user_official_auto',
                name: 'Mobil Sport GT',
                price: 45000,
                type: 'vehicle',
                desc: 'Kendaraan mewah 4 roda',
                status: 'active'
            };
            cs.marketplace.products['prod_nasgor'] = {
                productId: 'prod_nasgor',
                storeId: 'store_official_2',
                sellerId: 'user_official_kuliner',
                name: 'Nasi Goreng Spesial',
                price: 1500,
                type: 'food',
                vitRestore: 30,
                desc: 'Pemulih vitality +30%',
                status: 'active'
            };
        }

        // Pre-fill News jika kosong
        if (cs.news.articles.length === 0) {
            cs.news.articles.push({
                id: 'NEWS-1',
                title: 'Pembangunan Infrastruktur Digital Kota Ignatius Resmi Beroperasi',
                author: 'Redaksi News',
                content: 'Seluruh sistem pelayanan warga kini terintegrasi secara otomatis via City OS.',
                createdAt: Date.now()
            });
        }
    }

    // --- 3. MULTIPLAYER ONLINE BUS ADAPTER ---
    const OnlineBus = {
        channel: null,

        init() {
            if (typeof window.BroadcastChannel !== 'undefined') {
                this.channel = new BroadcastChannel('ignatius_city_online_bus');
                this.channel.onmessage = (event) => {
                    this.handleIncomingEvent(event.data);
                };
            }
        },

        emit(eventType, payload) {
            const data = { eventType, payload, timestamp: Date.now() };
            if (this.channel) {
                this.channel.postMessage(data);
            }
        },

        handleIncomingEvent(data) {
            if (!data || !data.eventType) return;
            initUnifiedCityState();

            if (data.eventType === 'SERVICE_REQUEST_CREATED') {
                window.cityState.serviceRequests[data.payload.id] = data.payload;
                NotificationEngine.checkAndNotifyProviders(data.payload);
            } else if (data.eventType === 'SERVICE_REQUEST_UPDATED') {
                window.cityState.serviceRequests[data.payload.id] = data.payload;
            }

            if (typeof openApp === 'function' && window.gameState?.activeApp) {
                openApp(window.gameState.activeApp);
            }
        }
    };

    // --- 4. UNIVERSAL NOTIFICATION ENGINE ---
    const NotificationEngine = {
        send(targetNik, title, message, category = 'info', payload = null) {
            initUnifiedCityState();
            const cs = window.cityState;

            if (!cs.notifications[targetNik]) {
                cs.notifications[targetNik] = [];
            }

            const notif = {
                id: Utils.generateId('NOTIF'),
                title,
                message,
                category,
                payload,
                read: false,
                createdAt: Date.now()
            };

            cs.notifications[targetNik].unshift(notif);

            const me = Utils.getUserIdentity();
            if (me.nik === targetNik) {
                if (typeof window.showIOSNotification === 'function') {
                    window.showIOSNotification(title, message, 'City System', 'fa-bell');
                }
                if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
            }

            if (typeof window.saveState === 'function') window.saveState();
        },

        checkAndNotifyProviders(request) {
            const jobs = JobDatabase.getJobsList();
            const myUser = Utils.getUserIdentity();
            const myJobId = window.gameState?.jobState?.activeJobId;
            const myJob = jobs.find(j => j.id === myJobId);

            if (myJob && Array.isArray(myJob.permissions) && myJob.permissions.includes(request.providerPermission)) {
                if (myUser.nik !== request.requesterNik) {
                    this.send(
                        myUser.nik,
                        `🚨 Permintaan Baru: ${request.type}`,
                        `Dari NIK ${request.requesterName}: "${request.details}"`,
                        'emergency',
                        request
                    );
                }
            }
        },

        getUnreadCount(nik) {
            initUnifiedCityState();
            const list = window.cityState.notifications[nik] || [];
            return list.filter(n => !n.read).length;
        },

        markAllRead(nik) {
            initUnifiedCityState();
            const list = window.cityState.notifications[nik] || [];
            list.forEach(n => n.read = true);
            if (typeof window.saveState === 'function') window.saveState();
        }
    };

    // --- 5. UNIVERSAL SERVICE ENGINE ---
    const ServiceEngine = {
        createRequest({ service, type, providerPermission, details, fee = 0, payload = {} }) {
            initUnifiedCityState();
            const me = Utils.getUserIdentity();

            if (fee > 0) {
                const currentCrest = window.gameState?.crest || 0;
                if (currentCrest < fee) {
                    if (typeof showToast === 'function') showToast(`Saldo Crest kurang (${fee.toLocaleString()} C required)!`, 'error');
                    return null;
                }
                window.gameState.crest -= fee;
            }

            const reqId = Utils.generateId('REQ');
            const reqObj = {
                id: reqId,
                service,
                type,
                providerPermission,
                requesterNik: me.nik,
                requesterName: me.name,
                details,
                fee,
                status: 'WAITING', // WAITING, IN_PROGRESS, COMPLETED, CANCELLED
                assignedToNik: null,
                assignedToName: null,
                payload,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            window.cityState.serviceRequests[reqId] = reqObj;
            OnlineBus.emit('SERVICE_REQUEST_CREATED', reqObj);

            // Kirim Notifikasi ke Pemohon
            NotificationEngine.send(
                me.nik,
                '🔔 Permintaan Terkirim',
                `Permintaan ${service} [${type}] telah dikirim ke antrean petugas.`,
                'info',
                reqObj
            );

            // Broadcast ke Provider terhubung
            NotificationEngine.checkAndNotifyProviders(reqObj);

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`Permintaan ${type} berhasil dikirim!`, 'success');

            return reqObj;
        },

        acceptRequest(reqId) {
            initUnifiedCityState();
            const reqObj = window.cityState.serviceRequests[reqId];
            if (!reqObj || reqObj.status !== 'WAITING') {
                if (typeof showToast === 'function') showToast('Permintaan tidak dapat diterima!', 'error');
                return;
            }

            const me = Utils.getUserIdentity();
            reqObj.status = 'IN_PROGRESS';
            reqObj.assignedToNik = me.nik;
            reqObj.assignedToName = me.name;
            reqObj.updatedAt = Date.now();

            OnlineBus.emit('SERVICE_REQUEST_UPDATED', reqObj);

            // Notifikasi ke Requester
            NotificationEngine.send(
                reqObj.requesterNik,
                '🩺 Permintaan Diterima',
                `Permintaanmu sedang ditangani oleh ${me.name}.`,
                'success',
                reqObj
            );

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`Anda menerima penanganan ${reqObj.id}!`, 'success');
        },

        completeRequest(reqId, resultPayload = {}) {
            initUnifiedCityState();
            const reqObj = window.cityState.serviceRequests[reqId];
            if (!reqObj || reqObj.status !== 'IN_PROGRESS') return;

            const me = Utils.getUserIdentity();
            reqObj.status = 'COMPLETED';
            reqObj.updatedAt = Date.now();
            if (resultPayload) reqObj.payload = { ...reqObj.payload, ...resultPayload };

            // Payout ke Provider jika ada fee
            if (reqObj.fee > 0) {
                if (window.EconomyModule && typeof window.EconomyModule.addIncome === 'function') {
                    window.EconomyModule.addIncome({
                        amount: reqObj.fee,
                        source: `Pelayanan ${reqObj.service}`,
                        description: `Honor penyelesaian ${reqObj.id}`
                    });
                } else {
                    window.gameState.crest = (window.gameState.crest || 0) + reqObj.fee;
                }
            }

            OnlineBus.emit('SERVICE_REQUEST_UPDATED', reqObj);

            // Notifikasi ke kedua pihak
            NotificationEngine.send(
                reqObj.requesterNik,
                '✓ Layanan Selesai',
                `Permintaan ${reqObj.service} telah selesai ditangani oleh ${me.name}.`,
                'success',
                reqObj
            );

            NotificationEngine.send(
                me.nik,
                '✓ Layanan Selesai',
                `Anda telah menyelesaikan tugas ${reqObj.id}. Honor: +${reqObj.fee.toLocaleString()} C.`,
                'success',
                reqObj
            );

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof playAudioSfx === 'function') playAudioSfx('cash');
            if (typeof showToast === 'function') showToast(`Tugas ${reqObj.id} berhasil diselesaikan!`, 'success');
        },

        getRequestsByPermission(permission) {
            initUnifiedCityState();
            return Object.values(window.cityState.serviceRequests).filter(r => r.providerPermission === permission);
        },

        getRequestsByRequester(requesterNik) {
            initUnifiedCityState();
            return Object.values(window.cityState.serviceRequests).filter(r => r.requesterNik === requesterNik);
        }
    };

    // --- 6. JOB DATABASE & PERMISSION ENGINE ---
    const JobDatabase = {
        COMPANIES: {
            'cmp_tech': { name: 'Ignatius Tech & Engineering', icon: 'fa-code', sector: 'Teknologi & IT' },
            'cmp_gov': { name: 'Pemerintah Kota Central', icon: 'fa-landmark', sector: 'Layanan Publik' },
            'cmp_rsud': { name: 'RSUD Medika Utama', icon: 'fa-hospital', sector: 'Kesehatan' },
            'cmp_polres': { name: 'Polres Patrolex Central', icon: 'fa-shield-halved', sector: 'Keamanan Hukum' },
            'cmp_bank': { name: 'Bank Central Ignatius', icon: 'fa-building-columns', sector: 'Keuangan' },
            'cmp_bistro': { name: 'Ignatius Bistro & Cafe', icon: 'fa-mug-hot', sector: 'Kuliner' },
            'cmp_media': { name: 'Ignatius News & Media', icon: 'fa-newspaper', sector: 'Media' },
            'cmp_freelance': { name: 'Bursa Gig & Freelance Kota', icon: 'fa-briefcase', sector: 'Jasa Umum' }
        },

        getJobsList() {
            return [
                { id: 'side_cleaning', companyId: 'cmp_freelance', title: 'Petugas Kebersihan Taman', desc: 'Bersihkan sampah & jaga keasrian kota.', category: 'sampingan', salary: { base: 800, overtimeRate: 1.2, bonus: 50 }, requirements: { careerLevel: 1, minXp: 0 }, vitalityCost: 5, xpGain: 10, permissions: [] },
                { id: 'side_courier', companyId: 'cmp_freelance', title: 'Kurir Paket Ekspres', desc: 'Antar paket kilat ke warga.', category: 'sampingan', salary: { base: 1300, overtimeRate: 1.3, bonus: 100 }, requirements: { careerLevel: 1, minXp: 0 }, vitalityCost: 8, xpGain: 15, permissions: ['courier.deliver'] },
                { id: 'side_barista', companyId: 'cmp_bistro', title: 'Barista Kafe Bistro', desc: 'Racik kopi & sajikan kuliner.', category: 'sampingan', salary: { base: 1500, overtimeRate: 1.3, bonus: 150 }, requirements: { careerLevel: 1, minXp: 10 }, vitalityCost: 8, xpGain: 20, permissions: ['food.prepare'] },

                { id: 'prof_admin', companyId: 'cmp_gov', title: 'Staf Administrasi Pemkot', desc: 'Kelola arsip & surat pelayanan warga.', category: 'tetap', salary: { base: 3800, overtimeRate: 1.5, bonus: 300 }, requirements: { careerLevel: 1, minXp: 20 }, vitalityCost: 9, xpGain: 40, permissions: ['gov.admin'] },
                { id: 'prof_banker', companyId: 'cmp_bank', title: 'Teller Bank Central', desc: 'Layanan deposito & permohonan kredit.', category: 'tetap', salary: { base: 4000, overtimeRate: 1.5, bonus: 400 }, requirements: { careerLevel: 2, minXp: 50 }, vitalityCost: 10, xpGain: 45, permissions: ['bank.teller'] },
                { id: 'prof_reporter', companyId: 'cmp_media', title: 'Jurnalis & Reporter News', desc: 'Liput Berita & Terbitkan Koran Kota.', category: 'tetap', salary: { base: 4400, overtimeRate: 1.5, bonus: 450 }, requirements: { careerLevel: 2, minXp: 80 }, vitalityCost: 10, xpGain: 50, permissions: ['news.publish'] },
                { id: 'prof_lawyer', companyId: 'cmp_gov', title: 'Pengacara & Konsultan Hukum', desc: 'Pendampingan sidang & advokasi hukum.', category: 'tetap', salary: { base: 5500, overtimeRate: 1.6, bonus: 600 }, requirements: { license: 'Sertifikat Hukum', careerLevel: 3, minXp: 150 }, vitalityCost: 11, xpGain: 60, permissions: ['law.advocate'] },
                { id: 'prof_it_eng', companyId: 'cmp_tech', title: 'Software Engineer IT', desc: 'Maintenance server & perbaiki bug app.', category: 'tetap', salary: { base: 6000, overtimeRate: 1.6, bonus: 700 }, requirements: { license: 'Sertifikat IT & Cyber', careerLevel: 3, minXp: 200 }, vitalityCost: 12, xpGain: 70, permissions: ['tech.developer'] },

                { id: 'prof_nurse', companyId: 'cmp_rsud', title: 'Perawat Medis IGD', desc: 'Bantu tindakan darurat medis IGD.', category: 'tetap', salary: { base: 4200, overtimeRate: 1.5, bonus: 400 }, requirements: { license: 'Izin Praktek Medis', careerLevel: 2, minXp: 100 }, vitalityCost: 12, xpGain: 45, permissions: ['medical.treat'] },
                { id: 'prof_police_patrol', companyId: 'cmp_polres', title: 'Polisi Patroli Lantas', desc: 'Patroli lantas, 911 & terbitkan E-Tilang.', category: 'tetap', salary: { base: 4800, overtimeRate: 1.5, bonus: 500 }, requirements: { license: 'SIM A (Mobil)', careerLevel: 2, minXp: 120 }, vitalityCost: 14, xpGain: 55, permissions: ['police.ticket', 'police.patrol'] },
                { id: 'prof_doc_gen', companyId: 'cmp_rsud', title: 'Dokter Umum RSUD', desc: 'Pemeriksaan medis & ambulans IGD.', category: 'tetap', salary: { base: 5600, overtimeRate: 1.6, bonus: 800 }, requirements: { license: 'Izin Praktek Medis', careerLevel: 4, minXp: 250 }, vitalityCost: 15, xpGain: 70, permissions: ['medical.treat', 'medical.dispatch'] }
            ];
        },

        hasPermission(permission) {
            if (!window.gameState?.jobState?.activeJobId) return false;
            const job = this.getJobsList().find(j => j.id === window.gameState.jobState.activeJobId);
            return job && Array.isArray(job.permissions) && job.permissions.includes(permission);
        }
    };

    // --- 7. APP RENDERERS & ECOSYSTEM MODULES ---

    // A. BURSA KERJA & KARIR
    const JobsApp = {
        ensureState() {
            if (!window.gameState) window.gameState = {};
            if (!window.gameState.jobState) {
                window.gameState.jobState = {
                    activeJobId: null,
                    hiredAt: null,
                    companyId: null,
                    totalShifts: 0,
                    jobXp: 0,
                    careerLevel: 1,
                    payslips: [],
                    performance: { fatigue: 0 },
                    lastShiftTimestamp: 0
                };
            }
        },

        render() {
            this.ensureState();
            const jobs = JobDatabase.getJobsList();
            const js = window.gameState.jobState;
            const activeJob = jobs.find(j => j.id === js.activeJobId);
            const activeComp = activeJob ? JobDatabase.COMPANIES[activeJob.companyId] : null;

            let headerHtml = '';
            if (activeJob) {
                headerHtml = `
                    <div class="glass-ios p-4 rounded-3xl border border-sky-500/50 bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 space-y-3 shadow-xl">
                        <div class="flex items-center justify-between border-b border-white/10 pb-2">
                            <div>
                                <span class="text-[8px] text-sky-400 uppercase font-mono font-bold block flex items-center gap-1">
                                    <i class="fa-solid ${activeComp?.icon || 'fa-briefcase'}"></i> ${Utils.escapeHTML(activeComp?.name)}
                                </span>
                                <h3 class="text-sm font-bold text-white">${Utils.escapeHTML(activeJob.title)}</h3>
                            </div>
                            <button onclick="CityOS.Jobs.resign()" class="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[9px] font-bold rounded-lg border border-rose-500/30 transition-all">Resign</button>
                        </div>
                        <div class="grid grid-cols-3 gap-2 text-center text-[9px]">
                            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block">Level Karir</span><span class="font-bold text-amber-300 font-mono text-xs">Lvl ${js.careerLevel}</span></div>
                            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block">Total Shift</span><span class="font-bold text-sky-300 font-mono text-xs">${js.totalShifts}x</span></div>
                            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block">Kelelahan</span><span class="font-bold ${js.performance.fatigue > 70 ? 'text-rose-400' : 'text-emerald-300'} font-mono text-xs">${js.performance.fatigue}%</span></div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 pt-1">
                            <button onclick="CityOS.Jobs.work(false)" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95">Shift Normal (+${Math.floor(activeJob.salary.base * 0.95).toLocaleString()} C)</button>
                            <button onclick="CityOS.Jobs.work(true)" class="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95">Lembur (+${Math.floor((activeJob.salary.base * activeJob.salary.overtimeRate) * 0.95).toLocaleString()} C)</button>
                        </div>
                    </div>
                `;
            } else {
                headerHtml = `
                    <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-2 bg-gradient-to-br from-slate-900 to-slate-950">
                        <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider"><i class="fa-solid fa-briefcase mr-1.5"></i> BURSA KERJA & KARIR KOTA</h4>
                        <p class="text-[10px] text-slate-300">Pilih profesi untuk mulai berkarir dan membuka hak akses pelayanan kota.</p>
                    </div>
                `;
            }

            let jobsHtml = jobs.map(j => `
                <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 border ${js.activeJobId === j.id ? 'border-sky-500 bg-sky-950/30' : 'border-white/10'}">
                    <div>
                        <h5 class="text-xs font-bold text-white">${Utils.escapeHTML(j.title)}</h5>
                        <p class="text-[10px] text-slate-400">${Utils.escapeHTML(j.desc)}</p>
                    </div>
                    ${js.activeJobId === j.id ? `<span class="text-[9px] text-emerald-400 font-bold">AKTIF</span>` : `<button onclick="CityOS.Jobs.apply('${j.id}')" class="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-xl">Lamar</button>`}
                </div>
            `).join('');

            return `<div class="space-y-4">${headerHtml}<div class="space-y-2 max-h-80 overflow-y-auto pr-1">${jobsHtml}</div></div>`;
        },

        apply(jobId) {
            this.ensureState();
            const job = JobDatabase.getJobsList().find(j => j.id === jobId);
            if (!job) return;

            window.gameState.jobState.activeJobId = jobId;
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`Selamat! Kamu bekerja sebagai ${job.title}`, 'success');
            if (typeof openApp === 'function') openApp('jobs');
        },

        resign() {
            this.ensureState();
            window.gameState.jobState.activeJobId = null;
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast('Berhasil mengundurkan diri.', 'info');
            if (typeof openApp === 'function') openApp('jobs');
        },

        work(isOvertime = false) {
            this.ensureState();
            const js = window.gameState.jobState;
            const job = JobDatabase.getJobsList().find(j => j.id === js.activeJobId);
            if (!job) return;

            const basePay = job.salary.base;
            const pay = isOvertime ? Math.floor(basePay * job.salary.overtimeRate) : basePay;
            const netPay = Math.floor(pay * 0.95);

            window.gameState.crest = (window.gameState.crest || 0) + netPay;
            js.totalShifts += 1;
            js.jobXp += job.xpGain;
            js.performance.fatigue = Math.min(100, js.performance.fatigue + (isOvertime ? 25 : 15));

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof playAudioSfx === 'function') playAudioSfx('cash');
            if (typeof showToast === 'function') showToast(`Shift Selesai! Pendapatan: +${netPay.toLocaleString()} C`, 'success');
            if (typeof openApp === 'function') openApp('jobs');
        }
    };

    // B. IGNA SHOPEE MARKETPLACE
    const ShopeeApp = {
        render() {
            initUnifiedCityState();
            const me = Utils.getUserIdentity();
            const stores = window.cityState.marketplace.stores;
            const products = window.cityState.marketplace.products;

            const myStore = Object.values(stores).find(s => s.ownerId === me.nik);

            let storeHeader = '';
            if (myStore) {
                storeHeader = `
                    <div class="glass-ios p-3 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/40 mb-3">
                        <div class="flex justify-between items-center">
                            <h4 class="text-xs font-bold text-amber-300"><i class="fa-solid fa-store mr-1"></i> ${Utils.escapeHTML(myStore.storeName)}</h4>
                            <span class="text-xs font-mono font-bold text-emerald-400">+${(myStore.income || 0).toLocaleString()} C</span>
                        </div>
                        <button onclick="CityOS.Shopee.addProductPrompt()" class="mt-2 w-full py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">+ Tambah Produk</button>
                    </div>
                `;
            } else {
                storeHeader = `
                    <div class="glass-card p-3 rounded-2xl flex justify-between items-center mb-3 border border-amber-500/30">
                        <span class="text-xs font-bold text-white">Buka Toko Sendiri</span>
                        <button onclick="CityOS.Shopee.registerStorePrompt()" class="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl">Daftar Toko</button>
                    </div>
                `;
            }

            let productsHtml = Object.values(products).map(p => `
                <div class="glass-card p-2.5 rounded-xl flex justify-between items-center text-xs mb-2 border border-white/5">
                    <div>
                        <h6 class="font-bold text-white">${Utils.escapeHTML(p.name)}</h6>
                        <span class="text-emerald-400 font-mono text-[10px]">${p.price.toLocaleString()} C</span>
                    </div>
                    <button onclick="CityOS.Shopee.buy('${p.productId}')" class="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg">Beli</button>
                </div>
            `).join('');

            return `<div>${storeHeader}<h4 class="text-xs font-bold text-sky-400 uppercase mb-2">Marketplace Kota</h4>${productsHtml}</div>`;
        },

        registerStorePrompt() {
            initUnifiedCityState();
            const me = Utils.getUserIdentity();
            const name = prompt("Nama Toko Kamu:");
            if (!name) return;

            const storeId = Utils.generateId('STORE');
            window.cityState.marketplace.stores[storeId] = {
                storeId,
                ownerId: me.nik,
                storeName: name.trim(),
                category: 'General',
                status: 'open',
                income: 0
            };

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`Toko "${name}" terdaftar!`, 'success');
            if (typeof openApp === 'function') openApp('shop');
        },

        addProductPrompt() {
            initUnifiedCityState();
            const me = Utils.getUserIdentity();
            const myStore = Object.values(window.cityState.marketplace.stores).find(s => s.ownerId === me.nik);
            if (!myStore) return;

            const name = prompt("Nama Barang:");
            if (!name) return;
            const price = parseInt(prompt("Harga (Crest):"));
            if (isNaN(price) || price <= 0) return;

            const prodId = Utils.generateId('PROD');
            window.cityState.marketplace.products[prodId] = {
                productId: prodId,
                storeId: myStore.storeId,
                sellerId: me.nik,
                name: name.trim(),
                price: price,
                type: 'asset',
                status: 'active'
            };

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`Produk "${name}" dipajang!`, 'success');
            if (typeof openApp === 'function') openApp('shop');
        },

        buy(productId) {
            initUnifiedCityState();
            const prod = window.cityState.marketplace.products[productId];
            if (!prod) return;

            const currentCrest = window.gameState?.crest || 0;
            if (currentCrest < prod.price) {
                if (typeof showToast === 'function') showToast('Saldo Crest kurang!', 'error');
                return;
            }

            const me = Utils.getUserIdentity();
            window.gameState.crest -= prod.price;

            const store = window.cityState.marketplace.stores[prod.storeId];
            if (store) store.income = (store.income || 0) + prod.price;

            // Trigger Notifikasi ke Penjual
            NotificationEngine.send(
                prod.sellerId,
                '🛍️ Barang Terjual!',
                `Produk "${prod.name}" dibeli oleh NIK ${me.nik}. +${prod.price.toLocaleString()} C`,
                'success'
            );

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof playAudioSfx === 'function') playAudioSfx('cash');
            if (typeof showToast === 'function') showToast(`Berhasil membeli ${prod.name}!`, 'success');
            if (typeof openApp === 'function') openApp('shop');
        }
    };

    // C. HALODOC MEDIKA (DUAL-SIDED)
    const HalodocApp = {
        render() {
            const isDoctor = JobDatabase.hasPermission('medical.treat');
            if (isDoctor) {
                const requests = ServiceEngine.getRequestsByPermission('medical.treat');
                let reqHtml = requests.map(r => `
                    <div class="glass-card p-3 rounded-2xl flex justify-between items-center mb-2 border border-rose-500/40">
                        <div>
                            <h5 class="text-xs font-bold text-white">${Utils.escapeHTML(r.requesterName)}</h5>
                            <p class="text-[10px] text-rose-300">${Utils.escapeHTML(r.details)}</p>
                            <span class="text-[8px] text-slate-400 font-mono">Status: ${r.status}</span>
                        </div>
                        ${r.status === 'WAITING' ? `
                            <button onclick="CityOS.Services.accept('${r.id}')" class="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl">Terima Pasien</button>
                        ` : r.status === 'IN_PROGRESS' ? `
                            <button onclick="CityOS.Services.complete('${r.id}')" class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl">Selesaikan (+3,000 C)</button>
                        ` : `<span class="text-emerald-400 font-bold text-xs">SELESAI</span>`}
                    </div>
                `).join('');

                return `
                    <div class="space-y-3">
                        <div class="glass-ios p-3 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-slate-900 to-rose-950/40">
                            <h4 class="text-xs font-bold text-rose-300 uppercase"><i class="fa-solid fa-user-doctor mr-1"></i> DASHBOARD MEDIS IGD DOKTER</h4>
                        </div>
                        <div class="space-y-2 max-h-80 overflow-y-auto">${reqHtml || '<p class="text-[10px] text-slate-500 text-center py-4">Tidak ada panggilan medis aktif.</p>'}</div>
                    </div>
                `;
            }

            // View Pasien
            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-rose-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-rose-950/40">
                        <h4 class="text-xs font-bold text-rose-300 uppercase"><i class="fa-solid fa-hospital mr-1.5"></i> HALODOC MEDIKA CENTRAL</h4>
                        <p class="text-[10px] text-slate-300">Layanan panggilan medis darurat & konsultasi dokter resep.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="CityOS.Halodoc.requestAmbulance()" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-rose-400/50">
                            <i class="fa-solid fa-truck-medical text-rose-400 text-xl animate-pulse"></i>
                            <span class="text-xs font-bold text-white">911 Ambulans</span>
                        </button>
                        <button onclick="CityOS.Halodoc.requestConsultation()" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-sky-400/50">
                            <i class="fa-solid fa-user-doctor text-sky-400 text-xl"></i>
                            <span class="text-xs font-bold text-white">Konsultasi Dokter</span>
                        </button>
                    </div>
                </div>
            `;
        },

        requestAmbulance() {
            ServiceEngine.createRequest({
                service: 'Halodoc Medika',
                type: 'AMBULANCE_911',
                providerPermission: 'medical.treat',
                details: 'Darurat Koma / Vitality Drop Sangat Rendah',
                fee: 3000
            });
            if (typeof openApp === 'function') openApp('app_halodoc');
        },

        requestConsultation() {
            ServiceEngine.createRequest({
                service: 'Halodoc Medika',
                type: 'DOCTOR_CONSULTATION',
                providerPermission: 'medical.treat',
                details: 'Pemeriksaan Kesehatan & Permintaan Resep Obat',
                fee: 1500
            });
            if (typeof openApp === 'function') openApp('app_halodoc');
        }
    };

    // D. POLICE HUB (DUAL-SIDED)
    const PoliceApp = {
        render() {
            const isPolice = JobDatabase.hasPermission('police.ticket') || JobDatabase.hasPermission('police.patrol');
            initUnifiedCityState();

            if (isPolice) {
                const tickets = window.cityState.police.tickets;
                let ticketLog = tickets.map(t => `
                    <div class="flex justify-between items-center text-[10px] py-1 border-b border-white/5">
                        <span class="text-white font-bold">${Utils.escapeHTML(t.nik)}</span>
                        <span class="text-rose-400 font-mono">${t.fine.toLocaleString()} C (${t.status})</span>
                    </div>
                `).join('');

                return `
                    <div class="space-y-3">
                        <div class="glass-ios p-3 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 to-indigo-950/50">
                            <h4 class="text-xs font-bold text-indigo-300 uppercase"><i class="fa-solid fa-shield-halved mr-1"></i> POLRES PATROLEX HUB PETUGAS</h4>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="CityOS.Police.issueTicketPrompt()" class="p-3 glass-card rounded-xl text-center"><i class="fa-solid fa-file-invoice-dollar text-indigo-400 text-lg"></i><span class="block text-xs font-bold text-white mt-1">Terbitkan E-Tilang</span></button>
                            <button onclick="CityOS.Police.issueDpoPrompt()" class="p-3 glass-card rounded-xl text-center"><i class="fa-solid fa-user-ninja text-rose-400 text-lg"></i><span class="block text-xs font-bold text-white mt-1">Terbitkan DPO</span></button>
                        </div>
                        <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-1">
                            <h5 class="text-[10px] font-bold text-indigo-300">Log E-Tilang Terbit</h5>
                            <div class="max-h-36 overflow-y-auto">${ticketLog || '<p class="text-[10px] text-slate-500">Belum ada E-Tilang.</p>'}</div>
                        </div>
                    </div>
                `;
            }

            // View Warga
            const me = Utils.getUserIdentity();
            const myTickets = window.cityState.police.tickets.filter(t => t.nik === me.nik && t.status === 'UNPAID');

            let myTicketsHtml = myTickets.map(t => `
                <div class="glass-card p-2.5 rounded-xl flex justify-between items-center text-xs mb-2 border border-rose-500/30">
                    <div><h6 class="font-bold text-white">${Utils.escapeHTML(t.violation)}</h6><span class="text-slate-400 font-mono text-[9px]">${t.fine.toLocaleString()} C</span></div>
                    <button onclick="CityOS.Police.payTicket('${t.id}')" class="px-3 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg">Bayar</button>
                </div>
            `).join('');

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-indigo-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-indigo-950/40">
                        <h4 class="text-xs font-bold text-indigo-300 uppercase"><i class="fa-solid fa-shield-halved mr-1"></i> POLRES PATROLEX HUB WARGA</h4>
                        <p class="text-[10px] text-slate-300">Layanan pembayaran E-Tilang & Laporan 911 Kejahatan.</p>
                    </div>
                    <div><h5 class="text-xs font-bold text-amber-400 mb-2">E-Tilang Aktif Kamu (${myTickets.length})</h5>${myTicketsHtml || '<p class="text-[10px] text-slate-500">Tidak ada tagihan E-Tilang aktif.</p>'}</div>
                </div>
            `;
        },

        issueTicketPrompt() {
            initUnifiedCityState();
            const nik = prompt("NIK Pelanggar:");
            if (!nik) return;
            const violation = prompt("Jenis Pelanggaran:");
            if (!violation) return;
            const fine = parseInt(prompt("Denda (Crest):"));
            if (isNaN(fine) || fine <= 0) return;

            const ticketId = Utils.generateId('TILANG');
            window.cityState.police.tickets.unshift({
                id: ticketId,
                nik: nik.trim(),
                violation: violation.trim(),
                fine,
                status: 'UNPAID',
                createdAt: Date.now()
            });

            NotificationEngine.send(nik.trim(), '🚨 E-Tilang Terbit!', `Pelanggaran: "${violation}". Denda: ${fine.toLocaleString()} C`, 'emergency');

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`E-Tilang terbit untuk NIK ${nik}`, 'success');
            if (typeof openApp === 'function') openApp('app_police');
        },

        issueDpoPrompt() {
            initUnifiedCityState();
            const name = prompt("Nama Buronan DPO:");
            if (!name) return;

            window.cityState.police.dpoList.unshift({ id: Utils.generateId('DPO'), name: name.trim(), reward: 25000 });
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`DPO terbit untuk ${name}`, 'error');
        },

        payTicket(ticketId) {
            initUnifiedCityState();
            const ticket = window.cityState.police.tickets.find(t => t.id === ticketId);
            if (!ticket) return;

            const currentCrest = window.gameState?.crest || 0;
            if (currentCrest < ticket.fine) {
                if (typeof showToast === 'function') showToast('Saldo Crest kurang!', 'error');
                return;
            }

            window.gameState.crest -= ticket.fine;
            ticket.status = 'PAID';

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof playAudioSfx === 'function') playAudioSfx('cash');
            if (typeof showToast === 'function') showToast('E-Tilang berhasil dilunasi!', 'success');
            if (typeof openApp === 'function') openApp('app_police');
        }
    };

    // E. BANK CENTRAL (DUAL-SIDED)
    const BankApp = {
        render() {
            const isTeller = JobDatabase.hasPermission('bank.teller');
            if (isTeller) {
                const requests = ServiceEngine.getRequestsByPermission('bank.teller');
                let reqHtml = requests.map(r => `
                    <div class="glass-card p-2.5 rounded-xl flex justify-between items-center text-xs mb-2 border border-emerald-500/30">
                        <div><h6 class="font-bold text-white">${Utils.escapeHTML(r.requesterName)}</h6><p class="text-[10px] text-slate-300">${Utils.escapeHTML(r.details)}</p></div>
                        ${r.status === 'WAITING' ? `<button onclick="CityOS.Services.accept('${r.id}')" class="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg">Proses Loan</button>` : `<button onclick="CityOS.Services.complete('${r.id}')" class="px-2.5 py-1 bg-sky-600 text-white font-bold text-[10px] rounded-lg">Cairkan Loan</button>`}
                    </div>
                `).join('');

                return `<div class="space-y-3"><div class="glass-ios p-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 to-emerald-950/40"><h4 class="text-xs font-bold text-emerald-300 uppercase"><i class="fa-solid fa-building-columns mr-1"></i> DASHBOARD TELLER BANK CENTRAL</h4></div>${reqHtml || '<p class="text-[10px] text-slate-500 text-center py-4">Tidak ada permohonan kredit.</p>'}</div>`;
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-emerald-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-emerald-950/40">
                        <h4 class="text-xs font-bold text-emerald-300 uppercase"><i class="fa-solid fa-building-columns mr-1"></i> BANK CENTRAL IGNATIUS</h4>
                        <p class="text-[10px] text-slate-300">Layanan perbankan digital, simpan-pinjam & kredit usaha warga.</p>
                    </div>
                    <button onclick="CityOS.Bank.requestLoanPrompt()" class="w-full py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg">+ Ajukan Permohonan Kredit Usaha</button>
                </div>
            `;
        },

        requestLoanPrompt() {
            const amountStr = prompt("Nominal Pinjaman Kredit (Crest):");
            const amount = parseInt(amountStr);
            if (isNaN(amount) || amount <= 0) return;

            ServiceEngine.createRequest({
                service: 'Bank Central',
                type: 'LOAN_APPLICATION',
                providerPermission: 'bank.teller',
                details: `Permohonan Kredit Usaha Sebesar ${amount.toLocaleString()} C`,
                fee: 0,
                payload: { loanAmount: amount }
            });
            if (typeof openApp === 'function') openApp('app_bank');
        }
    };

    // F. CITY GOVERNMENT (PEMKOT)
    const GovApp = {
        render() {
            const isAdmin = JobDatabase.hasPermission('gov.admin');
            if (isAdmin) {
                const requests = ServiceEngine.getRequestsByPermission('gov.admin');
                let reqHtml = requests.map(r => `
                    <div class="glass-card p-2.5 rounded-xl flex justify-between items-center text-xs mb-2 border border-sky-500/30">
                        <div><h6 class="font-bold text-white">${Utils.escapeHTML(r.requesterName)}</h6><p class="text-[10px] text-slate-300">${Utils.escapeHTML(r.details)}</p></div>
                        ${r.status === 'WAITING' ? `<button onclick="CityOS.Services.accept('${r.id}')" class="px-2.5 py-1 bg-sky-600 text-white font-bold text-[10px] rounded-lg">Proses Dokumen</button>` : `<button onclick="CityOS.Services.complete('${r.id}')" class="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg">Terbitkan</button>`}
                    </div>
                `).join('');

                return `<div class="space-y-3"><div class="glass-ios p-3 rounded-2xl border border-sky-500/40 bg-gradient-to-br from-slate-900 to-sky-950/40"><h4 class="text-xs font-bold text-sky-300 uppercase"><i class="fa-solid fa-landmark mr-1"></i> DASHBOARD STAF BALAI KOTA</h4></div>${reqHtml || '<p class="text-[10px] text-slate-500 text-center py-4">Tidak ada permohonan surat.</p>'}</div>`;
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-sky-950/40">
                        <h4 class="text-xs font-bold text-sky-300 uppercase"><i class="fa-solid fa-landmark mr-1"></i> BALAI KOTA & DISDUKCAPIL</h4>
                        <p class="text-[10px] text-slate-300">Pengurusan dokumen KTP, izin usaha & legalitas kependudukan.</p>
                    </div>
                    <button onclick="CityOS.Gov.requestDocPrompt()" class="w-full py-3 bg-sky-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg">+ Permohonan Legalitas Kependudukan</button>
                </div>
            `;
        },

        requestDocPrompt() {
            const type = prompt("Jenis Dokumen (Sertifikat Izin Usaha / Izin Praktek / SIM):");
            if (!type) return;

            ServiceEngine.createRequest({
                service: 'Disdukcapil Pemkot',
                type: 'DOCUMENT_ISSUANCE',
                providerPermission: 'gov.admin',
                details: `Permohonan Legalitas Dokumen: ${type.trim()}`,
                fee: 500
            });
            if (typeof openApp === 'function') openApp('app_gov');
        }
    };

    // G. LEGAL CENTER (DUAL-SIDED)
    const LegalApp = {
        render() {
            const isLawyer = JobDatabase.hasPermission('law.advocate');
            if (isLawyer) {
                const requests = ServiceEngine.getRequestsByPermission('law.advocate');
                let reqHtml = requests.map(r => `
                    <div class="glass-card p-2.5 rounded-xl flex justify-between items-center text-xs mb-2 border border-purple-500/30">
                        <div><h6 class="font-bold text-white">${Utils.escapeHTML(r.requesterName)}</h6><p class="text-[10px] text-slate-300">${Utils.escapeHTML(r.details)}</p></div>
                        ${r.status === 'WAITING' ? `<button onclick="CityOS.Services.accept('${r.id}')" class="px-2.5 py-1 bg-purple-600 text-white font-bold text-[10px] rounded-lg">Dampingi Sidang</button>` : `<button onclick="CityOS.Services.complete('${r.id}')" class="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg">Selesaikan Case</button>`}
                    </div>
                `).join('');

                return `<div class="space-y-3"><div class="glass-ios p-3 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-slate-900 to-purple-950/40"><h4 class="text-xs font-bold text-purple-300 uppercase"><i class="fa-solid fa-scale-balanced mr-1"></i> DASHBOARD ADVOKAT HUKUM</h4></div>${reqHtml || '<p class="text-[10px] text-slate-500 text-center py-4">Tidak ada kasus hukum aktif.</p>'}</div>`;
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-purple-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-purple-950/40">
                        <h4 class="text-xs font-bold text-purple-300 uppercase"><i class="fa-solid fa-scale-balanced mr-1"></i> LEGAL CENTER & ADVOKASI</h4>
                        <p class="text-[10px] text-slate-300">Konsultasi hukum pidana/perdata & pendampingan sidang pengadilan.</p>
                    </div>
                    <button onclick="CityOS.Legal.requestLawyerPrompt()" class="w-full py-3 bg-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg">+ Panggil Pengacara Pendamping</button>
                </div>
            `;
        },

        requestLawyerPrompt() {
            ServiceEngine.createRequest({
                service: 'Legal Center',
                type: 'LEGAL_ADVOCACY',
                providerPermission: 'law.advocate',
                details: 'Konsultasi & Pendampingan Kasus Hukum Sidang',
                fee: 2500
            });
            if (typeof openApp === 'function') openApp('app_legal');
        }
    };

    // H. TECH SUPPORT (DUAL-SIDED)
    const TechApp = {
        render() {
            const isIT = JobDatabase.hasPermission('tech.developer');
            if (isIT) {
                const requests = ServiceEngine.getRequestsByPermission('tech.developer');
                let reqHtml = requests.map(r => `
                    <div class="glass-card p-2.5 rounded-xl flex justify-between items-center text-xs mb-2 border border-cyan-500/30">
                        <div><h6 class="font-bold text-white">${Utils.escapeHTML(r.requesterName)}</h6><p class="text-[10px] text-slate-300">${Utils.escapeHTML(r.details)}</p></div>
                        ${r.status === 'WAITING' ? `<button onclick="CityOS.Services.accept('${r.id}')" class="px-2.5 py-1 bg-cyan-600 text-white font-bold text-[10px] rounded-lg">Fix Bug</button>` : `<button onclick="CityOS.Services.complete('${r.id}')" class="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg">Deploy Patch</button>`}
                    </div>
                `).join('');

                return `<div class="space-y-3"><div class="glass-ios p-3 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-900 to-cyan-950/40"><h4 class="text-xs font-bold text-cyan-300 uppercase"><i class="fa-solid fa-code mr-1"></i> DASHBOARD IT SOFTWARE ENGINEER</h4></div>${reqHtml || '<p class="text-[10px] text-slate-500 text-center py-4">Sistem berjalan optimal. Tidak ada tiket bug.</p>'}</div>`;
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-cyan-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-cyan-950/40">
                        <h4 class="text-xs font-bold text-cyan-300 uppercase"><i class="fa-solid fa-headset mr-1"></i> TECH SUPPORT & IT CENTER</h4>
                        <p class="text-[10px] text-slate-300">Pelaporan bug aplikasi, perbaikan jaringan HP Virtual & cyber security.</p>
                    </div>
                    <button onclick="CityOS.Tech.reportBugPrompt()" class="w-full py-3 bg-cyan-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg">+ Laporkan Masalah Sistem / Network</button>
                </div>
            `;
        },

        reportBugPrompt() {
            const desc = prompt("Jelaskan Masalah / Bug System:");
            if (!desc) return;

            ServiceEngine.createRequest({
                service: 'Tech Support',
                type: 'SYSTEM_MAINTENANCE',
                providerPermission: 'tech.developer',
                details: `Laporan Tiket IT Bug: ${desc.trim()}`,
                fee: 1000
            });
            if (typeof openApp === 'function') openApp('app_tech');
        }
    };

    // I. IGNATIUS NEWS (DUAL-SIDED)
    const NewsApp = {
        render() {
            initUnifiedCityState();
            const isJournalist = JobDatabase.hasPermission('news.publish');
            const articles = window.cityState.news.articles;

            let newsHtml = articles.map(a => `
                <div class="glass-card p-3 rounded-2xl space-y-1 mb-2 border border-white/5">
                    <h5 class="text-xs font-bold text-amber-300">${Utils.escapeHTML(a.title)}</h5>
                    <p class="text-[10px] text-slate-300 leading-relaxed">${Utils.escapeHTML(a.content)}</p>
                    <span class="text-[8px] text-slate-500 font-mono">Penulis: ${Utils.escapeHTML(a.author)}</span>
                </div>
            `).join('');

            return `
                <div class="space-y-3">
                    <div class="glass-ios p-3.5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/40 flex justify-between items-center">
                        <h4 class="text-xs font-bold text-amber-300 uppercase"><i class="fa-solid fa-newspaper mr-1"></i> IGNATIUS NEWS MEDIA</h4>
                        ${isJournalist ? `<button onclick="CityOS.News.publishPrompt()" class="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg">+ Terbitkan Berita</button>` : ''}
                    </div>
                    <div class="space-y-2 max-h-80 overflow-y-auto">${newsHtml}</div>
                </div>
            `;
        },

        publishPrompt() {
            initUnifiedCityState();
            const title = prompt("Judul Berita Kota:");
            if (!title) return;
            const content = prompt("Isi Berita:");
            if (!content) return;

            const me = Utils.getUserIdentity();
            window.cityState.news.articles.unshift({
                id: Utils.generateId('NEWS'),
                title: title.trim(),
                author: me.name,
                content: content.trim(),
                createdAt: Date.now()
            });

            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast('Berita resmi diterbitkan ke koran kota!', 'success');
            if (typeof openApp === 'function') openApp('app_news');
        }
    };

    // J. IGNA COURIER (DUAL-SIDED)
    const CourierApp = {
        render() {
            const isCourier = JobDatabase.hasPermission('courier.deliver');
            if (isCourier) {
                const requests = ServiceEngine.getRequestsByPermission('courier.deliver');
                let reqHtml = requests.map(r => `
                    <div class="glass-card p-2.5 rounded-xl flex justify-between items-center text-xs mb-2 border border-orange-500/30">
                        <div><h6 class="font-bold text-white">${Utils.escapeHTML(r.requesterName)}</h6><p class="text-[10px] text-slate-300">${Utils.escapeHTML(r.details)}</p></div>
                        ${r.status === 'WAITING' ? `<button onclick="CityOS.Services.accept('${r.id}')" class="px-2.5 py-1 bg-orange-600 text-white font-bold text-[10px] rounded-lg">Ambil Paket</button>` : `<button onclick="CityOS.Services.complete('${r.id}')" class="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg">Antar Selesai</button>`}
                    </div>
                `).join('');

                return `<div class="space-y-3"><div class="glass-ios p-3 rounded-2xl border border-orange-500/40 bg-gradient-to-br from-slate-900 to-orange-950/40"><h4 class="text-xs font-bold text-orange-300 uppercase"><i class="fa-solid fa-box mr-1"></i> DASHBOARD KURIR EKSPRES</h4></div>${reqHtml || '<p class="text-[10px] text-slate-500 text-center py-4">Tidak ada antrean kiriman paket.</p>'}</div>`;
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-orange-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-orange-950/40">
                        <h4 class="text-xs font-bold text-orange-300 uppercase"><i class="fa-solid fa-truck-fast mr-1"></i> IGNA COURIER EXPRESS</h4>
                        <p class="text-[10px] text-slate-300">Pengiriman barang & paket kilat antar alamat kota.</p>
                    </div>
                    <button onclick="CityOS.Courier.sendPackagePrompt()" class="w-full py-3 bg-orange-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg">+ Kirim Paket Kilat</button>
                </div>
            `;
        },

        sendPackagePrompt() {
            const dest = prompt("Alamat Tujuan / NIK Penerima:");
            if (!dest) return;

            ServiceEngine.createRequest({
                service: 'Igna Courier',
                type: 'PACKAGE_DELIVERY',
                providerPermission: 'courier.deliver',
                details: `Pengiriman Paket Kilat ke Tujuan: ${dest.trim()}`,
                fee: 1200
            });
            if (typeof openApp === 'function') openApp('app_courier');
        }
    };

    // K. IGNA FOOD & BISTRO (DUAL-SIDED)
    const FoodApp = {
        render() {
            const isChef = JobDatabase.hasPermission('food.prepare');
            if (isChef) {
                const requests = ServiceEngine.getRequestsByPermission('food.prepare');
                let reqHtml = requests.map(r => `
                    <div class="glass-card p-2.5 rounded-xl flex justify-between items-center text-xs mb-2 border border-yellow-500/30">
                        <div><h6 class="font-bold text-white">${Utils.escapeHTML(r.requesterName)}</h6><p class="text-[10px] text-slate-300">${Utils.escapeHTML(r.details)}</p></div>
                        ${r.status === 'WAITING' ? `<button onclick="CityOS.Services.accept('${r.id}')" class="px-2.5 py-1 bg-amber-600 text-white font-bold text-[10px] rounded-lg">Masak Pesanan</button>` : `<button onclick="CityOS.Services.complete('${r.id}')" class="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg">Sajikan</button>`}
                    </div>
                `).join('');

                return `<div class="space-y-3"><div class="glass-ios p-3 rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-slate-900 to-yellow-950/40"><h4 class="text-xs font-bold text-yellow-300 uppercase"><i class="fa-solid fa-utensils mr-1"></i> DASHBOARD DAPUR BISTRO & BARISTA</h4></div>${reqHtml || '<p class="text-[10px] text-slate-500 text-center py-4">Dapur sepi. Belum ada pesanan makanan.</p>'}</div>`;
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-yellow-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-yellow-950/40">
                        <h4 class="text-xs font-bold text-yellow-300 uppercase"><i class="fa-solid fa-mug-hot mr-1"></i> IGNA FOOD & KULINER BISTRO</h4>
                        <p class="text-[10px] text-slate-300">Pesan makanan & minuman hangat pemulih vitality.</p>
                    </div>
                    <button onclick="CityOS.Food.orderFoodPrompt()" class="w-full py-3 bg-yellow-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg">+ Pesan Makanan Kuliner Bistro</button>
                </div>
            `;
        },

        orderFoodPrompt() {
            const foodName = prompt("Menu Makanan / Minuman yang Dipesan:");
            if (!foodName) return;

            ServiceEngine.createRequest({
                service: 'Igna Food',
                type: 'FOOD_ORDER',
                providerPermission: 'food.prepare',
                details: `Pesanan Kuliner: ${foodName.trim()}`,
                fee: 1500
            });
            if (typeof openApp === 'function') openApp('app_food');
        }
    };

    // L. NOTIFICATION CENTER APP
    const NotificationsApp = {
        render() {
            initUnifiedCityState();
            const me = Utils.getUserIdentity();
            const list = window.cityState.notifications[me.nik] || [];

            let notifHtml = list.map(n => `
                <div class="glass-card p-3 rounded-2xl space-y-1 mb-2 border ${n.category === 'emergency' ? 'border-rose-500/50 bg-rose-950/20' : 'border-white/10'}">
                    <div class="flex justify-between items-center">
                        <h5 class="text-xs font-bold text-white">${Utils.escapeHTML(n.title)}</h5>
                        <span class="text-[8px] text-slate-500 font-mono">${new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p class="text-[10px] text-slate-300">${Utils.escapeHTML(n.message)}</p>
                </div>
            `).join('');

            // Auto-mark as read
            NotificationEngine.markAllRead(me.nik);

            return `
                <div class="space-y-3">
                    <div class="glass-ios p-3.5 rounded-2xl border border-sky-500/40 bg-gradient-to-br from-slate-900 to-sky-950/40 flex justify-between items-center">
                        <h4 class="text-xs font-bold text-sky-300 uppercase"><i class="fa-solid fa-bell mr-1"></i> NOTIFICATION CENTER</h4>
                        <span class="text-[9px] text-slate-400 font-mono">${list.length} Pesan</span>
                    </div>
                    <div class="space-y-2 max-h-80 overflow-y-auto">${notifHtml || '<p class="text-[10px] text-slate-500 text-center py-6">Belum ada notifikasi.</p>'}</div>
                </div>
            `;
        }
    };

    // --- 8. GLOBAL CITY OS INTERFACE & BACKWARDS COMPATIBILITY ---
    const CityOS = {
        init() {
            initUnifiedCityState();
            OnlineBus.init();
        },

        Jobs: JobsApp,
        Shopee: ShopeeApp,
        Halodoc: HalodocApp,
        Police: PoliceApp,
        Bank: BankApp,
        Gov: GovApp,
        Legal: LegalApp,
        Tech: TechApp,
        News: NewsApp,
        Courier: CourierApp,
        Food: FoodApp,
        Notifications: NotificationsApp,
        Services: ServiceEngine,
        NotificationsEngine: NotificationEngine
    };

    // Global Compatibility Layer untuk Modul Lama
    window.CityOS = CityOS;

    window.ShopModule = {
        initCityDatabase: initUnifiedCityState,
        registerStorePrompt: () => ShopeeApp.registerStorePrompt(),
        addStoreItemPrompt: () => ShopeeApp.addProductPrompt(),
        deleteProduct: (id) => {
            delete window.cityState.marketplace.products[id];
            if (typeof window.saveState === 'function') window.saveState();
        },
        buyProduct: (id) => ShopeeApp.buy(id),
        renderShopAppUI: () => ShopeeApp.render()
    };

    window.JobsModule = {
        getJobsList: () => JobDatabase.getJobsList(),
        hasPermission: (perm) => JobDatabase.hasPermission(perm),
        isDoctorOrNurse: () => JobDatabase.hasPermission('medical.treat'),
        isPolice: () => JobDatabase.hasPermission('police.ticket') || JobDatabase.hasPermission('police.patrol'),
        applyPermanentJob: (jobId) => JobsApp.apply(jobId),
        resignCurrentJob: () => JobsApp.resign(),
        doWorkShift: (jobId, isOvertime) => JobsApp.work(isOvertime),
        renderJobsAppUI: () => JobsApp.render(),
        renderHalodocAppUI: () => HalodocApp.render(),
        requestMedicalCall: () => HalodocApp.requestAmbulance(),
        treatMedicalCall: (idx) => {},
        renderPoliceHubAppUI: () => PoliceApp.render(),
        issuePoliceTicketPrompt: () => PoliceApp.issueTicketPrompt(),
        issueDpoPrompt: () => PoliceApp.issueDpoPrompt(),
        payPoliceTicket: (id) => PoliceApp.payTicket(id)
    };

    // Inisialisasi Otomatis saat Script Dimuat
    CityOS.init();

})();
