// ==========================================
// CONTROLLER UTAMA iOS & UI MANAGER (MAIN.JS)
// ==========================================

let currentInputPasscode = '';

// Play Sound Effect dengan Fallback Safe
function playAudioSfx(type) {
    const el = document.getElementById(`audio-${type}`);
    if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
    }
}

// System Toast Notification iOS
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

    toast.classList.remove('opacity-0', 'translate-y-2');
    setTimeout(() => toast.classList.add('opacity-0', 'translate-y-2'), 3000);
}

// Passcode Keypad System
function openPasscodeKeypad() {
    playAudioSfx('keypad');
    const keypadScreen = document.getElementById('screen-passcode');
    if (keypadScreen) keypadScreen.classList.remove('hidden');
    currentInputPasscode = '';
    renderPasscodeDots();
}

function cancelPasscode() {
    playAudioSfx('keypad');
    const keypadScreen = document.getElementById('screen-passcode');
    if (keypadScreen) keypadScreen.classList.add('hidden');
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

// FUNGSI VERIFIKASI PIN (FIXED NO-BUG)
function verifyPasscode() {
    // Ambil PIN terdaftar dengan Fallback bertingkat agar tidak pernah undefined
    const savedPin = String(
        (window.gameState && window.gameState.user && window.gameState.user.identity && window.gameState.user.identity.pinPasscode) ||
        (window.gameState && window.gameState.user && window.gameState.user.identity && window.gameState.user.identity.pin) ||
        '1234'
    );

    if (String(currentInputPasscode).trim() === savedPin.trim()) {
        playAudioSfx('unlock');
        document.getElementById('screen-passcode').classList.add('hidden');
        document.getElementById('screen-lockscreen').classList.add('hidden');
        document.getElementById('screen-homescreen').classList.remove('hidden');
        
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
    document.getElementById('screen-homescreen').classList.add('hidden');
    document.getElementById('screen-lockscreen').classList.remove('hidden');
    
    const lockIcon = document.getElementById('island-lock-icon');
    if (lockIcon) lockIcon.className = 'fa-solid fa-lock text-amber-400';
}

// SISTEM GESTURE SWIPE UP LOCKSCREEN iOS
function initSwipeLockscreen() {
    const lockscreen = document.getElementById('screen-lockscreen');
    if (!lockscreen) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    // Support Touch Screen (HP)
    lockscreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        lockscreen.style.transition = 'none';
    }, { passive: true });

    lockscreen.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        if (diffY < 0) {
            lockscreen.style.transform = `translateY(${diffY}px)`;
        }
    }, { passive: true });

    lockscreen.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const diffY = currentY - startY;
        lockscreen.style.transition = 'transform 0.3s ease-out';
        
        if (diffY < -80) { // Swipe up melebihi 80px
            lockscreen.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                lockscreen.style.transform = 'translateY(0)';
                openPasscodeKeypad();
            }, 250);
        } else {
            lockscreen.style.transform = 'translateY(0)';
        }
        startY = 0;
        currentY = 0;
    });

    // Support Mouse Drag (Desktop PC)
    lockscreen.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        isDragging = true;
        lockscreen.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentY = e.clientY;
        const diffY = currentY - startY;
        if (diffY < 0) {
            lockscreen.style.transform = `translateY(${diffY}px)`;
        }
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        const diffY = currentY - startY;
        lockscreen.style.transition = 'transform 0.3s ease-out';

        if (diffY < -80) {
            lockscreen.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                lockscreen.style.transform = 'translateY(0)';
                openPasscodeKeypad();
            }, 250);
        } else {
            lockscreen.style.transform = 'translateY(0)';
        }
        startY = 0;
        currentY = 0;
    });
}

