# 🏙️ Crestville - Web Life Simulator Game

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Crestville** adalah game simulasi kehidupan berbasis web (*Web-Based Life Simulator*) yang ringan, modular, dan responsif. Pemain bertualang di Kota Crestville, mengelola energi (**Vitality**), menghasilkan uang (**Crest**), mengurus administrasi kependudukan (**KTP Digital** & **Lisensi**), serta menjelajahi berbagai sektor ekonomi kota.

---

## 🌟 Fitur Utama

- **💼 Bursa Kerja 17 Tingkat (`jobs.js`)**: Dari pekerjaan pemula (*Pemulung, Kurir*) hingga eksekutif (*Software Engineer, Pilot, CEO*) dengan syarat lisensi dan biaya konsumsi Vitality yang proporsional.
- **🪪 Layanan Capil & Sertifikasi (`admin.js`)**: Sistem pendaftaran KTP Digital otomatis dengan pembuatan NIK unik dan bursa penerbitan 10 jenis lisensi/sertifikat keahlian.
- **🗺️ Peta Kota & Layanan 911 (`cityMap.js`)**: Navigasi ke lokasi-lokasi penting (RSUD, CBD, Capil, Bandara) serta pusat panggilan darurat 911 siaga 24/7 untuk pemulihan instan.
- **💾 Pengelolaan Data Simpanan (`storage.js`)**: Fitur *Auto-Save* setiap 30 detik ke LocalStorage, dukung simpan manual, *Reset Progress*, serta ekspor/impor berkas save `.json`.
- **⚡ Dynamic Vitality System**: Mekanisme stamina yang mengontrol batasan aktivitas harian pemain.

---

## 📁 Arsitektur Proyek

```text
crestville-game/
├── index.html                # Tampilan UI Utama & Kontainer Tab
├── README.md                 # Dokumentasi Proyek
└── src/
    ├── css/
    │   └── styles.css        # Style kustom & ekstensi Tailwind
    └── js/
        ├── main.js           # Pengelola State Global & Event Listeners
        └── modules/
            ├── admin.js      # Modul KTP Digital & Pembelian Lisensi
            ├── cityMap.js    # Modul Peta Navigasi & Layanan Darurat 911
            ├── jobs.js       # Modul Catalog 17 Pekerjaan & Vitality
            └── storage.js    # Modul LocalStorage, Auto-Save, & JSON Export
