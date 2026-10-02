// ==========================================
// MASTER STATE MANAGEMENT (STATE.JS)
// ==========================================

const DEFAULT_GAME_STATE = {
    crest: 5000,
    vitality: 100,
    registered: false,

    system: {
        ownerId: 'TG-8853198899',
        adminIds: [],
        wallpaperUrl: 'assets/images/wallpaper.png' // Wallpaper default
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
            marriageDate: null,
            childrenNiks: []
        },
        legal: {
            licenses: ['KTP_DIGITAL'],
            criminalRecord: [],
            skckStatus: 'CLEAN'
        }
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
        this.STORAGE_KEY = 'IGNATIUS_MASTER_STATE_V6';
        this.data = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.data = { ...DEFAULT_GAME_STATE, ...JSON.parse(saved) };
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
