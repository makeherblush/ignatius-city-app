// ==========================================
// MASTER DATABASE LOKASI & SPOT KOTA (LOCATIONS.JS)
// ==========================================

window.LOCATIONS_DATABASE = [
    {
        id: 'loc_capil',
        name: 'Balai Kota & Capil',
        category: 'Pemerintahan',
        iconFa: 'fa-landmark',
        color: 'bg-sky-600',
        desc: 'Layanan kependudukan, KTP Digital, KK, dan Paspor.',
        licenses: ['KTP_DIGITAL', 'PASSPORT_INT'],
        items: [],
        jobs: ['prof_auditor']
    },
    {
        id: 'loc_polres',
        name: 'Polres Ignatius',
        category: 'Keamanan',
        iconFa: 'fa-shield-halved',
        color: 'bg-indigo-600',
        desc: 'Ujian SIM, izin senjata api, dan pendaftaran kepolisian.',
        licenses: ['SIM_C', 'SIM_A', 'SIM_B1', 'CERT_SECURITY_1', 'CERT_SECURITY_2', 'LICENSE_FIREARM_INST'],
        items: [],
        jobs: ['prof_police_patrol', 'prof_police_detective']
    },
    {
        id: 'loc_rsud',
        name: 'RSUD Medika Central',
        category: 'Kesehatan',
        iconFa: 'fa-hospital',
        color: 'bg-rose-600',
        desc: 'Layanan medis darurat, pembelian obat, dan lisensi STR.',
        licenses: ['STR_GENERAL', 'STR_SPECIALIST', 'STR_PHARMA'],
        items: ['med_paracetamol', 'med_bandage', 'med_vitamin', 'med_firstaid_kit', 'med_adrenalin', 'pass_insurance_med'],
        jobs: ['prof_nurse', 'prof_pharma', 'prof_doc_gen', 'prof_doc_surg']
    },
    {
        id: 'loc_showroom',
        name: 'Showroom Otomotif',
        category: 'Kendaraan',
        iconFa: 'fa-car',
        color: 'bg-amber-600',
        desc: 'Beli sepeda, motor, hingga sedan mewah eksekutif.',
        licenses: [],
        items: ['key_bicycle', 'key_motor_bebek', 'key_taxi_matic', 'key_sedan_luxury'],
        jobs: []
    },
    {
        id: 'loc_market',
        name: 'Supermarket & Minimarket 24 jam',
        category: 'Perbelanjaan',
        iconFa: 'fa-cart-shopping',
        color: 'bg-emerald-600',
        desc: 'Kebutuhan makanan, minuman, dan stamina harian.',
        licenses: ['NIB_FOOD', 'NIB_RETAIL'],
        items: ['food_water', 'drink_tea', 'food_noodle', 'food_bread', 'drink_coffee', 'food_friedrice', 'food_satay', 'drink_milk', 'food_bento', 'drink_energy', 'food_steak', 'food_pizza'],
        jobs: ['side_carwash', 'side_parking', 'side_reseller']
    },
    {
        id: 'loc_court',
        name: 'Pengadilan Kota Ignatius',
        category: 'Hukum',
        iconFa: 'fa-scale-balanced',
        color: 'bg-purple-600',
        desc: 'Layanan hukum, kantor advokat, dan persidangan.',
        licenses: ['LICENSE_LAW', 'LICENSE_NOTARY'],
        items: [],
        jobs: ['prof_lawyer_advocate', 'prof_lawyer_prosecutor', 'prof_judge']
    },
    {
        id: 'loc_fishing',
        name: 'Danau & Area Pemancingan',
        category: 'Refreshing',
        iconFa: 'fa-fish',
        color: 'bg-cyan-600',
        desc: 'Spot santai memancing ikan untuk melatih kesabaran & dijual.',
        licenses: [],
        items: [],
        jobs: [],
        activities: [
            { id: 'act_fish', name: 'Mancing Ikan Gurame', vitCost: 8, rewardCrest: 350, desc: 'Mancing santai di tepi danau.' }
        ]
    },
    {
        id: 'loc_park',
        name: 'Taman Kota & Alun-Alun',
        category: 'Refreshing',
        iconFa: 'fa-tree',
        color: 'bg-teal-600',
        desc: 'Tempat bersantai, jogging, dan memulihkan stamina.',
        licenses: [],
        items: ['pass_gym_vip'],
        jobs: ['side_scavenger', 'side_newspaper', 'side_petsitter'],
        activities: [
            { id: 'act_relax', name: 'Duduk Santai di Taman', vitCost: 0, healVitality: 15, desc: 'Menghirup udara segar (+15% Vit gratis).' }
        ]
    }
];
