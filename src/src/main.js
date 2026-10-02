// ==========================================
// CONTROLLER UTAMA iOS & UI MANAGER (MAIN.JS)
// ==========================================

let currentInputPasscode = '';

// Play Sound Effect dengan Fallback Audio Element / Web Audio
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
    document.getElementById('screen-passcode').classList.remove('hidden');
    currentInputPasscode = '';
    renderPasscodeDots();
}

function cancelPasscode() {
    playAudioSfx('keypad');
    document.getElementById('screen-passcode').classList.add('hidden');
    currentInputPasscode = '';
}

function pressKey(num) {
    if (currentInputPasscode.length < 4) {
        playAudioSfx('keypad');
        currentInputPasscode += num;
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
    let html = '';
    for (let i = 0; i < 4; i++) {
        html += i < currentInputPasscode.length
            ? `<div class="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-amber-400"></div>`
            : `<div class="w-3.5 h-3.5 rounded-full border-2 border-white/60"></div>`;
    }
    dotsContainer.innerHTML = html;
}

function verifyPasscode() {
    if (currentInputPasscode === window.gameState.user.identity.pinPasscode) {
        playAudioSfx('unlock');
        document.getElementById('screen-passcode').classList.add('hidden');
        document.getElementById('screen-lockscreen').classList.add('hidden');
        document.getElementById('screen-homescreen').classList.remove('hidden');
        document.getElementById('island-lock-icon').className = 'fa-solid fa-lock-open text-emerald-400';
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
    document.getElementById('island-lock-icon').className = 'fa-solid fa-lock text-amber-400';
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
    `;

    // Dynamic Apps Profesi
    const unlockedApps = window.gameState.jobState ? window.gameState.jobState.unlockedCustomApps : [];
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
    document.getElementById('screen-app-window').classList.add('hidden');
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
    document.getElementById('display-crest').textContent = window.gameState.crest.toLocaleString();
    document.getElementById('display-vit-text').textContent = `${window.gameState.vitality} / 100`;
    document.getElementById('display-vit-bar').style.width = `${window.gameState.vitality}%`;

    const identity = window.gameState.user.identity;
    document.getElementById('home-user-name').textContent = identity.fullName || 'Warga Ignatius';
    document.getElementById('home-user-nik').textContent = `NIK: ${identity.nik || '-'}`;
    document.getElementById('lockscreen-citizen-name').textContent = identity.fullName || 'Warga Terdaftar';

    if (identity.photoUrl) {
        document.getElementById('home-user-avatar').src = identity.photoUrl;
    }

    renderHomescreenApps();
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

    document.getElementById('ios-clock-status').textContent = timeStr;
    document.getElementById('ios-clock-big').textContent = timeStr;
    document.getElementById('ios-date-display').textContent = dateStr;
}

document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);

    if (!window.gameState.registered) {
        document.getElementById('screen-register').classList.remove('hidden');
    } else {
        document.getElementById('screen-lockscreen').classList.remove('hidden');
    }

    updateUI();
});
