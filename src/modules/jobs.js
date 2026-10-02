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
            showToast(`Resmi diterima sebagai ${job.title}! Aplikasi profesi terbuka.`, 'success');
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
            showToast(`Bekerja ${job.title} (+${job.pay.toLocaleString()} C, -${job.vitalityCost}% Vit)`, 'success');
        }
    },

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
    }
};

window.JobsModule = JobsModule;
