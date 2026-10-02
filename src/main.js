// ==========================================
// KONTROL LAYAR LOCKSCREEN & KEYPAD PIN (FIXED SWIPE)
// ==========================================

// Membuka Layar Keypad PIN
function openPasscodeKeypad() {
    playAudioSfx('keypad');
    const lockscreen = document.getElementById('screen-lockscreen');
    const passcodeScreen = document.getElementById('screen-passcode');
    
    // Sembunyikan Lockscreen total & tampilkan Layar PIN
    if (lockscreen) {
        lockscreen.classList.add('hidden');
        lockscreen.style.transform = 'translateY(0)';
    }
    if (passcodeScreen) {
        passcodeScreen.classList.remove('hidden');
    }
    
    currentInputPasscode = '';
    renderPasscodeDots();
}

// Batal / Kembali ke Lockscreen
function cancelPasscode() {
    playAudioSfx('keypad');
    const lockscreen = document.getElementById('screen-lockscreen');
    const passcodeScreen = document.getElementById('screen-passcode');
    
    if (passcodeScreen) passcodeScreen.classList.add('hidden');
    if (lockscreen) {
        lockscreen.classList.remove('hidden');
        lockscreen.style.transform = 'translateY(0)';
    }
    currentInputPasscode = '';
}

// SISTEM GESTURE SWIPE UP iOS (RESPONSIF & BEBAS MENTAL)
function initSwipeLockscreen() {
    const lockscreen = document.getElementById('screen-lockscreen');
    if (!lockscreen) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    // --- GESTURE TOUCH (HP) ---
    lockscreen.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        currentY = startY; // Diset sama di awal agar tidak ada lonjakan nilai
        isDragging = true;
        lockscreen.style.transition = 'none';
    }, { passive: true });

    lockscreen.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;

        // Hanya izinkan animasi naik ke atas
        if (diffY < 0) {
            lockscreen.style.transform = `translateY(${diffY}px)`;
        }
    }, { passive: true });

    lockscreen.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;

        const diffY = currentY - startY;

        // Jika diusap ke atas minimal 25px (sangat sensitif, langsung buka)
        if (diffY < -25) {
            lockscreen.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            lockscreen.style.transform = 'translateY(-100%)';

            setTimeout(() => {
                openPasscodeKeypad();
            }, 180);
        } else {
            // Balik ke posisi awal jika cuma tersentuh / geser dikit
            lockscreen.style.transition = 'transform 0.2s ease-out';
            lockscreen.style.transform = 'translateY(0)';
        }

        startY = 0;
        currentY = 0;
    });

    // --- GESTURE MOUSE (PC / BROWSER DESKTOP) ---
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
        if (diffY < 0) {
            lockscreen.style.transform = `translateY(${diffY}px)`;
        }
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;

        const diffY = currentY - startY;

        if (diffY < -25) {
            lockscreen.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            lockscreen.style.transform = 'translateY(-100%)';

            setTimeout(() => {
                openPasscodeKeypad();
            }, 180);
        } else {
            lockscreen.style.transition = 'transform 0.2s ease-out';
            lockscreen.style.transform = 'translateY(0)';
        }

        startY = 0;
        currentY = 0;
    });
}
