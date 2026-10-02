// ==========================================
// MODUL KEPENDUDUKAN & ADMIN (ADMIN.JS)
// ==========================================

const AdminModule = {
    // --- CEK HAK AKSES ---
    isOwner() {
        const myNik = window.gameState.user.identity.nik;
        return myNik && myNik === window.gameState.system.ownerId;
    },

    isAdmin() {
        const myNik = window.gameState.user.identity.nik;
        if (!myNik) return false;
        
        const isOwner = this.isOwner();
        const isAdminList = window.gameState.system.adminIds.includes(myNik);
        
        return isOwner || isAdminList;
    },

    // --- FITUR OWNER: TAMBAH / HAPUS ADMIN ---
    addAdminById(targetNik) {
        if (!this.isOwner()) {
            if (typeof showToast === 'function') showToast('Khusus Owner Utama Kota!', 'error');
            return;
        }

        if (!targetNik) return;

        if (window.gameState.system.adminIds.includes(targetNik)) {
            if (typeof showToast === 'function') showToast('ID tersebut sudah jadi Admin!', 'info');
            return;
        }

        window.gameState.system.adminIds.push(targetNik);
        window.saveState();

        if (typeof showToast === 'function') {
            showToast(`Berhasil mengangkat ID ${targetNik} jadi Admin!`, 'success');
        }
    },

    removeAdminById(targetNik) {
        if (!this.isOwner()) return;

        window.gameState.system.adminIds = window.gameState.system.adminIds.filter(id => id !== targetNik);
        window.saveState();

        if (typeof showToast === 'function') {
            showToast(`Admin ${targetNik} berhasil dicopot.`, 'info');
        }
    },

    registerCitizen(fullName, gender, passcode) {
        if (!passcode || passcode.length !== 4) {
            if (typeof showToast === 'function') showToast('PIN Lockscreen harus 4 digit!', 'error');
            return false;
        }

        const tgUser = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) 
            ? window.Telegram.WebApp.initDataUnsafe.user 
            : null;

        const nik = tgUser ? `TG-${tgUser.id}` : `IGN-${Math.floor(100000 + Math.random() * 900000)}`;
        const photoUrl = (tgUser && tgUser.photo_url) ? tgUser.photo_url : 'assets/images/avatars/default.png';

        window.gameState.user.identity = {
            nik: nik,
            fullName: fullName || (tgUser ? tgUser.first_name : 'Warga Ignatius'),
            gender: gender || 'Laki-laki',
            photoUrl: photoUrl,
            registeredAt: new Date().toISOString().split('T')[0],
            pinPasscode: passcode
        };

        window.gameState.user.family.kkNumber = `KK-${Math.floor(10000000 + Math.random() * 90000000)}`;
        window.gameState.registered = true;

        window.saveState();
        if (typeof showToast === 'function') showToast('Pendaftaran KTP & KK Berhasil!', 'success');
        return true;
    },

    applyLicense(licenseId) {
        const lic = window.LICENSES_DATABASE.find(l => l.id === licenseId);
        if (!lic) return;

        const userLegal = window.gameState.user.legal;

        if (userLegal.licenses.includes(licenseId)) {
            if (typeof showToast === 'function') showToast('Kamu sudah memiliki lisensi ini!', 'info');
            return;
        }

        if (window.gameState.crest < lic.cost) {
            if (typeof showToast === 'function') showToast(`Saldo Crest kurang! Butuh ${lic.cost.toLocaleString()} C`, 'error');
            return;
        }

        window.gameState.crest -= lic.cost;
        userLegal.licenses.push(licenseId);
        window.saveState();

        if (typeof showToast === 'function') showToast(`Berhasil memperoleh ${lic.name}`, 'success');
    },

    renderKTPAppUI() {
        const identity = window.gameState.user.identity;
        const family = window.gameState.user.family;
        const legal = window.gameState.user.legal;

        let licensesHtml = '';
        window.LICENSES_DATABASE.forEach(lic => {
            const owned = legal.licenses.includes(lic.id);
            licensesHtml += `
                <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 border ${owned ? 'border-emerald-500/30' : 'border-white/10'}">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                            <img src="${lic.iconPng}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="hidden items-center justify-center w-full h-full text-slate-300 text-sm">
                                <i class="fa-solid ${lic.iconFa}"></i>
                            </div>
                        </div>
                        <div>
                            <h5 class="text-xs font-bold text-white">${lic.name}</h5>
                            <span class="text-[10px] text-slate-400 font-mono">${lic.cost > 0 ? lic.cost.toLocaleString() + ' C' : 'Gratis'}</span>
                        </div>
                    </div>
                    ${owned ? `
                        <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-lg border border-emerald-500/30">Aktif</span>
                    ` : `
                        <button onclick="AdminModule.applyLicense('${lic.id}'); openApp('ktp');" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">
                            Ambil
                        </button>
                    `}
                </div>
            `;
        });

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl space-y-3 border border-sky-500/40 relative overflow-hidden">
                    <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <span class="text-[9px] font-bold text-sky-400 tracking-wider">KTP DIGITAL REPUBLIK IGNATIUS</span>
                        <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-md">SKCK: ${legal.skckStatus}</span>
                    </div>

                    <div class="flex items-center gap-3">
                        <img src="${identity.photoUrl}" class="w-16 h-20 rounded-xl border border-white/20 bg-slate-900 object-cover shrink-0" alt="PP">
                        <div class="space-y-1">
                            <div>
                                <span class="text-[8px] text-slate-400 uppercase font-mono block">NIK / ID Warga</span>
                                <h4 class="text-xs font-mono font-bold text-sky-400">${identity.nik}</h4>
                            </div>
                            <div>
                                <span class="text-[8px] text-slate-400 uppercase font-mono block">Nama Lengkap</span>
                                <h3 class="text-xs font-bold text-white">${identity.fullName}</h3>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-1">
                                <span>Gender: <b>${identity.gender}</b></span>
                                <span>No. KK: <b>${family.kkNumber}</b></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">📜 Layanan Lisensi & Capil</h4>
                    <div class="space-y-2">${licensesHtml}</div>
                </div>
            </div>
        `;
    },

    renderAdminPanelUI() {
        const isOwner = this.isOwner();
        const isAdmin = this.isAdmin();

        if (!isAdmin) {
            return `
                <div class="glass-ios p-6 rounded-3xl border border-rose-500/40 text-center space-y-3">
                    <div class="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl border border-rose-500/30">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                    <h4 class="text-sm font-bold text-white">AKSES DITOLAK</h4>
                    <p class="text-xs text-slate-400">Aplikasi ini khusus untuk Owner & Admin Resmi Kota Ignatius.</p>
                    <span class="text-[9px] font-mono text-slate-500 block">ID Anda: ${window.gameState.user.identity.nik || '-'}</span>
                </div>
            `;
        }

        let adminListHtml = '';
        const adminIds = window.gameState.system.adminIds || [];
        if (adminIds.length === 0) {
            adminListHtml = `<p class="text-[10px] text-slate-500 py-1">Belum ada Admin yang ditambahkan.</p>`;
        } else {
            adminIds.forEach(id => {
                adminListHtml += `
                    <div class="p-2 glass-card rounded-xl flex items-center justify-between text-xs">
                        <span class="font-mono text-sky-400 text-[11px]">${id}</span>
                        ${isOwner ? `
                            <button onclick="AdminModule.removeAdminById('${id}'); openApp('admin_panel');" class="text-[10px] text-rose-400 font-bold hover:underline">
                                Hapus Admin
                            </button>
                        ` : ''}
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-rose-500/40 space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved text-rose-400 text-base"></i>
                            <h4 class="text-xs font-bold text-rose-400 uppercase tracking-wider">Panel Control Admin</h4>
                        </div>
                        <span class="text-[9px] font-bold px-2 py-0.5 ${isOwner ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border-sky-500/30'} rounded-md border">
                            ${isOwner ? 'OWNER UTAMA' : 'ADMIN KOTA'}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="window.gameState.crest += 10000; window.saveState(); showToast('Admin: +10,000 Crest', 'success'); openApp('admin_panel');" class="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg">
                            +10,000 Crest
                        </button>
                        <button onclick="window.gameState.crest += 100000; window.saveState(); showToast('Admin: +100,000 Crest', 'success'); openApp('admin_panel');" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">
                            +100,000 Crest
                        </button>
                        <button onclick="window.gameState.vitality = 100; window.saveState(); showToast('Admin: Vitality 100%', 'success'); openApp('admin_panel');" class="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg">
                            Full Vitality
                        </button>
                        <button onclick="window.gameState.user.legal.licenses = window.LICENSES_DATABASE.map(l => l.id); window.saveState(); showToast('Admin: Semua Lisensi Terbuka!', 'success'); openApp('admin_panel');" class="py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg">
                            Unlock Lisensi
                        </button>
                    </div>
                </div>

                ${isOwner ? `
                    <div class="glass-ios p-4 rounded-3xl border border-amber-500/40 space-y-3">
                        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">👑 TAMBAH ADMIN (KHUSUS OWNER)</h4>
                        
                        <button onclick="AdminModule.promptAddAdmin();" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg">
                            + Tambah Admin Baru (Input NIK / ID)
                        </button>

                        <div class="space-y-1.5 pt-2 border-t border-white/10">
                            <span class="text-[10px] text-slate-400 uppercase font-mono block">Daftar Admin Aktif:</span>
                            <div class="space-y-1.5 max-h-32 overflow-y-auto">
                                ${adminListHtml}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    promptAddAdmin() {
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang mau dijadikan Admin:");
        if (!targetNik) return;
        this.addAdminById(targetNik);
        openApp('admin_panel');
    }
};

window.AdminModule = AdminModule;
