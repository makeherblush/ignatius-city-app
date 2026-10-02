// ==========================================
// MASTER STATE MANAGEMENT (STATE.JS)
// ==========================================

const DEFAULT_GAME_STATE = {
    crest: 5000,
    vitality: 100,
    registered: false,

    system: {
        ownerId: 'TG-8853198899', // Masukkan NIK / ID Telegram Owner di sini
        adminIds: [],
        wallpaperUrl: 'assets/images/wallpaper.png'
    },

    user: {
        identity: {
            nik: null,
            fullName: '',
            gender: 'Laki-laki',
            photoUrl: 'assets/images/avatars/default.png',
            registeredAt: null,
            pinPasscode: '1234'
        },
        family: {
            kkNumber: null,
            isHeadOfFamily: true,
            spouseNik: null,
            spouseName: null,
            marriageDate: null,
            childrenNiks: []
        },
        legal: {
            licenses: ['KTP_DIGITAL'],
            criminalRecord: [],
            skckStatus: 'CLEAN'
        }
    },

    // Status Hukum & Penjara
    law: {
        isJailed: false,
        jailMinutes: 0,
        fines: 0,
        reason: ''
    },

    economy: {
        bankAccount: { accountNumber: 'CP-90128', pin: '1234', status: 'ACTIVE' },
        transactions: [],
        invoices: [],
        inventory: []
    },

    jobState: {
        activeJobId: null,
        unlockedCustomApps: [],
        completedShifts: 0,
        hiredAt: null
    },

    properties: {
        activeResidence: 'boarding_room',
        ownedProperties: ['boarding_room']
    },

    health: {
        isUnconscious: false,
        hospitalizedAt: null,
        activeEmergencyCall: null
    }
};

class GameStateManager {
    constructor() {
        this.STORAGE_KEY = 'IGNATIUS_MASTER_STATE_V7';
        this.data = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = { ...DEFAULT_GAME_STATE, ...parsed };
                
                // FORCE SYNC OWNER ID dari DEFAULT_GAME_STATE
                if (DEFAULT_GAME_STATE.system.ownerId !== 'TG-123456789') {
                    this.data.system.ownerId = DEFAULT_GAME_STATE.system.ownerId;
                }
            }
        } catch (e) {
            console.error('[GameState] Load error:', e);
        }
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            if (typeof updateUI === 'function') updateUI();
        } catch (e) {
            console.error('[GameState] Save error:', e);
        }
    }

    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        location.reload();
    }
}

window.gameStateManager = new GameStateManager();
window.gameState = window.gameStateManager.data;
window.saveState = () => window.gameStateManager.save();
