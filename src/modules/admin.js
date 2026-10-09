// ==========================================
// MODUL DUKCAPIL & CONTROL PANEL ADMIN (FULL VERSI REFACTORED)
// IGNATIUS CITY RP SYSTEM
// ==========================================

const AdminModule = {
    // --- HELPER UTILITAS & SANITASI ---
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Pencarian warga berbasis ID terpusat
    getCitizenById(nikOrTgId) {
        if (!nikOrTgId) return null;
        const target = String(nikOrTgId).trim();
        const citizens = window.gameState?.citizens || [];
        
        // Cek database warga terpusat
        let citizen = citizens.find(c => 
            String(c.identity?.nik) === target || 
            String(c.telegramId) === target
        );

        // Fallback cek data lokal user
        if (!citizen && window.gameState?.user?.identity?.nik === target) {
            citizen = window.gameState.user;
        }

        return citizen || null;
    },

    // --- MANAJEMEN HAK AKSES ---
    isOwner() {
        const TARGET_OWNER_ID = '8853198899';
        const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (tgId && String(tgId) === TARGET_OWNER_ID) return true;

        const myNik = window.gameState?.user?.identity?.nik;
        if (myNik && String(myNik) === TARGET_OWNER_ID) return true;

        const systemOwner = window.gameState?.system?.ownerId;
        if (systemOwner && String(systemOwner) === TARGET_OWNER_ID) return true;

        return false;
    },

    isAdmin() {
        if (this.isOwner()) return true;

        const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        const myNik = window.gameState?.user?.identity?.nik;
        const adminList = window.gameState?.system?.adminIds || [];

        const isTgAdmin = tgId && adminList.some(id => String(id) === String(tgId));
        const isNikAdmin = myNik && adminList.some(id => String(id) === String(myNik));

        return Boolean(isTgAdmin || isNikAdmin);
    },

    // --- ANIMASI & KARTU KTP ---
    flipKtpCard() {
        if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
        const cardInner = document.getElementById('ktp-card-inner');
        if (cardInner) {
            cardInner.classList.toggle('rotate-y-180');
        }
    },

    // --- DOKUMEN & LISENSI ---
    applyLicense(licId) {
        const lic = (window.LICENSES_DATABASE || []).find(l => l.id === licId);
        if (!lic) return;

        if (!window.gameState) window.gameState = {};
        if (!window.gameState.user) window.gameState.user = {};
        if (!window.gameState.user.legal) window.gameState.user.legal = {};
        if (!window.gameState.user.legal.licenses) window.gameState.user.legal.licenses = [];

        if (window.gameState.user.legal.licenses.includes(licId)) {
            if (typeof showToast === 'function') showToast('Kamu udah punya lisensi ini!', 'info');
            return;
        }

        const cost = Math.max(0, Number(lic.cost) || 0);
        if ((window.gameState.crest || 0) < cost) {
            if (typeof showToast === 'function') showToast(`Saldo Crest nggak cukup! Butuh ${cost.toLocaleString()} C`, 'error');
            return;
        }

        // Transaksi atomik dengan sistem rollback
        window.gameState.crest -= cost;
        window.gameState.user.legal.licenses.push(licId);

        if (typeof window.saveState === 'function') {
            const isSaved = window.saveState();
            if (isSaved === false) {
                window.gameState.crest += cost;
                window.gameState.user.legal.licenses.pop();
                if (typeof showToast === 'function') showToast('Gagal menyimpan transaksi!', 'error');
                return;
            }
        }

        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil menerbitkan ${lic.name}!`, 'success');
    },

    // --- REGISTRASI WARGA ---
    registerCitizen(fullName, gender, passcode) {
        const cleanPin = String(passcode || '').trim();
        if (!/^\d{4}$/.test(cleanPin)) {
            if (typeof showToast === 'function') showToast('PIN Lockscreen harus 4 angka!', 'error');
            return false;
        }

        if (!window.gameState) window.gameState = {};
        if (!window.gameState.user) window.gameState.user = {};

        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const nik = tgUser ? `TG-${tgUser.id}` : `IGN-${Math.floor(100000 + Math.random() * 900000)}`;
        const sanitizedName = this.escapeHtml(fullName || (tgUser ? tgUser.first_name : 'Warga Ignatius'));

        window.gameState.user.identity = {
            nik: nik,
            fullName: sanitizedName,
            gender: gender || 'Laki-laki',
            photoUrl: tgUser?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sanitizedName)}&background=0284c7&color=fff`,
            registeredAt: new Date().toISOString().split('T')[0],
            pinPasscode: cleanPin
        };

        if (!window.gameState.user.family) window.gameState.user.family = {};
        if (!window.gameState.user.family.kkNumber) {
            window.gameState.user.family.kkNumber = `KK-${Math.floor(10000000 + Math.random() * 90000000)}`;
        }

        window.gameState.registered = true;

        // Sinkronkan ke database warga lokal
        if (!window.gameState.citizens) window.gameState.citizens = [];
        const existingIdx = window.gameState.citizens.findIndex(c => c.identity?.nik === nik);
        if (existingIdx >= 0) {
            window.gameState.citizens[existingIdx] = window.gameState.user;
        } else {
            window.gameState.citizens.push(window.gameState.user);
        }

        if (typeof window.saveState === 'function') window.saveState();
        return true;
    },

    // --- DUKCAPIL & PERNIKAHAN ---
    registerMarriage() {
        const spouseNikInput = prompt("Masukkan NIK / Telegram ID Pasangan:");
        if (!spouseNikInput) return;

        const targetNik = String(spouseNikInput).trim();
        const spouseData = this.getCitizenById(targetNik);

        if (!spouseData) {
            if (typeof showToast === 'function') showToast('Warga dengan NIK/ID tersebut nggak ditemukan!', 'error');
            return;
        }

        const myNik = window.gameState?.user?.identity?.nik;
        if (spouseData.identity?.nik === myNik) {
            if (typeof showToast === 'function') showToast('Nggak bisa mendaftarkan pernikahan dengan diri sendiri!', 'error');
            return;
        }

        if (!window.gameState.user.family) window.gameState.user.family = {};
        window.gameState.user.family.spouseName = spouseData.identity?.fullName || `Warga (${targetNik})`;
        window.gameState.user.family.spouseNik = spouseData.identity?.nik || targetNik;
        window.gameState.user.family.marriageDate = new Date().toLocaleDateString('id-ID');

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Pernikahan dengan ${window.gameState.user.family.spouseName} dicatat!`, 'success');
        if (typeof openApp === 'function') openApp('ktp');
    },

    addChildToKK() {
        const childNikInput = prompt("Masukkan NIK / Telegram ID Anggota Keluarga:");
        if (!childNikInput) return;

        const targetNik = String(childNikInput).trim();
        const childData = this.getCitizenById(targetNik);

        if (!childData) {
            if (typeof showToast === 'function') showToast('Warga dengan NIK/ID tersebut nggak ditemukan!', 'error');
            return;
        }

        if (!window.gameState.user.family) window.gameState.user.family = {};
        if (!window.gameState.user.family.childrenNiks) window.gameState.user.family.childrenNiks = [];

        const exists = window.gameState.user.family.childrenNiks.some(c => c.nik === (childData.identity?.nik || targetNik));
        if (exists) {
            if (typeof showToast === 'function') showToast('Anggota keluarga ini udah ada di KK!', 'info');
            return;
        }

        window.gameState.user.family.childrenNiks.push({ 
            name: childData.identity?.fullName || `Warga (${targetNik})`, 
            nik: childData.identity?.nik || targetNik 
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Anggota keluarga ${childData.identity?.fullName || targetNik} berhasil ditambahkan!`, 'success');
        if (typeof openApp === 'function') openApp('ktp');
    },

    // --- RENDER UI KTP DIGITAL ---
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
                        <span class="text-slate-300">${idx + 1}. ${this.escapeHtml(child.name)}</span>
                        <span class="font-mono text-sky-400">${this.escapeHtml(child.nik)}</span>
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
                                <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[8px] font-bold rounded border border-emerald-500/30">SKCK: ${this.escapeHtml(legal.skckStatus || 'CLEAN')}</span>
                            </div>

                            <div class="flex items-center gap-3 py-1">
                                <img src="${this.escapeHtml(identity.photoUrl) || 'https://ui-avatars.com/api/?name=Warga'}" class="w-16 h-20 rounded-xl border border-sky-400/40 bg-slate-900 object-cover shrink-0 shadow-lg" alt="PP">
                                <div class="space-y-1">
                                    <div>
                                        <span class="text-[7px] text-slate-400 uppercase font-mono block">NIK / ID Warga</span>
                                        <h4 class="text-xs font-mono font-bold text-sky-300 tracking-wider">${this.escapeHtml(identity.nik) || '-'}</h4>
                                    </div>
                                    <div>
                                        <span class="text-[7px] text-slate-400 uppercase font-mono block">Nama Lengkap</span>
                                        <h3 class="text-xs font-bold text-white leading-tight">${this.escapeHtml(identity.fullName) || 'Warga Ignatius'}</h3>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 text-[9px] text-slate-300 pt-0.5">
                                        <span>Gender: <b>${this.escapeHtml(identity.gender) || 'Laki-laki'}</b></span>
                                        <span>Status: <b class="text-emerald-400">Warga Aktif</b></span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between border-t border-white/10 pt-2 text-[8px] text-slate-400 font-mono">
                                <span>Terdaftar: ${this.escapeHtml(identity.registeredAt) || '2026-10-02'}</span>
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
                                    <span class="font-mono font-bold text-white">${this.escapeHtml(family.kkNumber) || 'KK-90128391'}</span>
                                </div>
                                <div class="flex justify-between border-b border-white/5 pb-1">
                                    <span class="text-slate-400">Pasangan:</span>
                                    <span class="font-bold text-amber-300">${family.spouseName ? `${this.escapeHtml(family.spouseName)} (${this.escapeHtml(family.spouseNik)})` : 'Belum Menikah'}</span>
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
                        <span class="text-[9px] font-mono text-slate-400">No. KK: ${this.escapeHtml(family.kkNumber) || '-'}</span>
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

    // --- RENDER UI CONTROL PANEL ADMIN ---
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
                const safeId = this.escapeHtml(id);
                adminListHtml += `
                    <div class="p-2 glass-card rounded-xl flex items-center justify-between text-xs">
                        <span class="font-mono text-sky-400 text-[11px]">${safeId}</span>
                        ${isOwner ? `<button onclick="AdminModule.removeAdminById('${safeId}'); if(typeof openApp==='function') openApp('admin_panel');" class="text-[10px] text-rose-400 font-bold hover:underline">Hapus</button>` : ''}
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
                        <button onclick="AdminModule.inspectCitizenPrompt()" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
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
                        <button onclick="window.gameState.crest = (window.gameState.crest || 0) + 50000; window.saveState(); showToast('Admin: +50,000 Crest', 'success'); if(typeof openApp==='function') openApp('admin_panel');" class="py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg">+50,000 Crest</button>
                        <button onclick="window.gameState.vitality = 100; window.saveState(); showToast('Admin: Vitality 100%', 'success'); if(typeof openApp==='function') openApp('admin_panel');" class="py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg">Full Vitality</button>
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
                            <div class="space-y-1.5 max-h-32 overflow-y-auto">${adminListHtml}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // --- FITUR TINDAKAN ADMIN ---
    inspectCitizenPrompt() {
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang ingin diperiksa:");
        if (!targetNik) return;
        this.inspectCitizen(targetNik);
    },

    inspectCitizen(targetNikInput) {
        const citizen = this.getCitizenById(targetNikInput);

        if (!citizen) {
            if (typeof showToast === 'function') showToast('Data warga nggak ditemukan di database!', 'error');
            return;
        }

        const id = citizen.identity || {};
        const legal = citizen.legal || {};
        const isJailed = Boolean(citizen.jailStatus?.isJailed && citizen.jailStatus?.releaseAt > Date.now());

        alert(`
