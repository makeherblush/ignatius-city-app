// ==========================================
// CONTROLLER UTAMA iOS & UI MANAGER (MAIN.JS)
// ==========================================

let currentInputPasscode = '';

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

// PASSCODE & LOCKSCREEN
function openPasscodeKeypad() {
    playAudioSfx('keypad');
    const lockscreen = document.getElementById('screen-lockscreen');
    const passcodeScreen = document.getElementById('screen-passcode');

    if (lockscreen) { lockscreen.classList.add('hidden'); lockscreen.style.display = 'none'; }
    if (passcodeScreen) { passcodeScreen.classList.remove('hidden'); passcodeScreen.style.display = 'flex'; }

    currentInputPasscode = '';
    renderPasscodeDots();
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

// RENDER HOMESCREEN APPS (LENGKAP TANPA DUPLIKAT)
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

    // Panel Admin khusus Owner Telegram ID 8853198899
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

// ROUTER APLIKASI
function openApp(appName) {
    if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
    const win = document.getElementById('screen-app-window');
    const title = document.getElementById('app-window-title');
    const body = document.getElementById('app-window-body');

    if (!win || !body || !title) return;
    win.classList.remove('hidden');

    if (appName === 'ktp') {
        title.textContent = 'KTP Digital Capil';
        body.innerHTML = (window.AdminModule && typeof window.AdminModule.renderKTPAppUI === 'function') 
            ? window.AdminModule.renderKTPAppUI() 
            : '<div class="text-center py-10 text-rose-400">Gagal memuat KTP. Periksa file src/modules/admin.js</div>';
    } else if (appName === 'bank') {
        title.textContent = 'Bank Central Ignatius';
        body.innerHTML = (window.BankModule && typeof window.BankModule.renderBankAppUI === 'function') 
            ? window.BankModule.renderBankAppUI() 
            : 'Bank Central Siap';
    } else if (appName === 'citymap') {
        title.textContent = 'Peta Navigasi Kota';
        body.innerHTML = (window.MapModule && typeof window.MapModule.renderMapUI === 'function') 
            ? window.MapModule.renderMapUI() 
            : 'Peta Kota Siap';
    } else if (appName === 'jobs') {
        title.textContent = 'Bursa Kerja Ignatius';
        body.innerHTML = (window.JobsModule && typeof window.JobsModule.renderJobsAppUI === 'function') 
            ? window.JobsModule.renderJobsAppUI() 
            : 'Bursa Kerja Siap';
    } else if (appName === 'shop') {
        title.textContent = 'IgnaShopee & Toko Kota';
        body.innerHTML = (window.ShopModule && typeof window.ShopModule.renderShopAppUI === 'function') 
            ? window.ShopModule.renderShopAppUI() 
            : 'Toko Kota Siap';
    } else if (appName === 'inventory') {
        title.textContent = 'Tas & Aset Warga';
        body.innerHTML = (window.EconomyModule && typeof window.EconomyModule.renderInventoryAppUI === 'function') 
            ? window.EconomyModule.renderInventoryAppUI() 
            : 'Tas & Aset Siap';
    } else if (appName === 'messages') {
        title.textContent = 'IgnaTalk (Pesan)';
        body.innerHTML = (window.MessagesModule && typeof window.MessagesModule.renderMessagesAppUI === 'function') 
            ? window.MessagesModule.renderMessagesAppUI() 
            : 'IgnaTalk Siap';
    } else if (appName === 'admin_panel') {
        title.textContent = 'Panel Control Admin';
        body.innerHTML = (window.AdminModule && typeof window.AdminModule.renderAdminPanelUI === 'function') 
            ? window.AdminModule.renderAdminPanelUI() 
            : 'Panel Admin Siap';
    } else if (appName === 'app_halodoc') {
        title.textContent = 'Halodoc Medika Central';
        body.innerHTML = (window.JobsModule && typeof window.JobsModule.renderHalodocAppUI === 'function') 
            ? window.JobsModule.renderHalodocAppUI() 
            : 'Halodoc Siap';
    } else if (appName === 'app_police_hub') {
        title.textContent = 'Polres Hub & Patrolex';
        body.innerHTML = (window.JobsModule && typeof window.JobsModule.renderPoliceHubAppUI === 'function') 
            ? window.JobsModule.renderPoliceHubAppUI() 
            : 'Polres Hub Siap';
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
