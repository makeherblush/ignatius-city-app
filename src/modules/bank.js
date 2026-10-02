// ==========================================
// MODUL BANK DIGITAL & KEUTANGAN (BANK.JS)
// ==========================================

const BankModule = {
    renderBankAppUI() {
        const crest = window.gameState.crest || 0;
        const bankAccount = window.gameState.economy.bankAccount || { accountNumber: 'CP-90128', pin: '1234' };
        const identity = window.gameState.user.identity || {};
        const txs = window.gameState.economy.transactions || [];

        let txHtml = '';
        if (txs.length === 0) {
            txHtml = `<p class="text-[10px] text-slate-500 text-center py-3">Belum ada riwayat transaksi bank.</p>`;
        } else {
            txs.slice(0, 5).forEach(tx => {
                txHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2.5">
                            <div class="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                            </div>
                            <div>
                                <h5 class="font-bold text-white text-[11px]">${tx.title}</h5>
                                <span class="text-[9px] text-slate-400 font-mono">${tx.timestamp} • Target: ${tx.toNik}</span>
                            </div>
                        </div>
                        <span class="font-mono font-bold text-rose-400 text-xs">-${tx.amount.toLocaleString()} C</span>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <!-- BLACK CARD DEBIT DIGITAL -->
                <div class="w-full h-48 rounded-3xl p-4 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 border border-amber-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-amber-400 uppercase tracking-widest">BANK CENTRAL IGNATIUS</span>
                        <i class="fa-solid fa-building-columns text-amber-400 text-base"></i>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="w-9 h-7 rounded-md bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                            <div class="w-6 h-4 border border-slate-900/60 rounded-xs"></div>
                        </div>
                        <i class="fa-solid fa-wifi text-slate-400 text-xs rotate-90"></i>
                    </div>

                    <div>
                        <span class="text-[8px] text-slate-400 uppercase font-mono block">Saldo Utama Rekening</span>
                        <h2 class="text-2xl font-mono font-bold text-white tracking-wider">${crest.toLocaleString()} <span class="text-xs text-amber-400">Crest</span></h2>
                    </div>

                    <div class="flex justify-between items-end border-t border-white/10 pt-2 text-[9px]">
                        <div>
                            <span class="text-slate-500 block uppercase text-[7px]">Pemilik Rekening</span>
                            <span class="font-bold text-slate-200">${identity.fullName || 'Warga Ignatius'}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-slate-500 block uppercase text-[7px]">No. Rekening</span>
                            <span class="font-mono font-bold text-amber-300">${bankAccount.accountNumber}</span>
                        </div>
                    </div>
                </div>

                <!-- MENU AKSI QUICK BANK -->
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="EconomyModule.showTransferPrompt()" class="p-3 glass-ios rounded-2xl border border-amber-500/30 flex items-center gap-3 hover:bg-amber-500/10">
                        <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-paper-plane"></i>
                        </div>
                        <div class="text-left">
                            <h5 class="text-xs font-bold text-white">Transfer</h5>
                            <span class="text-[9px] text-slate-400">Kirim Crest P2P</span>
                        </div>
                    </button>

                    <button onclick="showToast('Fitur Deposito Bunga 5%/Shift Aktif!', 'success')" class="p-3 glass-ios rounded-2xl border border-emerald-500/30 flex items-center gap-3 hover:bg-emerald-500/10">
                        <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-piggy-bank"></i>
                        </div>
                        <div class="text-left">
                            <h5 class="text-xs font-bold text-white">Tabungan</h5>
                            <span class="text-[9px] text-slate-400">Bunga Shift 5%</span>
                        </div>
                    </button>
                </div>

                <!-- RIWAYAT MUTASI -->
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">📊 Mutasi Transaksi Terakhir</h4>
                    <div class="space-y-2">
                        ${txHtml}
                    </div>
                </div>
            </div>
        `;
    }
};

window.BankModule = BankModule;
