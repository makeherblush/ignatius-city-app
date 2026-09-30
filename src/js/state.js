// ==========================================
// MODUL CENTRALIZED GAME STATE (STATE.JS)
// ==========================================

// Nilai Bawaan Game (Initial State)
const DEFAULT_STATE = {
    playerCrest: 5000,
    playerVitality: 100,
    playerAdmin: {
        hasKTP: false,
        nik: null,
        fullName: 'Warga Crestville',
        gender: 'Laki-laki',
        city: 'Kota Crestville',
        registeredAt: null,
        licenses: []
    },
    playerBusinesses: [],
    playerProperties: {
        activeResidence: 'boarding_room',
        ownedProperties: ['boarding_room']
    },
    playerCityState: {
        currentLocation: 'city_hall',
        lastEmergencyCall: null
    }
};

class GameState {
    constructor() {
        this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.listeners = [];
        this.bindGlobalScope();
    }

    /**
     * Menghubungkan state ke window scope agar tetap kompatibel dengan modul lain
     */
    bindGlobalScope() {
        window.gameState = this;
        
        // Proxy/Getter-Setter ke variabel global legacy
        Object.defineProperty(window, 'playerCrest', {
            get: () => this.data.playerCrest,
            set: (val) => this.set('playerCrest', val)
        });

        Object.defineProperty(window, 'playerVitality', {
            get: () => this.data.playerVitality,
            set: (val) => this.set('playerVitality', val)
        });

        Object.defineProperty(window, 'playerAdmin', {
            get: () => this.data.playerAdmin,
            set: (val) => this.set('playerAdmin', val)
        });

        Object.defineProperty(window, 'playerBusinesses', {
            get: () => this.data.playerBusinesses,
            set: (val) => this.set('playerBusinesses', val)
        });

        Object.defineProperty(window, 'playerProperties', {
            get: () => this.data.playerProperties,
            set: (val) => this.set('playerProperties', val)
        });

        Object.defineProperty(window, 'playerCityState', {
            get: () => this.data.playerCityState,
            set: (val) => this.set('playerCityState', val)
        });
    }

    /**
     * Membaca seluruh data state
     * @returns {Object}
     */
    get() {
        return this.data;
    }

    /**
     * Mengubah properti spesifik pada state dan memicu notifikasi pembaruan UI
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        this.data[key] = value;
        this.notify(key, value);
    }

    /**
     * Memuat objek state secara utuh (digunakan saat Load Game dari LocalStorage/JSON)
     * @param {Object} newState 
     */
    load(newState) {
        this.data = { ...DEFAULT_STATE, ...newState };
        this.notify('ALL', this.data);
    }

    /**
     * Mengembalikan state ke kondisi awal
     */
    reset() {
        this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.notify('ALL', this.data);
    }

    /**
     * Mendaftarkan callback untuk mendengarkan perubahan state (Event Listener)
     * @param {Function} callback 
     */
    subscribe(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    /**
     * Memberitahu seluruh modul yang berlangganan bahwa terjadi perubahan state
     * @param {string} key 
     * @param {any} value 
     */
    notify(key, value) {
        this.listeners.forEach(callback => {
            try {
                callback(key, value, this.data);
            } catch (err) {
                console.error('[GameState] Listener Error:', err);
            }
        });

        // Trigger fungsi render UI global jika tersedia
        if (typeof window.updateUI === 'function') {
            window.updateUI();
        }
    }
}

// Inisialisasi Instance Tunggal (Singleton)
const stateManager = new GameState();
