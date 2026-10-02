// ==========================================
// CONTROLLER UTAMA iOS & UI MANAGER (MAIN.JS)
// ==========================================

let currentInputPasscode = '';

// 1. PLAY AUDIO SFX
function playAudioSfx(type) {
    const el = document.getElementById(`audio-${type}`);
    if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
    }
}

// 2. SYSTEM TOAST NOTIFICATION iOS
function showToast(msg, type = 'info') {
    playAudioSfx(type === 'error' ? 'error' : 'noti');
    const toast = document.getElementById('toast-ios');
    const icon = document.getElementById('toast-ios-icon');
    const text = document.getElementById('toast-ios-msg');

    if (!toast) return;

    text.textContent = msg;
    if (type === 'success') icon.className = 'fa-solid fa-circle-check text-emerald-400 text-base shrink-0';
    else if (type === 'error') icon.className = 'fa-solid fa-circle-xmark text-rose-400 text-base shrink-0';
    else icon.className = 'fa-solid fa-circle-info text-sky-400 text-base shrink-0';

    toast.classList.remove('opacity-0', '-translate-y-4');
    setTimeout(() => toast.classList.add('opacity-0', '-translate-y-4'), 3000);
}

// 3. AUTO SYNC TELEGRAM PROFILE & AVATAR
function syncTelegramProfile() {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const regAvatar = document.getElementById('reg-avatar');
    const regInput = document.getElementById('reg-fullname');

    if (tgUser) {
        const fullName = `${tgUser.first_name || ''}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`.trim();
        if (regInput && fullName) {
            regInput.value = fullName;
        }

        if (regAvatar) {
            if (tgUser.photo_url) {
                regAvatar.src = tgUser.photo_url;
            } else {
                regAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Warga')}&background=0284c7&color=fff`;
            }
        }
    }
}

