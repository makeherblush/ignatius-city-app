// src/modules/admin.js

const AdminModule = {
    /**
     * Integrasi Data Telegram API
     */
    getTelegramProfile() {
        let tgUser = null;
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
            tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        }

        const fullName = tgUser 
            ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}` 
            : 'Warga Ignatius';
            
        const nik = tgUser ? `TG-${tgUser.id}` : `IGN-${Math.floor(100000 + Math.random() * 900000)}`;
        const photoUrl = (tgUser && tgUser.photo_url) 
            ? tgUser.photo_url 
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName}`;

        return { fullName, nik, photoUrl };
    },

    /**
     * Proses Pendaftaran Warga Baru (KTP & KK Awal)
     */
    registerCitizen(fullName, gender, passcode) {
        if (!passcode || passcode.length !== 4) {
            if (typeof showToast === 'function') showToast('PIN Lockscreen harus 4 digit!', 'error');
            return false;
        }

        const tgData = this.getTelegramProfile();

        window.gameState.user = {
            identity: {
                nik: tgData.nik,
                fullName: fullName || tgData.fullName,
                gender: gender || 'Laki-laki',
                photoUrl: tgData.photoUrl,
                registeredAt: new Date().toISOString().split('T')[0],
                pinPasscode: passcode
            },
            family: {
                kkNumber: `KK-${Math.floor(10000000 + Math.random() * 90000000)}`,
                isHeadOfFamily: true,
                spouseNik: null,
                marriageDate: null,
                childrenNiks: []
            },
            legal: {
                licenses: ['KTP_DIGITAL'],
                criminalRecord: [],
                skckStatus: 'CLEAN'
            }
        };

        window.gameState.registered = true;
        if (typeof saveState === 'function') saveState();

        if (typeof showToast === 'function') {
            showToast(`KTP & KK berhasil diterbitkan atas nama ${fullName}!`, 'success');
        }
        return true;
    },

    /**
     * Pembelian / Ujian Lisensi Sipil & Profesi
     */
    applyLicense(licenseId) {
        const license = window.LICENSES_DATABASE.find(l => l.id === licenseId);
        if (!license) return;

        const userLegal = window.gameState.user.legal;

        // Cek apakah sudah punya
        if (userLegal.licenses.includes(licenseId)) {
            if (typeof showToast === 'function') showToast('Kamu sudah memiliki lisensi ini!', 'info');
            return;
        }

        // Cek Saldo Crest
        if (window.gameState.crest < license.cost) {
            if (typeof showToast === 'function') {
                showToast(`Saldo Crest tidak cukup! Butuh ${license.cost.toLocaleString()} C`, 'error');
            }
            return;
        }

        // Potong Saldo & Tambah Lisensi
        window.gameState.crest -= license.cost;
        userLegal.licenses.push(licenseId);

        if (typeof saveState === 'function') saveState();

        if (typeof showToast === 'function') {
            showToast(`Selamat! Kamu resmi memperoleh ${license.name}`, 'success');
        }
    },

    /**
     * Render UI Aplikasi KTP & Capil di iPhone Window
     */
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
                        <div class="w-9 h-9 rounded-xl ${owned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'} flex items-center justify-center text-sm shrink-0">
                            <i class="fa-solid ${lic.icon}"></i>
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
                <!-- Tampilan KTP Digital -->
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

                <!-- Katalog Sertifikasi & Lisensi Capil -->
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">📜 Layanan Lisensi & Capil</h4>
                    <div class="space-y-2">
                        ${licensesHtml}
                    </div>
                </div>
            </div>
        `;
    }
};

// Expose ke global scope
window.AdminModule = AdminModule;
