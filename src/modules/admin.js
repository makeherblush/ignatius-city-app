
const AdminModule = {
    // ------------------------------------------
    // 1. LOGIKA REGISTRASI WARGA BARU
    // ------------------------------------------
    registerCitizen(fullName, gender, passcode) {
        if (!passcode || passcode.length !== 4) {
            if (typeof showToast === 'function') showToast('PIN Lockscreen harus 4 digit!', 'error');
            return false;
        }

        // Ambil data user dari Telegram WebApp
        const tgUser = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) 
            ? window.Telegram.WebApp.initDataUnsafe.user 
            : null;

        // Bikin NIK Otomatis dari Telegram ID / Random IGN
        const nik = tgUser ? `TG-${tgUser.id}` : `IGN-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Ambil PP Telegram, jika tidak ada/error otomatis pakai UI-Avatars
        const photoUrl = (tgUser && tgUser.photo_url) 
            ? tgUser.photo_url 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Warga')}&background=0284c7&color=fff`;

        // Simpan Identitas ke Master State
        window.gameState.user.identity = {
            nik: nik,
            fullName: fullName || (tgUser ? tgUser.first_name : 'Warga Ignatius'),
            gender: gender || 'Laki-laki',
            photoUrl: photoUrl,
            registeredAt: new Date().toISOString().split('T')[0],
            pinPasscode: passcode
        };

        // Bikin No. KK Otomatis
        window.gameState.user.family.kkNumber = `KK-${Math.floor(10000000 + Math.random() * 90000000)}`;
        window.gameState.registered = true;

        // Auto-assign status Owner jika NIK kamu sesuai
        if (nik === 'TG-8853198899' || !window.gameState.system.ownerId) {
            window.gameState.system.ownerId = nik;
        }

        window.saveState();
        return true;
    },

    // ------------------------------------------
    // 2. HELPER OWNER & ADMIN
    // ------------------------------------------
    isOwner() {
        const myNik = window.gameState?.user?.identity?.nik;
        if (!myNik) return false;
        const ownerId = window.gameState?.system?.ownerId;
        return myNik === ownerId || myNik === 'TG-8853198899';
    },

    isAdmin() {
        const myNik = window.gameState?.user?.identity?.nik;
        if (!myNik) return false;
        return this.isOwner() || (window.gameState?.system?.adminIds || []).includes(myNik);
    },

    // ... (fungsi KTP Flip, Dukcapil, & Panel Admin lainnya) ...
};