// 4. HANDLER PENDAFTARAN WARGA (ANTI-STUCK / BULLETPROOF)
function handleRegisterSubmit(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    try {
        const nameInput = document.getElementById('reg-fullname');
        const genderInput = document.getElementById('reg-gender');
        const passcodeInput = document.getElementById('reg-passcode');

        const name = nameInput ? nameInput.value.trim() : 'Warga Ignatius';
        const gender = genderInput ? genderInput.value : 'Laki-laki';
        const passcode = passcodeInput ? passcodeInput.value.trim() : '';

        if (!passcode || passcode.length !== 4) {
            showToast('PIN Lockscreen wajib 4 digit!', 'error');
            return false;
        }

        // 1. Coba registrasi via AdminModule jika tersedia
        let success = false;
        if (window.AdminModule && typeof window.AdminModule.registerCitizen === 'function') {
            success = window.AdminModule.registerCitizen(name, gender, passcode);
        }

        // 2. Fallback Direct State Management (Jaminan tidak akan pernah stuck)
        if (!success) {
            if (!window.gameState) window.gameState = {};
            if (!window.gameState.user) window.gameState.user = { identity: {}, family: {}, legal: {} };

            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            const nik = tgUser ? `TG-${tgUser.id}` : `IGN-${Math.floor(100000 + Math.random() * 900000)}`;
            const photoUrl = tgUser?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff`;

            window.gameState.user.identity = {
                nik: nik,
                fullName: name,
                gender: gender,
                photoUrl: photoUrl,
                registeredAt: new Date().toISOString().split('T')[0],
                pinPasscode: passcode
            };

            if (!window.gameState.user.family) window.gameState.user.family = {};
            window.gameState.user.family.kkNumber = `KK-${Math.floor(10000000 + Math.random() * 90000000)}`;
            window.gameState.registered = true;

            if (!window.gameState.system) window.gameState.system = {};
            if (nik === 'TG-8853198899' || !window.gameState.system.ownerId) {
                window.gameState.system.ownerId = nik;
            }

            if (typeof window.saveState === 'function') {
                window.saveState();
            } else {
                localStorage.setItem('IGNATIUS_MASTER_STATE_V7', JSON.stringify(window.gameState));
            }
        }

        playAudioSfx('unlock');

        // 3. PAKSA PERPINDAHAN LAYAR (SEMBUNYIKAN REGISTER, TAMPILKAN LOCKSCREEN)
        const regScreen = document.getElementById('screen-register');
        const lockScreen = document.getElementById('screen-lockscreen');

        if (regScreen) {
            regScreen.classList.add('hidden');
            regScreen.style.display = 'none';
        }

        if (lockScreen) {
            lockScreen.classList.remove('hidden');
            lockScreen.style.display = 'flex';
        }

        updateUI();
        showToast('Pendaftaran Berhasil! Silakan Buka Kunci.', 'success');

    } catch (err) {
        console.error('[Register] Error:', err);
        showToast('Gagal mendaftar: ' + err.message, 'error');
    }

    return false;
}

// 5. PASSCODE KEYPAD LOGIC
function openPasscodeKeypad() {
    playAudioSfx('keypad');
    const lockscreen = document.getElementById('screen-lockscreen');
    const passcodeScreen = document.getElementById('screen-passcode');

    if (lockscreen) {
        lockscreen.classList.add('hidden');
        lockscreen.style.display = 'none';
        lockscreen.style.transform = 'translateY(0)';
    }
    if (passcodeScreen) {
        passcodeScreen.classList.remove('hidden');
        passcodeScreen.style.display = 'flex';
    }

    currentInputPasscode = '';
    renderPasscodeDots();
}

function cancelPasscode() {
    playAudioSfx('keypad');
    const lockscreen = document.getElementById('screen-lockscreen');
    const passcodeScreen = document.getElementById('screen-passcode');

    if (passcodeScreen) {
        passcodeScreen.classList.add('hidden');
        passcodeScreen.style.display = 'none';
    }
    if (lockscreen) {
        lockscreen.classList.remove('hidden');
        lockscreen.style.display = 'flex';
        lockscreen.style.transform = 'translateY(0)';
    }
    currentInputPasscode = '';
}

function pressKey(num) {
    if (currentInputPasscode.length < 4) {
        playAudioSfx('keypad');
        currentInputPasscode += String(num);
        renderPasscodeDots();
        if (currentInputPasscode.length === 4) {
            setTimeout(verifyPasscode, 150);
        }
    }
}

function deleteKey() {
    if (currentInputPasscode.length > 0) {
        playAudioSfx('keypad');
        currentInputPasscode = currentInputPasscode.slice(0, -1);
        renderPasscodeDots();
    }
}

function renderPasscodeDots() {
    const dotsContainer = document.getElementById('passcode-dots');
    if (!dotsContainer) return;
    let html = '';
    for (let i = 0; i < 4; i++) {
        html += i < currentInputPasscode.length
            ? `<div class="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-amber-400"></div>`
            : `<div class="w-3.5 h-3.5 rounded-full border-2 border-white/60"></div>`;
    }
    dotsContainer.innerHTML = html;
}

function verifyPasscode() {
    const savedPin = String(
        (window.gameState && window.gameState.user && window.gameState.user.identity && window.gameState.user.identity.pinPasscode) ||
        '1234'
    );

    if (String(currentInputPasscode).trim() === savedPin.trim()) {
        playAudioSfx('unlock');
        
        const passcodeScreen = document.getElementById('screen-passcode');
        const lockScreen = document.getElementById('screen-lockscreen');
        const homeScreen = document.getElementById('screen-homescreen');

        if (passcodeScreen) { passcodeScreen.classList.add('hidden'); passcodeScreen.style.display = 'none'; }
        if (lockScreen) { lockScreen.classList.add('hidden'); lockScreen.style.display = 'none'; }
        if (homeScreen) { homeScreen.classList.remove('hidden'); homeScreen.style.display = 'flex'; }

        const lockIcon = document.getElementById('island-lock-icon');
        if (lockIcon) lockIcon.className = 'fa-solid fa-lock-open text-emerald-400';

        currentInputPasscode = '';
    } else {
        playAudioSfx('error');
        showToast('PIN Kunci Salah!', 'error');
        currentInputPasscode = '';
        renderPasscodeDots();
    }
}

function lockScreenNow() {
    playAudioSfx('lock');
    closeApp();

    const homeScreen = document.getElementById('screen-homescreen');
    const lockScreen = document.getElementById('screen-lockscreen');

    if (homeScreen) { homeScreen.classList.add('hidden'); homeScreen.style.display = 'none'; }
    if (lockScreen) { lockScreen.classList.remove('hidden'); lockScreen.style.display = 'flex'; }

    const lockIcon = document.getElementById('island-lock-icon');
    if (lockIcon) lockIcon.className = 'fa-solid fa-lock text-amber-400';
}

// 6. GESTURE SWIPE UP LOCKSCREEN
function initSwipeLockscreen() {
    const lockscreen = document.getElementById('screen-lockscreen');
    if (!lockscreen) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    lockscreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        currentY = startY;
        isDragging = true;
        lockscreen.style.transition = 'none';
    }, { passive: true });

    lockscreen.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;

        if (diffY < 0) {
            if (e.cancelable) e.preventDefault();
            lockscreen.style.transform = `translateY(${diffY}px)`;
        }
    }, { passive: false });

    lockscreen.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;

        const diffY = currentY - startY;

        if (diffY < -25) {
            lockscreen.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            lockscreen.style.transform = 'translateY(-100%)';
            setTimeout(() => { openPasscodeKeypad(); }, 180);
        } else if (Math.abs(diffY) < 10) {
            openPasscodeKeypad();
        } else {
            lockscreen.style.transition = 'transform 0.2s ease-out';
            lockscreen.style.transform = 'translateY(0)';
        }

        startY = 0;
        currentY = 0;
    });

    lockscreen.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        currentY = startY;
        isDragging = true;
        lockscreen.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentY = e.clientY;
        const diffY = currentY - startY;
        if (diffY < 0) lockscreen.style.transform = `translateY(${diffY}px)`;
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;

        const diffY = currentY - startY;

        if (diffY < -25 || Math.abs(diffY) < 5) {
            lockscreen.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            lockscreen.style.transform = 'translateY(-100%)';
            setTimeout(() => { openPasscodeKeypad(); }, 180);
        } else {
            lockscreen.style.transition = 'transform 0.2s ease-out';
            lockscreen.style.transform = 'translateY(0)';
        }

        startY = 0;
        currentY = 0;
    });
}

// 7. WALLPAPER ENGINE
function setWallpaper(url) {
    if (!url) return;
    if (!window.gameState) window.gameState = {};
    if (!window.gameState.system) window.gameState.system = {};
    window.gameState.system.wallpaperUrl = url;
    if (typeof window.saveState === 'function') window.saveState();
    applyWallpaperToUI(url);
    showToast('Wallpaper berhasil diganti!', 'success');
}

function applyWallpaperToUI(url) {
    const lockEl = document.getElementById('screen-lockscreen');
    const homeEl = document.getElementById('screen-homescreen');

    const wallUrl = url || window.gameState?.system?.wallpaperUrl || 'assets/images/wallpaper.png';

    if (lockEl) {
        lockEl.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('${wallUrl}')`;
    }
    if (homeEl) {
        homeEl.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url('${wallUrl}')`;
    }
}

function renderSettingsUI() {
    return `
        <div class="space-y-4">
            <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-3">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-gear text-sky-400 text-base"></i>
                    <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">Pengaturan iOS</h4>
                </div>
                <p class="text-[10px] text-slate-300">Kustomisasi wallpaper & tema perangkat Kota Ignatius.</p>
            </div>

            <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-3">
                <h4 class="text-xs font-bold text-white uppercase tracking-wider"><i class="fa-solid fa-image mr-1 text-amber-400"></i> Pilih Wallpaper Preset</h4>
                
                <div class="grid grid-cols-3 gap-2 pt-1">
                    <button onclick="setWallpaper('assets/images/wallpaper.png')" class="p-2 glass-card rounded-xl text-[10px] font-bold text-white border border-white/10 hover:border-sky-400">Default iOS</button>
                    <button onclick="setWallpaper('https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=600')" class="p-2 glass-card rounded-xl text-[10px] font-bold text-white border border-white/10 hover:border-sky-400">Cyber City</button>
                    <button onclick="setWallpaper('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600')" class="p-2 glass-card rounded-xl text-[10px] font-bold text-white border border-white/10 hover:border-sky-400">Sunset Beach</button>
                    <button onclick="setWallpaper('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600')" class="p-2 glass-card rounded-xl text-[10px] font-bold text-white border border-white/10 hover:border-sky-400">Neon Dark</button>
                    <button onclick="setWallpaper('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600')" class="p-2 glass-card rounded-xl text-[10px] font-bold text-white border border-white/10 hover:border-sky-400">Nature Fog</button>
                    <button onclick="setWallpaper('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600')" class="p-2 glass-card rounded-xl text-[10px] font-bold text-white border border-white/10 hover:border-sky-400">Mountain</button>
                </div>

                <div class="pt-3 border-t border-white/10 space-y-2">
                    <label class="text-[10px] font-semibold text-slate-400 uppercase block">Atau Input URL Gambar Kustom:</label>
                    <div class="flex gap-2">
                        <input type="text" id="custom-wall-url" placeholder="https://domain.com/gambar.jpg" class="flex-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500">
                        <button onclick="const url = document.getElementById('custom-wall-url').value; if(url) setWallpaper(url);" class="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">Pasang</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 8. RENDER HOMESCREEN APPS
function renderHomescreenApps() {
    const grid = document.getElementById('homescreen-app-grid');
    if (!grid) return;

    let appsHtml = `
        <div onclick="openApp('bank')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-building-columns"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Bank Ignatius</span>
        </div>
        <div onclick="openApp('citymap')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-cyan-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-map-location-dot"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Peta Kota</span>
        </div>
        <div onclick="openApp('ktp')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-address-card"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">KTP Digital</span>
        </div>
        <div onclick="openApp('jobs')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-briefcase"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Bursa Kerja</span>
        </div>
        <div onclick="openApp('settings')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-gear"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Pengaturan</span>
        </div>
    `;

    // PANEL ADMIN: HANYA MUNCUL JIKA USER ADALAH ADMIN / OWNER!
    if (window.AdminModule && window.AdminModule.isAdmin && window.AdminModule.isAdmin()) {
        appsHtml += `
            <div onclick="openApp('admin_panel')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
                <div class="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <span class="text-[10px] font-medium text-white drop-shadow">Panel Admin</span>
            </div>
        `;
    }

    // Dynamic Apps Profesi
    const unlockedApps = (window.gameState && window.gameState.jobState) ? window.gameState.jobState.unlockedCustomApps : [];
    if (unlockedApps.includes('app_halodoc')) {
        appsHtml += `<div onclick="openApp('app_halodoc')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer"><div class="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20 animate-pulse"><i class="fa-solid fa-hospital"></i></div><span class="text-[10px] font-medium text-rose-300 drop-shadow">Halodoc</span></div>`;
    }
    if (unlockedApps.includes('app_police_hub')) {
        appsHtml += `<div onclick="openApp('app_police_hub')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer"><div class="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20"><i class="fa-solid fa-shield-halved"></i></div><span class="text-[10px] font-medium text-indigo-300 drop-shadow">Polres Hub</span></div>`;
    }

    grid.innerHTML = appsHtml;
}

function openApp(appName) {
    playAudioSfx('keypad');
    const win = document.getElementById('screen-app-window');
    const title = document.getElementById('app-window-title');
    const body = document.getElementById('app-window-body');

    if (!win) return;
    win.classList.remove('hidden');

    if (appName === 'bank') {
        title.textContent = 'Bank Central Ignatius';
        body.innerHTML = window.BankModule ? window.BankModule.renderBankAppUI() : 'Loading...';
    } else if (appName === 'citymap') {
        title.textContent = 'Peta Navigasi Kota';
        body.innerHTML = window.MapModule ? window.MapModule.renderMapUI() : 'Loading...';
    } else if (appName === 'ktp') {
        title.textContent = 'KTP Digital Capil';
        body.innerHTML = window.AdminModule ? window.AdminModule.renderKTPAppUI() : 'Loading...';
    } else if (appName === 'jobs') {
        title.textContent = 'Bursa Kerja Ignatius';
        body.innerHTML = window.JobsModule ? window.JobsModule.renderJobsAppUI() : 'Loading...';
    } else if (appName === 'economy') {
        title.textContent = 'Crest Pay & Market';
        body.innerHTML = window.EconomyModule ? window.EconomyModule.renderCrestPayAppUI() : 'Loading...';
    } else if (appName === 'settings') {
        title.textContent = 'Pengaturan iOS';
        body.innerHTML = renderSettingsUI();
    } else if (appName === 'admin_panel') {
        title.textContent = 'Panel Control Admin';
        body.innerHTML = window.AdminModule ? window.AdminModule.renderAdminPanelUI() : 'Loading...';
    } else if (appName === 'app_halodoc') {
        title.textContent = 'Halodoc Medika Central';
        body.innerHTML = window.JobsModule ? window.JobsModule.renderHalodocAppUI() : 'Loading...';
    } else if (appName === 'app_police_hub') {
        title.textContent = 'Polres Hub & Patrolex';
        body.innerHTML = window.JobsModule ? window.JobsModule.renderPoliceHubAppUI() : 'Loading...';
    }
}

function closeApp() {
    const win = document.getElementById('screen-app-window');
    if (win) win.classList.add('hidden');
}

// 9. UI & CLOCK UPDATE ENGINE
function updateUI() {
    if (!window.gameState) return;

    const crestEl = document.getElementById('display-crest');
    const vitTextEl = document.getElementById('display-vit-text');
    const vitBarEl = document.getElementById('display-vit-bar');

    if (crestEl) crestEl.textContent = (window.gameState.crest || 0).toLocaleString();
    if (vitTextEl) vitTextEl.textContent = `${window.gameState.vitality || 0} / 100`;
    if (vitBarEl) vitBarEl.style.width = `${window.gameState.vitality || 0}%`;

    const identity = (window.gameState.user && window.gameState.user.identity) ? window.gameState.user.identity : {};

    const nameEl = document.getElementById('home-user-name');
    const nikEl = document.getElementById('home-user-nik');
    const lockNameEl = document.getElementById('lockscreen-citizen-name');
    const avatarEl = document.getElementById('home-user-avatar');

    if (nameEl) nameEl.textContent = identity.fullName || 'Warga Ignatius';
    if (nikEl) nikEl.textContent = `NIK: ${identity.nik || '-'}`;
    if (lockNameEl) lockNameEl.textContent = identity.fullName || 'Warga Terdaftar';

    if (avatarEl && identity.photoUrl) {
        avatarEl.src = identity.photoUrl;
    }

    applyWallpaperToUI();
    renderHomescreenApps();
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

    const clockStatus = document.getElementById('ios-clock-status');
    const clockBig = document.getElementById('ios-clock-big');
    const dateDisp = document.getElementById('ios-date-display');

    if (clockStatus) clockStatus.textContent = timeStr;
    if (clockBig) clockBig.textContent = timeStr;
    if (dateDisp) dateDisp.textContent = dateStr;
}

// 10. INITIALIZATION ROUTER ON DOM LOAD
document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }

    updateClock();
    setInterval(updateClock, 1000);
    initSwipeLockscreen();

    const regScreen = document.getElementById('screen-register');
    const lockScreen = document.getElementById('screen-lockscreen');

    // Cek status pendaftaran
    const isRegistered = Boolean(window.gameState && window.gameState.registered === true);

    if (isRegistered) {
        if (regScreen) { regScreen.classList.add('hidden'); regScreen.style.display = 'none'; }
        if (lockScreen) { lockScreen.classList.remove('hidden'); lockScreen.style.display = 'flex'; }
    } else {
        syncTelegramProfile();
        if (regScreen) { regScreen.classList.remove('hidden'); regScreen.style.display = 'flex'; }
        if (lockScreen) { lockScreen.classList.add('hidden'); lockScreen.style.display = 'none'; }
    }

    updateUI();
});
