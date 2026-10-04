// =================================================================
// CITY ONLINE OS - UNIFIED SYSTEM ENGINE (COMPLETE INTEGRATED VERSION)
// =================================================================

(function (global) {
    'use strict';

    // -------------------------------------------------------------
    // 1. GLOBAL CITY STATE (CENTRALIZED DATA STORE)
    // -------------------------------------------------------------
    global.cityState = global.cityState || {
        version: '2.0.0-UNIFIED',
        timestamp: Date.now(),
        stores: [
            { id: 'store_1', name: 'Supermarket Central', ownerId: 'npc_1', items: ['food_pack', 'water_bottle'] },
            { id: 'store_2', name: 'Apotek Medika', ownerId: 'npc_2', items: ['medkit', 'bandage'] }
        ],
        orders: [],
        serviceRequests: [],
        notifications: [],
        policeWantedList: [],
        systemLogs: []
    };

    // -------------------------------------------------------------
    // 2. UNIVERSAL SERVICE ENGINE
    // -------------------------------------------------------------
    class UnifiedServiceEngine {
        constructor() {
            this.requests = global.cityState.serviceRequests;
        }

        createRequest({ requesterId, service, type, providerPermission, cost = 0, metadata = {} }) {
            const req = {
                id: 'SRV_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                requesterId,
                service,
                type,
                providerPermission,
                cost,
                metadata,
                status: 'WAITING', // WAITING, IN_PROGRESS, COMPLETED, CANCELLED
                providerId: null,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            this.requests.push(req);
            this.broadcastNotification({
                title: `Layanan Baru: ${type.toUpperCase()}`,
                message: `Permintaan baru untuk layanan ${service}.`,
                targetPermission: providerPermission,
                serviceId: req.id
            });

            this.logAction('CREATE_REQUEST', req);
            return req;
        }

        acceptRequest(requestId, providerId) {
            const req = this.requests.find(r => r.id === requestId);
            if (!req) return { success: false, message: 'Permintaan tidak ditemukan.' };
            if (req.status !== 'WAITING') return { success: false, message: 'Permintaan sudah diambil atau dibatalkan.' };

            req.status = 'IN_PROGRESS';
            req.providerId = providerId;
            req.updatedAt = Date.now();

            this.broadcastNotification({
                title: 'Layanan Diterima',
                message: `Permintaan ${req.type} Anda telah diterima oleh petugas.`,
                targetUserId: req.requesterId
            });

            this.logAction('ACCEPT_REQUEST', req);
            return { success: true, request: req };
        }

        completeRequest(requestId) {
            const req = this.requests.find(r => r.id === requestId);
            if (!req) return { success: false, message: 'Permintaan tidak ditemukan.' };

            req.status = 'COMPLETED';
            req.updatedAt = Date.now();

            this.broadcastNotification({
                title: 'Layanan Selesai',
                message: `Permintaan ${req.type} Anda telah selesai diproses.`,
                targetUserId: req.requesterId
            });

            this.logAction('COMPLETE_REQUEST', req);
            return { success: true, request: req };
        }

        getRequestsByService(service) {
            return this.requests.filter(r => r.service === service);
        }

        broadcastNotification({ title, message, targetPermission = null, targetUserId = null, serviceId = null }) {
            const notif = {
                id: 'NOTIF_' + Date.now() + '_' + Math.floor(Math.random() * 100),
                title,
                message,
                targetPermission,
                targetUserId,
                serviceId,
                timestamp: Date.now(),
                read: false
            };
            global.cityState.notifications.unshift(notif);
        }

        logAction(action, data) {
            global.cityState.systemLogs.push({
                action,
                data,
                timestamp: Date.now()
            });
        }
    }

    global.CityServiceEngine = new UnifiedServiceEngine();
    global.ServiceEngine = global.CityServiceEngine;

    // -------------------------------------------------------------
    // 3. JOBS MODULE & PERMISSION SYSTEM
    // -------------------------------------------------------------
    global.JobsModule = {
        hasPermission: function (permissionNeeded) {
            if (!permissionNeeded) return true;
            const user = global.gameState?.user || {};
            const permissions = user.permissions || user.jobPermissions || [];
            
            // Admin atau Overlord selalu memiliki akses penuh
            if (user.role === 'admin' || user.role === 'dev') return true;

            return permissions.includes(permissionNeeded);
        },

        renderJobsAppUI: function () {
            const jobs = [
                { id: 'job_police', name: 'Kepolisian Kota', perm: 'police.ticket', desc: 'Menjaga ketertiban & merespons darurat' },
                { id: 'job_medic', name: 'Tenaga Medis 911', perm: 'medical.consult', desc: 'Melayani kesehatan & panggilan ambulans' },
                { id: 'job_banker', name: 'Petugas Bank Central', perm: 'bank.teller', desc: 'Mengelola transaksi keuangan & pinjaman' },
                { id: 'job_legal', name: 'Konsultan Hukum / Advokat', perm: 'law.advocate', desc: 'Memberikan bantuan & advokasi hukum' },
                { id: 'job_courier', name: 'Kurir Ekspres', perm: 'courier.deliver', desc: 'Mengantar paket & logistik antar wilayah' },
                { id: 'job_chef', name: 'Staf Kuliner / Resto', perm: 'food.serve', desc: 'Menyajikan pesanan makanan & minuman' }
            ];

            let html = `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-sky-500/30 bg-slate-900/80">
                        <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider"><i class="fa-solid fa-briefcase mr-1"></i> Bursa Karir & Profesi Kota</h4>
                        <p class="text-[10px] text-slate-300 pt-1">Pilih profesi resmi untuk mendapatkan akses dashboard provider layanan terkait.</p>
                    </div>
                    <div class="grid grid-cols-1 gap-2.5">
            `;

            jobs.forEach(j => {
                const isCurrent = this.hasPermission(j.perm);
                html += `
                    <div class="glass-card p-3.5 rounded-2xl flex items-center justify-between border ${isCurrent ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-white/10'}">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-white">${j.name}</span>
                                ${isCurrent ? '<span class="text-[8px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">AKTIF</span>' : ''}
                            </div>
                            <p class="text-[10px] text-slate-400 mt-0.5">${j.desc}</p>
                        </div>
                        <button onclick="JobsModule.toggleJobRole('${j.perm}')" class="px-3 py-1.5 ${isCurrent ? 'bg-rose-600/80 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500'} text-white text-[10px] font-bold rounded-xl shadow transition-all">
                            ${isCurrent ? 'Resign' : 'Lamar'}
                        </button>
                    </div>
                `;
            });

            html += `</div></div>`;
            return html;
        },

        toggleJobRole: function (permissionNeeded) {
            if (!global.gameState) global.gameState = {};
            if (!global.gameState.user) global.gameState.user = {};
            if (!global.gameState.user.permissions) global.gameState.user.permissions = [];

            const perms = global.gameState.user.permissions;
            const index = perms.indexOf(permissionNeeded);

            if (index > -1) {
                perms.splice(index, 1);
                if (typeof showToast === 'function') showToast('Anda telah mengundurkan diri dari profesi.', 'info');
            } else {
                perms.push(permissionNeeded);
                if (typeof showToast === 'function') showToast('Selamat! Profesi baru berhasil diaktifkan.', 'success');
            }

            if (typeof openApp === 'function') openApp('jobs');
        }
    };

    // -------------------------------------------------------------
    // 4. SHOP MODULE (MARKETPLACE INTEGRATION)
    // -------------------------------------------------------------
    global.ShopModule = {
        renderShopAppUI: function () {
            const stores = global.cityState.stores || [];
            let storeHtml = '';

            stores.forEach(s => {
                storeHtml += `
                    <div class="glass-card p-3.5 rounded-2xl border border-white/10 space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-amber-300"><i class="fa-solid fa-store mr-1"></i> ${s.name}</span>
                            <span class="text-[9px] font-mono text-slate-400">ID: ${s.id}</span>
                        </div>
                        <div class="flex gap-2">
                            ${s.items.map(item => `<span class="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-slate-200">${item}</span>`).join('')}
                        </div>
                    </div>
                `;
            });

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-amber-500/30 bg-slate-900/80">
                        <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider"><i class="fa-solid fa-bag-shopping mr-1"></i> IgnaShopee Marketplace</h4>
                        <p class="text-[10px] text-slate-300 pt-1">Pusat perbelanjaan barang dan pendaftaran merchant usaha kota.</p>
                    </div>
                    <div class="space-y-2">
                        <h5 class="text-xs font-bold text-slate-300 uppercase">Daftar Toko Aktif</h5>
                        <div class="space-y-2">${storeHtml}</div>
                    </div>
                </div>
            `;
        }
    };

})(typeof window !== 'undefined' ? window : this);


// =================================================================
// 5. SYSTEM APP REGISTRY & UNIFIED UI ROUTER
// =================================================================

(function initCityAppRegistry() {
    window.CITY_APP_REGISTRY = {
        'jobs': {
            title: 'Bursa Kerja & Karir',
            icon: 'fa-briefcase',
            color: 'sky',
            render: () => window.JobsModule ? window.JobsModule.renderJobsAppUI() : renderEngineFallback('jobs')
        },
        'shop': {
            title: 'IgnaShopee Marketplace',
            icon: 'fa-bag-shopping',
            color: 'amber',
            render: () => window.ShopModule ? window.ShopModule.renderShopAppUI() : renderEngineFallback('marketplace')
        },
        'app_halodoc': {
            title: 'Halodoc Medika',
            icon: 'fa-hospital',
            color: 'rose',
            render: () => renderUnifiedAppUI({
                appId: 'app_halodoc',
                service: 'halodoc',
                permissionNeeded: 'medical.consult',
                consumerTitle: 'Halodoc Pasien & 911',
                providerTitle: 'Halodoc Provider Dashboard',
                consumerActions: [
                    { label: '🚑 Panggil Ambulans (911)', type: 'EMERGENCY_AMBULANCE', cost: 0 },
                    { label: '🩺 Konsultasi Dokter', type: 'CONSULTATION', cost: 1500 }
                ]
            })
        },
        'app_police': {
            title: 'Police Hub',
            icon: 'fa-shield-halved',
            color: 'indigo',
            render: () => renderUnifiedAppUI({
                appId: 'app_police',
                service: 'police',
                permissionNeeded: 'police.ticket',
                consumerTitle: 'Polres Laporan Warga',
                providerTitle: 'Police Patrol & Station HQ',
                consumerActions: [
                    { label: '🚨 Lapor Kejahatan (911)', type: 'POLICE_EMERGENCY', cost: 0 },
                    { label: '📄 Ajukan Surat Izin', type: 'PERMIT_REQUEST', cost: 500 }
                ]
            })
        },
        'app_bank': {
            title: 'Bank Central',
            icon: 'fa-building-columns',
            color: 'emerald',
            render: () => renderUnifiedAppUI({
                appId: 'app_bank',
                service: 'bank',
                permissionNeeded: 'bank.teller',
                consumerTitle: 'Layanan Nasabah Bank',
                providerTitle: 'Bank Teller & CS Station',
                consumerActions: [
                    { label: '💳 Konsultasi Pinjaman', type: 'LOAN_REQUEST', cost: 0 },
                    { label: '🔑 Buka Deposito Baru', type: 'DEPOSIT_OPEN', cost: 10000 }
                ]
            })
        },
        'app_legal': {
            title: 'Legal Center',
            icon: 'fa-scale-balanced',
            color: 'purple',
            render: () => renderUnifiedAppUI({
                appId: 'app_legal',
                service: 'legal',
                permissionNeeded: 'law.advocate',
                consumerTitle: 'Pusat Bantuan Hukum',
                providerTitle: 'Dashboard Legal & Advokat',
                consumerActions: [
                    { label: '⚖ Konsultasi Hukum Warga', type: 'LEGAL_ADVICE', cost: 3000 }
                ]
            })
        },
        'app_tech': {
            title: 'Tech Support',
            icon: 'fa-wrench',
            color: 'cyan',
            render: () => renderUnifiedAppUI({
                appId: 'app_tech',
                service: 'tech',
                permissionNeeded: 'tech.developer',
                consumerTitle: 'Dukungan IT Kota',
                providerTitle: 'Engine Center & Server Operations',
                consumerActions: [
                    { label: '🖥️ Lapor Perbaikan Server', type: 'IT_SUPPORT', cost: 500 }
                ]
            })
        },
        'app_news': {
            title: 'Ignatius News',
            icon: 'fa-newspaper',
            color: 'red',
            render: () => renderUnifiedAppUI({
                appId: 'app_news',
                service: 'news',
                permissionNeeded: 'news.reporter',
                consumerTitle: 'Koran & Berita Kota',
                providerTitle: 'Redaksi & Publishing Portal',
                consumerActions: [
                    { label: '📰 Kirim Liputan Warga', type: 'NEWS_TIP', cost: 0 }
                ]
            })
        },
        'app_courier': {
            title: 'IgnaCourier',
            icon: 'fa-truck-fast',
            color: 'orange',
            render: () => renderUnifiedAppUI({
                appId: 'app_courier',
                service: 'courier',
                permissionNeeded: 'courier.deliver',
                consumerTitle: 'Pengiriman Paket Kilat',
                providerTitle: 'Courier Control Panel',
                consumerActions: [
                    { label: '📦 Kirim Barang/Dokumen', type: 'PACKAGE_DELIVERY', cost: 800 }
                ]
            })
        },
        'app_food': {
            title: 'IgnaFood',
            icon: 'fa-utensils',
            color: 'amber',
            render: () => renderUnifiedAppUI({
                appId: 'app_food',
                service: 'food',
                permissionNeeded: 'food.serve',
                consumerTitle: 'Pesan Makanan & Resto',
                providerTitle: 'Kitchen & Resto Orders Dashboard',
                consumerActions: [
                    { label: '🍔 Pesan Makanan Siap Saji', type: 'FOOD_ORDER', cost: 2500 }
                ]
            })
        },
        'app_notifications': {
            title: 'Notification Center',
            icon: 'fa-bell',
            color: 'yellow',
            render: () => renderNotificationCenterUI()
        }
    };

    // Fungsi Render Dual-Sided UI (Adaptif Warga vs Petugas)
    function renderUnifiedAppUI(config) {
        const user = window.gameState?.user || {};
        const hasPermission = window.JobsModule?.hasPermission
            ? window.JobsModule.hasPermission(config.permissionNeeded)
            : false;

        const engine = window.CityServiceEngine || window.ServiceEngine;
        const requests = engine ? engine.getRequestsByService(config.service) : [];

        if (hasPermission) {
            // TAMPILAN PROVIDER DASHBOARD (PETUGAS)
            let pendingRequestsHtml = '';
            const pendingReqs = requests.filter(r => r.status === 'WAITING' || r.providerId === user.identity?.userId);

            if (pendingReqs.length === 0) {
                pendingRequestsHtml = `<p class="text-[10px] text-slate-500 py-4 text-center">Belum ada antrean masuk untuk layanan ini.</p>`;
            } else {
                pendingReqs.forEach(req => {
                    pendingRequestsHtml += `
                        <div class="glass-card p-3 rounded-2xl flex items-center justify-between border border-sky-500/30">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-white">${req.type}</span>
                                    <span class="text-[8px] px-2 py-0.5 rounded ${req.status === 'WAITING' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'} font-mono">${req.status}</span>
                                </div>
                                <span class="text-[9px] text-slate-400 font-mono block">Requester: ${req.requesterId} | ID: ${req.id}</span>
                            </div>
                            <div class="flex gap-1.5">
                                ${req.status === 'WAITING' ? `
                                    <button onclick="executeServiceAction('${req.id}', 'accept', '${config.appId}')" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl shadow-md">Terima</button>
                                ` : ''}
                                ${req.status === 'IN_PROGRESS' ? `
                                    <button onclick="executeServiceAction('${req.id}', 'complete', '${config.appId}')" class="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-xl shadow-md">Selesaikan</button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
            }

            return `
                <div class="space-y-4" data-active-app="${config.appId}">
                    <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900">
                        <div class="flex justify-between items-center">
                            <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider"><i class="fa-solid fa-user-gear mr-1"></i> ${config.providerTitle}</h4>
                            <span class="text-[8px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">PROVIDER AKTIF</span>
                        </div>
                        <p class="text-[10px] text-slate-300 pt-1">Kamu terhubung sebagai petugas resmi. Tangani permintaan masuk di bawah ini.</p>
                    </div>
                    <div class="space-y-2">
                        <h5 class="text-xs font-bold text-slate-300 uppercase">Antrean Masuk (${pendingReqs.length})</h5>
                        <div class="space-y-2 max-h-72 overflow-y-auto pr-1">${pendingRequestsHtml}</div>
                    </div>
                </div>
            `;
        }

        // TAMPILAN CONSUMER (WARGA BIASA)
        let actionButtons = '';
        config.consumerActions.forEach(act => {
            actionButtons += `
                <button onclick="createUniversalRequest('${config.service}', '${act.type}', '${config.permissionNeeded}', ${act.cost}, '${config.appId}')" class="p-3.5 glass-card rounded-2xl flex items-center justify-between hover:border-sky-400/50 transition-all active:scale-95">
                    <span class="text-xs font-bold text-white">${act.label}</span>
                    <span class="text-[10px] font-mono text-amber-400">${act.cost > 0 ? act.cost.toLocaleString() + ' C' : 'Gratis'}</span>
                </button>
            `;
        });

        return `
            <div class="space-y-4" data-active-app="${config.appId}">
                <div class="glass-ios p-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950">
                    <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider">${config.consumerTitle}</h4>
                    <p class="text-[10px] text-slate-300 pt-1">Pilih jenis layanan di bawah ini untuk terhubung secara otomatis dengan provider yang sedang bertugas.</p>
                </div>
                <div class="grid grid-cols-1 gap-2">${actionButtons}</div>
            </div>
        `;
    }

    // Pusat Pemberitahuan / Notification Center UI
    function renderNotificationCenterUI() {
        const notifs = window.cityState?.notifications || [];
        let notifHtml = '';

        if (notifs.length === 0) {
            notifHtml = `<p class="text-[10px] text-slate-500 py-6 text-center">Tidak ada pemberitahuan sistem saat ini.</p>`;
        } else {
            notifs.slice(0, 15).forEach(n => {
                notifHtml += `
                    <div class="glass-card p-3 rounded-2xl space-y-1 border border-white/5">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-sky-300">${n.title || 'Pemberitahuan'}</span>
                            <span class="text-[8px] text-slate-500 font-mono">${new Date(n.timestamp || Date.now()).toLocaleTimeString()}</span>
                        </div>
                        <p class="text-[10px] text-slate-300">${n.message || ''}</p>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-3">
                <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider"><i class="fa-solid fa-bell mr-1"></i> Pusat Notifikasi Kota</h4>
                <div class="space-y-2 max-h-80 overflow-y-auto pr-1">${notifHtml}</div>
            </div>
        `;
    }

    function renderEngineFallback(moduleName) {
        return `<div class="p-4 text-center text-rose-400 text-xs font-bold">Modul ${moduleName} sedang memuat ulang...</div>`;
    }

    // Window OpenApp Manager
    window.openApp = function (appId) {
        const appContainer = document.getElementById('app-content-area') || document.getElementById('app-container');
        const appInfo = window.CITY_APP_REGISTRY[appId];

        if (!appInfo) {
            if (typeof showToast === 'function') showToast(`Aplikasi ${appId} belum terdaftar!`, 'error');
            return;
        }

        if (appContainer) {
            appContainer.innerHTML = appInfo.render();
        }

        if (typeof window.setActiveAppHeader === 'function') {
            window.setActiveAppHeader(appInfo.title, appInfo.icon);
        }
    };
})();

// =================================================================
// 6. HELPER ACTIONS & EVENT HANDLERS
// =================================================================

function createUniversalRequest(service, type, permissionNeeded, cost, appId) {
    const engine = window.CityServiceEngine || window.ServiceEngine;
    if (!engine) {
        if (typeof showToast === 'function') showToast('ServiceEngine belum aktif!', 'error');
        return;
    }

    const userId = window.gameState?.user?.identity?.userId || 'user_local';

    if (cost > 0 && (window.gameState?.crest || 0) < cost) {
        if (typeof showToast === 'function') showToast(`Saldo Crest tidak cukup! Butuh ${cost.toLocaleString()} C`, 'error');
        return;
    }

    engine.createRequest({
        requesterId: userId,
        service: service,
        type: type,
        providerPermission: permissionNeeded,
        cost: cost
    });

    if (cost > 0 && window.gameState) {
        window.gameState.crest -= cost;
    }

    if (typeof showToast === 'function') showToast(`Permintaan ${type} berhasil dikirim!`, 'success');
    if (typeof openApp === 'function') openApp(appId);
}

function executeServiceAction(requestId, actionType, appId) {
    const engine = window.CityServiceEngine || window.ServiceEngine;
    const providerId = window.gameState?.user?.identity?.userId || 'user_local';

    if (actionType === 'accept') {
        engine.acceptRequest(requestId, providerId);
        if (typeof showToast === 'function') showToast('Kamu menerima permintaan ini!', 'info');
    } else if (actionType === 'complete') {
        engine.completeRequest(requestId);
        if (typeof showToast === 'function') showToast('Layanan berhasil diselesaikan!', 'success');
    }

    if (typeof openApp === 'function') openApp(appId);
}