// Expose ke global window
window.AdminModule = AdminModule;
    // --- TOGGLE FLIP KARTU KTP ---
    flipKtpCard() {
        playAudioSfx('keypad');
        const cardInner = document.getElementById('ktp-card-inner');
        if (cardInner) {
            cardInner.classList.toggle('rotate-y-180');
        }
    },

    // --- FITUR DUKCAPIL: PERNIKAHAN & TAMBAH ANGGOTA KK ---
    registerMarriage() {
        const spouseName = prompt("Masukkan Nama Lengkap Pasangan:");
        if (!spouseName) return;
        const spouseNik = prompt("Masukkan NIK Pasangan:");
        if (!spouseNik) return;

        window.gameState.user.family.spouseName = spouseName;
        window.gameState.user.family.spouseNik = spouseNik;
        window.gameState.user.family.marriageDate = new Date().toLocaleDateString('id-ID');

        window.saveState();
        if (typeof showToast === 'function') showToast(`Status Pernikahan dicatat! Pasangan: ${spouseName}`, 'success');
        openApp('ktp');
    },

    addChildToKK() {
        const childName = prompt("Masukkan Nama Anggota Keluarga / Anak:");
        if (!childName) return;
        const childNik = prompt("Masukkan NIK Anggota / Anak:");
        if (!childNik) return;

        if (!window.gameState.user.family.childrenNiks) {
            window.gameState.user.family.childrenNiks = [];
        }

        window.gameState.user.family.childrenNiks.push({ name: childName, nik: childNik });
        window.saveState();

        if (typeof showToast === 'function') showToast(`Anggota keluarga ${childName} berhasil ditambahkan ke KK!`, 'success');
        openApp('ktp');
    },

    // --- RENDER APPLICATION KTP DIGITAL & DUKCAPIL ---
    renderKTPAppUI() {
        const identity = window.gameState.user.identity || {};
        const family = window.gameState.user.family || {};
        const legal = window.gameState.user.legal || {};

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
                    <p class="text-[10px] text-sky-400 font-bold uppercase tracking-widest"><i class="fa-solid fa-hand-pointer animate-pulse mr-1"></i> Sentuh Kartu Untuk Membalik (Flip)</p>
                </div>

                <!-- 3D FLIP KTP DIGITAL -->
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
                                <img src="${identity.photoUrl || 'assets/images/avatars/default.png'}" class="w-16 h-20 rounded-xl border border-sky-400/40 bg-slate-900 object-cover shrink-0 shadow-lg" alt="PP">
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
                                    <span class="text-slate-400">Pasangan (Suami/Istri):</span>
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

                <!-- LAYANAN UPDATE KK & KELUARGA DUKCAPIL -->
                <div class="glass-ios p-4 rounded-3xl border border-sky-500/30 space-y-3">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider"><i class="fa-solid fa-users mr-1"></i> Layanan Update KK & Keluarga</h4>
                        <span class="text-[9px] font-mono text-slate-400">No. KK: ${family.kkNumber || '-'}</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="AdminModule.registerMarriage()" class="p-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-ring text-amber-300"></i> Catat Pernikahan
                        </button>
                        <button onclick="AdminModule.addChildToKK()" class="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-user-plus"></i> Tambah Anggota
                        </button>
                    </div>

                    <div class="pt-2 border-t border-white/10">
                        <span class="text-[9px] font-semibold text-slate-400 uppercase block mb-1">Daftar Anggota / Anak Dalam KK:</span>
                        <div class="space-y-1 max-h-24 overflow-y-auto">
                            ${childrenHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- PANEL ADMIN (PENGECEKAN WARGA & FITUR PENJARA) ---
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
                    <span class="text-[9px] font-mono text-slate-500 block">ID Anda: ${window.gameState?.user?.identity?.nik || '-'}</span>
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
                            <button onclick="AdminModule.removeAdminById('${id}'); openApp('admin_panel');" class="text-[10px] text-rose-400 font-bold hover:underline">
                                Hapus
                            </button>
                        ` : ''}
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <!-- HEADER MODERASI -->
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

                    <!-- FITUR PENGECEKAN WARGA & PENJARA -->
                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="AdminModule.inspectCitizen()" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-magnifying-glass"></i> Cek Data Warga
                        </button>
                        <button onclick="AdminModule.jailCitizenPrompt()" class="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-handcuffs"></i> Penjarakan Warga
                        </button>
                    </div>
                </div>

                <!-- CHEATS / TOOLKIT ADMIN -->
                <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">🛠️ Quick Cheats Dev</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="window.gameState.crest += 50000; window.saveState(); showToast('Admin: +50,000 Crest', 'success'); openApp('admin_panel');" class="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg">
                            +50,000 Crest
                        </button>
                        <button onclick="window.gameState.vitality = 100; window.saveState(); showToast('Admin: Vitality 100%', 'success'); openApp('admin_panel');" class="py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg">
                            Full Vitality
                        </button>
                        <button onclick="window.gameState.user.legal.licenses = window.LICENSES_DATABASE.map(l => l.id); window.saveState(); showToast('Admin: Unlock Semua SIM/Lisensi!', 'success'); openApp('admin_panel');" class="col-span-2 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg">
                            Unlock Semua Lisensi & SIM
                        </button>
                    </div>
                </div>

                <!-- MANAJEMEN ADMIN (KHUSUS OWNER) -->
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

    // --- FITUR INSPEKSI / PENGECEKAN DATA WARGA ---
    inspectCitizen() {
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang ingin diperiksa:");
        if (!targetNik) return;

        // Cek data user sendiri atau dummy
        const user = window.gameState.user;
        alert(`
--- HASIL PENGECEKAN WARGA ---
NIK: ${user.identity.nik}
Nama: ${user.identity.fullName}
Gender: ${user.identity.gender}
Saldo Crest: ${window.gameState.crest.toLocaleString()} C
Vitality: ${window.gameState.vitality}%
SKCK: ${user.legal.skckStatus}
Lisensi Aktif: ${user.legal.licenses.join(', ')}
No. KK: ${user.family.kkNumber}
Pasangan: ${user.family.spouseName || 'Belum Menikah'}
Status Hukum: ${window.gameState.law.isJailed ? 'DIPENJARA' : 'BEBAS'}
        `);
    },

    // --- FITUR PENJARAKAN WARGA ---
    jailCitizenPrompt() {
        const targetNik = prompt("Masukkan NIK Warga yang akan dipenjarakan:");
        if (!targetNik) return;
        const minutes = prompt("Lama Hukuman Penjara (Menit):") || "10";
        const fines = prompt("Nominal Denda Crest (Contoh: 5000):") || "0";
        const reason = prompt("Alasan Penjara / Pasal Violasi:") || "Pelanggaran Hukum Kota";

        window.gameState.law = {
            isJailed: true,
            jailMinutes: parseInt(minutes),
            fines: parseInt(fines),
            reason: reason
        };

        if (window.gameState.law.fines > 0) {
            window.gameState.crest = Math.max(0, window.gameState.crest - parseInt(fines));
        }

        window.saveState();
        if (typeof showToast === 'function') {
            showToast(`Warga ${targetNik} resmi dipenjara ${minutes} menit! Denda: ${fines} C`, 'error');
        }
    },

    promptAddAdmin() {
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang mau dijadikan Admin:");
        if (!targetNik) return;

        if (!window.gameState.system.adminIds) window.gameState.system.adminIds = [];
        if (!window.gameState.system.adminIds.includes(targetNik)) {
            window.gameState.system.adminIds.push(targetNik);
            window.saveState();
            if (typeof showToast === 'function') showToast(`Berhasil mengangkat ${targetNik} sebagai Admin!`, 'success');
        }
        openApp('admin_panel');
    },

    removeAdminById(targetNik) {
        if (!this.isOwner()) return;
        window.gameState.system.adminIds = (window.gameState.system.adminIds || []).filter(id => id !== targetNik);
        window.saveState();
        if (typeof showToast === 'function') showToast(`Admin ${targetNik} dicopot.`, 'info');
    }
};

window.AdminModule = AdminModule;
