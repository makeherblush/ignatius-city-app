// ==========================================
// MODUL DUKCAPIL & CONTROL PANEL ADMIN (ADMIN.JS)
// ==========================================

const AdminModule = {
    // Check Status Owner
    isOwner() {
        const TARGET_OWNER_ID = '8853198899';
        const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (tgId && String(tgId) === TARGET_OWNER_ID) return true;

        const myNik = window.gameState?.user?.identity?.nik;
        if (myNik && String(myNik).includes(TARGET_OWNER_ID)) return true;

        const systemOwner = window.gameState?.system?.ownerId;
        if (systemOwner && String(systemOwner).includes(TARGET_OWNER_ID)) return true;

        return false;
    },

    // Check Status Admin
    isAdmin() {
        if (this.isOwner()) return true;

        const TARGET_OWNER_ID = '8853198899';
        const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        const myNik = window.gameState?.user?.identity?.nik;
        const adminList = window.gameState?.system?.adminIds || [];

        if (tgId && adminList.some(id => String(id).includes(String(tgId)))) return true;
        if (myNik && adminList.some(id => String(id) === String(myNik))) return true;

        return false;
    },

    // Toggle 3D Flip KTP Card
    flipKtpCard() {
        if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
        const cardInner = document.getElementById('ktp-card-inner');
        if (cardInner) {
            cardInner.classList.toggle('rotate-y-180');
        }
    },

    // Register Logic
    registerCitizen(fullName, gender, passcode) {
        if (!passcode || String(passcode).trim().length !== 4) {
            if (typeof showToast === 'function') showToast('PIN Lockscreen harus 4 digit!', 'error');
            return false;
        }

        if (!window.gameState) window.gameState = {};
        if (!window.gameState.user) window.gameState.user = {};
        if (!window.gameState.user.identity) window.gameState.user.identity = {};
        if (!window.gameState.user.family) window.gameState.user.family = {};
        if (!window.gameState.user.legal) window.gameState.user.legal = {};

        const tgUser = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) 
            ? window.Telegram.WebApp.initDataUnsafe.user 
            : null;

        const nik = tgUser ? `TG-${tgUser.id}` : `IGN-${Math.floor(100000 + Math.random() * 900000)}`;
        const photoUrl = (tgUser && tgUser.photo_url) 
            ? tgUser.photo_url 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Warga')}&background=0284c7&color=fff`;

        window.gameState.user.identity = {
            nik: nik,
            fullName: fullName || (tgUser ? tgUser.first_name : 'Warga Ignatius'),
            gender: gender || 'Laki-laki',
            photoUrl: photoUrl,
            registeredAt: new Date().toISOString().split('T')[0],
            pinPasscode: String(passcode).trim()
        };

        if (!window.gameState.user.family.kkNumber) {
            window.gameState.user.family.kkNumber = `KK-${Math.floor(10000000 + Math.random() * 90000000)}`;
        }

        window.gameState.registered = true;

        if (!window.gameState.system) window.gameState.system = {};
        if (nik.includes('8853198899') || !window.gameState.system.ownerId) {
            window.gameState.system.ownerId = nik;
        }

        if (typeof window.saveState === 'function') window.saveState();
        return true;
    },

    registerMarriage() {
        const spouseNik = prompt("Masukkan NIK / ID Telegram Pasangan:");
        if (!spouseNik) return;
        
        const spouseName = prompt("Masukkan Nama Pasangan (Opsional):") || `Warga (${spouseNik})`;

        if (!window.gameState.user.family) window.gameState.user.family = {};
        window.gameState.user.family.spouseName = spouseName;
        window.gameState.user.family.spouseNik = spouseNik;
        window.gameState.user.family.marriageDate = new Date().toLocaleDateString('id-ID');

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Pernikahan tersinkronisasi dengan NIK ${spouseNik}!`, 'success');
        if (typeof openApp === 'function') openApp('ktp');
    },

    // Dukcapil Tambah Anggota KK (Direct NIK Sync)
    addChildToKK() {
        const childNik = prompt("Masukkan NIK / ID Telegram Anggota Keluarga:");
        if (!childNik) return;

        const childName = prompt("Nama Anggota Keluarga (Opsional):") || `Anggota (${childNik})`;

        if (!window.gameState.user.family) window.gameState.user.family = {};
        if (!window.gameState.user.family.childrenNiks) window.gameState.user.family.childrenNiks = [];

        window.gameState.user.family.childrenNiks.push({ name: childName, nik: childNik });
        if (typeof window.saveState === 'function') window.saveState();

        if (typeof showToast === 'function') showToast(`Anggota keluarga NIK ${childNik} berhasil ditambahkan!`, 'success');
        if (typeof openApp === 'function') openApp('ktp');
    },
    
    // RENDER KTP DIGITAL 3D FLIP CARD
    renderKTPAppUI() {
        const user = window.gameState?.user || {};
        const identity = user.identity || {};
        const family = user.family || {};
        const legal = user.legal || {};

        let childrenHtml = '';
        if (family.childrenNiks && family.childrenNiks.length > 0) {
            family.childrenNiks.forEach((child, idx) => {
                childrenHtml += `
                    <div class="flex items-center justify-between py-1 border-b border-white/5 text-[10px]">
                        <span class="text-slate-300">${idx + 1}. ${child.name}</span>
                        <span class="font-mono text-sky-400">${child.nik}</span>
                    </div>
                `;
            });
        } else {
            childrenHtml = `<p class="text-[9px] text-slate-500 py-1">Belum ada anggota keluarga terdaftar.</p>`;
        }

        return `
            <div class="space-y-4 pt-1">
                <div class="text-center">
                    <p class="text-[10px] text-sky-400 font-bold uppercase tracking-widest"><i class="fa-solid fa-hand-pointer animate-pulse mr-1"></i> Klik Kartu Untuk Membalik (Flip 3D)</p>
                </div>

                <div class="w-full h-56 perspective-1000 cursor-pointer" onclick="AdminModule.flipKtpCard()">
                    <div id="ktp-card-inner" class="w-full h-full relative transform-style-3d shadow-2xl rounded-3xl">
                        
                        <!-- DEPAN KTP -->
                        <div class="absolute inset-0 w-full h-full glass-ios rounded-3xl p-4 border border-sky-500/50 flex flex-col justify-between backface-hidden bg-gradient-to-br from-slate-900/90 via-sky-950/80 to-slate-900/90">
                            <div class="flex items-center justify-between border-b border-white/10 pb-2">
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid fa-landmark-flag text-sky-400 text-sm"></i>
                                    <span class="text-[9px] font-bold text-white tracking-widest">KTP DIGITAL REPUBLIK IGNATIUS</span>
                                </div>
                                <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[8px] font-bold rounded border border-emerald-500/30">SKCK: ${legal.skckStatus || 'CLEAN'}</span>
                            </div>

                            <div class="flex items-center gap-3 py-1">
                                <img src="${identity.photoUrl || 'https://ui-avatars.com/api/?name=Warga'}" class="w-16 h-20 rounded-xl border border-sky-400/40 bg-slate-900 object-cover shrink-0 shadow-lg" alt="PP">
                                <div class="space-y-1">
                                    <div>
                                        <span class="text-[7px] text-slate-400 uppercase font-mono block">NIK / ID Warga</span>
                                        <h4 class="text-xs font-mono font-bold text-sky-300 tracking-wider">${identity.nik || '-'}</h4>
                                    </div>
                                    <div>
                                        <span class="text-[7px] text-slate-400 uppercase font-mono block">Nama Lengkap</span>
                                        <h3 class="text-xs font-bold text-white leading-tight">${identity.fullName || 'Warga Ignatius'}</h3>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 text-[9px] text-slate-300 pt-0.5">
                                        <span>Gender: <b>${identity.gender || 'Laki-laki'}</b></span>
                                        <span>Status: <b class="text-emerald-400">Warga Aktif</b></span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between border-t border-white/10 pt-2 text-[8px] text-slate-400 font-mono">
                                <span>Terdaftar: ${identity.registeredAt || '2026-10-02'}</span>
                                <span class="text-sky-400 font-bold">KARTU DEPAN ▲</span>
                            </div>
                        </div>

                        <!-- BELAKANG KTP -->
                        <div class="absolute inset-0 w-full h-full glass-ios rounded-3xl p-4 border border-sky-500/50 flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950">
                            <div class="flex items-center justify-between border-b border-white/10 pb-2">
                                <span class="text-[9px] font-bold text-slate-300 tracking-wider">DATA KELUARGA & DUKCAPIL</span>
                                <i class="fa-solid fa-qrcode text-sky-400 text-base"></i>
                            </div>

                            <div class="space-y-1.5 py-1 text-[9px] text-slate-300">
                                <div class="flex justify-between border-b border-white/5 pb-1">
                                    <span class="text-slate-400">No. Kartu Keluarga:</span>
                                    <span class="font-mono font-bold text-white">${family.kkNumber || 'KK-90128391'}</span>
                                </div>
                                <div class="flex justify-between border-b border-white/5 pb-1">
                                    <span class="text-slate-400">Pasangan:</span>
                                    <span class="font-bold text-amber-300">${family.spouseName ? `${family.spouseName} (${family.spouseNik})` : 'Belum Menikah'}</span>
                                </div>
                                <div class="flex justify-between border-b border-white/5 pb-1">
                                    <span class="text-slate-400">Kepala Keluarga:</span>
                                    <span class="font-bold text-white">${family.isHeadOfFamily ? 'YA' : 'TIDAK'}</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-between border-t border-white/10 pt-2">
                                <span class="text-[8px] text-slate-400 font-mono">Dinas Capil Kota Ignatius</span>
                                <span class="text-sky-400 font-bold text-[8px]">KARTU BELAKANG ▲</span>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="glass-ios p-4 rounded-3xl border border-sky-500/30 space-y-3">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider"><i class="fa-solid fa-users mr-1"></i> Layanan Update KK & Keluarga</h4>
                        <span class="text-[9px] font-mono text-slate-400">No. KK: ${family.kkNumber || '-'}</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="AdminModule.registerMarriage()" class="p-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-ring text-amber-300"></i> Catat Nikah
                        </button>
                        <button onclick="AdminModule.addChildToKK()" class="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-user-plus"></i> Tambah Anggota
                        </button>
                    </div>

                    <div class="pt-2 border-t border-white/10">
                        <span class="text-[9px] font-semibold text-slate-400 uppercase block mb-1">Daftar Anggota Dalam KK:</span>
                        <div class="space-y-1 max-h-24 overflow-y-auto">
                            ${childrenHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // RENDER PANEL CONTROL ADMIN
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
                </div>
            `;
        }

        let adminListHtml = '';
        const adminIds = window.gameState?.system?.adminIds || [];
        if (adminIds.length === 0) {
            adminListHtml = `<p class="text-[10px] text-slate-500 py-1">Belum ada Admin tambahan.</p>`;
        } else {
            adminIds.forEach(id => {
                adminListHtml += `
                    <div class="p-2 glass-card rounded-xl flex items-center justify-between text-xs">
                        <span class="font-mono text-sky-400 text-[11px]">${id}</span>
                        ${isOwner ? `
                            <button onclick="AdminModule.removeAdminById('${id}'); openApp('admin_panel');" class="text-[10px] text-rose-400 font-bold hover:underline">Hapus</button>
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
                            <h4 class="text-xs font-bold text-rose-400 uppercase tracking-wider">Control Panel Admin</h4>
                        </div>
                        <span class="text-[9px] font-bold px-2 py-0.5 ${isOwner ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border-sky-500/30'} rounded-md border">
                            ${isOwner ? 'OWNER UTAMA' : 'ADMIN KOTA'}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="AdminModule.inspectCitizen()" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-magnifying-glass"></i> Cek Data Warga
                        </button>
                        <button onclick="AdminModule.jailCitizenPrompt()" class="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-handcuffs"></i> Penjarakan Warga
                        </button>
                    </div>
                </div>

                <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">🛠️ Quick Cheats Dev</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="window.gameState.crest += 50000; window.saveState(); showToast('Admin: +50,000 Crest', 'success'); openApp('admin_panel');" class="py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg">+50,000 Crest</button>
                        <button onclick="window.gameState.vitality = 100; window.saveState(); showToast('Admin: Vitality 100%', 'success'); openApp('admin_panel');" class="py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg">Full Vitality</button>
                    </div>
                </div>

                ${isOwner ? `
                    <div class="glass-ios p-4 rounded-3xl border border-amber-500/40 space-y-3">
                        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">👑 TAMBAH ADMIN (KHUSUS OWNER)</h4>
                        
                        <button onclick="AdminModule.promptAddAdmin()" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg">
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

    inspectCitizen() {
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang ingin diperiksa:");
        if (!targetNik) return;
        const user = window.gameState?.user || {};
        alert(`
--- HASIL PENGECEKAN WARGA ---
NIK: ${user.identity?.nik || '-'}
Nama: ${user.identity?.fullName || '-'}
Gender: ${user.identity?.gender || '-'}
Saldo Crest: ${(window.gameState?.crest || 0).toLocaleString()} C
Vitality: ${window.gameState?.vitality || 0}%
SKCK: ${user.legal?.skckStatus || 'CLEAN'}
        `);
    },

    jailCitizenPrompt() {
        const targetNik = prompt("Masukkan NIK Warga yang akan dipenjarakan:");
        if (!targetNik) return;
        const minutes = prompt("Lama Hukuman Penjara (Menit):") || "10";
        if (typeof showToast === 'function') showToast(`Warga ${targetNik} resmi dipenjara ${minutes} menit!`, 'error');
    },

    promptAddAdmin() {
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang mau dijadikan Admin:");
        if (!targetNik) return;

        if (!window.gameState.system.adminIds) window.gameState.system.adminIds = [];
        if (!window.gameState.system.adminIds.includes(targetNik)) {
            window.gameState.system.adminIds.push(targetNik);
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`Berhasil mengangkat ${targetNik} sebagai Admin!`, 'success');
        }
        openApp('admin_panel');
    },

    removeAdminById(targetNik) {
        if (!this.isOwner()) return;
        window.gameState.system.adminIds = (window.gameState.system.adminIds || []).filter(id => id !== targetNik);
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Admin ${targetNik} dicopot.`, 'info');
    }
};

window.AdminModule = AdminModule;
