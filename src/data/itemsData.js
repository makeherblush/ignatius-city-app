// src/data/itemsData.js
window.ITEMS_DATABASE = [
    // --- KATEGORI: MAKANAN & MINUMAN (PEMULIHAN STAMINA/VITALITY) ---
    {
        id: 'food_noodle',
        name: 'Mie Instan Ignatius',
        category: 'Makanan',
        price: 150,
        healVitality: 15,
        icon: 'fa-bowl-food',
        desc: 'Makanan merakyat pemulih stamina cepat.'
    },
    {
        id: 'food_bento',
        name: 'Nasi Bento Lengkap',
        category: 'Makanan',
        price: 500,
        healVitality: 40,
        icon: 'fa-box-tissue',
        desc: 'Makanan bergizi tinggi untuk pekerja keras.'
    },
    {
        id: 'drink_coffee',
        name: 'Kopi Espresso Hitam',
        category: 'Minuman',
        price: 250,
        healVitality: 25,
        icon: 'fa-mug-hot',
        desc: 'Menghilangkan kantuk dan menambah stamina kerja.'
    },

    // --- KATEGORI: KESEHATAN & MEDICINE ---
    {
        id: 'med_bandage',
        name: 'Perban P3K Darurat',
        category: 'Kesehatan',
        price: 450,
        healVitality: 30,
        icon: 'fa-bandage',
        desc: 'Pertolongan pertama saat lecet atau stamina turun.'
    },
    {
        id: 'med_vitamin',
        name: 'Suplemen Vitamin C Complex',
        category: 'Kesehatan',
        price: 1200,
        healVitality: 65,
        icon: 'fa-pills',
        desc: 'Menjaga tubuh tetap fit dan terhindar dari koma.'
    },

    // --- KATEGORI: PERALATAN & PERIZINAN ---
    {
        id: 'tool_toolbox',
        name: 'Kotak Perkakas Mekanik',
        category: 'Peralatan',
        price: 3500,
        healVitality: 0,
        icon: 'fa-toolbox',
        desc: 'Peralatan wajib untuk montir dan teknisi.'
    }
];
