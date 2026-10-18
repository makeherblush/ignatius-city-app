// ==========================================
// MODUL DUKCAPIL & CONTROL PANEL ADMIN (V3.1 - SECURE CONFIG)
// IGNATIUS CITY RP SYSTEM
// ==========================================

const AdminModule = {
    // Owner ID diambil murni dari Environment Variable (Railway / Backend Config)
    get OWNER_ID() {
        return window.ENV_CONFIG?.OWNER_ID || window.OWNER_ID || null;
    },

    APP_KEYS: { ktp: 'ktp', admin: 'admin_panel', licenses: 'licenses', register: 'register' },
    MAX_JAIL_MINUTES: 1440,
    SKCK_CLEAN: 'CLEAN',
    SKCK_RECORD: 'CATATAN KRIMINAL',

    _jailTimer: null,
    _pinFails: 0,
    _pinLockUntil: 0,

    // ==========================================
    // 1. HELPER UTILITAS & SANITASI
    // ==========================================
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    _toast(msg, type = 'info') { 
        if (typeof showToast === 'function') showToast(msg, type); 
    },
    
    _sfx(name) { 
        if (typeof playAudioSfx === 'function') playAudioSfx(name); 
    },

    _refresh(key) { 
        if (typeof openApp === 'function') openApp(this.APP_KEYS[key] || key); 
    },

    _state() {
        if (!window.gameState) window.gameState = {};
        const gs = window.gameState;
        if (!gs.user) gs.user = {};
        if (!gs.system) gs.system = {};
        if (!Array.isArray(gs.citizens)) gs.citizens = [];
        return gs;
    },

    _ensureFamily(citizen) {
        if (!citizen.family) citizen.family = {};
        if (!Array.isArray(citizen.family.childrenNiks)) citizen.family.childrenNiks = [];
        return citizen.family;
    },

    _ensureLegal(citizen) {
        if (!citizen.legal) citizen.legal = {};
        if (!Array.isArray(citizen.legal.licenses)) citizen.legal.licenses = [];
        if (!Array.isArray(citizen.legal.criminalRecords)) citizen.legal.criminalRecords = [];
        return citizen.legal;
    },

    _myNik() { 
        return window.gameState?.user?.identity?.nik || null; 
    },

    _myTgId() { 
        return window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? null; 
    },

    async _save() {
        this.syncUserToCitizens();
        if (typeof window.saveState === 'function') {
            try {
                const res = await window.saveState();
                return res !== false;
            } catch (err) {
                console.error("Gagal menyimpan state:", err);
                return false;
            }
        }
        return true;
    },

    syncUserToCitizens() {
        const gs = window.gameState;
        const nik = gs?.user?.identity?.nik;
        if (!nik) return;
        if (!Array.isArray(gs.citizens)) gs.citizens = [];
        const idx = gs.citizens.findIndex(c => c.identity?.nik === nik);
        if (idx >= 0) gs.citizens[idx] = gs.user;
        else gs.citizens.push(gs.user);
    },

    formatDuration(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        if (h > 0) return `${h}j ${m}m`;
        if (m > 0) return `${m}m ${s}d`;
        return `${s}d`;
    },

    _log(action, detail = '') {
        const gs = this._state();
        if (!Array.isArray(gs.system.auditLog)) gs.system.auditLog = [];
        gs.system.auditLog.push({
            t: Date.now(),
            by: this._myNik() || this._myTgId() || 'SYSTEM',
            action,
            detail: String(detail)
        });
        if (gs.system.auditLog.length > 200) {
            gs.system.auditLog.splice(0, gs.system.auditLog.length - 200);
        }
    },

    getCitizenById(nikOrTgId) {
        if (!nikOrTgId) return null;
        const target = String(nikOrTgId).trim();
        if (!target) return null;
        const tgForm = `TG-${target}`;

        const matches = (c) => {
            if (!c) return false;
            const nik = c.identity?.nik ? String(c.identity.nik) : null;
            const tg = c.telegramId !== undefined && c.telegramId !== null ? String(c.telegramId) : null;
            return [nik, tg].some(v => v && (v === target || v === tgForm));
        };

        const gs = window.gameState;
        if (matches(gs?.user)) return gs.user;
        return (gs?.citizens || []).find(matches) || null;
    },

    _getAllCitizens() {
        const gs = window.gameState || {};
        const map = new Map();
        (gs.citizens || []).forEach(c => { if (c?.identity?.nik) map.set(c.identity.nik, c); });
        if (gs.user?.identity?.nik) map.set(gs.user.identity.nik, gs.user);
        return [...map.values()];
    },

    // ==========================================
    // 2. MANAJEMEN HAK AKSES
    // ==========================================
    _isOwnerCitizen(c) {
        const ownerId = this.OWNER_ID;
        if (!ownerId) return false;
        
        const nik = c?.identity?.nik ? String(c.identity.nik) : '';
        const candidates = [nik, nik.replace(/^TG-/, ''), c?.telegramId];
        return candidates.some(v => v !== undefined && v !== null && String(v) === String(ownerId));
    },

    isOwner() {
        const ownerId = this.OWNER_ID;
        if (!ownerId) return false;

        const tgId = this._myTgId();
        if (tgId && String(tgId) === String(ownerId)) return true;

        const myNik = this._myNik();
        if (myNik && String(myNik).replace(/^TG-/, '') === String(ownerId)) return true;

        const systemOwner = window.gameState?.system?.ownerId;
        if (systemOwner && String(systemOwner) === String(ownerId)) return true;

        return false;
    },

    isAdmin() {
        if (this.isOwner()) return true;

        const tgId = this._myTgId();
        const myNik = this._myNik();
        const adminList = window.gameState?.system?.adminIds || [];

        const isTgAdmin = tgId && adminList.some(id => String(id) === String(tgId));
        const isNikAdmin = myNik && adminList.some(id => String(id) === String(myNik));

        return Boolean(isTgAdmin || isNikAdmin);
    },

    isAdminCitizen(c) {
        if (!c) return false;
        if (this._isOwnerCitizen(c)) return true;
        const ids = (window.gameState?.system?.adminIds || []).map(String);
        const nik = c.identity?.nik;
        const tg = c.telegramId;
        return Boolean((nik && ids.includes(String(nik))) || (tg !== undefined && tg !== null && ids.includes(String(tg))));
    },

    _requireAdmin() {
        if (this.isAdmin()) return true;
        this._toast('Akses ditolak! Khusus Admin.', 'error');
        return false;
    },

    // ==========================================
    // 3. STATUS PENJARA (ENFORCEMENT & WATCHER)
    // ==========================================
    isJailed(citizen) {
        const j = citizen?.jailStatus;
        return Boolean(j?.isJailed && j.releaseAt > Date.now());
    },

    autoReleaseExpired() {
        const released = [];
        const seen = new Set();
        const gs = window.gameState;
        if (!gs) return released;

        [gs.user, ...(gs.citizens || [])].forEach(c => {
            if (!c || seen.has(c)) return;
            seen.add(c);
            const j = c.jailStatus;
            if (j?.isJailed && j.releaseAt <= Date.now()) {
                j.isJailed = false;
                j.releasedAt = Date.now();
                j.releaseType = 'SELESAI';
                released.push(c.identity?.nik);
            }
        });

        if (released.length) this._save();
        return released;
    },

    startJailWatcher() {
        if (this._jailTimer) return;
        this.autoReleaseExpired();
        this._jailTimer = setInterval(() => {
            const released = this.autoReleaseExpired();
            const myNik = this._myNik();
            if (myNik && released.includes(myNik)) {
                this._toast('Masa hukumanmu sudah selesai. Kamu bebas!', 'success');
                this._sfx('cash');
                this._refresh('ktp');
            }
        }, 15000);
    },

    guardJail(featureLabel = 'Fitur ini') {
        this.autoReleaseExpired();
        const me = window.gameState?.user;
        if (this.isJailed(me)) {
            const left = this.formatDuration(me.jailStatus.releaseAt - Date.now());
            this._toast(`${featureLabel} nggak bisa dipakai, kamu lagi dipenjara. Sisa ${left}.`, 'error');
            return true;
        }
        return false;
    },

    renderJailBanner() {
        this.autoReleaseExpired();
        const me = window.gameState?.user;
        if (!this.isJailed(me)) return '';
        const j = me.jailStatus;
        return `
            <div class="glass-ios p-4 rounded-3xl border border-rose-500/50 flex items-center gap-3 bg-rose-950/30">
                <div class="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                    <i class="fa-solid fa-handcuffs animate-bounce"></i>
                </div>
                <div class="text-xs space-y-0.5">
                    <p class="font-bold text-rose-300 uppercase tracking-wider">Sedang Dipenjara</p>
                    <p class="text-slate-300">Sisa Hukuman: <b>${this.formatDuration(j.releaseAt - Date.now())}</b></p>
                    <p class="text-slate-400 text-[10px]">Alasan: ${this.escapeHtml(j.reason || '-')}</p>
                </div>
            </div>
        `;
    },

    // ==========================================
    // 4. PIN LOCKSCREEN & KEAMANAN
    // ==========================================
    _hashPin(pin, salt) {
        const str = `${salt}:${pin}:ignatius_city_secret`;
        let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
    },

    verifyPin(pin) {
        const now = Date.now();
        if (now < this._pinLockUntil) {
            this._toast(`Terlalu banyak percobaan. Coba lagi ${this.formatDuration(this._pinLockUntil - now)}.`, 'error');
            return false;
        }

        const identity = window.gameState?.user?.identity;
        if (!identity) return false;
        const clean = String(pin || '').trim();

        let ok = false;
        if (identity.pinHash) {
            ok = this._hashPin(clean, identity.nik) === identity.pinHash;
        } else if (identity.pinPasscode) {
            ok = String(identity.pinPasscode) === clean;
            if (ok) {
                identity.pinHash = this._hashPin(clean, identity.nik);
                delete identity.pinPasscode;
                this._save();
            }
        }

        if (ok) {
            this._pinFails = 0;
            return true;
        }

        this._pinFails++;
        if (this._pinFails >= 5) {
            this._pinFails = 0;
            this._pinLockUntil = Date.now() + 60000;
            this._toast('PIN salah 5x. Dikunci 60 detik.', 'error');
        } else {
            this._toast(`PIN salah! Sisa percobaan: ${5 - this._pinFails}`, 'error');
        }
        return false;
    },

    async changePin(oldPin, newPin) {
        const cleanNew = String(newPin || '').trim();
        if (!/^\d{4}$/.test(cleanNew)) {
            this._toast('PIN baru harus 4 angka!', 'error');
            return false;
        }
        if (!this.verifyPin(oldPin)) return false;

        const identity = window.gameState.user.identity;
        identity.pinHash = this._hashPin(cleanNew, identity.nik);
        delete identity.pinPasscode;
        
        const saved = await this._save();
        if (!saved) {
            this._toast('Gagal menyimpan PIN baru!', 'error');
            return false;
        }
        this._toast('PIN berhasil diganti!', 'success');
        return true;
    },

    changePinPrompt() {
        const oldPin = prompt("Masukkan PIN lama:");
        if (!oldPin) return;
        const newPin = prompt("Masukkan PIN baru (4 angka):");
        if (!newPin) return;
        this.changePin(oldPin, newPin);
    },

    // ==========================================
    // 5. REGISTRASI WARGA
    // ==========================================
    async registerCitizen(fullName, gender, passcode) {
        const gs = this._state();

        if (gs.registered && gs.user.identity?.nik) {
            this._toast('Kamu sudah terdaftar sebagai warga!', 'info');
            return false;
        }

        const cleanPin = String(passcode || '').trim();
        if (!/^\d{4}$/.test(cleanPin)) {
            this._toast('PIN Lockscreen harus 4 angka!', 'error');
            return false;
        }

        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const rawName = String(fullName || (tgUser ? tgUser.first_name : '') || 'Warga Ignatius').trim().replace(/\s+/g, ' ');
        if (rawName.length < 3 || rawName.length > 30 || !/^[\p{L}][\p{L}\s.'-]*$/u.test(rawName)) {
            this._toast('Nama harus 3-30 karakter (huruf, spasi, titik, apostrof).', 'error');
            return false;
        }

        const safeGender = ['Laki-laki', 'Perempuan'].includes(gender) ? gender : 'Laki-laki';

        let nik;
        if (tgUser) {
            nik = `TG-${tgUser.id}`;
        } else {
            do {
                nik = `IGN-${Math.floor(100000 + Math.random() * 900000)}`;
            } while (gs.citizens.some(c => c.identity?.nik === nik));
        }

        gs.user.telegramId = tgUser?.id ?? null;
        gs.user.identity = {
            nik,
            fullName: rawName,
            gender: safeGender,
            photoUrl: tgUser?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawName)}&background=0284c7&color=fff`,
            registeredAt: new Date().toISOString().split('T')[0],
            pinHash: this._hashPin(cleanPin, nik)
        };

        const family = this._ensureFamily(gs.user);
        if (!family.kkNumber) family.kkNumber = `KK-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const legal = this._ensureLegal(gs.user);
        if (!legal.skckStatus) legal.skckStatus = this.SKCK_CLEAN;

        gs.registered = true;
        await this._save();
        return true;
    },

    renderRegisterUI() {
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const defaultName = this.escapeHtml(tgUser?.first_name || '');
        return `
            <div class="glass-ios p-5 rounded-3xl border border-sky-500/40 space-y-4">
                <div class="text-center space-y-1">
                    <div class="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-xl border border-sky-500/30">
                        <i class="fa-solid fa-id-card"></i>
                    </div>
                    <h4 class="text-sm font-bold text-white">Pendaftaran Warga Baru</h4>
                    <p class="text-[10px] text-slate-400">Dinas Capil Kota Ignatius</p>
                </div>

                <div class="space-y-3">
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-mono block mb-1">Nama Lengkap</label>
                        <input id="reg-name" type="text" maxlength="30" value="${defaultName}" placeholder="Nama kamu" class="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white outline-none focus:border-sky-500">
                    </div>
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-mono block mb-1">Gender</label>
                        <select id="reg-gender" class="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white outline-none focus:border-sky-500">
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-mono block mb-1">PIN Lockscreen (4 angka)</label>
                        <input id="reg-pin" type="password" inputmode="numeric" maxlength="4" placeholder="••••" class="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white tracking-[0.5em] text-center outline-none focus:border-sky-500">
                    </div>
                </div>

                <button onclick="AdminModule.submitRegisterForm()" class="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">
                    Daftar & Terbitkan KTP
                </button>
            </div>
        `;
    },

    async submitRegisterForm() {
        const name = document.getElementById('reg-name')?.value;
        const gender = document.getElementById('reg-gender')?.value;
        const pin = document.getElementById('reg-pin')?.value;
        const success = await this.registerCitizen(name, gender, pin);
        if (success) {
            this._sfx('cash');
            this._toast('Selamat! KTP Digital kamu sudah terbit.', 'success');
            this._refresh('ktp');
        }
    },

    // ==========================================
    // 6. DOKUMEN & LISENSI
    // ==========================================
    getLicenseList() {
        return Array.isArray(window.LICENSES_DATABASE) ? window.LICENSES_DATABASE : [];
    },

    hasLicense(licId, citizen) {
        const c = citizen || window.gameState?.user;
        return Boolean(c?.legal?.licenses?.includes(licId));
    },

    async applyLicense(licId) {
        const lic = this.getLicenseList().find(l => l.id === licId);
        if (!lic) return false;

        const gs = this._state();
        if (!gs.registered || !gs.user.identity?.nik) {
            this._toast('Daftar KTP dulu sebelum mengurus lisensi!', 'error');
            return false;
        }
        if (this.guardJail('Pengurusan lisensi')) return false;

        const legal = this._ensureLegal(gs.user);
        if (legal.licenses.includes(licId)) {
            this._toast('Kamu udah punya lisensi ini!', 'info');
            return false;
        }

        const cost = Math.max(0, Number(lic.cost) || 0);
        if ((gs.crest || 0) < cost) {
            this._toast(`Saldo Crest nggak cukup! Butuh ${cost.toLocaleString('id-ID')} C`, 'error');
            return false;
        }

        gs.crest = (gs.crest || 0) - cost;
        legal.licenses.push(licId);

        const saved = await this._save();
        if (!saved) {
            gs.crest += cost;
            legal.licenses.pop();
            this._toast('Gagal menyimpan transaksi!', 'error');
            return false;
        }

        this._sfx('cash');
        this._toast(`Berhasil menerbitkan ${lic.name}!`, 'success');
        this._refresh('licenses');
        return true;
    },

    renderLicenseUI() {
        const gs = window.gameState || {};
        const list = this.getLicenseList();
        const saldo = Number(gs.crest || 0).toLocaleString('id-ID');

        if (list.length === 0) {
            return `<p class="text-xs text-slate-500 text-center py-4">Belum ada lisensi yang tersedia.</p>`;
        }

        const cards = list.map(l => {
            const has = this.hasLicense(l.id);
            const cost = Math.max(0, Number(l.cost) || 0);
            return `
                <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
                            <i class="fa-solid ${this.escapeHtml(l.icon || 'fa-id-badge')}"></i>
                        </div>
                        <div class="min-w-0">
                            <h5 class="text-xs font-bold text-white truncate">${this.escapeHtml(l.name)}</h5>
                            <p class="text-[10px] text-slate-400 line-clamp-2">${this.escapeHtml(l.desc || l.description || '')}</p>
                        </div>
                    </div>
                    ${has
                        ? `<span class="text-[9px] font-bold px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md shrink-0">DIMILIKI</span>`
                        : `<button data-id="${this.escapeHtml(l.id)}" onclick="AdminModule.applyLicense(this.dataset.id)" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] rounded-lg shadow-lg shrink-0">${cost.toLocaleString('id-ID')} C</button>`}
                </div>
            `;
        }).join('');

        return `
            <div class="space-y-3">
                ${this.renderJailBanner()}
                <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider"><i class="fa-solid fa-id-badge mr-1"></i> Layanan Lisensi</h4>
                    <span class="text-[10px] font-mono text-amber-300">Saldo: ${saldo} C</span>
                </div>
                <div class="space-y-2">${cards}</div>
            </div>
        `;
    },

    async revokeLicense(targetNikInput, licId) {
        if (!this._requireAdmin()) return false;
        const citizen = this.getCitizenById(targetNikInput);
        if (!citizen) { this._toast('Warga nggak ditemukan!', 'error'); return false; }

        const legal = this._ensureLegal(citizen);
        if (!legal.licenses.includes(licId)) {
            this._toast('Warga ini nggak punya lisensi tersebut.', 'info');
            return false;
        }

        legal.licenses = legal.licenses.filter(id => id !== licId);
        this._log('REVOKE_LICENSE', `${citizen.identity?.nik} -> ${licId}`);
        await this._save();
        this._toast(`Lisensi ${licId} milik ${citizen.identity?.fullName || targetNikInput} dicabut.`, 'success');
        return true;
    },

    revokeLicensePrompt() {
        const nik = prompt("Masukkan NIK / Telegram ID Warga:");
        if (!nik) return;
        const licId = prompt("ID Lisensi yang dicabut:");
        if (!licId) return;
        if (this.revokeLicense(nik, licId.trim())) this._refresh('admin');
    },

    // ==========================================
    // 7. DUKCAPIL: PERNIKAHAN & PERCERAIAN
    // ==========================================
    async registerMarriage() {
        if (this.guardJail('Pencatatan nikah')) return;

        const gs = this._state();
        const me = gs.user;
        const myNik = this._myNik();
        if (!myNik) { this._toast('Daftar KTP dulu!', 'error'); return; }

        const myFamily = this._ensureFamily(me);
        if (myFamily.spouseNik) {
            this._toast(`Kamu masih tercatat menikah dengan ${myFamily.spouseName}. Ajukan cerai dulu.`, 'error');
            return;
        }

        const spouseNikInput = prompt("Masukkan NIK / Telegram ID Pasangan:");
        if (!spouseNikInput) return;

        const spouseData = this.getCitizenById(spouseNikInput);
        if (!spouseData) { this._toast('Warga dengan NIK/ID tersebut nggak ditemukan!', 'error'); return; }

        const spouseNik = spouseData.identity?.nik;
        if (spouseNik === myNik) { this._toast('Nggak bisa menikah dengan diri sendiri!', 'error'); return; }

        const spouseFamily = this._ensureFamily(spouseData);
        if (spouseFamily.spouseNik) { this._toast('Orang tersebut sudah tercatat menikah!', 'error'); return; }

        const isMyChild = myFamily.childrenNiks.some(c => c.nik === spouseNik);
        const isMyParent = spouseFamily.childrenNiks.some(c => c.nik === myNik) || me.family.parentNik === spouseNik;
        if (isMyChild || isMyParent) {
            this._toast('Nggak bisa menikah dengan anggota keluarga sendiri!', 'error');
            return;
        }

        if (!confirm(`Catat pernikahan dengan ${spouseData.identity?.fullName || spouseNik}?`)) return;

        const date = new Date().toLocaleDateString('id-ID');
        myFamily.spouseName = spouseData.identity?.fullName || `Warga (${spouseNik})`;
        myFamily.spouseNik = spouseNik;
        myFamily.marriageDate = date;

        spouseFamily.spouseName = me.identity?.fullName || `Warga (${myNik})`;
        spouseFamily.spouseNik = myNik;
        spouseFamily.marriageDate = date;

        await this._save();
        this._sfx('cash');
        this._toast(`Pernikahan dengan ${myFamily.spouseName} dicatat!`, 'success');
        this._refresh('ktp');
    },

    async divorce() {
        if (this.guardJail('Pengajuan cerai')) return;

        const me = this._state().user;
        const family = this._ensureFamily(me);
        if (!family.spouseNik) { this._toast('Kamu belum tercatat menikah.', 'info'); return; }
        if (!confirm(`Yakin ajukan cerai dengan ${family.spouseName}?`)) return;

        const spouse = this.getCitizenById(family.spouseNik);
        const record = { 
            spouseNik: family.spouseNik, 
            spouseName: family.spouseName, 
            marriageDate: family.marriageDate, 
            divorcedAt: new Date().toLocaleDateString('id-ID') 
        };

        if (!Array.isArray(family.marriageHistory)) family.marriageHistory = [];
        family.marriageHistory.push(record);
        delete family.spouseName; 
        delete family.spouseNik; 
        delete family.marriageDate;

        if (spouse) {
            const sf = this._ensureFamily(spouse);
            if (!Array.isArray(sf.marriageHistory)) sf.marriageHistory = [];
            sf.marriageHistory.push({ 
                spouseNik: this._myNik(), 
                spouseName: me.identity?.fullName, 
                marriageDate: record.marriageDate, 
                divorcedAt: record.divorcedAt 
            });
            delete sf.spouseName; 
            delete sf.spouseNik; 
            delete sf.marriageDate;
        }

        await this._save();
        this._toast('Perceraian dicatat.', 'info');
        this._refresh('ktp');
    },

    // ==========================================
    // 8. DUKCAPIL: KARTU KELUARGA
    // ==========================================
    async addChildToKK() {
        if (this.guardJail('Update KK')) return;

        const me = this._state().user;
        const myNik = this._myNik();
        if (!myNik) { this._toast('Daftar KTP dulu!', 'error'); return; }

        const input = prompt("Masukkan NIK / Telegram ID Anggota Keluarga:");
        if (!input) return;

        const childData = this.getCitizenById(input);
        if (!childData) { this._toast('Warga dengan NIK/ID tersebut nggak ditemukan!', 'error'); return; }

        const childNik = childData.identity?.nik;
        const family = this._ensureFamily(me);

        if (childNik === myNik) { this._toast('Nggak bisa menambahkan diri sendiri!', 'error'); return; }
        if (childNik === family.spouseNik) { this._toast('Pasangan sudah tercatat di status utama.', 'error'); return; }
        if (family.childrenNiks.some(c => c.nik === childNik)) { this._toast('Anggota keluarga ini udah ada di KK!', 'info'); return; }

        const childFamily = this._ensureFamily(childData);
        if (childFamily.parentNik && childFamily.parentNik !== myNik) {
            this._toast('Warga ini sudah terdaftar di KK lain!', 'error');
            return;
        }

        family.childrenNiks.push({ name: childData.identity?.fullName || `Warga (${childNik})`, nik: childNik });
        childFamily.parentNik = myNik;
        childFamily.parentKk = family.kkNumber;

        await this._save();
        this._toast(`Anggota keluarga ${childData.identity?.fullName || childNik} berhasil ditambahkan!`, 'success');
        this._refresh('ktp');
    },

    async removeFamilyMember(targetNik) {
        if (this.guardJail('Update KK')) return;

        const me = this._state().user;
        const family = this._ensureFamily(me);
        const member = family.childrenNiks.find(c => c.nik === targetNik);
        if (!member) return;
        if (!confirm(`Keluarkan ${member.name} dari KK?`)) return;

        family.childrenNiks = family.childrenNiks.filter(c => c.nik !== targetNik);

        const memberData = this.getCitizenById(targetNik);
        if (memberData?.family?.parentNik === this._myNik()) {
            delete memberData.family.parentNik;
            delete memberData.family.parentKk;
        }

        await this._save();
        this._toast(`${member.name} dikeluarkan dari KK.`, 'info');
        this._refresh('ktp');
    },

    // ==========================================
    // 9. RENDER UI KTP DIGITAL
    // ==========================================
    flipKtpCard() {
        this._sfx('keypad');
        const cardInner = document.getElementById('ktp-card-inner');
        if (cardInner) cardInner.classList.toggle('rotate-y-180');
    },

    renderKTPAppUI() {
        const gs = window.gameState || {};
        if (!gs.registered || !gs.user?.identity?.nik) return this.renderRegisterUI();

        const user = gs.user;
        const identity = user.identity || {};
        const family = user.family || {};
        const legal = user.legal || {};

        const skck = legal.skckStatus || this.SKCK_CLEAN;
        const skckClean = skck === this.SKCK_CLEAN;
        const skckClass = skckClean
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

        let childrenHtml = '';
        if (family.childrenNiks && family.childrenNiks.length > 0) {
            family.childrenNiks.forEach((child, idx) => {
                childrenHtml += `
                    <div class="flex items-center justify-between py-1 border-b border-white/5 text-[10px] gap-2">
                        <span class="text-slate-300 truncate">${idx + 1}. ${this.escapeHtml(child.name)}</span>
                        <span class="flex items-center gap-2 shrink-0">
                            <span class="font-mono text-sky-400">${this.escapeHtml(child.nik)}</span>
                            <button data-nik="${this.escapeHtml(child.nik)}" onclick="AdminModule.removeFamilyMember(this.dataset.nik)" class="text-rose-400 font-bold hover:underline">Keluarkan</button>
                        </span>
                    </div>
                `;
            });
        } else {
            childrenHtml = `<p class="text-[9px] text-slate-500 py-1">Belum ada anggota keluarga terdaftar.</p>`;
        }

        const marriageButton = family.spouseNik
            ? `<button onclick="AdminModule.divorce()" class="p-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-heart-crack"></i> Ajukan Cerai
               </button>`
            : `<button onclick="AdminModule.registerMarriage()" class="p-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-ring text-amber-300"></i> Catat Nikah
               </button>`;

        return `
            <div class="space-y-4 pt-1">
                ${this.renderJailBanner()}

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
                                <span class="px-2 py-0.5 ${skckClass} text-[8px] font-bold rounded border">SKCK: ${this.escapeHtml(skck)}</span>
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
                                        <span>Status: ${this.isJailed(user)
                                            ? '<b class="text-rose-400">Ditahan</b>'
                                            : '<b class="text-emerald-400">Warga Aktif</b>'}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between border-t border-white/10 pt-2 text-[8px] text-slate-400 font-mono">
                                <span>Terdaftar: ${this.escapeHtml(identity.registeredAt) || '-'}</span>
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
                                    <span class="font-mono font-bold text-white">${this.escapeHtml(family.kkNumber) || '-'}</span>
                                </div>
                                <div class="flex justify-between border-b border-white/5 pb-1">
                                    <span class="text-slate-400">Pasangan:</span>
                                    <span class="font-bold text-amber-300">${family.spouseName ? `${this.escapeHtml(family.spouseName)} (${this.escapeHtml(family.spouseNik)})` : 'Belum Menikah'}</span>
                                </div>
                                <div class="flex justify-between border-b border-white/5 pb-1">
                                    <span class="text-slate-400">Tgl. Nikah:</span>
                                    <span class="font-bold text-white">${this.escapeHtml(family.marriageDate) || '-'}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-slate-400">Lisensi Aktif:</span>
                                    <span class="font-bold text-white">${(legal.licenses || []).length}</span>
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
                        ${marriageButton}
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

                    <button onclick="AdminModule.changePinPrompt()" class="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-key"></i> Ganti PIN Lockscreen
                    </button>
                </div>
            </div>
        `;
    },

    // ==========================================
    // 10. RENDER UI CONTROL PANEL ADMIN
    // ==========================================
    renderAdminPanelUI() {
        this.autoReleaseExpired();
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

        const citizens = this._getAllCitizens();
        const jailed = citizens.filter(c => this.isJailed(c));
        const adminIds = window.gameState?.system?.adminIds || [];

        let adminListHtml = '';
        if (adminIds.length === 0) {
            adminListHtml = `<p class="text-[10px] text-slate-500 py-1">Belum ada Admin tambahan.</p>`;
        } else {
            adminIds.forEach(id => {
                const safeId = this.escapeHtml(id);
                adminListHtml += `
                    <div class="p-2 glass-card rounded-xl flex items-center justify-between text-xs">
                        <span class="font-mono text-sky-400 text-[11px]">${safeId}</span>
                        ${isOwner ? `<button data-id="${safeId}" onclick="AdminModule.removeAdminById(this.dataset.id)" class="text-[10px] text-rose-400 font-bold hover:underline">Hapus</button>` : ''}
                    </div>
                `;
            });
        }

        let jailedHtml = '';
        if (jailed.length === 0) {
            jailedHtml = `<p class="text-[10px] text-slate-500 py-1">Nggak ada warga yang lagi dipenjara.</p>`;
        } else {
            jailed.forEach(c => {
                const nik = this.escapeHtml(c.identity?.nik);
                jailedHtml += `
                    <div class="p-2 glass-card rounded-xl flex items-center justify-between gap-2 text-xs">
                        <div class="min-w-0">
                            <p class="font-bold text-white truncate">${this.escapeHtml(c.identity?.fullName || '-')}</p>
                            <p class="text-[9px] text-slate-400 truncate">${nik} · sisa ${this.formatDuration(c.jailStatus.releaseAt - Date.now())} · ${this.escapeHtml(c.jailStatus.reason || '-')}</p>
                        </div>
                        <button data-nik="${nik}" onclick="AdminModule.releaseCitizen(this.dataset.nik)" class="text-[10px] text-emerald-400 font-bold hover:underline shrink-0">Bebaskan</button>
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

                    <div class="grid grid-cols-3 gap-2 text-center">
                        <div class="glass-card rounded-xl py-2"><p class="text-sm font-bold text-white">${citizens.length}</p><p class="text-[8px] text-slate-400 uppercase">Warga</p></div>
                        <div class="glass-card rounded-xl py-2"><p class="text-sm font-bold text-rose-300">${jailed.length}</p><p class="text-[8px] text-slate-400 uppercase">Dipenjara</p></div>
                        <div class="glass-card rounded-xl py-2"><p class="text-sm font-bold text-amber-300">${adminIds.length}</p><p class="text-[8px] text-slate-400 uppercase">Admin</p></div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="AdminModule.inspectCitizenPrompt()" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-magnifying-glass"></i> Cek Data Warga
                        </button>
                        <button onclick="AdminModule.jailCitizenPrompt()" class="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-handcuffs"></i> Penjarakan Warga
                        </button>
                        <button onclick="AdminModule.clearSkckPrompt()" class="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-eraser"></i> Bersihkan SKCK
                        </button>
                        <button onclick="AdminModule.revokeLicensePrompt()" class="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-ban"></i> Cabut Lisensi
                        </button>
                    </div>
                </div>

                <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider"><i class="fa-solid fa-handcuffs mr-1 text-rose-400"></i> Warga Dalam Tahanan</h4>
                    <div class="space-y-1.5 max-h-36 overflow-y-auto">${jailedHtml}</div>
                </div>

                <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">🛠️ Quick Cheats Dev</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="AdminModule.devAddCrest(50000)" class="py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg">+50,000 Crest</button>
                        <button onclick="AdminModule.devFullVitality()" class="py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg">Full Vitality</button>
                    </div>
                    <button onclick="AdminModule.showAuditLog()" class="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-lg">
                        <i class="fa-solid fa-clock-rotate-left mr-1"></i> Lihat Log Tindakan Admin
                    </button>
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

    // ==========================================
    // 11. CHEATS & ACTIONS ADMIN
    // ==========================================
    async devAddCrest(amount) {
        if (!this._requireAdmin()) return;
        const gs = this._state();
        gs.crest = (gs.crest || 0) + Math.max(0, Number(amount) || 0);
        this._log('DEV_ADD_CREST', amount);
        await this._save();
        this._toast(`Admin: +${Number(amount).toLocaleString('id-ID')} Crest`, 'success');
        this._refresh('admin');
    },

    async devFullVitality() {
        if (!this._requireAdmin()) return;
        this._state().vitality = 100;
        this._log('DEV_FULL_VITALITY');
        await this._save();
        this._toast('Admin: Vitality 100%', 'success');
        this._refresh('admin');
    },

    showAuditLog() {
        if (!this._requireAdmin()) return;
        const log = (window.gameState?.system?.auditLog || []).slice(-15).reverse();
        if (log.length === 0) { alert('Belum ada log tindakan admin.'); return; }
        const lines = log.map(e => `[${new Date(e.t).toLocaleString('id-ID')}] ${e.by} · ${e.action}${e.detail ? ' · ' + e.detail : ''}`);
        alert(`--- 15 LOG ADMIN TERAKHIR ---\n${lines.join('\n')}`);
    },

    inspectCitizenPrompt() {
        if (!this._requireAdmin()) return;
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang ingin diperiksa:");
        if (!targetNik) return;
        this.inspectCitizen(targetNik);
    },

    inspectCitizen(targetNikInput) {
        if (!this._requireAdmin()) return;
        const citizen = this.getCitizenById(targetNikInput);
        if (!citizen) { this._toast('Data warga nggak ditemukan di database!', 'error'); return; }

        const id = citizen.identity || {};
        const legal = citizen.legal || {};
        const family = citizen.family || {};
        const jailed = this.isJailed(citizen);

        const lines = [
            '--- HASIL PENGECEKAN WARGA ---',
            `NIK: ${id.nik || '-'}`,
            `Telegram ID: ${citizen.telegramId ?? '-'}`,
            `Nama: ${id.fullName || '-'}`,
            `Gender: ${id.gender || '-'}`,
            `Terdaftar: ${id.registeredAt || '-'}`,
            `Peran: ${this._isOwnerCitizen(citizen) ? 'OWNER' : this.isAdminCitizen(citizen) ? 'ADMIN' : 'WARGA'}`,
            `Status Penjara: ${jailed ? `DIPENJARA (sisa ${this.formatDuration(citizen.jailStatus.releaseAt - Date.now())}, alasan:${citizen.jailStatus.reason || '-'})` : 'BEBAS'}`,
            `SKCK: ${legal.skckStatus || this.SKCK_CLEAN} (${(legal.criminalRecords || []).length} catatan)`,
            `Lisensi: ${(legal.licenses || []).join(', ') || 'Belum Ada'}`,
            `No. KK: ${family.kkNumber || '-'}`,
            `Pasangan: ${family.spouseName ? `${family.spouseName} (${family.spouseNik})` : 'Belum Menikah'}`,
            `Anggota KK: ${(family.childrenNiks || []).length} orang`
        ];
        alert(lines.join('\n'));
        this._log('INSPECT', id.nik);
    },

    jailCitizenPrompt() {
        if (!this._requireAdmin()) return;
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang akan dipenjarakan:");
        if (!targetNik) return;
        const minutes = prompt(`Lama Hukuman Penjara (Menit, maks ${this.MAX_JAIL_MINUTES}):`, "10");
        if (!minutes) return;
        const reason = prompt("Alasan Penahanan:", "Pelanggaran Aturan Kota RP");
        if (this.jailCitizen(targetNik, minutes, reason)) this._refresh('admin');
    },

    async jailCitizen(targetNikInput, durationMinutes, reason) {
        if (!this._requireAdmin()) return false;
        const citizen = this.getCitizenById(targetNikInput);
        if (!citizen) { this._toast('Warga nggak ditemukan!', 'error'); return false; }

        const targetNik = citizen.identity?.nik;
        if (targetNik && targetNik === this._myNik()) { this._toast('Nggak bisa memenjarakan diri sendiri!', 'error'); return false; }
        if (this._isOwnerCitizen(citizen)) { this._toast('Owner nggak bisa dipenjara!', 'error'); return false; }
        if (this.isAdminCitizen(citizen) && !this.isOwner()) {
            this._toast('Hanya Owner yang bisa memenjarakan sesama Admin!', 'error');
            return false;
        }

        const minutes = Math.min(this.MAX_JAIL_MINUTES, Math.max(1, parseInt(durationMinutes, 10) || 10));
        const cleanReason = String(reason || 'Pelanggaran Aturan Kota').trim().slice(0, 120) || 'Pelanggaran Aturan Kota';
        const now = Date.now();

        citizen.jailStatus = {
            isJailed: true,
            reason: cleanReason,
            jailedAt: now,
            releaseAt: now + minutes * 60 * 1000,
            jailedBy: this._myNik() || 'ADMIN'
        };

        const legal = this._ensureLegal(citizen);
        legal.criminalRecords.push({ reason: cleanReason, minutes, date: new Date(now).toLocaleDateString('id-ID'), by: this._myNik() || 'ADMIN' });
        legal.skckStatus = this.SKCK_RECORD;

        this._log('JAIL', `${targetNik} · ${minutes}m · ${cleanReason}`);
        await this._save();
        this._toast(`Warga ${citizen.identity?.fullName || targetNikInput} resmi dipenjara ${minutes} menit!`, 'error');
        return true;
    },

    async releaseCitizen(targetNikInput) {
        if (!this._requireAdmin()) return false;
        const citizen = this.getCitizenById(targetNikInput);
        if (!citizen) { this._toast('Warga nggak ditemukan!', 'error'); return false; }
        if (!this.isJailed(citizen)) { this._toast('Warga ini nggak lagi dipenjara.', 'info'); return false; }

        citizen.jailStatus.isJailed = false;
        citizen.jailStatus.releasedAt = Date.now();
        citizen.jailStatus.releaseType = 'ADMIN';
        citizen.jailStatus.releasedBy = this._myNik() || 'ADMIN';

        this._log('RELEASE', citizen.identity?.nik);
        await this._save();
        this._toast(`${citizen.identity?.fullName || targetNikInput} dibebaskan.`, 'success');
        this._refresh('admin');
        return true;
    },

    async clearSkck(targetNikInput) {
        if (!this._requireAdmin()) return false;
        const citizen = this.getCitizenById(targetNikInput);
        if (!citizen) { this._toast('Warga nggak ditemukan!', 'error'); return false; }

        const legal = this._ensureLegal(citizen);
        legal.skckStatus = this.SKCK_CLEAN;
        legal.criminalRecords = [];

        this._log('CLEAR_SKCK', citizen.identity?.nik);
        await this._save();
        this._toast(`SKCK ${citizen.identity?.fullName || targetNikInput} dibersihkan.`, 'success');
        return true;
    },

    clearSkckPrompt() {
        if (!this._requireAdmin()) return;
        const nik = prompt("Masukkan NIK / Telegram ID Warga yang SKCK-nya dibersihkan:");
        if (!nik) return;
        this.clearSkck(nik);
    },

    async promptAddAdmin() {
        if (!this.isOwner()) return;
        const targetNik = prompt("Masukkan NIK / Telegram ID Warga yang mau dijadikan Admin:");
        if (!targetNik) return;

        const citizen = this.getCitizenById(targetNik);
        let idToStore;
        if (citizen) {
            idToStore = String(citizen.identity?.nik || targetNik).trim();
        } else {
            if (!confirm("Warga dengan ID itu belum terdaftar di database. Tetap jadikan Admin?")) return;
            idToStore = String(targetNik).trim();
        }

        const gs = this._state();
        if (!Array.isArray(gs.system.adminIds)) gs.system.adminIds = [];

        if (this._isOwnerCitizen(citizen) || idToStore === this.OWNER_ID) {
            this._toast('Owner sudah punya akses penuh.', 'info');
            return;
        }

        if (gs.system.adminIds.map(String).includes(idToStore)) {
            this._toast('ID ini udah jadi Admin!', 'info');
        } else {
            gs.system.adminIds.push(idToStore);
            this._log('ADD_ADMIN', idToStore);
            await this._save();
            this._toast(`Berhasil mengangkat ${idToStore} sebagai Admin!`, 'success');
        }
        this._refresh('admin');
    },

    async removeAdminById(targetNik) {
        if (!this.isOwner()) return;
        const cleanNik = String(targetNik).trim();
        const gs = this._state();
        if (!Array.isArray(gs.system.adminIds)) return;

        gs.system.adminIds = gs.system.adminIds.filter(id => String(id) !== cleanNik);
        this._log('REMOVE_ADMIN', cleanNik);
        await this._save();
        this._toast(`Admin ${cleanNik} dicopot.`, 'info');
        this._refresh('admin');
    },

    init() {
        this.startJailWatcher();
    }
};

window.AdminModule = AdminModule;
AdminModule.init();
