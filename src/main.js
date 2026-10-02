// ==========================================
// CONTROLLER UTAMA iOS & UI MANAGER (MAIN.JS)
// ==========================================

let currentInputPasscode = '';

// 1. AUDIO & TOAST NOTIFICATION
function playAudioSfx(type) {
    const el = document.getElementById(`audio-${type}`);
    if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
    }
}

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

// 2. AUTO SYNC TELEGRAM PROFILE
function syncTelegramProfile() {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const regAvatar = document.getElementById('reg-avatar');
    const regInput = document.getElementById('reg-fullname');

    if (tgUser) {
        const fullName = `${tgUser.first_name || ''}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`.trim();
        if (regInput && fullName) regInput.value = fullName;

        if (regAvatar) {
            if (tgUser.photo_url) regAvatar.src = tgUser.photo_url;
            else regAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Warga')}&background=0284c7&color=fff`;
        }
    }
}

// 3. REGISTER HANDLER
function handleRegisterSubmit(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }

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

        if (window.AdminModule && typeof window.AdminModule.registerCitizen === 'function') {
            window.AdminModule.registerCitizen(name, gender, passcode);
        }

        playAudioSfx('unlock');

        const regScreen = document.getElementById('screen-register');
        const lockScreen = document.getElementById('screen-lockscreen');

        if (regScreen) { regScreen.classList.add('hidden'); regScreen.style.display = 'none'; }
        if (lockScreen) { lockScreen.classList.remove('hidden'); lockScreen.style.display = 'flex'; }

        updateUI();
        showToast('Pendaftaran Berhasil! Silakan Buka Kunci.', 'success');

    } catch (err) {
        console.error('[Register] Error:', err);
    }
    return false;
}

// 4. PASSCODE & LOCKSCREEN GESTURE
function openPasscodeKeypad() {
    playAudioSfx('keypad');
    const lockscreen = document.getElementById('screen-lockscreen');
    const passcodeScreen = document.getElementById('screen-passcode');

    if (lockscreen) { lockscreen.classList.add('hidden'); lockscreen.style.display = 'none'; }
    if (passcodeScreen) { passcodeScreen.classList.remove('hidden'); passcodeScreen.style.display = 'flex'; }

    currentInputPasscode = '';
    renderPasscodeDots();
}

function cancelPasscode() {
    playAudioSfx('keypad');
    const lockscreen = document.getElementById('screen-lockscreen');
    const passcodeScreen = document.getElementById('screen-passcode');

    if (passcodeScreen) { passcodeScreen.classList.add('hidden'); passcodeScreen.style.display = 'none'; }
    if (lockscreen) { lockscreen.classList.remove('hidden'); lockscreen.style.display = 'flex'; }
    currentInputPasscode = '';
}

function pressKey(num) {
    if (currentInputPasscode.length < 4) {
        playAudioSfx('keypad');
        currentInputPasscode += String(num);
        renderPasscodeDots();
        if (currentInputPasscode.length === 4) setTimeout(verifyPasscode, 150);
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
    const savedPin = String((window.gameState?.user?.identity?.pinPasscode) || '1234');

    if (String(currentInputPasscode).trim() === savedPin.trim()) {
        playAudioSfx('unlock');
        
        const passcodeScreen = document.getElementById('screen-passcode');
        const lockScreen = document.getElementById('screen-lockscreen');
        const homeScreen = document.getElementById('screen-homescreen');

        if (passcodeScreen) { passcodeScreen.classList.add('hidden'); passcodeScreen.style.display = 'none'; }
        if (lockScreen) { lockScreen.classList.add('hidden'); lockScreen.style.display = 'none'; }
        if (homeScreen) { homeScreen.classList.remove('hidden'); homeScreen.style.display = 'flex'; }

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
}

function initSwipeLockscreen() {
    const lockscreen = document.getElementById('screen-lockscreen');
    if (!lockscreen) return;

    let startY = 0, currentY = 0, isDragging = false;

    lockscreen.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        startY = e.touches[0].clientY;
        currentY = startY;
        isDragging = true;
    }, { passive: true });

    lockscreen.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        if (currentY - startY < -20 || Math.abs(currentY - startY) < 8) openPasscodeKeypad();
    });

    lockscreen.addEventListener('click', () => openPasscodeKeypad());
}

