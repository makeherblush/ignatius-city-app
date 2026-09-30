// Struktur data player khusus modul Pendataan
const DEFAULT_CITIZEN_STATE = {
    identity: {
        nik: null,               // e.g., "IGN-100203" atau Telegram ID "TG-892182"
        fullName: '',            // Nama dari Telegram / Custom
        gender: 'Laki-laki',
        photoUrl: '',            // URL Foto Profil Telegram
        registeredAt: null,      // Tanggal Pendaftaran
        pinPasscode: '1234'       // 4-Digit PIN Lockscreen
    },
    family: {
        kkNumber: null,          // Nomor Kartu Keluarga
        isHeadOfFamily: true,    // Status Kepala Keluarga
        spouseNik: null,         // NIK Pasangan (jika menikah)
        marriageDate: null,      // Tanggal Nikah
        childrenNiks: []         // List NIK Anak Adopsi/Dependen
    },
    legal: {
        licenses: ['KTP_DIGITAL'], // Array ID lisensi yang dimiliki
        criminalRecord: [],        // Riwayat tilang/penjara
        skckStatus: 'CLEAN'        // Status 'CLEAN' atau 'CONVICT'
    }
};
