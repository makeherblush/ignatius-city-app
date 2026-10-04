// ==========================================
// ENGINE BURSA KERJA, KARIR, PAYROLL & PELAYANAN KOTA V3 (JOBS.JS)
// ==========================================

const JobsModule = {
    // --- 0. HELPER SANITASI XSS ---
    escapeHTML(str) {
        if (!str || typeof str !== 'string') return str || '';
        return str.replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    },

    // --- 1. ENTITAS PERUSAHAAN KOTA (COMPANY ENTITY) ---
    COMPANIES: {
        'cmp_tech': { name: 'Ignatius Tech & Engineering', icon: 'fa-code', sector: 'Teknologi & IT' },
        'cmp_gov': { name: 'Pemerintah Kota Central', icon: 'fa-landmark', sector: 'Layanan Publik' },
        'cmp_rsud': { name: 'RSUD Medika Utama', icon: 'fa-hospital', sector: 'Kesehatan' },
        'cmp_polres': { name: 'Polres Patrolex Central', icon: 'fa-shield-halved', sector: 'Keamanan Hukum' },
        'cmp_bank': { name: 'Bank Central Ignatius', icon: 'fa-building-columns', sector: 'Keuangan' },
        'cmp_bistro': { name: 'Ignatius Bistro & Cafe', icon: 'fa-mug-hot', sector: 'Kuliner' },
        'cmp_media': { name: 'Ignatius News & Media', icon: 'fa-newspaper', sector: 'Media' },
        'cmp_freelance': { name: 'Bursa Gig & Freelance Kota', icon: 'fa-briefcase', sector: 'Jasa Umum' }
    },

    // --- 2. DATABASE PROFESI LENGKAP & PERSYARATAN KARIR ---
    getJobsList() {
        if (window.JOBS_DATABASE && Array.isArray(window.JOBS_DATABASE) && window.JOBS_DATABASE.length > 10) {
            return window.JOBS_DATABASE;
        }

        return [
            // A. FREELANCE / GIG
            { id: 'side_cleaning', companyId: 'cmp_freelance', title: 'Petugas Kebersihan Taman', desc: 'Bersihkan sampah & jaga keasrian fasilitas umum.', category: 'sampingan', salary: { base: 800, overtimeRate: 1.2, bonus: 50 }, requirements: { careerLevel: 1, minXp: 0 }, vitalityCost: 5, xpGain: 10, schedule: 'Flexible' },
            { id: 'side_courier', companyId: 'cmp_freelance', title: 'Kurir Paket Ekspres', desc: 'Antar paket kilat ke alamat warga.', category: 'sampingan', salary: { base: 1300, overtimeRate: 1.3, bonus: 100 }, requirements: { careerLevel: 1, minXp: 0 }, vitalityCost: 8, xpGain: 15, schedule: 'Flexible' },
            { id: 'side_barista', companyId: 'cmp_bistro', title: 'Barista Kafe Bistro', desc: 'Racik kopi & sajikan pesanan pelanggan.', category: 'sampingan', salary: { base: 1500, overtimeRate: 1.3, bonus: 150 }, requirements: { careerLevel: 1, minXp: 10 }, vitalityCost: 8, xpGain: 20, schedule: 'Flexible' },

            // B. PEKERJAAN TETAP & PROFESI BERGELAR
            { id: 'prof_admin', companyId: 'cmp_gov', title: 'Staf Administrasi Pemkot', desc: 'Kelola arsip surat & pelayanan dokumen publik.', category: 'tetap', salary: { base: 3800, overtimeRate: 1.5, bonus: 300 }, requirements: { careerLevel: 1, minXp: 20 }, vitalityCost: 9, xpGain: 40, schedule: '08:00 - 17:00' },
            { id: 'prof_banker', companyId: 'cmp_bank', title: 'Teller Bank Central', desc: 'Melayani transaksi simpan-pinjam & deposito.', category: 'tetap', salary: { base: 4000, overtimeRate: 1.5, bonus: 400 }, requirements: { careerLevel: 2, minXp: 50 }, vitalityCost: 10, xpGain: 45, schedule: '08:00 - 16:00' },
            { id: 'prof_reporter', companyId: 'cmp_media', title: 'Jurnalis & Reporter News', desc: 'Liput berita kriminal, ekonomi & koran kota.', category: 'tetap', salary: { base: 4400, overtimeRate: 1.5, bonus: 450 }, requirements: { careerLevel: 2, minXp: 80 }, vitalityCost: 10, xpGain: 50, schedule: 'Flexible' },
            { id: 'prof_lawyer', companyId: 'cmp_gov', title: 'Pengacara & Konsultan Hukum', desc: 'Pendampingan persidangan & advokasi hukum.', category: 'tetap', salary: { base: 5500, overtimeRate: 1.6, bonus: 600 }, requirements: { license: 'Sertifikat Hukum', careerLevel: 3, minXp: 150 }, vitalityCost: 11, xpGain: 60, schedule: '09:00 - 17:00', permissions: ['law.advocate'] },
            { id: 'prof_it_eng', companyId: 'cmp_tech', title: 'Software Engineer IT', desc: 'Maintenance server & kembangkan aplikasi kota.', category: 'tetap', salary: { base: 6000, overtimeRate: 1.6, bonus: 700 }, requirements: { license: 'Sertifikat IT & Cyber', careerLevel: 3, minXp: 200 }, vitalityCost: 12, xpGain: 70, schedule: '09:00 - 18:00', permissions: ['tech.developer'] },

            // C. PROFESI INSTITUSI SPESIALIS (DOKTER & POLISI)
            { id: 'prof_nurse', companyId: 'cmp_rsud', title: 'Perawat Medis IGD', desc: 'Bantu tindakan darurat & rawat pasien IGD.', category: 'tetap', salary: { base: 4200, overtimeRate: 1.5, bonus: 400 }, requirements: { license: 'Izin Praktek Medis', careerLevel: 2, minXp: 100 }, vitalityCost: 12, xpGain: 45, schedule: '24 Hours Shift', permissions: ['medical.treat'] },
            { id: 'prof_police_patrol', companyId: 'cmp_polres', title: 'Polisi Patroli Lantas', desc: 'Patroli jalanan, penanganan 911 & terbitkan E-Tilang.', category: 'tetap', salary: { base: 4800, overtimeRate: 1.5, bonus: 500 }, requirements: { license: 'SIM A (Mobil)', careerLevel: 2, minXp: 120 }, vitalityCost: 14, xpGain: 55, schedule: '24 Hours Shift', permissions: ['police.ticket', 'police.patrol'] },
            { id: 'prof_doc_gen', companyId: 'cmp_rsud', title: 'Dokter Umum RSUD', desc: 'Pemeriksaan medis, panggil ambulans & tangani IGD.', category: 'tetap', salary: { base: 5600, overtimeRate: 1.6, bonus: 800 }, requirements: { license: 'Izin Praktek Medis', careerLevel: 4, minXp: 250 }, vitalityCost: 15, xpGain: 70, schedule: '24 Hours Shift', permissions: ['medical.treat', 'medical.dispatch'] },
            { id: 'prof_doc_surg', companyId: 'cmp_rsud', title: 'Dokter Spesialis Bedah', desc: 'Operasi darurat pasien pingsan & koma medis.', category: 'tetap', salary: { base: 7000, overtimeRate: 1.7, bonus: 1200 }, requirements: { license: 'Izin Praktek Medis', careerLevel: 5, minXp: 400 }, vitalityCost: 18, xpGain: 85, schedule: 'On Call', permissions: ['medical.treat', 'medical.surgery'] }
        ];
    },

    // --- 3. ENSURE CAREER, HEALTH & POLICE STATE (ANTI-CORRUPTION) ---
    ensureState() {
        if (!window.gameState) window.gameState = {};

        // A. Job & Career State
        if (!window.gameState.jobState) {
            window.gameState.jobState = {
                activeJobId: null,
                hiredAt: null,
                companyId: null,
                totalShifts: 0,
                jobXp: 0,
                careerLevel: 1,
                professionLevels: {},
                careerHistory: [],
                payslips: [],
                performance: { attendance: 100, efficiency: 100, fatigue: 0 },
                lastShiftTimestamp: 0
            };
        }

        const js = window.gameState.jobState;
        if (typeof js.totalShifts !== 'number') js.totalShifts = 0;
        if (typeof js.jobXp !== 'number') js.jobXp = 0;
        if (typeof js.careerLevel !== 'number') js.careerLevel = 1;
        if (!js.professionLevels || typeof js.professionLevels !== 'object') js.professionLevels = {};
        if (!Array.isArray(js.careerHistory)) js.careerHistory = [];
        if (!Array.isArray(js.payslips)) js.payslips = [];
        if (!js.performance) js.performance = { attendance: 100, efficiency: 100, fatigue: 0 };
        if (typeof js.performance.fatigue !== 'number') js.performance.fatigue = 0;

        // B. Health & Emergency State
        if (!window.gameState.health) window.gameState.health = {};
        if (!Array.isArray(window.gameState.health.emergencyCalls)) {
            window.gameState.health.emergencyCalls = [];
        }

        // C. Police State (E-Tilang & DPO)
        if (!window.gameState.policeState) window.gameState.policeState = {};
        if (!Array.isArray(window.gameState.policeState.tickets)) {
            window.gameState.policeState.tickets = [];
        }
        if (!Array.isArray(window.gameState.policeState.dpoList)) {
            window.gameState.policeState.dpoList = [
                { id: 'DPO-9012', nik: 'TG-99999', name: 'Riko "Blackjack"', caseName: 'Pencurian Kasino', reward: 25000, status: 'ACTIVE', lastSeen: 'Downtown' }
            ];
        }
    },

    // --- 4. CHECK PERMISSIONS & ROLES ---
    hasPermission(perm) {
        this.ensureState();
        const activeJobId = window.gameState.jobState.activeJobId;
        if (!activeJobId) return false;
        const jobs = this.getJobsList();
        const job = jobs.find(j => j.id === activeJobId);
        return job && Array.isArray(job.permissions) && job.permissions.includes(perm);
    },

    isDoctorOrNurse() {
        return this.hasPermission('medical.treat');
    },

    isPolice() {
        return this.hasPermission('police.ticket') || this.hasPermission('police.patrol');
    },

    canApplyJob(jobId) {
        this.ensureState();
        const jobs = this.getJobsList();
        const job = jobs.find(j => j.id === jobId);
        if (!job) return { allowed: false, reason: 'Pekerjaan tidak valid' };

        const userLicenses = window.gameState?.user?.legal?.licenses || [];
        const js = window.gameState.jobState;

        if (job.requirements?.license && !userLicenses.includes(job.requirements.license)) {
            return { allowed: false, reason: `Memerlukan Lisensi "${job.requirements.license}"` };
        }

        if (job.requirements?.careerLevel && js.careerLevel < job.requirements.careerLevel) {
            return { allowed: false, reason: `Memerlukan Level Karir minimal Lvl ${job.requirements.careerLevel}` };
        }

        if (job.requirements?.minXp && js.jobXp < job.requirements.minXp) {
            return { allowed: false, reason: `Memerlukan Pengalaman минимал ${job.requirements.minXp} XP` };
        }

        return { allowed: true, reason: 'Kualifikasi Terpenuhi' };
    },

    // --- 5. LAMAR PEKERJAAN & PROSES SELEKSI (APPLICATION ENGINE) ---
    applyPermanentJob(jobId) {
        this.ensureState();
        const jobs = this.getJobsList();
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
            if (typeof showToast === 'function') showToast('Pekerjaan tidak ditemukan!', 'error');
            return;
        }

        const check = this.canApplyJob(jobId);
        if (!check.allowed) {
            if (typeof showToast === 'function') showToast(`Lamaran Ditolak: ${check.reason}`, 'warning');
            return;
        }

        const js = window.gameState.jobState;
        const comp = this.COMPANIES[job.companyId] || { name: 'Perusahaan Kota' };

        // Simpan Pekerjaan Lama ke Career History (Jika Ada)
        if (js.activeJobId && js.activeJobId !== jobId) {
            const oldJob = jobs.find(j => j.id === js.activeJobId);
            js.careerHistory.unshift({
                jobId: js.activeJobId,
                title: oldJob ? oldJob.title : 'Profesi Lama',
                companyName: comp.name,
                startedAt: js.hiredAt || 'Lama',
                endedAt: new Date().toLocaleDateString('id-ID'),
                totalShifts: js.totalShifts
            });
        }

        // Diterima Kerja
        js.activeJobId = jobId;
        js.companyId = job.companyId;
        js.hiredAt = new Date().toLocaleDateString('id-ID');

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('unlock');

        if (typeof window.showIOSNotification === 'function') {
            window.showIOSNotification('Lamaran Diterima!', `Selamat! Anda resmi bergabung di ${comp.name} sebagai ${job.title}.`, 'HRD Center', 'fa-briefcase');
        }

        if (typeof showToast === 'function') showToast(`Resmi diterima sebagai ${job.title}!`, 'success');
        if (typeof openApp === 'function') openApp('jobs');
    },

    resignCurrentJob() {
        this.ensureState();
        const js = window.gameState.jobState;
        if (!js.activeJobId) return;

        const confirmResign = confirm("Apakah kamu yakin ingin mengundurkan diri dari perusahaan saat ini?");
        if (!confirmResign) return;

        const jobs = this.getJobsList();
        const oldJob = jobs.find(j => j.id === js.activeJobId);

        js.careerHistory.unshift({
            jobId: js.activeJobId,
            title: oldJob ? oldJob.title : 'Profesi Lama',
            companyName: 'Perusahaan Kota',
            startedAt: js.hiredAt || 'Lama',
            endedAt: new Date().toLocaleDateString('id-ID'),
            totalShifts: js.totalShifts
        });

        js.activeJobId = null;
        js.companyId = null;
        js.hiredAt = null;

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast('Berhasil mengundurkan diri.', 'info');
        if (typeof openApp === 'function') openApp('jobs');
    },

    // --- 6. SHIFT KERJA, OVERTIME & PAYSLIP GENERATION VIA ECONOMY V2 ---
    doWorkShift(jobId, isOvertime = false) {
        this.ensureState();
        const jobs = this.getJobsList();
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
            if (typeof showToast === 'function') showToast('Pekerjaan tidak valid!', 'error');
            return;
        }

        const js = window.gameState.jobState;
        const now = Date.now();

        // Check Cooldown Shift (Min 10 Detik Antar Shift)
        if (now - (js.lastShiftTimestamp || 0) < 10000) {
            if (typeof showToast === 'function') showToast('Kamu masih dalam periode istirahat shift! Tunggu sejenak.', 'warning');
            return;
        }

        // Cek Vitality & Fatigue Penalty
        let vitCost = isOvertime ? Math.floor(job.vitalityCost * 1.5) : job.vitalityCost;
        if ((window.gameState?.vitality || 0) < vitCost) {
            if (typeof showToast === 'function') showToast(`Tubuh terlalu lelah! Butuh ${vitCost}% Vitality.`, 'error');
            return;
        }

        // Hitung Gaji Gross, Lembur & Potongan Pajak
        const baseSalary = job.salary.base;
        const overtimePay = isOvertime ? Math.floor(baseSalary * (job.salary.overtimeRate - 1)) : 0;
        const bonusPay = js.performance.fatigue < 30 ? job.salary.bonus : 0; // Bonus jika tidak lelah
        const grossPay = baseSalary + overtimePay + bonusPay;

        const taxDeduction = Math.floor(grossPay * 0.05); // Pajak PPh 5%
        const netPay = grossPay - taxDeduction;

        // Eksekusi Pemasukan VIA EconomyModule V2 Engine
        if (window.EconomyModule && typeof window.EconomyModule.addIncome === 'function') {
            window.EconomyModule.addIncome({
                amount: netPay,
                source: this.COMPANIES[job.companyId]?.name || 'Gaji Perusahaan',
                description: `Gaji ${isOvertime ? 'Lembur' : 'Shift'} (${job.title})`
            });
        } else {
            window.gameState.crest = (window.gameState.crest || 0) + netPay;
        }

        // Update Vitality & State Karir
        window.gameState.vitality -= vitCost;
        js.lastShiftTimestamp = now;
        js.totalShifts += 1;
        js.jobXp += job.xpGain;
        js.performance.fatigue = Math.min(100, js.performance.fatigue + (isOvertime ? 25 : 15));

        // Level Up Karir (250 XP per Level)
        const oldLevel = js.careerLevel;
        js.careerLevel = Math.floor(js.jobXp / 250) + 1;

        if (js.careerLevel > oldLevel) {
            if (typeof showToast === 'function') showToast(`🎉 PROMOSI KARIR! Kamu naik ke Level ${js.careerLevel}!`, 'success');
        }

        // Terbitkan Official Payslip Object
        const payslipId = 'PAY-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
        const comp = this.COMPANIES[job.companyId] || { name: 'Perusahaan Kota' };
        const user = window.gameState?.user?.identity || {};

        const newPayslip = {
            id: payslipId,
            employer: comp.name,
            employee: user.fullName || 'Warga Ignatius',
            position: job.title,
            baseSalary: baseSalary,
            overtime: overtimePay,
            bonus: bonusPay,
            gross: grossPay,
            tax: taxDeduction,
            net: netPay,
            paidAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };

        js.payslips.unshift(newPayslip);
        if (js.payslips.length > 20) js.payslips.pop();

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Shift Selesai! Slip Gaji ${netPay.toLocaleString()} C Diterbitkan.`, 'success');

        if (typeof openApp === 'function') openApp('jobs');
    },

    // Instan Istirahat Kurangi Fatigue
    restEmployee() {
        this.ensureState();
        const js = window.gameState.jobState;
        if (js.performance.fatigue <= 0) {
            if (typeof showToast === 'function') showToast('Kondisi fisikmu dalam keadaan prima!', 'info');
            return;
        }

        js.performance.fatigue = Math.max(0, js.performance.fatigue - 40);
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast('Beristirahat sejenak... Fatigue berkurang -40%', 'success');
        if (typeof openApp === 'function') openApp('jobs');
    },

    // --- 7. RENDER MAIN BURSA KERJA UI ---
    renderJobsAppUI() {
        this.ensureState();
        const jobs = this.getJobsList();
        const js = window.gameState.jobState;
        const activeJob = jobs.find(j => j.id === js.activeJobId);
        const activeComp = activeJob ? this.COMPANIES[activeJob.companyId] : null;

        // A. Header Karir Aktif Warga
        let activeJobHeaderHtml = '';
        if (activeJob) {
            activeJobHeaderHtml = `
                <div class="glass-ios p-4 rounded-3xl border border-sky-500/50 bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 space-y-3 shadow-xl">
                    <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <div>
                            <span class="text-[8px] text-sky-400 uppercase font-mono font-bold block flex items-center gap-1">
                                <i class="fa-solid ${activeComp?.icon || 'fa-briefcase'}"></i> ${this.escapeHTML(activeComp?.name || 'Perusahaan Kota')}
                            </span>
                            <h3 class="text-sm font-bold text-white">${this.escapeHTML(activeJob.title)}</h3>
                        </div>
                        <button onclick="JobsModule.resignCurrentJob()" class="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[9px] font-bold rounded-lg border border-rose-500/30 transition-all">
                            Resign
                        </button>
                    </div>

                    <!-- INDICATOR PERFORMA & FATIGUE -->
                    <div class="grid grid-cols-3 gap-2 text-center text-[9px]">
                        <div class="glass-card p-2 rounded-xl">
                            <span class="text-slate-400 block">Level Karir</span>
                            <span class="font-bold text-amber-300 font-mono text-xs">Lvl ${js.careerLevel}</span>
                        </div>
                        <div class="glass-card p-2 rounded-xl">
                            <span class="text-slate-400 block">Total Shift</span>
                            <span class="font-bold text-sky-300 font-mono text-xs">${js.totalShifts}x</span>
                        </div>
                        <div class="glass-card p-2 rounded-xl">
                            <span class="text-slate-400 block">Tingkat Kelelahan</span>
                            <span class="font-bold ${js.performance.fatigue > 70 ? 'text-rose-400' : 'text-emerald-300'} font-mono text-xs">${js.performance.fatigue}%</span>
                        </div>
                    </div>

                    <!-- TOMBOL KINERJA SHIFT -->
                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="JobsModule.doWorkShift('${activeJob.id}', false)" class="py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95">
                            <i class="fa-solid fa-clock"></i> Shift Normal (+${Math.floor(activeJob.salary.base * 0.95).toLocaleString()} C)
                        </button>
                        <button onclick="JobsModule.doWorkShift('${activeJob.id}', true)" class="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95">
                            <i class="fa-solid fa-bolt text-amber-300"></i> Lembur (+${Math.floor((activeJob.salary.base * activeJob.salary.overtimeRate) * 0.95).toLocaleString()} C)
                        </button>
                    </div>

                    ${js.performance.fatigue > 50 ? `
                        <button onclick="JobsModule.restEmployee()" class="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-[10px] rounded-xl border border-emerald-500/30 transition-all text-center">
                            ☕ Istirahat Kopi & Pulihkan Fatigue (-40%)
                        </button>
                    ` : ''}
                </div>
            `;
        } else {
            activeJobHeaderHtml = `
                <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-2 bg-gradient-to-br from-slate-900 to-slate-950">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-briefcase text-sky-400 text-base"></i>
                        <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider">BURSA KERJA & KARIR KOTA</h4>
                    </div>
                    <p class="text-[10px] text-slate-300">Kamu belum terikat kontrak kerja tetap. Pilih salah satu tawaran profesi di bawah untuk mulai berkarir.</p>
                </div>
            `;
        }

        // B. List Pekerjaan Sampingan & Tetap
        let sideHtml = '';
        let fullHtml = '';

        jobs.forEach(job => {
            const check = this.canApplyJob(job.id);
            const isCurrent = js.activeJobId === job.id;
            const comp = this.COMPANIES[job.companyId] || { name: 'Perusahaan Kota' };

            if (job.category === 'sampingan') {
                sideHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 border border-white/5 hover:border-emerald-500/40 transition-all">
                        <div>
                            <h5 class="text-xs font-bold text-white">${this.escapeHTML(job.title)}</h5>
                            <p class="text-[10px] text-slate-400 leading-tight">${this.escapeHTML(job.desc)}</p>
                            <span class="text-[8px] text-emerald-400 font-mono block pt-0.5">Beban: -${job.vitalityCost}% Vit | +${job.xpGain} XP</span>
                        </div>
                        <button onclick="JobsModule.doWorkShift('${job.id}', false)" class="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shrink-0 transition-all active:scale-95">
                            +${Math.floor(job.salary.base * 0.95).toLocaleString()} C
                        </button>
                    </div>
                `;
            } else {
                fullHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 border ${isCurrent ? 'border-sky-500/60 bg-sky-950/30' : 'border-white/10'} hover:border-sky-400/40 transition-all">
                        <div>
                            <div class="flex items-center gap-1.5">
                                <h5 class="text-xs font-bold text-white">${this.escapeHTML(job.title)}</h5>
                                ${isCurrent ? '<span class="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 text-[7px] font-bold rounded">KONTRAK AKTIF</span>' : ''}
                            </div>
                            <span class="text-[8px] text-slate-400 font-mono block">${this.escapeHTML(comp.name)}</span>
                            <p class="text-[10px] text-slate-300 leading-tight pt-0.5">${this.escapeHTML(job.desc)}</p>
                            ${job.requirements?.license ? `<span class="text-[8px] text-amber-300 font-mono block pt-0.5"><i class="fa-solid fa-certificate mr-1"></i>Syarat: ${this.escapeHTML(job.requirements.license)}</span>` : ''}
                        </div>
                        ${isCurrent ? `
                            <button onclick="JobsModule.doWorkShift('${job.id}', false)" class="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shrink-0 transition-all active:scale-95">
                                Shift Kerja
                            </button>
                        ` : `
                            <button onclick="JobsModule.applyPermanentJob('${job.id}')" class="px-3 py-2 ${check.allowed ? 'bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white' : 'bg-slate-900 text-slate-600 cursor-not-allowed'} font-bold text-xs rounded-xl shrink-0 transition-all">
                                ${check.allowed ? 'Lamar' : '🔒 Terkunci'}
                            </button>
                        `}
                    </div>
                `;
            }
        });

        // C. Render Histori Slip Gaji (Payslips)
        let payslipsHtml = '';
        if (js.payslips.length === 0) {
            payslipsHtml = `<p class="text-[10px] text-slate-500 text-center py-2">Belum ada struk slip gaji resmi yang terbit.</p>`;
        } else {
            js.payslips.slice(0, 5).forEach(ps => {
                payslipsHtml += `
                    <div class="p-2.5 glass-card rounded-2xl border border-white/5 space-y-1 text-[10px]">
                        <div class="flex justify-between items-center font-bold text-white">
                            <span>🧾 ${this.escapeHTML(ps.employer)}</span>
                            <span class="font-mono text-emerald-400">+${ps.net.toLocaleString()} C</span>
                        </div>
                        <div class="flex justify-between text-[8px] text-slate-400 font-mono">
                            <span>Posisi: ${this.escapeHTML(ps.position)}</span>
                            <span>Gaji Pokok: ${ps.baseSalary.toLocaleString()} C | Pajak 5%: -${ps.tax} C</span>
                        </div>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                ${activeJobHeaderHtml}

                <!-- PEKERJAAN SAMPINGAN -->
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-bolt"></i> Pekerjaan Sampingan & Gig (Bebas Syarat)
                    </h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                        ${sideHtml}
                    </div>
                </div>

                <!-- PROFESI KANTORAN -->
                <div class="space-y-2 pt-2 border-t border-white/10">
                    <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-user-tie"></i> Karir Tetap & Karir Spesialis
                    </h4>
                    <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                        ${fullHtml}
                    </div>
                </div>

                <!-- SLIP GAJI TERAKHIR -->
                <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-2">
                    <h4 class="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span><i class="fa-solid fa-receipt mr-1 text-amber-400"></i> Struk Slip Gaji Resmi (Payslip)</span>
                        <span class="text-[8px] text-slate-500 font-mono">Pajak PPh: 5%</span>
                    </h4>
                    <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        ${payslipsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    // --- 8. MODUL HALODOC MEDIKA (PERSISTENT EMERGENCY QUEUE & DOCTOR DISPATCH) ---
    renderHalodocAppUI() {
        this.ensureState();
        const isDoctor = this.isDoctorOrNurse();
        const calls = window.gameState.health.emergencyCalls;

        if (isDoctor) {
            let callsHtml = '';
            if (calls.length === 0) {
                callsHtml = `<p class="text-[10px] text-slate-500 py-4 text-center">Tidak ada panggilan darurat medis aktif di RSUD Medika Utama.</p>`;
            } else {
                calls.forEach((c, idx) => {
                    callsHtml += `
                        <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-2 border border-rose-500/40 bg-gradient-to-r from-rose-950/30 to-slate-900">
                            <div>
                                <div class="flex items-center gap-1.5">
                                    <h5 class="text-xs font-bold text-white">${this.escapeHTML(c.name)}</h5>
                                    <span class="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 font-mono text-[8px] rounded">${this.escapeHTML(c.nik)}</span>
                                </div>
                                <p class="text-[10px] text-rose-300 font-semibold pt-0.5"><i class="fa-solid fa-kit-medical mr-1"></i>${this.escapeHTML(c.reason)}</p>
                                <span class="text-[8px] text-slate-400 font-mono">ID: ${c.id} · Status: ${c.status}</span>
                            </div>
                            <button onclick="JobsModule.treatMedicalCall(${idx})" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shrink-0 transition-all active:scale-95">
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
                            <h4 class="text-xs font-bold text-rose-300 uppercase tracking-wider"><i class="fa-solid fa-user-doctor mr-1.5"></i> DASHBOARD MEDIS RSUD</h4>
                            <span class="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[8px] font-bold rounded border border-rose-500/30 animate-pulse">DOKTER ON-CALL</span>
                        </div>
                        <p class="text-[10px] text-slate-300">Pantau antrean panggilan darurat ambulans & berikan pertolongan medis IGD kepada warga.</p>
                    </div>

                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-rose-400 uppercase tracking-wider">🚑 Antrean Pasien IGD (${calls.length})</h4>
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
                    <p class="text-[10px] text-slate-300">Layanan panggilan darurat IGD, konsultasi resep dokter, & pemulihan kesehatan warga.</p>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="JobsModule.requestMedicalCall('Pingsan Koma Drop Vitality')" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-rose-400/50 transition-all active:scale-95">
                        <i class="fa-solid fa-truck-medical text-rose-400 text-xl animate-pulse"></i>
                        <span class="text-xs font-bold text-white">Panggil Ambulans</span>
                        <span class="text-[8px] text-slate-400">Panggilan Darurat Code Blue IGD</span>
                    </button>
                    <button onclick="JobsModule.requestMedicalCall('Konsultasi Dokter & Resep')" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-sky-400/50 transition-all active:scale-95">
                        <i class="fa-solid fa-user-doctor text-sky-400 text-xl"></i>
                        <span class="text-xs font-bold text-white">Konsultasi Dokter</span>
                        <span class="text-[8px] text-slate-400">Panggil dokter resep obat</span>
                    </button>
                </div>

                <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-1.5">
                    <h5 class="text-[10px] font-bold text-slate-300 uppercase">💡 Edukasi Kesehatan Warga</h5>
                    <p class="text-[9px] text-slate-400 leading-relaxed">Jangan biarkan Vitality kamu menyentuh 0%. Beli makanan di minimarket atau hubungi dokter untuk penanganan medis darurat.</p>
                </div>
            </div>
        `;
    },

    requestMedicalCall(reason) {
        this.ensureState();
        const user = window.gameState?.user?.identity || {};
        const callId = 'EMG-' + Math.floor(10000 + Math.random() * 90000);

        window.gameState.health.emergencyCalls.push({
            id: callId,
            nik: user.nik || 'TG-000',
            name: user.fullName || 'Warga Sakit',
            reason: reason,
            status: 'WAITING',
            createdAt: Date.now()
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Panggilan Medis (${callId}) Terkirim ke Dokter IGD!`, 'success');
        if (typeof openApp === 'function') openApp('app_halodoc');
    },

    treatMedicalCall(idx) {
        this.ensureState();
        const calls = window.gameState.health.emergencyCalls;
        if (!calls[idx]) return;

        if ((window.gameState?.vitality || 0) < 10) {
            if (typeof showToast === 'function') showToast('Vitality kamu tidak cukup!', 'error');
            return;
        }

        window.gameState.vitality -= 10;
        const call = calls[idx];

        // Honor Dokter via EconomyModule V2 Engine
        if (window.EconomyModule && typeof window.EconomyModule.addIncome === 'function') {
            window.EconomyModule.addIncome({
                amount: 3000,
                source: 'RSUD Medika Utama',
                description: `Honor Tindakan Pasien ${call.id}`
            });
        } else {
            window.gameState.crest = (window.gameState.crest || 0) + 3000;
        }

        calls.splice(idx, 1);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast('Pasien sukses ditangani! (+3,000 C Honor Dokter)', 'success');
        if (typeof openApp === 'function') openApp('app_halodoc');
    },

    // --- 9. MODUL POLRES HUB, E-TILANG NYATA & PERSISTENT DPO ---
    renderPoliceHubAppUI() {
        this.ensureState();
        const isPol = this.isPolice();
        const policeState = window.gameState.policeState;
        const userNik = window.gameState?.user?.identity?.nik || 'TG-90128';

        if (isPol) {
            // VIEW POLISI PATROLI / DETEKTIF
            let ticketsHtml = '';
            if (policeState.tickets.length === 0) {
                ticketsHtml = `<p class="text-[10px] text-slate-500 py-2 text-center">Belum ada catatan E-Tilang aktif yang diterbitkan.</p>`;
            } else {
                policeState.tickets.forEach(t => {
                    ticketsHtml += `
                        <div class="flex items-center justify-between py-1.5 border-b border-white/5 text-[10px]">
                            <div>
                                <span class="font-bold text-white">${this.escapeHTML(t.nik)}</span>
                                <span class="text-slate-400 text-[8px] block">${this.escapeHTML(t.violation)}</span>
                            </div>
                            <span class="font-mono font-bold ${t.status === 'PAID' ? 'text-emerald-400' : 'text-rose-400'}">${t.fine.toLocaleString()} C (${t.status})</span>
                        </div>
                    `;
                });
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-indigo-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider"><i class="fa-solid fa-shield-halved mr-1.5"></i> POLRES PATROLEX HUB</h4>
                            <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[8px] font-bold rounded border border-indigo-500/30">PETUGAS POLISI</span>
                        </div>
                        <p class="text-[10px] text-slate-300">Penerbitan E-Tilang Lantas Resmi, Input DPO Buronan, & Penegakan Hukum Kota.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="JobsModule.issuePoliceTicketPrompt()" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-indigo-400/50 transition-all active:scale-95">
                            <i class="fa-solid fa-file-invoice-dollar text-indigo-400 text-xl"></i>
                            <span class="text-xs font-bold text-white">Terbitkan E-Tilang</span>
                            <span class="text-[8px] text-slate-400">Input denda tilang ke NIK</span>
                        </button>
                        <button onclick="JobsModule.issueDpoPrompt()" class="p-3.5 glass-card rounded-2xl flex flex-col items-center text-center space-y-1.5 hover:border-rose-400/50 transition-all active:scale-95">
                            <i class="fa-solid fa-user-ninja text-rose-400 text-xl"></i>
                            <span class="text-xs font-bold text-white">Input DPO Buronan</span>
                            <span class="text-[8px] text-slate-400">Terbitkan DPO buronan kota</span>
                        </button>
                    </div>

                    <div class="glass-ios p-3 rounded-2xl border border-white/10 space-y-2">
                        <h4 class="text-[10px] font-bold text-indigo-300 uppercase">📋 Log E-Tilang Terbit Terakhir</h4>
                        <div class="space-y-1 max-h-36 overflow-y-auto pr-1">${ticketsHtml}</div>
                    </div>
                </div>
            `;
        }

        // VIEW WARGA BIASA (BAYAR E-TILANG & CEK DPO)
        const myTickets = policeState.tickets.filter(t => t.nik === userNik && t.status === 'UNPAID');
        let myTicketsHtml = '';

        if (myTickets.length === 0) {
            myTicketsHtml = `<p class="text-[10px] text-slate-500 py-2 text-center">Kamu tidak memiliki tagihan E-Tilang aktif. Pengendara Teladan! 🚗</p>`;
        } else {
            myTickets.forEach(t => {
                myTicketsHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs border border-rose-500/30">
                        <div>
                            <h6 class="font-bold text-white text-[11px]">${this.escapeHTML(t.violation)}</h6>
                            <span class="text-[9px] text-slate-400 font-mono">Denda: ${t.fine.toLocaleString()} C</span>
                        </div>
                        <button onclick="JobsModule.payPoliceTicket('${t.id}')" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg shadow-md transition-all active:scale-95">
                            Bayar Tilang
                        </button>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-indigo-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-shield-halved text-indigo-400 text-base"></i>
                        <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider">POLRES PATROLEX HUB WARGA</h4>
                    </div>
                    <p class="text-[10px] text-slate-300">Layanan pengaduan darurat 911 kejahatan, pembayaran e-tilang aktif, & informasi DPO buronan kota.</p>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">🧾 E-Tilang Aktif Kamu (${myTickets.length})</h4>
                    <div class="space-y-1.5 max-h-36 overflow-y-auto">${myTicketsHtml}</div>
                </div>
            </div>
        `;
    },

    // POLICE PROMPT HANDLERS
    issuePoliceTicketPrompt() {
        this.ensureState();
        const nik = prompt("Masukkan NIK Warga Pelanggar:");
        if (!nik) return;
        const violation = prompt("Masukkan Jenis Pelanggaran (misal: Menerobos Lampu Merah):");
        if (!violation) return;
        const fineStr = prompt("Masukkan Nominal Denda Tilang (Crest):");
        if (!fineStr) return;
        const fine = parseInt(fineStr);

        if (isNaN(fine) || fine <= 0) {
            if (typeof showToast === 'function') showToast('Nominal denda tidak valid!', 'error');
            return;
        }

        const ticketId = 'TILANG-' + Math.floor(10000 + Math.random() * 90000);
        window.gameState.policeState.tickets.unshift({
            id: ticketId,
            nik: nik.trim(),
            violation: violation.trim(),
            fine: fine,
            status: 'UNPAID',
            issuedAt: Date.now()
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`E-Tilang Resmi Terbit untuk NIK ${nik.trim()}!`, 'success');
        if (typeof openApp === 'function') openApp('app_police');
    },

    issueDpoPrompt() {
        this.ensureState();
        const nik = prompt("Masukkan NIK Buronan:");
        if (!nik) return;
        const name = prompt("Masukkan Nama Buronan:");
        if (!name) return;
        const caseName = prompt("Masukkan Kasus Kejahatan:");
        if (!caseName) return;

        const dpoId = 'DPO-' + Math.floor(1000 + Math.random() * 9000);
        window.gameState.policeState.dpoList.unshift({
            id: dpoId,
            nik: nik.trim(),
            name: name.trim(),
            caseName: caseName.trim(),
            reward: 20000,
            status: 'ACTIVE',
            lastSeen: 'Peta Kota'
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Status DPO Buronan Terbit untuk ${name.trim()}!`, 'error');
        if (typeof openApp === 'function') openApp('app_police');
    },

    payPoliceTicket(ticketId) {
        this.ensureState();
        const tickets = window.gameState.policeState.tickets;
        const ticket = tickets.find(t => t.id === ticketId);

        if (!ticket) return;

        // Potong Saldo via EconomyModule V2 Engine
        if (window.EconomyModule && typeof window.EconomyModule.pay === 'function') {
            const paid = window.EconomyModule.pay({
                amount: ticket.fine,
                merchant: 'Polres Patrolex Hub',
                description: `Pelunasan E-Tilang ${ticket.id}`
            });
            if (!paid) return;
        } else {
            if ((window.gameState?.crest || 0) < ticket.fine) {
                if (typeof showToast === 'function') showToast('Saldo Crest kamu kurang untuk bayar tilang!', 'error');
                return;
            }
            window.gameState.crest -= ticket.fine;
        }

        ticket.status = 'PAID';

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast('E-Tilang Berhasil Dilunasi! Status Lantas Bersih.', 'success');
        if (typeof openApp === 'function') openApp('app_police');
    }
};

// Inisialisasi Otomatis State saat Modul Dibaca
JobsModule.ensureState();

window.JobsModule = JobsModule;