// 5. WALLPAPER ENGINE & SETTINGS UI
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
            </div>
        </div>
    `;
}

// 6. RENDER HOMESCREEN APPS
function renderHomescreenApps() {
    const grid = document.getElementById('homescreen-app-grid');
    if (!grid) return;

    let appsHtml = `
        <div onclick="openApp('bank')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-building-columns"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Bank Central</span>
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
        <div onclick="openApp('shop')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-store"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">IgnaShopee</span>
        </div>
        <div onclick="openApp('inventory')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-box-archive"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Tas & Aset</span>
        </div>
        <div onclick="openApp('messages')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-comments"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">IgnaTalk</span>
        </div>
        <div onclick="openApp('app_halodoc')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-hospital"></i>
            </div>
            <span class="text-[10px] font-medium text-rose-300 drop-shadow">Halodoc</span>
        </div>
        <div onclick="openApp('app_police_hub')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
            <span class="text-[10px] font-medium text-indigo-300 drop-shadow">Polres Hub</span>
        </div>
        <div onclick="openApp('settings')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-gear"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Pengaturan</span>
        </div>
    `;

    // Panel Admin Khusus Owner / Admin
    const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    const isOwner = (tgId && String(tgId) === '8853198899') || 
                    (window.AdminModule && typeof window.AdminModule.isAdmin === 'function' && window.AdminModule.isAdmin());

    if (isOwner) {
        appsHtml += `
            <div onclick="openApp('admin_panel')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
                <div class="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                    <i class="fa-solid fa-user-shield"></i>
                </div>
                <span class="text-[10px] font-medium text-white drop-shadow">Panel Admin</span>
            </div>
        `;
    }

    grid.innerHTML = appsHtml;
}

// 7. ROUTER UTAMA
function openApp(appName) {
    if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
    const win = document.getElementById('screen-app-window');
    const title = document.getElementById('app-window-title');
    const body = document.getElementById('app-window-body');

    if (!win || !body || !title) return;
    win.classList.remove('hidden');

    try {
        if (appName === 'ktp') {
            title.textContent = 'KTP Digital Capil';
            body.innerHTML = (window.AdminModule && typeof window.AdminModule.renderKTPAppUI === 'function') 
                ? window.AdminModule.renderKTPAppUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat KTP. Periksa src/modules/admin.js</div>';
        } else if (appName === 'bank') {
            title.textContent = 'Bank Central Ignatius';
            body.innerHTML = (window.BankModule && typeof window.BankModule.renderBankAppUI === 'function') 
                ? window.BankModule.renderBankAppUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat Bank. Periksa src/modules/bank.js</div>';
        } else if (appName === 'citymap') {
            title.textContent = 'Peta Navigasi Kota';
            body.innerHTML = (window.MapModule && typeof window.MapModule.renderMapUI === 'function') 
                ? window.MapModule.renderMapUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat Peta. Periksa src/modules/map.js</div>';
        } else if (appName === 'jobs') {
            title.textContent = 'Bursa Kerja Ignatius';
            body.innerHTML = (window.JobsModule && typeof window.JobsModule.renderJobsAppUI === 'function') 
                ? window.JobsModule.renderJobsAppUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat Bursa Kerja. Periksa src/modules/jobs.js</div>';
        } else if (appName === 'shop') {
            title.textContent = 'IgnaShopee & Toko Kota';
            body.innerHTML = (window.ShopModule && typeof window.ShopModule.renderShopAppUI === 'function') 
                ? window.ShopModule.renderShopAppUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat Toko. Periksa src/modules/shop.js</div>';
        } else if (appName === 'inventory') {
            title.textContent = 'Tas & Aset Warga';
            body.innerHTML = (window.EconomyModule && typeof window.EconomyModule.renderInventoryAppUI === 'function') 
                ? window.EconomyModule.renderInventoryAppUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat Tas. Periksa src/modules/economy.js</div>';
        } else if (appName === 'messages') {
            title.textContent = 'IgnaTalk (Pesan)';
            body.innerHTML = (window.MessagesModule && typeof window.MessagesModule.renderMessagesAppUI === 'function') 
                ? window.MessagesModule.renderMessagesAppUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat IgnaTalk. Periksa src/modules/messages.js</div>';
        } else if (appName === 'admin_panel') {
            title.textContent = 'Panel Control Admin';
            body.innerHTML = (window.AdminModule && typeof window.AdminModule.renderAdminPanelUI === 'function') 
                ? window.AdminModule.renderAdminPanelUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat Admin Panel. Periksa src/modules/admin.js</div>';
        } else if (appName === 'app_halodoc') {
            title.textContent = 'Halodoc Medika Central';
            body.innerHTML = (window.JobsModule && typeof window.JobsModule.renderHalodocAppUI === 'function') 
                ? window.JobsModule.renderHalodocAppUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat Halodoc. Periksa src/modules/jobs.js</div>';
        } else if (appName === 'app_police_hub') {
            title.textContent = 'Polres Hub & Patrolex';
            body.innerHTML = (window.JobsModule && typeof window.JobsModule.renderPoliceHubAppUI === 'function') 
                ? window.JobsModule.renderPoliceHubAppUI() 
                : '<div class="text-center py-10 text-rose-400">Gagal memuat Polres Hub. Periksa src/modules/jobs.js</div>';
        } else if (appName === 'settings') {
            title.textContent = 'Pengaturan iOS';
            body.innerHTML = renderSettingsUI();
        }
    } catch (err) {
        console.error('Error opening app:', err);
        body.innerHTML = `<div class="text-center py-10 text-rose-400">Error App: ${err.message}</div>`;
    }
}

function closeApp() {
    const win = document.getElementById('screen-app-window');
    if (win) win.classList.add('hidden');
}

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
    const avatarEl = document.getElementById('home-user-avatar');

    if (nameEl) nameEl.textContent = identity.fullName || 'Warga Ignatius';
    if (nikEl) nikEl.textContent = `NIK: ${identity.nik || '-'}`;
    if (avatarEl && identity.photoUrl) avatarEl.src = identity.photoUrl;

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
