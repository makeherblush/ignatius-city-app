// ==========================================
// MODUL BANK CENTRAL & EKONOMI REALTIME (BANK.JS)
// ==========================================

const BankModule = {
    timerInterval: null,

    // --- 1. ENSURE INITIAL STATE BANK & EKONOMI ---
    ensureBankState() {
        if (!window.gameState) window.gameState = {};
        if (typeof window.gameState.crest !== 'number') window.gameState.crest = 0;

        if (!window.gameState.economy) window.gameState.economy = {};
        if (typeof window.gameState.economy.savingsBalance !== 'number') {
            window.gameState.economy.savingsBalance = 0;
        }

        if (!window.gameState.economy.bankAccount) {
            const userNik = window.gameState?.user?.identity?.nik || 'TG-90128';
            window.gameState.economy.bankAccount = {
                accountNumber: 'CP-' + Math.floor(10000 + Math.random() * 90000),
                lastTickTimestamp: Date.now(),
                activeLoan: 0,
                loanInterestRate: 0.1, // 10% Bunga Pinjaman
                timeDeposits: [], // Deposito Berjangka
                mutationHistory: [] // Riwayat Mutasi Rekening
            };
        }

        const acc = window.gameState.economy.bankAccount;
        if (!acc.lastTickTimestamp) acc.lastTickTimestamp = Date.now();
        if (typeof acc.activeLoan !== 'number') acc.activeLoan = 0;
        if (!Array.isArray(acc.timeDeposits)) acc.timeDeposits = [];
        if (!Array.isArray(acc.mutationHistory)) acc.mutationHistory = [];
    },

    // --- 2. ENGINE BUNGA & PAJAK REAL-TIME (TICKER SYSTEM) ---
    // Dipanggil otomatis setiap interval waktu real-time
    processRealtimeBanking() {
        this.ensureBankState();

        const now = Date.now();
        const acc = window.gameState.economy.bankAccount;
        const lastTick = acc.lastTickTimestamp || now;
        const elapsedSeconds = Math.floor((now - lastTick) / 1000);

        // Interval perhitungan: Setiap 60 detik (1 Menit)
        const INTERVAL_SEC = 60;

        if (elapsedSeconds >= INTERVAL_SEC) {
            const cycles = Math.floor(elapsedSeconds / INTERVAL_SEC);
            acc.lastTickTimestamp = now;

            let updated = false;

            // A. PERHITUNGAN BUNGA TABUNGAN REALTIME (1% PER CYCLE ON SAVINGS)
            const savings = window.gameState.economy.savingsBalance || 0;
            if (savings > 0) {
                const interestRatePerCycle = 0.01; // 1% per menit
                const totalInterest = Math.floor(savings * interestRatePerCycle * cycles);

                if (totalInterest > 0) {
                    window.gameState.economy.savingsBalance += totalInterest;
                    this.addMutationLog('KREDIT', `Bunga Realtime Tabungan (${cycles}x)`, totalInterest);
                    updated = true;
                    if (typeof showToast === 'function') {
                        showToast(`💰 Bunga Realtime Tabungan Masuk (+${totalInterest.toLocaleString()} C)`, 'success');
                    }
                }
            }

            // B. PERHITUNGAN PAJAK KEKAYAAN & BIYA ADMIN REALTIME (0.2% PER CYCLE jika kekayaan > 10.000 C)
            const totalWealth = (window.gameState.crest || 0) + (window.gameState.economy.savingsBalance || 0);
            if (totalWealth >= 10000) {
                const taxRatePerCycle = 0.002; // 0.2% per menit
                const totalTax = Math.floor(totalWealth * taxRatePerCycle * cycles);

                if (totalTax > 0) {
                    // Potong dari saldo utama terlebih dahulu, jika kurang potong dari tabungan
                    if (window.gameState.crest >= totalTax) {
                        window.gameState.crest -= totalTax;
                    } else {
                        const remainder = totalTax - window.gameState.crest;
                        window.gameState.crest = 0;
                        window.gameState.economy.savingsBalance = Math.max(0, window.gameState.economy.savingsBalance - remainder);
                    }

                    this.addMutationLog('DEBIT', `Pajak Kekayaan Kota (${cycles}x)`, totalTax);
                    updated = true;
                    if (typeof showToast === 'function') {
                        showToast(`🏛️ Pajak Kekayaan Terpotong (-${totalTax.toLocaleString()} C)`, 'info');
                    }
                }
            }

            if (updated) {
                if (typeof window.saveState === 'function') window.saveState();
                if (typeof window.updateUI === 'function') window.updateUI();
            }
        }

        // C. CEK JATUH TEMPO DEPOSITO BERJANGKA REALTIME
        this.checkTimeDeposits();
    },

    // Inisialisasi Interval Ticker Realtime Tepat Saat Game Dibuka
    initRealtimeTicker() {
        this.ensureBankState();
        this.processRealtimeBanking();

        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // Ticker berjalan di background setiap 10 detik
        this.timerInterval = setInterval(() => {
            BankModule.processRealtimeBanking();
        }, 10000);
    },

    // --- 3. LOG MUTASI REKENING ---
    addMutationLog(type, description, amount) {
        this.ensureBankState();
        const acc = window.gameState.economy.bankAccount;
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        acc.mutationHistory.unshift({
            id: 'MUT-' + Date.now(),
            type: type, // 'KREDIT' (+ masuk) atau 'DEBIT' (- keluar)
            description: description,
            amount: amount,
            time: timeStr
        });

        // Simpan Maksimal 20 Mutasi Terakhir
        if (acc.mutationHistory.length > 20) {
            acc.mutationHistory.pop();
        }
    },

    // --- 4. RENDER UI MAIN BANK APP ---
    renderBankAppUI() {
        this.ensureBankState();
        this.processRealtimeBanking();

        const crest = window.gameState?.crest || 0;
        const savings = window.gameState?.economy?.savingsBalance || 0;
        const identity = window.gameState?.user?.identity || {};
        const bankAccount = window.gameState?.economy?.bankAccount;
        const deposits = bankAccount.timeDeposits || [];
        const history = bankAccount.mutationHistory || [];

        // Total Kekayaan Warga
        const totalWealth = crest + savings;

        // Render Mutasi History
        let historyHtml = '';
        if (history.length === 0) {
            historyHtml = `<p class="text-[10px] text-slate-500 text-center py-3">Belum ada transaksi mutasi rekening.</p>`;
        } else {
            history.forEach(m => {
                const isCredit = m.type === 'KREDIT';
                historyHtml += `
                    <div class="flex items-center justify-between py-1.5 border-b border-white/5 text-[10px]">
                        <div>
                            <span class="font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}">[${m.type}]</span>
                            <span class="text-slate-200 ml-1">${m.description}</span>
                            <span class="text-[8px] text-slate-500 block font-mono">${m.time}</span>
                        </div>
                        <span class="font-mono font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}">
                            ${isCredit ? '+' : '-'}${m.amount.toLocaleString()} C
                        </span>
                    </div>
                `;
            });
        }

        // Render Active Deposito
        let depositsHtml = '';
        if (deposits.length === 0) {
            depositsHtml = `<p class="text-[10px] text-slate-500 py-2">Belum ada investasi deposito aktif.</p>`;
        } else {
            const now = Date.now();
            deposits.forEach((dep, idx) => {
                const isReady = now >= dep.maturesAt;
                const remainingSec = Math.max(0, Math.ceil((dep.maturesAt - now) / 1000));

                depositsHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs border border-amber-500/30">
                        <div>
                            <h6 class="font-bold text-white text-[11px]">${dep.title} (+${dep.returnRate}% Return)</h6>
                            <span class="text-[9px] text-slate-400 font-mono">Modal: ${dep.amount.toLocaleString()} C ➔ Hasil: ${dep.payout.toLocaleString()} C</span>
                        </div>
                        ${isReady ? `
                            <button onclick="BankModule.claimDeposit(${idx})" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[9px] rounded-lg shadow-md animate-bounce">
                                Cairkan
                            </button>
                        ` : `
                            <span class="text-[9px] font-mono text-amber-300 font-bold px-2 py-0.5 bg-amber-500/20 rounded">
                                ⏳ ${remainingSec}s lagi
                            </span>
                        `}
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <!-- BLACK CARD VIRTUAL UTAMA -->
                <div class="w-full h-44 rounded-3xl p-4 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 border border-amber-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                            <i class="fa-solid fa-building-columns"></i> BANK CENTRAL IGNATIUS
                        </span>
                        <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[8px] font-bold rounded border border-emerald-500/30 animate-pulse">
                            REALTIME ONLINE
                        </span>
                    </div>

                    <div>
                        <span class="text-[8px] text-slate-400 uppercase font-mono block">Saldo Rekening Utama (Crest)</span>
                        <h2 class="text-2xl font-mono font-bold text-white tracking-wider">${crest.toLocaleString()} <span class="text-xs text-amber-400">C</span></h2>
                    </div>

                    <div class="flex justify-between items-end border-t border-white/10 pt-2 text-[9px]">
                        <div>
                            <span class="text-slate-500 block uppercase text-[7px]">Pemilik Rekening</span>
                            <span class="font-bold text-slate-200">${identity.fullName || 'Warga Ignatius'}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-slate-500 block uppercase text-[7px]">No. Rekening Digital</span>
                            <span class="font-mono font-bold text-amber-300">${bankAccount.accountNumber}</span>
                        </div>
                    </div>
                </div>

                <!-- DOMPET TABUNGAN REALTIME -->
                <div class="glass-ios p-4 rounded-3xl border border-emerald-500/30 space-y-3 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">💰 Saldo Tabungan Berbunga Realtime</span>
                            <h3 class="text-lg font-mono font-bold text-white">${savings.toLocaleString()} <span class="text-xs text-emerald-400">C</span></h3>
                        </div>
                        <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[8px] font-bold rounded-lg border border-emerald-500/30">
                            Bunga +1%/Menit
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="BankModule.depositSavingsPrompt()" class="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all">
                            <i class="fa-solid fa-arrow-down text-emerald-300"></i> Setor Tabungan
                        </button>
                        <button onclick="BankModule.withdrawSavingsPrompt()" class="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-lg border border-white/10 flex items-center justify-center gap-1.5 transition-all">
                            <i class="fa-solid fa-arrow-up text-amber-300"></i> Tarik Saldo
                        </button>
                    </div>
                </div>

                <!-- LOKET FITUR BARU: TRANSFER NIK & PINJAMAN KREDIT -->
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="BankModule.transferNikPrompt()" class="p-3 glass-ios rounded-2xl border border-sky-500/30 flex items-center gap-2.5 hover:border-sky-400 transition-all text-left">
                        <div class="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-base shrink-0">
                            <i class="fa-solid fa-paper-plane"></i>
                        </div>
                        <div>
                            <h5 class="text-xs font-bold text-white">Transfer NIK</h5>
                            <span class="text-[8px] text-slate-400">Kirim Crest antar warga</span>
                        </div>
                    </button>

                    <button onclick="BankModule.loanPrompt()" class="p-3 glass-ios rounded-2xl border border-purple-500/30 flex items-center gap-2.5 hover:border-purple-400 transition-all text-left">
                        <div class="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-base shrink-0">
                            <i class="fa-solid fa-hand-holding-dollar"></i>
                        </div>
                        <div>
                            <h5 class="text-xs font-bold text-white">Pinjaman Kredit</h5>
                            <span class="text-[8px] text-slate-400">Hutang: ${bankAccount.activeLoan.toLocaleString()} C</span>
                        </div>
                    </button>
                </div>

                <!-- INVESTASI DEPOSITO BERJANGKA (HIGH YIELD) -->
                <div class="glass-ios p-4 rounded-3xl border border-amber-500/30 space-y-3">
                    <div class="flex justify-between items-center">
                        <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fa-solid fa-chart-line"></i> Deposito Berjangka (High Yield)
                        </h4>
                        <button onclick="BankModule.createDepositPrompt()" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[9px] rounded-lg shadow-md">+ Investasi</button>
                    </div>
                    <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        ${depositsHtml}
                    </div>
                </div>

                <!-- MUTASI REKENING REALTIME LOG -->
                <div class="glass-ios p-4 rounded-3xl border border-white/10 space-y-2">
                    <div class="flex justify-between items-center border-b border-white/10 pb-2">
                        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fa-solid fa-receipt text-sky-400"></i> Mutasi Transaksi Rekening
                        </h4>
                        <span class="text-[8px] text-slate-500 font-mono">Realtime Log</span>
                    </div>
                    <div class="space-y-1 max-h-40 overflow-y-auto pr-1">
                        ${historyHtml}
                    </div>
                </div>
            </div>
        `;
    },

    // --- 5. FITUR SETOR TABUNGAN ---
    depositSavingsPrompt() {
        this.ensureBankState();
        const amountStr = prompt("Masukkan Nominal Crest yang Mau Disimpan ke Tabungan Berbunga:");
        if (!amountStr) return;
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0) {
            if (typeof showToast === 'function') showToast('Nominal tidak valid!', 'error');
            return;
        }

        if (window.gameState.crest < amount) {
            if (typeof showToast === 'function') showToast('Saldo Utama Crest tidak cukup!', 'error');
            return;
        }

        window.gameState.crest -= amount;
        window.gameState.economy.savingsBalance += amount;

        this.addMutationLog('DEBIT', 'Setor ke Tabungan Berbunga', amount);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil menyimpan ${amount.toLocaleString()} C ke Tabungan!`, 'success');
        if (typeof openApp === 'function') openApp('bank');
    },

    // --- 6. FITUR TARIK TABUNGAN ---
    withdrawSavingsPrompt() {
        this.ensureBankState();
        const savings = window.gameState?.economy?.savingsBalance || 0;
        const amountStr = prompt(`Masukkan Nominal yang Mau Ditarik (Maksimal Tabungan: ${savings.toLocaleString()} C):`);
        if (!amountStr) return;
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0 || amount > savings) {
            if (typeof showToast === 'function') showToast('Nominal tarik tidak valid atau melebihi saldo tabungan!', 'error');
            return;
        }

        window.gameState.economy.savingsBalance -= amount;
        window.gameState.crest += amount;

        this.addMutationLog('KREDIT', 'Tarik Saldo dari Tabungan', amount);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Berhasil menarik ${amount.toLocaleString()} C ke Saldo Utama!`, 'success');
        if (typeof openApp === 'function') openApp('bank');
    },

    // --- 7. FITUR NEW: TRANSFER P2P KE NIK WARGA ---
    transferNikPrompt() {
        this.ensureBankState();
        const targetNik = prompt("Masukkan NIK / ID Telegram Warga Penerima:");
        if (!targetNik || !targetNik.trim()) return;

        const amountStr = prompt("Masukkan Nominal Crest yang Mau Ditransfer:");
        if (!amountStr) return;
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0) {
            if (typeof showToast === 'function') showToast('Nominal transfer tidak valid!', 'error');
            return;
        }

        if (window.gameState.crest < amount) {
            if (typeof showToast === 'function') showToast('Saldo Utama tidak cukup untuk transfer!', 'error');
            return;
        }

        window.gameState.crest -= amount;
        this.addMutationLog('DEBIT', `Transfer ke NIK ${targetNik.trim()}`, amount);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Transfer ${amount.toLocaleString()} C ke ${targetNik.trim()} Berhasil!`, 'success');
        if (typeof openApp === 'function') openApp('bank');
    },

    // --- 8. FITUR NEW: PINJAMAN KREDIT BANK ---
    loanPrompt() {
        this.ensureBankState();
        const acc = window.gameState.economy.bankAccount;

        if (acc.activeLoan > 0) {
            const payConfirm = confirm(`Kamu memiliki tagihan pinjaman aktif sebesar ${acc.activeLoan.toLocaleString()} C. Bayar tagihan sekarang?`);
            if (payConfirm) {
                if (window.gameState.crest < acc.activeLoan) {
                    if (typeof showToast === 'function') showToast('Saldo Utama kurang untuk melunasi pinjaman!', 'error');
                    return;
                }
                window.gameState.crest -= acc.activeLoan;
                this.addMutationLog('DEBIT', 'Pelunasan Kredit Bank', acc.activeLoan);
                acc.activeLoan = 0;

                if (typeof window.saveState === 'function') window.saveState();
                if (typeof showToast === 'function') showToast('Pinjaman kredit berhasil dilunasi!', 'success');
                if (typeof openApp === 'function') openApp('bank');
            }
            return;
        }

        const amountStr = prompt("Masukkan Jumlah Pinjaman Kredit (Maksimal 20.000 C | Bunga 10%):");
        if (!amountStr) return;
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0 || amount > 20000) {
            if (typeof showToast === 'function') showToast('Nominal pinjaman tidak valid (Maksimal 20.000 C)!', 'error');
            return;
        }

        const totalToRepay = Math.floor(amount * 1.10); // +10% Bunga Kredit
        acc.activeLoan = totalToRepay;
        window.gameState.crest += amount;

        this.addMutationLog('KREDIT', 'Pencairan Pinjaman Bank', amount);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Pinjaman ${amount.toLocaleString()} C cair! Tagihan pelunasan: ${totalToRepay.toLocaleString()} C`, 'success');
        if (typeof openApp === 'function') openApp('bank');
    },

    // --- 9. FITUR NEW: INVESTASI DEPOSITO BERJANGKA ---
    createDepositPrompt() {
        this.ensureBankState();
        const planChoice = prompt("Pilih Paket Deposito:\n1. Paket Kilat (1 Menit | Return 15%)\n2. Paket Super (3 Menit | Return 40%)\n\nKetik angka 1 atau 2:");
        if (!planChoice) return;

        let durationSec = 60;
        let returnRate = 15;
        let title = 'Deposito Kilat 1m';

        if (planChoice === '2') {
            durationSec = 180;
            returnRate = 40;
            title = 'Deposito Super 3m';
        }

        const amountStr = prompt("Masukkan Modal Deposito (Crest):");
        if (!amountStr) return;
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0) {
            if (typeof showToast === 'function') showToast('Modal deposito tidak valid!', 'error');
            return;
        }

        if (window.gameState.crest < amount) {
            if (typeof showToast === 'function') showToast('Saldo Utama tidak cukup!', 'error');
            return;
        }

        window.gameState.crest -= amount;
        const payout = Math.floor(amount * (1 + returnRate / 100));

        const newDep = {
            id: 'DEP-' + Date.now(),
            title: title,
            amount: amount,
            payout: payout,
            returnRate: returnRate,
            createdAt: Date.now(),
            maturesAt: Date.now() + (durationSec * 1000)
        };

        window.gameState.economy.bankAccount.timeDeposits.push(newDep);
        this.addMutationLog('DEBIT', `Investasi ${title}`, amount);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Deposito ${amount.toLocaleString()} C aktif! Tunggu ${durationSec} detik.`, 'success');
        if (typeof openApp === 'function') openApp('bank');
    },

    checkTimeDeposits() {
        this.ensureBankState();
        const deposits = window.gameState.economy.bankAccount.timeDeposits;
        if (!deposits || deposits.length === 0) return;

        const now = Date.now();
        deposits.forEach(dep => {
            if (now >= dep.maturesAt && !dep.notified) {
                dep.notified = true;
                if (typeof showToast === 'function') {
                    showToast(`📈 Deposito "${dep.title}" milikmu sudah jatuh tempo! Cairkan di Bank Central.`, 'success');
                }
            }
        });
    },

    claimDeposit(index) {
        this.ensureBankState();
        const deposits = window.gameState.economy.bankAccount.timeDeposits;
        if (!deposits || !deposits[index]) return;

        const dep = deposits[index];
        const now = Date.now();

        if (now < dep.maturesAt) {
            if (typeof showToast === 'function') showToast('Deposito belum jatuh tempo!', 'warning');
            return;
        }

        window.gameState.crest += dep.payout;
        this.addMutationLog('KREDIT', `Pencairan ${dep.title}`, dep.payout);

        deposits.splice(index, 1);

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof playAudioSfx === 'function') playAudioSfx('cash');
        if (typeof showToast === 'function') showToast(`Pencairan Deposito Sukses! (+${dep.payout.toLocaleString()} C)`, 'success');
        if (typeof openApp === 'function') openApp('bank');
    }
};

// Inisialisasi Ticker Engine Realtime Tepat Saat Modul Dibaca
BankModule.initRealtimeTicker();

window.BankModule = BankModule;
