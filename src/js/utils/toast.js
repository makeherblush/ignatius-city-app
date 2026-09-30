// ==========================================
// MODUL TOAST NOTIFICATION (CUSTOM ALERTS)
// ==========================================

const Toast = {
    // Wadah tempat toast menumpuk di layar
    containerId: 'toast-container',

    /**
     * Memastikan wadah container toast sudah ada di DOM
     */
    initContainer() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            // Posisikan di sudut kanan bawah dengan z-index tinggi
            container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none';
            document.body.appendChild(container);
        }
        return container;
    },

    /**
     * Menampilkan notifikasi melayang
     * @param {string} message - Teks pesan yang ingin ditampilkan
     * @param {'success'|'error'|'warning'|'info'} type - Jenis notifikasi
     * @param {number} duration - Durasi tampil dalam milidetik (default: 3000ms)
     */
    show(message, type = 'info', duration = 3000) {
        const container = this.initContainer();

        // Konfigurasi tema warna & icon berdasarkan tipe
        const config = {
            success: {
                border: 'border-emerald-500/40',
                bg: 'bg-emerald-950/90',
                icon: 'fa-circle-check text-emerald-400',
                progress: 'bg-emerald-500'
            },
            error: {
                border: 'border-rose-500/40',
                bg: 'bg-rose-950/90',
                icon: 'fa-circle-xmark text-rose-400',
                progress: 'bg-rose-500'
            },
            warning: {
                border: 'border-amber-500/40',
                bg: 'bg-amber-950/90',
                icon: 'fa-triangle-exclamation text-amber-400',
                progress: 'bg-amber-500'
            },
            info: {
                border: 'border-sky-500/40',
                bg: 'bg-sky-950/90',
                icon: 'fa-circle-info text-sky-400',
                progress: 'bg-sky-500'
            }
        }[type] || config.info;

        // Buat elemen card toast
        const toastEl = document.createElement('div');
        toastEl.className = `relative flex items-center justify-between gap-3 p-3.5 ${config.bg} text-slate-100 rounded-2xl border ${config.border} shadow-2xl backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-4 opacity-0 overflow-hidden`;

        toastEl.innerHTML = `
            <div class="flex items-center gap-3 pr-2">
                <i class="fa-solid ${config.icon} text-lg shrink-0"></i>
                <span class="text-xs font-medium leading-relaxed">${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-200 text-xs shrink-0 p-1">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="toast-progress absolute bottom-0 left-0 h-0.5 ${config.progress} transition-all ease-linear" style="width: 100%;"></div>
        `;

        container.appendChild(toastEl);

        // Animasi Masuk (Fade In + Slide Up)
        requestAnimationFrame(() => {
            toastEl.classList.remove('translate-y-4', 'opacity-0');
        });

        // Animasi Progress Bar
        const progressBar = toastEl.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.transitionDuration = `${duration}ms`;
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }

        // Fungsi Hilang Otomatis
        const dismissTimer = setTimeout(() => {
            this.dismiss(toastEl);
        }, duration);

        // Klik langsung untuk menutup
        toastEl.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.parentElement.matches('button')) {
                clearTimeout(dismissTimer);
                this.dismiss(toastEl);
            }
        });
    },

    /**
     * Mengapus elemen toast dengan animasi keluar
     */
    dismiss(toastEl) {
        toastEl.classList.add('opacity-0', 'translate-y-2', 'scale-95');
        setTimeout(() => {
            if (toastEl.parentElement) {
                toastEl.remove();
            }
        }, 300);
    },

    // Helper shorthand method
    success(msg, duration) { this.show(msg, 'success', duration); },
    error(msg, duration) { this.show(msg, 'error', duration); },
    warning(msg, duration) { this.show(msg, 'warning', duration); },
    info(msg, duration) { this.show(msg, 'info', duration); }
};

/**
 * Opsional: Timpa fungsi window.alert() agar semua alert bawaan otomatis menjadi Toast
 */
window.alert = function (message) {
    Toast.info(message);
};

// Expose ke global scope
window.Toast = Toast;
window.showToast = (msg, type, duration) => Toast.show(msg, type, duration);