--- HASIL PENGECEKAN WARGA ---
NIK: ${id.nik || '-'}
Nama: ${id.fullName || '-'}
Gender: ${id.gender || '-'}
Status Penjara: ${isJailed ? 'DIPENJARA (Selesai: ' + new Date(citizen.jailStatus.releaseAt).toLocaleTimeString('id-ID') + ')' : 'BEBAS'}
SKCK: ${legal.skckStatus || 'CLEAN'}
Lisensi: ${(legal.licenses || []).join(', ') || 'Belum Ada'}
        `);
    },

    jailCitizenPrompt() {
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang akan dipenjarakan:");
        if (!targetNik) return;
        const minutes = prompt("Lama Hukuman Penjara (Menit):", "10");
        if (!minutes) return;
        const reason = prompt("Alasan Penahanan:", "Pelanggaran Aturan Kota RP");
        this.jailCitizen(targetNik, minutes, reason);
    },

    jailCitizen(targetNikInput, durationMinutes, reason) {
        if (!this.isAdmin()) return;
        const citizen = this.getCitizenById(targetNikInput);

        if (!citizen) {
            if (typeof showToast === 'function') showToast('Warga nggak ditemukan!', 'error');
            return;
        }

        const minutes = Math.max(1, parseInt(durationMinutes) || 10);
        const releaseTime = Date.now() + (minutes * 60 * 1000);

        citizen.jailStatus = {
            isJailed: true,
            reason: this.escapeHtml(reason || 'Pelanggaran Aturan Kota'),
            jailedAt: Date.now(),
            releaseAt: releaseTime,
            jailedBy: window.gameState?.user?.identity?.nik || 'ADMIN'
        };

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Warga ${citizen.identity?.fullName || targetNikInput} resmi dipenjara ${minutes} menit!`, 'error');
    },

    promptAddAdmin() {
        if (!this.isOwner()) return;
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang mau dijadikan Admin:");
        if (!targetNik) return;

        const cleanNik = String(targetNik).trim();
        if (!window.gameState.system) window.gameState.system = {};
        if (!window.gameState.system.adminIds) window.gameState.system.adminIds = [];

        if (!window.gameState.system.adminIds.includes(cleanNik)) {
            window.gameState.system.adminIds.push(cleanNik);
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof showToast === 'function') showToast(`Berhasil mengangkat ${cleanNik} sebagai Admin!`, 'success');
        } else {
            if (typeof showToast === 'function') showToast('ID ini udah jadi Admin!', 'info');
        }
        if (typeof openApp === 'function') openApp('admin_panel');
    },

    removeAdminById(targetNik) {
        if (!this.isOwner()) return;
        const cleanNik = String(targetNik).trim();
        if (!window.gameState.system?.adminIds) return;

        window.gameState.system.adminIds = window.gameState.system.adminIds.filter(id => String(id) !== cleanNik);
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Admin ${cleanNik} dicopot.`, 'info');
    }
};

window.AdminModule = AdminModule;