// Render Homescreen App Grid
function renderHomescreenApps() {
    const grid = document.getElementById('homescreen-app-grid');
    if (!grid) return;

    let appsHtml = `
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
        <div onclick="openApp('economy')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-wallet"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Crest Pay</span>
        </div>
        <div onclick="openApp('admin_panel')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
            <div class="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
            <span class="text-[10px] font-medium text-white drop-shadow">Panel Admin</span>
        </div>
    `;

    // Dynamic Apps Profesi
    const unlockedApps = (window.gameState && window.gameState.jobState) ? window.gameState.jobState.unlockedCustomApps : [];
    if (unlockedApps.includes('app_imc_dispatch')) {
        appsHtml += `
            <div onclick="openApp('imc_dispatch')" class="app-icon flex flex-col items-center gap-1.5 cursor-pointer">
                <div class="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl shadow-lg border border-white/20 animate-pulse">
                    <i class="fa-solid fa-truck-medical"></i>
                </div>
                <span class="text-[10px] font-medium text-rose-300 drop-shadow">IMC Dispatch</span>
            </div>
        `;
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

    if (appName === 'ktp') {
        title.textContent = 'KTP Digital Capil';
        body.innerHTML = window.AdminModule.renderKTPAppUI();
    } else if (appName === 'jobs') {
        title.textContent = 'Bursa Kerja Ignatius';
        body.innerHTML = window.JobsModule.renderJobsAppUI();
    } else if (appName === 'economy') {
        title.textContent = 'Crest Pay & Market';
        body.innerHTML = window.EconomyModule.renderCrestPayAppUI();
    } else if (appName === 'admin_panel') {
        title.textContent = 'Panel Control Admin';
        body.innerHTML = window.AdminModule.renderAdminPanelUI();
    } else if (appName === 'imc_dispatch') {
        title.textContent = 'IMC Dispatch (Dokter)';
        body.innerHTML = `
            <div class="glass-ios p-4 rounded-3xl border border-rose-500/40 space-y-3">
                <h4 class="text-xs font-bold text-rose-400">🚨 PUSAT DISPATCH MEDIS (CODE BLUE)</h4>
                <p class="text-[10px] text-slate-300">Siaga darurat medis pingsan sekota.</p>
                <button onclick="playAudioSfx('siren'); showToast('Sirene Ambulans diaktifkan!', 'error');" class="w-full py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg">
                    Aktifkan Sirene Ambulans
                </button>
            </div>
        `;
    }
}

function closeApp() {
    const win = document.getElementById('screen-app-window');
    if (win) win.classList.add('hidden');
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-fullname').value;
    const gender = document.getElementById('reg-gender').value;
    const passcode = document.getElementById('reg-passcode').value;

    if (window.AdminModule.registerCitizen(name, gender, passcode)) {
        playAudioSfx('unlock');
        document.getElementById('screen-register').classList.add('hidden');
        document.getElementById('screen-lockscreen').classList.remove('hidden');
    }
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
    const lockNameEl = document.getElementById('lockscreen-citizen-name');
    const avatarEl = document.getElementById('home-user-avatar');

    if (nameEl) nameEl.textContent = identity.fullName || 'Warga Ignatius';
    if (nikEl) nikEl.textContent = `NIK: ${identity.nik || '-'}`;
    if (lockNameEl) lockNameEl.textContent = identity.fullName || 'Warga Terdaftar';

    if (avatarEl && identity.photoUrl) {
        avatarEl.src = identity.photoUrl;
    }

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
    // Inisialisasi & Auto-Expand Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand(); // Bikin tampilan HP langsung full screen di Telegram
    }

    updateClock();
    setInterval(updateClock, 1000);
    initSwipeLockscreen();

    if (!window.gameState.registered) {
        // Auto-fill nama di form pendaftaran jika baru pertama kali buka
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser) {
            const regInput = document.getElementById('reg-fullname');
            if (regInput) {
                regInput.value = `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`;
            }
        }
        document.getElementById('screen-register').classList.remove('hidden');
    } else {
        document.getElementById('screen-lockscreen').classList.remove('hidden');
    }

    updateUI();
});
