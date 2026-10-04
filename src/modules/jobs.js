// ==========================================
// MODUL BURSA KERJA & PROFESI KOTA (JOBS.JS)
// BARIS KODE LENGKAP METODE ROLEPLAY V2.5
// ==========================================

const JobsModule = {
    // --- 1. INISIALISASI DATABASE PEKERJAAN & KARIR ---
    getJobsList() {
        if (window.JOBS_DATABASE && Array.isArray(window.JOBS_DATABASE) && window.JOBS_DATABASE.length > 10) {
            return window.JOBS_DATABASE;
        }

        // DATABASE LENGKAP KOTA (30+ OPSI PEKERJAAN)
        return [
            // A. PEKERJAAN SAMPINGAN & FREELANCE (TANPA SYARAT)
            { id: 'side_cleaning', title: 'Petugas Kebersihan Taman', desc: 'Bersihkan sampah & jaga keasrian fasilitas umum kota.', pay: 800, category: 'sampingan', vitalityCost: 5, xpGain: 10 },
            { id: 'side_parker', title: 'Juru Parkir Pusat Kota', desc: 'Atur kendaraan warga di area pasar & pertokoan.', pay: 950, category: 'sampingan', vitalityCost: 5, xpGain: 12 },
            { id: 'side_washer', title: 'Pencuci Kendaraan', desc: 'Bersihkan mobil & motor warga hingga kinclong.', pay: 1100, category: 'sampingan', vitalityCost: 7, xpGain: 15 },
            { id: 'side_courier', title: 'Kurir Paket Ekspres', desc: 'Antar paket kilat ke rumah-rumah warga.', pay: 1300, category: 'sampingan', vitalityCost: 9, xpGain: 18 },
            { id: 'side_ojek', title: 'Driver Ojek Online', desc: 'Antar penumpang sesuai rute navigasi peta.', pay: 1400, category: 'sampingan', vitalityCost: 9, xpGain: 20 },
            { id: 'side_barista', title: 'Barista Kafe Kota', desc: 'Racik kopi & sajikan pesanan pelanggan kafe.', pay: 1500, category: 'sampingan', vitalityCost: 8, xpGain: 22 },
            { id: 'side_mechanic', title: 'Montir Bengkel Umum', desc: 'Servis ganti oli & perbaiki mesin kendaraan.', pay: 1800, category: 'sampingan', vitalityCost: 12, xpGain: 25 },
            { id: 'side_photo', title: 'Fotografer Event', desc: 'Dokumentasikan acara pernikahan & kegiatan warga.', pay: 2000, category: 'sampingan', vitalityCost: 10, xpGain: 28 },
            { id: 'side_porter', title: 'Kuli Angkut Pelabuhan', desc: 'Angkut muatan kontainer berat di dermaga.', pay: 2400, category: 'sampingan', vitalityCost: 18, xpGain: 35 },
            { id: 'side_streamer', title: 'Live Streamer Gaming', desc: 'Streaming hiburan & kumpulkan donasi viewers.', pay: 2600, category: 'sampingan', vitalityCost: 12, xpGain: 30 },

            // B. PEKERJAAN BERGELAR & KANTORAN UMUM
            { id: 'prof_admin', title: 'Staf Administrasi Pemkot', desc: 'Kelola arsip surat & pelayanan balai kota.', pay: 3800, category: 'tetap', vitalityCost: 9, xpGain: 40 },
            { id: 'prof_banker', title: 'Teller Bank Central', desc: 'Melayani transaksi simpan-pinjam & deposito nasabah.', pay: 4000, category: 'tetap', vitalityCost: 10, xpGain: 42 },
            { id: 'prof_teacher', title: 'Guru & Tenaga Pendidik', desc: 'Mengajar siswa & susun kurikulum sekolah kota.', pay: 4200, category: 'tetap', vitalityCost: 10, xpGain: 45 },
            { id: 'prof_reporter', title: 'Jurnalis & Reporter Media', desc: 'Liput berita kriminal, ekonomi & koran kota.', pay: 4400, category: 'tetap', vitalityCost: 10, xpGain: 48 },
            { id: 'prof_hrd', title: 'HRD Recruiter Perusahaan', desc: 'Seleksi calon pekerja & evaluasi pegawai.', pay: 4600, category: 'tetap', vitalityCost: 9, xpGain: 50 },
            { id: 'prof_accountant', title: 'Akuntan Keuangan', desc: 'Audit laporan pajak & pembukuan kas kota.', pay: 4800, category: 'tetap', vitalityCost: 10, xpGain: 52 },
            { id: 'prof_lawyer', title: 'Pengacara & Konsultan Hukum', desc: 'Pendampingan persidangan & hukum warga.', pay: 5500, category: 'tetap', vitalityCost: 11, xpGain: 60, requiredLicense: 'Sertifikat Hukum' },
            { id: 'prof_architect', title: 'Arsitek Perencana Bangunan', desc: 'Rancang maket gedung & fasilitas kota.', pay: 5800, category: 'tetap', vitalityCost: 12, xpGain: 65 },
            { id: 'prof_it_eng', title: 'Software Engineer IT', desc: 'Maintenance server & kembangkan aplikasi OS.', pay: 6000, category: 'tetap', vitalityCost: 12, xpGain: 70 },

            // C. PROFESI INSTITUSI & PEMERINTAHAN
            { id: 'prof_satpol', title: 'Petugas Satpol PP', desc: 'Tertibkan pedagang liar & jaga ketertiban publik.', pay: 4100, category: 'tetap', vitalityCost: 12, xpGain: 42 },
            { id: 'prof_capil_officer', title: 'Petugas Dukcapil Kota', desc: 'Verifikasi NIK, cetak KTP 3D & Akta Nikah.', pay: 4300, category: 'tetap', vitalityCost: 9, xpGain: 45 },
            { id: 'prof_tax_officer', title: 'Petugas Pajak Daerah', desc: 'Tagih retribusi usaha & audit keuangan toko.', pay: 4700, category: 'tetap', vitalityCost: 10, xpGain: 50 },

            // D. PROFESI SPESIALIS DENGAN INTEGRASI APK (HALODOC & POLRES HUB)
            { id: 'prof_nurse', title: 'Perawat Medis IGD', desc: 'Bantu tindakan darurat & pasang infus pasien.', pay: 4200, category: 'tetap', vitalityCost: 12, xpGain: 45, requiredLicense: 'Izin Praktek Medis' },
            { id: 'prof_police_patrol', title: 'Polisi Patroli Lantas', desc: 'Patrolex jalanan, penanganan lapor 911 & e-tilang.', pay: 4800, category: 'tetap', vitalityCost: 14, xpGain: 55, requiredLicense: 'SIM A (Mobil)' },
            { id: 'prof_police_detective', title: 'Detektif Reskrim Polres', desc: 'Olah TKP kejahatan & usut buronan DPO kota.', pay: 5400, category: 'tetap', vitalityCost: 15, xpGain: 65, requiredLicense: 'SIM A (Mobil)' },
            { id: 'prof_doc_gen', title: 'Dokter Umum RSUD', desc: 'Pemeriksaan medis, panggil ambulans & tangani IGD.', pay: 5600, category: 'tetap', vitalityCost: 15, xpGain: 70, requiredLicense: 'Izin Praktek Medis' },
            { id: 'prof_doc_surg', title: 'Dokter Spesialis Bedah', desc: 'Operasi darurat pasien pingsan & koma medis.', pay: 7000, category: 'tetap', vitalityCost: 18, xpGain: 85, requiredLicense: 'Izin Praktek Medis' }
        ];
    },

    // --- 2. ENSURE DATA KARIR PLAYER ---
    ensureCareerState() {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.jobState) {
            window.gameState.jobState = {
                activeJobId: null,
                hiredAt: null,
                totalShifts: 0,
                jobXp: 0,
                careerLevel: 1,
                workLogs: []
            };
        }
        if (typeof window.gameState.jobState.totalShifts !== 'number') window.gameState.jobState.totalShifts = 0;
        if (typeof window.gameState.jobState.jobXp !== 'number') window.gameState.jobState.jobXp = 0;
        if (typeof window.gameState.jobState.careerLevel !== 'number') window.gameState.jobState.careerLevel = 1;
        if (!Array.isArray(window.gameState.jobState.workLogs)) window.gameState.jobState.workLogs = [];
    },

    // --- 3. CHECK PERMISSION DOKTER / POLISI ---
    isDoctorOrNurse() {
        const activeJob = window.gameState?.jobState?.activeJobId;
        return ['prof_doc_gen', 'prof_doc_surg', 'prof_nurse'].includes(activeJob);
    },

    isPolice() {
        const activeJob = window.gameState?.jobState?.activeJobId;
        return ['prof_police_patrol', 'prof_police_detective'].includes(activeJob);
    },

    canApplyJob(jobId) {
        const jobs = this.getJobsList();
        const job = jobs.find(j => j.id === jobId);
        if (!job || !job.requiredLicense) return true;
        const userLicenses = window.gameState?.user?.legal?.licenses || [];
        return userLicenses.includes(job.requiredLicense);
    },

    // --- 4. LOGIKA MELAMAR PEKERJAAN ---
    applyPermanentJob(jobId) {
        this.ensureCareerState();
        const jobs = this.getJobsList();
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
            if (typeof showToast === 'function') showToast('Pekerjaan tidak ditemukan!', 'error');
            return;
        }

        if (!this.canApplyJob(jobId)) {
            if (typeof showToast === 'function') showToast(`Syarat Kurang! Wajib lisensi "${job.requiredLicense}"`, 'warning');
            return;
        }

        window.gameState.jobState.activeJobId = jobId;
        window.gameState.jobState.hiredAt = new Date().toLocaleDateString('id-ID');

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('unlock');
        if (typeof showToast === 'function') showToast(`Selamat! Resmi diterima sebagai ${job.title}`, 'success');
        
        if (typeof openApp === 'function') openApp('jobs');
    },

    // Resign Pekerjaan
    resignCurrentJob() {
        this.ensureCareerState();
        if (!window.gameState.jobState.activeJobId) return;

        const confirmResign = confirm("Apakah kamu yakin ingin mengundurkan diri dari pekerjaan saat ini?");
        if (!confirmResign) return;

        window.gameState.jobState.activeJobId = null;
        window.gameState.jobState.hiredAt = null;

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast('Berhasil mengundurkan diri.', 'info');
        if (typeof openApp === 'function') openApp('jobs');
    },

    // --- 5. EKSEKUSI SHIFT KERJA & OVERTIME ---
    doWorkShift(jobId, isOvertime = false) {
        this.ensureCareerState();
        const jobs = this.getJobsList();
        const job = jobs.find(j => j.id === jobId) || { title: 'Pekerjaan', pay: 1000, vitalityCost: 10, xpGain: 15 };

        let vitCost = isOvertime ? Math.floor(job.vitalityCost * 1.5) : job.vitalityCost;
        let basePay = isOvertime ? Math.floor(job.pay * 1.6) : job.pay;

        if ((window.gameState?.vitality || 0) < vitCost) {
            if (typeof showToast === 'function') showToast(`Vitality kamu kurang! Butuh ${vitCost}% Vit.`, 'error');
            return;
        }

        // Potong Pajak Penghasilan Kota (5%)
        const taxDeduction = Math.floor(basePay * 0.05);
        const netPay = basePay - taxDeduction;

        // Potong Vitality & Tambah Saldo
        window.gameState.vitality -= vitCost;
        window.gameState.crest = (window.gameState.crest || 0) + netPay;

        // Update Career Progress & XP Leveling
        const career = window.gameState.jobState;
        career.totalShifts += 1;
        career.jobXp += job.xpGain || 15;

        // Level Up Logic (Setiap 200 XP)
        const oldLevel = career.careerLevel;
        career.careerLevel = Math.floor(career.jobXp / 200) + 1;

        if (career.careerLevel > oldLevel) {
            if (typeof showToast === 'function') showToast(`🎉 LEVEL KARIR NAIK! Sekarang Level ${career.careerLevel}`, 'success');
        }

        // Simpan Log Kerja
        const logTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        career.workLogs.unshift({
            title: job.title,
            pay: netPay,
            tax: taxDeduction,
            time: logTime,
            isOvertime: isOvertime
        });

        // Batasi Max 10 Log
        if (career.workLogs.length > 10) career.workLogs.pop();

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        
        const modeText = isOvertime ? 'Lembur ' : 'Shift ';
        if (typeof showToast === 'function') {
            showToast(`Selesai ${modeText}${job.title} (+${netPay.toLocaleString()} C, Pajak -${taxDeduction} C)`, 'success');
        }

        if (typeof openApp === 'function') openApp('jobs');
    },

    // --- 6. RENDER MAIN BURSA KERJA APP UI ---
    renderJobsAppUI() {
        this.ensureCareerState();
        const jobs = this.getJobsList();
        const activeJobId = window.gameState.jobState.activeJobId;
        const currentJob = jobs.find(j => j.id === activeJobId);
        const career = window.gameState.jobState;

        // 1. BAR AKTIFITAS KARIR USER
        let activeJobHeaderHtml = '';
        if (currentJob) {
            activeJobHeaderHtml = `
                <div class="glass-ios p-4 rounded-3xl border border-sky-500/50 bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 space-y-3">
                    <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <div>
                            <span class="text-[8px] text-sky-400 uppercase font-mono font-bold block">Pekerjaan Aktif Kamu</span>
                            <h3 class="text-sm font-bold text-white">${currentJob.title}</h3>
                        </div>
                        <button onclick="JobsModule.resignCurrentJob()" class="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[9px] font-bold rounded-lg border border-rose-500/30 transition-all">
                            Resign
                        </button>
                    </div>

                    <div class="grid grid-cols-3 gap-2 text-center text-[9px]">
                        <div class="glass-card p-2 rounded-xl">
                            <span class="text-slate-400 block">Level Karir</span>
                            <span class="font-bold text-amber-300 font-mono text-xs">Lvl ${career.careerLevel}</span>
                        </div>
                        <div class="glass-card p-2 rounded-xl">
                            <span class="text-slate-400 block">Total Shift</span>
                            <span class="font-bold text-sky-300 font-mono text-xs">${career.totalShifts}x</span>
                        </div>
                        <div class="glass-card p-2 rounded-xl">
                            <span class="text-slate-400 block">XP Kerja</span>
                            <span class="font-bold text-emerald-300 font-mono text-xs">${career.jobXp} XP</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="JobsModule.doWorkShift('${currentJob.id}', false)" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all">
                            <i class="fa-solid fa-clock"></i> Shift Normal (+${Math.floor(currentJob.pay * 0.95).toLocaleString()} C)
                        </button>
                        <button onclick="JobsModule.doWorkShift('${currentJob.id}', true)" class="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all">
                            <i class="fa-solid fa-bolt text-amber-300"></i> Lembur (+${Math.floor(currentJob.pay * 1.52).toLocaleString()} C)
                        </button>
                    </div>
                </div>
            `;
        } else {
            activeJobHeaderHtml = `
                <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-2 bg-gradient-to-br from-slate-900 to-slate-950">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-briefcase text-sky-400 text-base"></i>
                        <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider">BURSA KERJA KOTA IGNATIUS</h4>
                    </div>
                    <p class="text-[10px] text-slate-300">Kamu belum memiliki pekerjaan tetap. Pilih salah satu daftar profesi di bawah untuk mulai berkarir.</p>
                </div>
            `;
        }

        // 2. TAMPILAN DAFTAR PEKERJAAN (SAMPINGAN & TETAP)
        let sideHtml = '';
        let fullHtml = '';

        jobs.forEach(job => {
            const hasLicense = this.canApplyJob(job.id);
            const isCurrent = activeJobId === job.id;

            if (job.category === 'sampingan') {
                sideHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 border border-white/5 hover:border-emerald-500/40 transition-all">
                        <div>
                            <h5 class="text-xs font-bold text-white">${job.title}</h5>
                            <p class="text-[10px] text-slate-400 leading-tight">${job.desc}</p>
                            <span class="text-[8px] text-emerald-400 font-mono block pt-0.5">Beban: -${job.vitalityCost}% Vit | +${job.xpGain} XP</span>
                        </div>
                        <button onclick="JobsModule.doWorkShift('${job.id}', false)" class="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shrink-0 transition-all">
                            +${Math.floor(job.pay * 0.95).toLocaleString()} C
                        </button>
                    </div>
                `;
            } else {
                fullHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 border ${isCurrent ? 'border-sky-500/60 bg-sky-950/30' : 'border-white/10'} hover:border-sky-400/40 transition-all">
                        <div>
                            <div class="flex items-center gap-1.5">
                                <h5 class="text-xs font-bold text-white">${job.title}</h5>
                                ${isCurrent ? '<span class="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 text-[7px] font-bold rounded">AKTIF</span>' : ''}
                            </div>
                            <p class="text-[10px] text-slate-400 leading-tight">${job.desc}</p>
                            ${job.requiredLicense ? `<span class="text-[8px] text-amber-300 font-mono block pt-0.5"><i class="fa-solid fa-certificate mr-1"></i>Syarat: ${job.requiredLicense}</span>` : ''}
                        </div>
                        ${isCurrent ? `
                            <button onclick="JobsModule.doWorkShift('${job.id}', false)" class="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shrink-0 transition-all">
                                Shift Kerja
                            </button>
                        ` : `
                            <button onclick="JobsModule.applyPermanentJob('${job.id}')" class="px-3 py-2 ${hasLicense ? 'bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white' : 'bg-slate-900 text-slate-600'} font-bold text-xs rounded-xl shrink-0 transition-all">
                                ${hasLicense ? 'Lamar' : '🔒 Terkunci'}
                            </button>
                        `}
                    </div>
                `;
            }
        });

        // 3. LOG SHIFT KERJA TERAKHIR
        let logsHtml = '';
        if (career.workLogs.length === 0) {
            logsHtml = `<p class="text-[10px] text-slate-500 text-center py-2">Belum ada riwayat shift kerja.</p>`;
        } else {
            career.workLogs.forEach(log => {
                logsHtml += `
                    <div class="flex items-center justify-between text-[10px] py-1 border-b border-white/5">
                        <div>
                            <span class="text-white font-semibold">${log.title} ${log.isOvertime ? '<b class="text-amber-400">(Lembur)</b>' : ''}</span>
                            <span class="text-slate-500 text-[8px] block font-mono">${log.time}</span>
                        </div>
                        <div class="text-right font-mono">
                            <span class="text-emerald-400 font-bold">+${log.pay.toLocaleString()} C</span>
                            <span class="text-rose-400/80 text-[8px] block">Pajak: -${log.tax} C</span>
                        </div>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                ${activeJobHeaderHtml}

                <!-- TAB PEKERJAAN SAMPINGAN -->
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-bolt"></i> Pekerjaan Sampingan & Gig (Bebas Syarat)
                    </h4>
                    <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                        ${sideHtml}
                    </div>
                </div>

                <!-- TAB PROFESI BERGELAR & KANTORAN -->
                <div class="space-y-2 pt-2 border-t border-white/10">
                    <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-user-tie"></i> Pekerjaan Tetap & Profesi Bergelar
                    </h4>
                    <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                        ${fullHtml}
                    </div>
                </div>

                <!-- RIWAYAT SLIP GAJI & LOG KERJA -->
                <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-2">
                    <h4 class="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span><i class="fa-solid fa-receipt mr-1 text-amber-400"></i> Riwayat Slip Gaji Terakhir</span>
                        <span class="text-[8px] text-slate-500 font-mono">Pajak Kota: 5%</span>
                    </h4>
                    <div class="space-y-1 max-h-32 overflow-y-auto pr-1">
                        ${logsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    // --- 7. MODUL HALODOC MEDIKA (ROLE-BASED DOKTER vs WARGA) ---
    renderHalodocAppUI() {
        const isDoctor = this.isDoctorOrNurse();
        const calls = window.gameState?.health?.emergencyCalls || [];

        if (isDoctor) {
            let callsHtml = '';
            if (calls.length === 0) {
                callsHtml = `<p class="text-[10px] text-slate-500 py-4 text-center">Tidak ada panggilan darurat medis saat ini. IGD RSUD Aman.</p>`;
            } else {
                calls.forEach((c, idx) => {
                    callsHtml += `
                        <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-2 border border-rose-500/40 bg-gradient-to-r from-rose-950/30 to-slate-900">
                            <div>
                                <div class="flex items-center gap-1.5">
                                    <h5 class="text-xs font-bold text-white">${c.name}</h5>
                                    <span class="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 font-mono text-[8px] rounded">${c.nik}</span>
                                </div>
                                <p class="text-[10px] text-rose-300 font-semibold pt-0.5"><i class="fa-solid fa-kit-medical mr-1"></i>${c.reason}</p>
                            </div>
                            <button onclick="JobsModule.treatMedicalCall(${idx})" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shrink-0 transition-all">
                                Tangani (+3,000 C)
                            </button>
                        </div>
                    `;
                });
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-rose-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-rose-950/50 to-slate-900">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-bold text-rose-300 uppercase tracking-wider"><i class="fa-solid fa-user-doctor mr-1.5"></i> DASHBOARD MEDIS DOKTER</h4>
                            <span class="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[8px] font-bold rounded border border-rose-500/30 animate-pulse">TIM MEDIS ON-CALL</span>
                        </div>
                        <p class="text-[10px] text-slate-300">Kamu bertugas sebagai Dokter RSUD. Pantau panggilan darurat ambulans & tangani kondisi medis warga.</p>
                    </div>

                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                            <span>🚨 Antrean IGD & Ambulans Pasien (${calls.length})</span>
                        </h4>
                        <div class="space-y-2 max-h-80 overflow-y-auto pr-1">${callsHtml}</div>
                    </div>
                </div>
            `;
        }

        // Tampilan Warga Biasa
        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-rose-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-hospital text-rose-400 text-base"></i>
                        <h4 class="text-xs font-bold text-rose-300 uppercase tracking-wider">HALODOC MEDIKA CENTRAL</h4>
                    </div>
                    <p class="text-[10px] text-slate-300">Layanan panggilan darurat IGD, konsultasi dokter pemeriksa, & pemulihan kesehatan warga.</p>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="JobsModule.requestMedicalCall('Pertolongan Pingsan / Koma Drop Vitality')" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-rose-400/50 transition-all">
                        <i class="fa-solid fa-truck-medical text-rose-400 text-xl animate-pulse"></i>
                        <span class="text-xs font-bold text-white">Panggil Ambulans</span>
                        <span class="text-[8px] text-slate-400">Kirim panggil IGD Code Blue ke Tim Dokter</span>
                    </button>
                    <button onclick="JobsModule.requestMedicalCall('Konsultasi Dokter & Resep Obat')" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-sky-400/50 transition-all">
                        <i class="fa-solid fa-user-doctor text-sky-400 text-xl"></i>
                        <span class="text-xs font-bold text-white">Konsultasi Dokter</span>
                        <span class="text-[8px] text-slate-400">Panggil dokter untuk resep medis</span>
                    </button>
                </div>

                <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-1.5">
                    <h5 class="text-[10px] font-bold text-slate-300 uppercase">💡 Tips Kesehatan Warga</h5>
                    <p class="text-[9px] text-slate-400 leading-relaxed">Jika Vitality kamu mendekati 0%, kamu akan pingsan. Beli makanan di minimarket atau panggil dokter untuk pertolongan medis.</p>
                </div>
            </div>
        `;
    },

    requestMedicalCall(reason) {
        if (!window.gameState.health) window.gameState.health = { emergencyCalls: [] };
        if (!window.gameState.health.emergencyCalls) window.gameState.health.emergencyCalls = [];

        const user = window.gameState?.user?.identity || {};
        window.gameState.health.emergencyCalls.push({
            nik: user.nik || 'TG-000',
            name: user.fullName || 'Warga Sakit',
            reason: reason
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast('Panggilan Medis terkirim! Tim Dokter akan segera tiba.', 'success');
        if (typeof openApp === 'function') openApp('app_halodoc');
    },

    treatMedicalCall(idx) {
        if ((window.gameState?.vitality || 0) < 10) {
            if (typeof showToast === 'function') showToast('Vitality kamu tidak cukup!', 'error');
            return;
        }

        window.gameState.vitality -= 10;
        window.gameState.crest = (window.gameState.crest || 0) + 3000;
        window.gameState.health.emergencyCalls.splice(idx, 1);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast('Pasien berhasil ditangani! (+3,000 Crest)', 'success');
        if (typeof openApp === 'function') openApp('app_halodoc');
    },

    // --- 8. MODUL POLRES HUB & PATROLEX (ROLE-BASED POLISI vs WARGA) ---
    renderPoliceHubAppUI() {
        const isPol = this.isPolice();

        if (isPol) {
            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-indigo-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider"><i class="fa-solid fa-shield-halved mr-1.5"></i> DASHBOARD POLRES PATROLEX</h4>
                            <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[8px] font-bold rounded border border-indigo-500/30">PETUGAS POLISI</span>
                        </div>
                        <p class="text-[10px] text-slate-300">Penerbitan E-Tilang Lantas, Penginputan DPO Buronan Kota, & Pengamanan Publik.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="const nik=prompt('Masukkan NIK Pelanggar Lantas:'); if(nik) showToast('E-Tilang Resmi Terbit untuk NIK '+nik, 'success');" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-indigo-400/50 transition-all">
                            <i class="fa-solid fa-file-invoice-dollar text-indigo-400 text-xl"></i>
                            <span class="text-xs font-bold text-white">Terbitkan E-Tilang</span>
                            <span class="text-[8px] text-slate-400">Input denda tilang NIK warga</span>
                        </button>
                        <button onclick="const nik=prompt('Masukkan NIK Buronan DPO:'); if(nik) showToast('Status DPO Terbit untuk NIK '+nik, 'error');" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-rose-400/50 transition-all">
                            <i class="fa-solid fa-user-ninja text-rose-400 text-xl"></i>
                            <span class="text-xs font-bold text-white">Input DPO Buronan</span>
                            <span class="text-[8px] text-slate-400">Terbitkan DPO buronan kota</span>
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-indigo-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-shield-halved text-indigo-400 text-base"></i>
                        <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider">POLRES HUB WARGA</h4>
                    </div>
                    <p class="text-[10px] text-slate-300">Layanan pengaduan darurat 911 kejahatan, pengecekan e-tilang aktif, & pendaftaran SIM.</p>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="showToast('Laporan Kejahatan 911 terkirim ke Polres!', 'success')" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-indigo-400/50 transition-all">
                        <i class="fa-solid fa-shield-cat text-indigo-400 text-xl"></i>
                        <span class="text-xs font-bold text-white">Lapor Kejahatan 911</span>
                        <span class="text-[8px] text-slate-400">Pengaduan darurat kepolisian</span>
                    </button>
                    <button onclick="showToast('Kamu tidak memiliki E-Tilang aktif!', 'info')" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-amber-400/50 transition-all">
                        <i class="fa-solid fa-receipt text-amber-400 text-xl"></i>
                        <span class="text-xs font-bold text-white">Bayar E-Tilang</span>
                        <span class="text-[8px] text-slate-400">Cek status denda lantas</span>
                    </button>
                </div>
            </div>
        `;
    }
};

window.JobsModule = JobsModule;
