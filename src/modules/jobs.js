// ==========================================
// MODUL BURSA KERJA & DYNAMIC APPS (JOBS.JS)
// ==========================================

const JobsModule = {
    isDoctorOrNurse() {
        const activeJob = window.gameState?.jobState?.activeJobId;
        return ['prof_doc_gen', 'prof_doc_surg', 'prof_nurse'].includes(activeJob);
    },

    isPolice() {
        const activeJob = window.gameState?.jobState?.activeJobId;
        return ['prof_police_patrol', 'prof_police_detective'].includes(activeJob);
    },

    canApplyJob(jobId) {
        const jobs = window.JOBS_DATABASE || [];
        const job = jobs.find(j => j.id === jobId);
        if (!job || !job.requiredLicense) return true;
        const userLicenses = window.gameState?.user?.legal?.licenses || [];
        return userLicenses.includes(job.requiredLicense);
    },

    applyPermanentJob(jobId) {
        const jobs = window.JOBS_DATABASE || [];
        const job = jobs.find(j => j.id === jobId);
        if (!job) return;

        if (!this.canApplyJob(jobId)) {
            if (typeof showToast === 'function') showToast(`Syarat Kurang! Wajib lisensi ${job.requiredLicense}`, 'warning');
            return;
        }

        if (!window.gameState.jobState) window.gameState.jobState = {};
        window.gameState.jobState.activeJobId = jobId;
        window.gameState.jobState.hiredAt = new Date().toLocaleDateString('id-ID');

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Resmi diterima sebagai ${job.title}!`, 'success');
        openApp('jobs');
    },

    doWorkShift(jobId) {
        const jobs = window.JOBS_DATABASE || [];
        const job = jobs.find(j => j.id === jobId) || { title: 'Pekerjaan', pay: 1500, vitalityCost: 10 };

        if ((window.gameState?.vitality || 0) < job.vitalityCost) {
            if (typeof showToast === 'function') showToast(`Vitality kurang! Butuh ${job.vitalityCost}% Vit.`, 'error');
            return;
        }

        window.gameState.vitality -= job.vitalityCost;
        window.gameState.crest = (window.gameState.crest || 0) + job.pay;

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Selesai Shift ${job.title} (+${job.pay.toLocaleString()} C)`, 'success');
        openApp('jobs');
    },

    renderJobsAppUI() {
        const jobs = window.JOBS_DATABASE || [
            { id: 'side_cleaning', title: 'Petugas Kebersihan Taman', desc: 'Bersihkan sampah area publik', pay: 800, category: 'sampingan', vitalityCost: 5 },
            { id: 'side_courier', title: 'Kurir Paket Ekspres', desc: 'Antar paket warga sekota', pay: 1200, category: 'sampingan', vitalityCost: 10 },
            { id: 'prof_doc_gen', title: 'Dokter Umum RSUD', desc: 'Tangani pasien & IGD', pay: 5000, category: 'tetap', vitalityCost: 15 },
            { id: 'prof_police_patrol', title: 'Polisi Patroli', desc: 'Jaga keamanan & lantas', pay: 4500, category: 'tetap', vitalityCost: 15 }
        ];

        let sideHtml = '';
        let fullHtml = '';

        jobs.forEach(job => {
            const hasLicense = this.canApplyJob(job.id);
            const isCurrent = window.gameState?.jobState?.activeJobId === job.id;

            if (job.category === 'sampingan') {
                sideHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3">
                        <div>
                            <h5 class="text-xs font-bold text-white">${job.title}</h5>
                            <p class="text-[10px] text-slate-400">${job.desc}</p>
                        </div>
                        <button onclick="JobsModule.doWorkShift('${job.id}')" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shrink-0">
                            +${job.pay.toLocaleString()} C
                        </button>
                    </div>
                `;
            } else {
                fullHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 border ${isCurrent ? 'border-sky-500/50' : 'border-white/10'}">
                        <div>
                            <h5 class="text-xs font-bold text-white">${job.title}</h5>
                            <p class="text-[10px] text-slate-400">${job.desc}</p>
                        </div>
                        ${isCurrent ? `
                            <button onclick="JobsModule.doWorkShift('${job.id}')" class="px-3 py-1.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-lg shrink-0">
                                Shift (+${job.pay.toLocaleString()} C)
                            </button>
                        ` : `
                            <button onclick="JobsModule.applyPermanentJob('${job.id}')" class="px-3 py-1.5 ${hasLicense ? 'bg-slate-800 text-slate-200' : 'bg-slate-900 text-slate-600'} font-bold text-xs rounded-xl shrink-0">
                                ${hasLicense ? 'Lamar' : '🔒 Terkunci'}
                            </button>
                        `}
                    </div>
                `;
            }
        });

        return `
            <div class="space-y-4">
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

    renderHalodocAppUI() {
        const isDoctor = this.isDoctorOrNurse();
        const calls = window.gameState?.health?.emergencyCalls || [];

        if (isDoctor) {
            let callsHtml = '';
            if (calls.length === 0) {
                callsHtml = `<p class="text-[10px] text-slate-500 py-3 text-center">Tidak ada panggilan darurat medis saat ini.</p>`;
            } else {
                calls.forEach((c, idx) => {
                    callsHtml += `
                        <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-2 border border-rose-500/30">
                            <div>
                                <h5 class="text-xs font-bold text-white">${c.name} (${c.nik})</h5>
                                <p class="text-[10px] text-rose-300 font-semibold">${c.reason}</p>
                            </div>
                            <button onclick="JobsModule.treatMedicalCall(${idx})" class="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shrink-0">
                                Tangani (+3,000 C)
                            </button>
                        </div>
                    `;
                });
            }

            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-rose-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-rose-950/60">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-bold text-rose-300 uppercase tracking-wider">🩺 DASHBOARD MEDIS DOKTER</h4>
                            <span class="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[8px] font-bold rounded">TIM MEDIS AKTIF</span>
                        </div>
                        <p class="text-[10px] text-slate-300">Siaga IGD RSUD & penanganan pasien darurat sekota.</p>
                    </div>

                    <div class="space-y-2">
                        <h4 class="text-xs font-bold text-rose-400 uppercase tracking-wider">🚨 Antrean Panggilan Darurat Pasien</h4>
                        <div class="space-y-2">${callsHtml}</div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-rose-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-rose-950/60">
                    <h4 class="text-xs font-bold text-rose-300 uppercase tracking-wider">🏥 HALODOC MEDIKA CENTRAL</h4>
                    <p class="text-[10px] text-slate-300">Layanan kesehatan warga, pemanggilan dokter, & konsultasi obat.</p>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="JobsModule.requestMedicalCall('Pertolongan Pingsan / Koma Vitality Drop')" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1">
                        <i class="fa-solid fa-truck-medical text-rose-400 text-lg animate-pulse"></i>
                        <span class="text-xs font-bold text-white">Panggil Ambulans</span>
                    </button>
                    <button onclick="JobsModule.requestMedicalCall('Konsultasi Dokter Sakit Parah')" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1">
                        <i class="fa-solid fa-user-doctor text-sky-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Konsultasi Dokter</span>
                    </button>
                </div>
            </div>
        `;
    },

    requestMedicalCall(reason) {
        if (!window.gameState.health) window.gameState.health = {};
        if (!window.gameState.health.emergencyCalls) window.gameState.health.emergencyCalls = [];

        const user = window.gameState?.user?.identity || {};
        window.gameState.health.emergencyCalls.push({
            nik: user.nik || 'TG-000',
            name: user.fullName || 'Warga Sakit',
            reason: reason
        });

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast('Panggilan Medis terkirim! Tim Dokter akan segera datang.', 'success');
        openApp('app_halodoc');
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
        if (typeof showToast === 'function') showToast('Pasien berhasil ditangani! (+3,000 C)', 'success');
        openApp('app_halodoc');
    },

    renderPoliceHubAppUI() {
        const isPol = this.isPolice();

        if (isPol) {
            return `
                <div class="space-y-4">
                    <div class="glass-ios p-4 rounded-3xl border border-indigo-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-indigo-950/60">
                        <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider">🚔 DASHBOARD POLRES PATROLEX</h4>
                        <p class="text-[10px] text-slate-300">Sistem Lantas, Penerbitan E-Tilang, & DPO Buronan.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="const nik=prompt('NIK Pelanggar:'); if(nik) showToast('E-Tilang Terbit!', 'success');" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1">
                            <i class="fa-solid fa-file-invoice-dollar text-indigo-400 text-lg"></i>
                            <span class="text-xs font-bold text-white">Terbitkan Tilang</span>
                        </button>
                        <button onclick="const nik=prompt('NIK Buronan DPO:'); if(nik) showToast('Status DPO Terbit!', 'error');" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1">
                            <i class="fa-solid fa-user-ninja text-rose-400 text-lg"></i>
                            <span class="text-xs font-bold text-white">Input DPO</span>
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-indigo-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-indigo-950/60">
                    <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider">🛡️ POLRES HUB WARGA</h4>
                    <p class="text-[10px] text-slate-300">Layanan pengaduan kejahatan 911, pembayaran e-tilang, & daftar DPO.</p>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="showToast('Laporan Kejahatan 911 terkirim ke Polisi!', 'success')" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1">
                        <i class="fa-solid fa-shield-cat text-indigo-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Lapor Kejahatan 911</span>
                    </button>
                    <button onclick="showToast('Kamu tidak memiliki E-Tilang aktif!', 'info')" class="p-3 glass-card rounded-2xl flex flex-col items-center text-center space-y-1">
                        <i class="fa-solid fa-receipt text-amber-400 text-lg"></i>
                        <span class="text-xs font-bold text-white">Bayar E-Tilang</span>
                    </button>
                </div>
            </div>
        `;
    }
};

window.JobsModule = JobsModule;
