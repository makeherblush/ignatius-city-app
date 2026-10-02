// ==========================================
// MASTER DATABASE BARANG & TOKO
// ==========================================

window.ITEMS_DATABASE = [
    // --- KONSUMSI MAKANAN & MINUMAN ---
    { id: 'food_water', name: 'Air Mineral Botol', category: 'Minuman', price: 50, healVitality: 8, iconPng: 'assets/images/icons/water.png', iconFa: 'fa-bottle-water', desc: 'Penghilang dahaga ringan.' },
    { id: 'drink_tea', name: 'Es Teh Manis Jumbo', category: 'Minuman', price: 100, healVitality: 12, iconPng: 'assets/images/icons/tea.png', iconFa: 'fa-glass-water', desc: 'Penyegar dahaga harian.' },
    { id: 'food_noodle', name: 'Mie Instan Ignatius', category: 'Makanan', price: 150, healVitality: 15, iconPng: 'assets/images/icons/noodle.png', iconFa: 'fa-bowl-food', desc: 'Makanan merakyat hemat.' },
    { id: 'food_bread', name: 'Roti Cokelat Bakar', category: 'Makanan', price: 200, healVitality: 20, iconPng: 'assets/images/icons/bread.png', iconFa: 'fa-bread-slice', desc: 'Sarapan praktis pekerja.' },
    { id: 'drink_coffee', name: 'Kopi Espresso Hitam', category: 'Minuman', price: 250, healVitality: 25, iconPng: 'assets/images/icons/coffee.png', iconFa: 'fa-mug-hot', desc: 'Penghilang kantuk shift malam.' },
    { id: 'food_friedrice', name: 'Nasi Goreng Spesial', category: 'Makanan', price: 350, healVitality: 30, iconPng: 'assets/images/icons/friedrice.png', iconFa: 'fa-bowl-rice', desc: 'Porsi kenyang harga terjangkau.' },
    { id: 'food_satay', name: 'Sate Ayam Madura', category: 'Makanan', price: 400, healVitality: 35, iconPng: 'assets/images/icons/satay.png', iconFa: 'fa-drumstick-bite', desc: 'Kuliner malam pemulih stamina.' },
    { id: 'drink_milk', name: 'Susu Murni Steril', category: 'Minuman', price: 450, healVitality: 38, iconPng: 'assets/images/icons/milk.png', iconFa: 'fa-cow', desc: 'Menjaga kebugaran fisik.' },
    { id: 'food_bento', name: 'Nasi Bento Lengkap', category: 'Makanan', price: 500, healVitality: 40, iconPng: 'assets/images/icons/bento.png', iconFa: 'fa-box-tissue', desc: 'Makanan bergizi lengkap.' },
    { id: 'drink_energy', name: 'Energy Drink RedBoost', category: 'Minuman', price: 600, healVitality: 50, iconPng: 'assets/images/icons/energy.png', iconFa: 'fa-bolt', desc: 'Injeksi stamina mendadak.' },
    { id: 'food_steak', name: 'Steak Beef Tenderloin', category: 'Makanan', price: 1200, healVitality: 75, iconPng: 'assets/images/icons/steak.png', iconFa: 'fa-utensils', desc: 'Hidangan restoran mewah.' },
    { id: 'food_pizza', name: 'Pizza Supreme Large', category: 'Makanan', price: 1500, healVitality: 85, iconPng: 'assets/images/icons/pizza.png', iconFa: 'fa-pizza-slice', desc: 'Santapan santai berkumpul.' },

    // --- KESEHATAN & FARMASI ---
    { id: 'med_paracetamol', name: 'Paracetamol 500mg', category: 'Kesehatan', price: 300, healVitality: 25, iconPng: 'assets/images/icons/pill.png', iconFa: 'fa-pills', desc: 'Meredakan pusing & demam ringan.' },
    { id: 'med_bandage', name: 'Perban P3K Darurat', category: 'Kesehatan', price: 450, healVitality: 30, iconPng: 'assets/images/icons/bandage.png', iconFa: 'fa-bandage', desc: 'Pertolongan pertama luka memar.' },
    { id: 'med_vitamin', name: 'Suplemen Vitamin C', category: 'Kesehatan', price: 1200, healVitality: 65, iconPng: 'assets/images/icons/vit.png', iconFa: 'fa-capsules', desc: 'Pencegah pingsan/koma.' },
    { id: 'med_firstaid_kit', name: 'Kotak P3K Lengkap', category: 'Kesehatan', price: 2200, healVitality: 80, iconPng: 'assets/images/icons/medkit.png', iconFa: 'fa-kit-medical', desc: 'Peralatan darurat medis tas.' },
    { id: 'med_adrenalin', name: 'Injeksi Adrenalin IGD', category: 'Kesehatan', price: 3500, healVitality: 100, iconPng: 'assets/images/icons/syringe.png', iconFa: 'fa-syringe', desc: 'Pertolongan darurat medis penuh.' },

    // --- ELEKTRONIK & PERALATAN KERJA ---
    { id: 'tool_box', name: 'Kotak Perkakas Mekanik', category: 'Peralatan', price: 3500, healVitality: 0, iconPng: 'assets/images/icons/toolbox.png', iconFa: 'fa-toolbox', desc: 'Peralatan wajib teknisi & bengkel.' },
    { id: 'tool_electro', name: 'Toolkit Elektro Pro', category: 'Peralatan', price: 6500, healVitality: 0, iconPng: 'assets/images/icons/electro.png', iconFa: 'fa-plug', desc: 'Peralatan servis kelistrikan.' },
    { id: 'tool_scanner', name: 'OBD Scanner Mesin', category: 'Peralatan', price: 8000, healVitality: 0, iconPng: 'assets/images/icons/scanner.png', iconFa: 'fa-microchip', desc: 'Alat diagnosa kerusakan mesin.' },
    { id: 'tech_phone', name: 'Smartphone Ignatius Pro', category: 'Elektronik', price: 12000, healVitality: 0, iconPng: 'assets/images/icons/phone.png', iconFa: 'fa-mobile-screen', desc: 'Akses cepat jaringan aplikasi.' },
    { id: 'tech_drone', name: 'Drone Kamera 4K', category: 'Elektronik', price: 18000, healVitality: 0, iconPng: 'assets/images/icons/drone.png', iconFa: 'fa-camera', desc: 'Alat liputan pers & survei lokasi.' },
    { id: 'tech_laptop', name: 'Laptop Workstation Core', category: 'Elektronik', price: 25000, healVitality: 0, iconPng: 'assets/images/icons/laptop.png', iconFa: 'fa-laptop', desc: 'Perangkat programmer & akuntan.' },

    // --- KENDARAAN & VOUCHER ---
    { id: 'key_bicycle', name: 'Sepeda Gunung MTB', category: 'Kendaraan', price: 5000, healVitality: 0, iconPng: 'assets/images/icons/bike.png', iconFa: 'fa-bicycle', desc: 'Transportasi sehat & hemat.' },
    { id: 'pass_gym_vip', name: 'Voucher Gym Member 1 Bln', category: 'Voucher', price: 5000, healVitality: 0, iconPng: 'assets/images/icons/gym.png', iconFa: 'fa-dumbbell', desc: 'Buff kebugaran stamina.' },
    { id: 'pass_insurance_med', name: 'Voucher Asuransi Medis', category: 'Voucher', price: 10000, healVitality: 0, iconPng: 'assets/images/icons/voucher.png', iconFa: 'fa-shield-heart', desc: 'Klaim pengobatan RSUD.' },
    { id: 'key_motor_bebek', name: 'Motor Bebek 125cc', category: 'Kendaraan', price: 18000, healVitality: 0, iconPng: 'assets/images/icons/motor.png', iconFa: 'fa-motorcycle', desc: 'Armada ojek & kurir.' },
    { id: 'key_taxi_matic', name: 'Mobil Sedan Taksi', category: 'Kendaraan', price: 45000, healVitality: 0, iconPng: 'assets/images/icons/car.png', iconFa: 'fa-car-side', desc: 'Armada taksi online.' },
    { id: 'key_sedan_luxury', name: 'Mobil Sedan Executive', category: 'Kendaraan', price: 150000, healVitality: 0, iconPng: 'assets/images/icons/lux_car.png', iconFa: 'fa-car-rear', desc: 'Kendaraan mewah eksekutif.' }
];
