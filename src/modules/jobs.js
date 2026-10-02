// ==========================================
// MODUL BURSA KERJA & DYNAMIC APPS (JOBS.JS)
// ==========================================

const JobsModule = {
    canApplyJob(jobId) {
        const job = window.JOBS_DATABASE.find(j => j.id === jobId);
        if (!job || !job.requiredLicense) return true;

        const userLicenses = window.gameState.user.legal.licenses || [];
        return userLicenses.includes(job.requiredLicense);
    },

    applyPermanentJob(jobId) {
        const job = window.JOBS_DATABASE.find(j => j.id === jobId);
        if (!job || job.category !== 'tetap') return;

        if (!this.canApplyJob(jobId)) {
            if (typeof showToast === 'function') {
                showToast(`Syarat Kurang! Wajib memiliki lisensi ${job.requiredLicense}`, 'warning');
            }
            return;
        }

        window.gameState.jobState.activeJobId = jobId;
        window.gameState.jobState.hiredAt = new Date().toLocaleDateString('id-ID');

        if (job.customAppId && !window.gameState.jobState.unlockedCustomApps.includes(job.customAppId)) {
            window.gameState.jobState.unlockedCustomApps.push(job.customAppId);
        }

        window.saveState();
        if (typeof showToast === 'function') {
            showToast(`Resmi diterima sebagai ${job.title}! Aplikasi profesi terbuka di Homescreen.`, 'success');
        }
    },

    resignJob() {
        if (!window.gameState.jobState.activeJobId) return;

        const currentJob = window.JOBS_DATABASE.find(j => j.id === window.gameState.jobState.activeJobId);
        if (currentJob && currentJob.customAppId) {
            window.gameState.jobState.unlockedCustomApps = window.gameState.jobState.unlockedCustomApps.filter(appId => appId !== currentJob.customAppId);
        }

        window.gameState.jobState.activeJobId = null;
        window.gameState.jobState.hiredAt = null;

        window.saveState();
        if (typeof showToast === 'function') showToast('Mengundurkan diri dari pekerjaan tetap.', 'info');
    },

    doWorkShift(jobId) {
        const job = window.JOBS_DATABASE.find(j => j.id === jobId);
        if (!job) return;

        if (window.gameState.vitality < job.vitalityCost) {
            if (typeof showToast === 'function') showToast(`Vitality kurang! Butuh ${job.vitalityCost}% Vitality.`, 'error');
            return;
        }

        if (job.category === 'tetap' && window.gameState.jobState.activeJobId !== jobId) {
            if (typeof showToast === 'function') showToast(`Kamu harus melamar ${job.title} terlebih dahulu!`, 'warning');
            return;
        }

        window.gameState.vitality -= job.vitalityCost;
        window.gameState.crest += job.pay;
        window.gameState.jobState.completedShifts += 1;

        window.saveState();
        if (typeof showToast === 'function') {
            showToast(`Selesai Bekerja ${job.title} (+${job.pay.toLocaleString()} C, -${job.vitalityCost}% Vit)`, 'success');
        }
    },

    // --- BURSA KERJA APP UI ---
    renderJobsAppUI() {
        const activeJobId = window.gameState.jobState.activeJobId;
        const activeJob = window.JOBS_DATABASE.find(j => j.id === activeJobId);

        let sideHtml = '';
        let fullHtml = '';

        window.JOBS_DATABASE.forEach(job => {
            const hasLicense = this.canApplyJob(job.id);

            const iconElement = `
                <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                    <img src="${job.iconPng}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="hidden items-center justify-center w-full h-full text-slate-300 text-lg">
                        <i class="fa-solid ${job.iconFa}"></i>
                    </div>
                </div>
            `;

            if (job.category === 'sampingan') {
                sideHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            ${iconElement}
                            <div>
                                <h5 class="text-xs font-bold text-white">${job.title}</h5>
                                <p class="text-[10px] text-slate-400">${job.desc}</p>
                            </div>
                        </div>
                        <button onclick="JobsModule.doWorkShift('${job.id}'); openApp('jobs');" class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shrink-0">
                            +${job.pay.toLocaleString()} C
                        </button>
                    </div>
                `;
            } else {
                const isCurrent = activeJobId === job.id;
                fullHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 border ${isCurrent ? 'border-sky-500/50' : 'border-white/10'}">
                        <div class="flex items-center gap-3">
                            ${iconElement}
                            <div>
                                <h5 class="text-xs font-bold text-white">${job.title}</h5>
                                <p class="text-[10px] text-slate-400">${job.desc}</p>
                            </div>
                        </div>

                        ${isCurrent ? `
                            <button onclick="JobsModule.doWorkShift('${job.id}'); openApp('jobs');" class="px-3 py-1.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-lg shrink-0">
                                Shift (+${job.pay.toLocaleString()} C)
                            </button>
                        ` : `
                            <button onclick="JobsModule.applyPermanentJob('${job.id}'); openApp('jobs');" class="px-3 py-1.5 ${hasLicense ? 'bg-slate-800 text-slate-200' : 'bg-slate-900 text-slate-600 cursor-not-allowed'} font-bold text-xs rounded-xl border border-white/10 shrink-0">
                                ${hasLicense ? 'Lamar' : '🔒 Lisensi Less'}
                            </button>
                        `}
                    </div>
                `;
            }
        });

        return `
            <div class="space-y-4">
                ${activeJob ? `
                    <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[9px] font-bold text-sky-400 uppercase tracking-wider">KONTRAK KERJA AKTIF</span>
                            <button onclick="JobsModule.resignJob(); openApp('jobs');" class="text-[10px] text-rose-400 font-bold hover:underline">Resign</button>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl">
                                <i class="fa-solid ${activeJob.iconFa}"></i>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-white">${activeJob.title}</h4>
                                <p class="text-[10px] text-slate-300">Divisi: ${activeJob.division} • Gaji: ${activeJob.pay.toLocaleString()} C</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">⚡ Pekerjaan Sampingan</h4>
                    <div class="space-y-2">${sideHtml}</div>
                </div>

                <div class="space-y-2 pt-2">
                    <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">💼 Pekerjaan Tetap & Profesi</h4>
                    <div class="space-y-2">${fullHtml}</div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // 1. APK HALODOC MEDIKA (DOKTER & PERAWAT)
    // ==========================================
    renderHalodocAppUI() {
        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-rose-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-rose-950/60">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-hospital text-rose-400 text-base"></i>
                            <h4 class="text-xs font-bold text-rose-300 uppercase tracking-wider">HALODOC MEDIKA Central</h4>
                        </div>
                        <span class="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[8px] font-bold rounded">ONLINE MEDIS</span>
                    </div>
                    <p class="text-[10px] text-slate-300">Portal konsultasi warga, resep obat medis, & sirene ambulans IGD.</p>
                </div>

                <!-- DOKTER ACTIONS -->
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">🩺 Tindakan Medis Dokter</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="JobsModule.prescribeMedicinePrompt()" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-rose-400/50">
                            <i class="fa-solid fa-pills text-rose-400 text-lg"></i>
                            <span class="text-xs font-bold text-white">Resepkan Obat</span>
                            <span class="text-[8px] text-slate-400">Kirim obat langsung ke NIK</span>
                        </button>
                        <button onclick="playAudioSfx('siren'); showToast('🚨 Sirene Ambulans IGD Diaktifkan!', 'error');" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-rose-400/50">
                            <i class="fa-solid fa-truck-medical text-rose-400 text-lg animate-pulse"></i>
                            <span class="text-xs font-bold text-white">Ambulans IGD</span>
                            <span class="text-[8px] text-slate-400">Tarik pasien koma</span>
                        </button>
                    </div>
                </div>

                <!-- PASIEN KONSULTASI DEMO -->
                <div class="space-y-2 pt-2">
                    <h4 class="text-xs font-bold text-rose-400 uppercase tracking-wider">💬 Antrean Konsultasi Warga</h4>
                    <div class="glass-card p-3 rounded-2xl space-y-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <h5 class="text-xs font-bold text-white">Pasien: Asep Surasep (TG-99120)</h5>
                                <p class="text-[10px] text-slate-400">Keluhan: Pusing berat, Vitality tinggal 15% habis shift malam.</p>
                            </div>
                            <span class="text-[8px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded">Menunggu</span>
                        </div>
                        <button onclick="JobsModule.treatPatient('TG-99120')" class="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md">
                            Beri Pengobatan (+2,500 C)
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    prescribeMedicinePrompt() {
        const targetNik = prompt("Masukkan NIK Pasangan / Pasien:");
        if (!targetNik) return;
        const medName = prompt("Nama Obat (Contoh: Paracetamol 500mg / Vitamin C):") || "Paracetamol 500mg";
        showToast(`Berhasil meresepkan ${medName} ke pasien NIK ${targetNik}!`, 'success');
    },

    treatPatient(nik) {
        if (window.gameState.vitality < 10) {
            showToast('Vitality kamu terlalu rendah buat merawat pasien!', 'error');
            return;
        }
        window.gameState.vitality -= 10;
        window.gameState.crest += 2500;
        window.saveState();
        showToast(`Pasien ${nik} berhasil disembuhkan (+2,500 C, -10% Vit)`, 'success');
        openApp('app_halodoc');
    },

    // ==========================================
    // 2. APK POLRES HUB (POLISI & DETEKTIF)
    // ==========================================
    renderPoliceHubAppUI() {
        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-indigo-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-indigo-950/60">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved text-indigo-400 text-base"></i>
                            <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider">POLRES HUB & PATROLEX</h4>
                        </div>
                        <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[8px] font-bold rounded">POLISI AKTIF</span>
                    </div>
                    <p class="text-[10px] text-slate-300">Sistem E-Tilang lalu lintas, penetapan DPO Buronan, dan patroli kota.</p>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="JobsModule.issueETilangPrompt()" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-indigo-400/50">
                        <i class="fa-solid fa-file-invoice-dollar text-indigo-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Penerbitan E-Tilang</span>
                        <span class="text-[8px] text-slate-400">Tilang pelanggar lalu lintas</span>
                    </button>
                    <button onclick="JobsModule.setDPOPrompt()" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-rose-400/50">
                        <i class="fa-solid fa-user-ninja text-rose-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Tetapkan DPO</span>
                        <span class="text-[8px] text-slate-400">Input buronan kota</span>
                    </button>
                </div>

                <div class="space-y-2 pt-2">
                    <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">🚔 Misi Patroli Lantas Terjadwal</h4>
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <h5 class="text-xs font-bold text-white">Patroli Jalan Protokol</h5>
                            <p class="text-[10px] text-slate-400">Pemeriksaan SIM & STNK pengendara ruko.</p>
                        </div>
                        <button onclick="JobsModule.doPolicePatrol()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md">
                            Patroli (+3,000 C)
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    issueETilangPrompt() {
        const targetNik = prompt("Masukkan NIK / ID Telegram Pengendara:");
        if (!targetNik) return;
        const fine = prompt("Nominal Denda Tilang (Crest):") || "1500";
        showToast(`E-Tilang terbit! NIK ${targetNik} dikenakan denda ${parseInt(fine).toLocaleString()} C`, 'success');
    },

    setDPOPrompt() {
        const targetNik = prompt("Masukkan NIK / ID Warga Buronan DPO:");
        if (!targetNik) return;
        const reason = prompt("Alasan DPO:") || "Tindak Pidana Penipuan P2P";
        showToast(`Warga NIK ${targetNik} resmi menjadi DPO Polres! Alasan: ${reason}`, 'error');
    },

    doPolicePatrol() {
        if (window.gameState.vitality < 15) {
            showToast('Vitality kurang buat patroli!', 'error');
            return;
        }
        window.gameState.vitality -= 15;
        window.gameState.crest += 3000;
        window.saveState();
        showToast('Selesai patroli jalur protokol! (+3,000 C, -15% Vit)', 'success');
        openApp('app_police_hub');
    },

    // ==========================================
    // 3. APK E-COURT LEGAL (PENGACARA, JAKSA, HAKIM)
    // ==========================================
    renderLegalCourtAppUI() {
        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-purple-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-purple-950/60">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-scale-balanced text-purple-400 text-base"></i>
                            <h4 class="text-xs font-bold text-purple-300 uppercase tracking-wider">E-COURT PENGADILAN KOTA</h4>
                        </div>
                        <span class="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[8px] font-bold rounded">LEGAL VERIFIED</span>
                    </div>
                    <p class="text-[10px] text-slate-300">Portal pendampingan hukum, pembuatan akta notaris, & sidang perkara.</p>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="JobsModule.fileLawsuitPrompt()" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-purple-400/50">
                        <i class="fa-solid fa-gavel text-purple-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Ajukan Perkara</span>
                        <span class="text-[8px] text-slate-400">Daftarkan sidang sengketa</span>
                    </button>
                    <button onclick="JobsModule.issueNotaryActPrompt()" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-sky-400/50">
                        <i class="fa-solid fa-file-contract text-sky-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Akta Notaris</span>
                        <span class="text-[8px] text-slate-400">Sertifikasi tanah/bisnis</span>
                    </button>
                </div>
            </div>
        `;
    },

    fileLawsuitPrompt() {
        const clientNik = prompt("Masukkan NIK Klien Penggugat:");
        if (!clientNik) return;
        showToast(`Berkas sidang atas Klien ${clientNik} berhasil mendaftar E-Court!`, 'success');
    },

    issueNotaryActPrompt() {
        const title = prompt("Nama Dokumen / PT Bisnis:") || "PT Ignatius Jaya";
        showToast(`Akta Notaris ${title} berhasil diverifikasi & diterbitkan!`, 'success');
    },

    // ==========================================
    // 4. APK CORP MANAGER (CEO, AKUNTAN, ARCHITECT)
    // ==========================================
    renderCorpManagerAppUI() {
        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-amber-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-amber-950/60">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-building text-amber-400 text-base"></i>
                            <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider">IGNATIUS CORP MANAGER</h4>
                        </div>
                        <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[8px] font-bold rounded">EXECUTIVE</span>
                    </div>
                    <p class="text-[10px] text-slate-300">Penggajian payroll karyawan PT, audit pajak, & proyek tata ruang.</p>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="JobsModule.runPayrollPrompt()" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-amber-400/50">
                        <i class="fa-solid fa-money-check-dollar text-amber-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Payroll Karyawan</span>
                        <span class="text-[8px] text-slate-400">Cairkan gaji staf PT</span>
                    </button>
                    <button onclick="JobsModule.startCityProjectPrompt()" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1 hover:border-emerald-400/50">
                        <i class="fa-solid fa-helmet-safety text-emerald-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Proyek Konstruksi</span>
                        <span class="text-[8px] text-slate-400">Pembangunan Ruko Kota</span>
                    </button>
                </div>
            </div>
        `;
    },

    runPayrollPrompt() {
        showToast('Payroll Karyawan PT Ignatius cangkupan shift ini berhasil dicairkan!', 'success');
    },

    startCityProjectPrompt() {
        showToast('Proyek Pembangunan Ruko Central resmi disetujui!', 'success');
    },

    // ==========================================
    // 5. APK DRIVER EXPRESS (OJEK & KURIR)
    // ==========================================
    renderDriverExpressAppUI() {
        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-emerald-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-emerald-950/60">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-motorcycle text-emerald-400 text-base"></i>
                            <h4 class="text-xs font-bold text-emerald-300 uppercase tracking-wider">DRIVER EXPRESS TERMINAL</h4>
                        </div>
                        <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[8px] font-bold rounded">SIAP ANTARE</span>
                    </div>
                    <p class="text-[10px] text-slate-300">Terminal penerimaan orderan ojek online & antar paket logistik.</p>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">📦 Orderan Masuk Aktif</h4>
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <h5 class="text-xs font-bold text-white">Antar Paket Makanan Ruko</h5>
                            <p class="text-[10px] text-slate-400">Rute: Pasar Central ➔ Kos Melati</p>
                        </div>
                        <button onclick="JobsModule.completeExpressOrder(1200, 15)" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md">
                            Ambil (+1,200 C)
                        </button>
                    </div>
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between">
                        <div>
                            <h5 class="text-xs font-bold text-white">Antar Penumpang Ke RSUD</h5>
                            <p class="text-[10px] text-slate-400">Rute: Alun-Alun ➔ RSUD Medika</p>
                        </div>
                        <button onclick="JobsModule.completeExpressOrder(1800, 18)" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md">
                            Ambil (+1,800 C)
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    completeExpressOrder(pay, vitCost) {
        if (window.gameState.vitality < vitCost) {
            showToast('Vitality kamu tidak cukup buat narik orderan!', 'error');
            return;
        }
        window.gameState.vitality -= vitCost;
        window.gameState.crest += pay;
        window.saveState();
        showToast(`Orderan Driver Express Selesai! (+${pay.toLocaleString()} C, -${vitCost}% Vit)`, 'success');
        openApp('app_driver_express');
    },

    // ==========================================
    // 6. APK PRESS NEWS (WARTAWAN)
    // ==========================================
    renderPressNewsAppUI() {
        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-sky-950/60">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-newspaper text-sky-400 text-base"></i>
                            <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider">WARTA IGNATIUS PERS</h4>
                        </div>
                        <span class="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[8px] font-bold rounded">RED AKSI</span>
                    </div>
                    <p class="text-[10px] text-slate-300">Aplikasi penulisan berita & publikasi koran harian kota.</p>
                </div>

                <div class="glass-card p-3 rounded-2xl space-y-2">
                    <h5 class="text-xs font-bold text-white">Tulis Berita Harian Kota</h5>
                    <input type="text" id="news-title-input" placeholder="Judul Berita..." class="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white">
                    <button onclick="JobsModule.publishNewsArticle()" class="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg">
                        Terbitkan Berita Kota (+2,000 C)
                    </button>
                </div>
            </div>
        `;
    },

    publishNewsArticle() {
        const titleInput = document.getElementById('news-title-input');
        const title = titleInput ? titleInput.value : 'Berita Utama Kota';

        if (!title) {
            showToast('Judul berita tidak boleh kosong!', 'error');
            return;
        }

        if (window.gameState.vitality < 12) {
            showToast('Vitality tidak cukup buat liputan berita!', 'error');
            return;
        }

        window.gameState.vitality -= 12;
        window.gameState.crest += 2000;
        window.saveState();
        showToast(`Berita "${title}" resmi terbit di Koran Ignatius! (+2,000 C)`, 'success');
        openApp('app_press_news');
    }
};

window.JobsModule = JobsModule;
