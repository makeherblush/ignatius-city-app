// ==========================================
// MODUL EKONOMI & TRANSAKSI CREST PAY (ECONOMY.JS)
// ==========================================

const EconomyModule = {
    transferCrest(targetNik, amount, note = 'Transfer Crest P2P') {
        amount = parseInt(amount);
        if (isNaN(amount) || amount <= 0) return false;

        if (window.gameState.crest < amount) {
            if (typeof showToast === 'function') showToast('Saldo Crest tidak mencukupi!', 'error');
            return false;
        }

        window.gameState.crest -= amount;
        window.gameState.economy.transactions.unshift({
            id: `TX-${Date.now()}`,
            type: 'OUT',
            amount: amount,
            title: note,
            toNik: targetNik,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });

        window.saveState();
        if (typeof showToast === 'function') showToast(`Berhasil mentransfer +${amount.toLocaleString()} C ke ${targetNik}`, 'success');
        return true;
    },

    buyItem(itemId) {
        const item = window.ITEMS_DATABASE.find(i => i.id === itemId);
        if (!item) return;

        if (window.gameState.crest < item.price) {
            if (typeof showToast === 'function') showToast('Saldo Crest tidak cukup!', 'error');
            return;
        }

        window.gameState.crest -= item.price;

        if (item.healVitality > 0) {
            window.gameState.vitality = Math.min(100, window.gameState.vitality + item.healVitality);
            if (typeof showToast === 'function') showToast(`Memakai ${item.name} (+${item.healVitality}% Vit)!`, 'success');
        } else {
            window.gameState.economy.inventory.push(item);
            if (typeof showToast === 'function') showToast(`Membeli ${item.name}! Masuk Inventory.`, 'success');
        }

        window.saveState();
    },

    renderCrestPayAppUI() {
        const crest = window.gameState.crest || 0;
        const txs = window.gameState.economy.transactions || [];

        let txHtml = '';
        if (txs.length === 0) {
            txHtml = `<p class="text-[10px] text-slate-500 text-center py-3">Belum ada riwayat transaksi.</p>`;
        } else {
            txs.slice(0, 4).forEach(tx => {
                txHtml += `
                    <div class="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2.5">
                            <div class="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                            </div>
                            <div>
                                <h5 class="font-bold text-white text-[11px]">${tx.title}</h5>
                                <span class="text-[9px] text-slate-400 font-mono">${tx.timestamp} • Ke: ${tx.toNik}</span>
                            </div>
                        </div>
                        <span class="font-mono font-bold text-rose-400 text-xs">-${tx.amount.toLocaleString()} C</span>
                    </div>
                `;
            });
        }

        let storeHtml = '';
        window.ITEMS_DATABASE.forEach(item => {
            storeHtml += `
                <div class="glass-card p-3 rounded-2xl flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                            <img src="${item.iconPng}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="hidden items-center justify-center w-full h-full text-amber-400 text-lg">
                                <i class="fa-solid ${item.iconFa}"></i>
                            </div>
                        </div>
                        <div>
                            <h5 class="text-xs font-bold text-white">${item.name}</h5>
                            <p class="text-[10px] text-slate-400">${item.desc}</p>
                        </div>
                    </div>
                    <button onclick="EconomyModule.buyItem('${item.id}'); openApp('economy');" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shrink-0">
                        ${item.price.toLocaleString()} C
                    </button>
                </div>
            `;
        });

        return `
            <div class="space-y-4">
                <div class="glass-ios p-5 rounded-3xl space-y-3 border border-amber-500/40 relative overflow-hidden">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-amber-400 tracking-wider">CREST PAY BANK IGNATIUS</span>
                        <i class="fa-solid fa-wallet text-amber-400 text-sm"></i>
                    </div>
                    <div>
                        <span class="text-[9px] text-slate-400 uppercase block font-mono">Total Saldo Aktif</span>
                        <h2 class="text-2xl font-mono font-bold text-white">${crest.toLocaleString()} <span class="text-xs text-amber-400">Crest</span></h2>
                    </div>
                    <div class="pt-1">
                        <button onclick="EconomyModule.showTransferPrompt()" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg">
                            <i class="fa-solid fa-paper-plane mr-1"></i> Kirim Crest P2P
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">📊 Mutasi Terakhir</h4>
                    <div class="space-y-2">${txHtml}</div>
                </div>

                <div class="space-y-2 pt-2">
                    <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">🛒 Pasar & Supermarket Kota</h4>
                    <div class="space-y-2">${storeHtml}</div>
                </div>
            </div>
        `;
    },

    showTransferPrompt() {
        const targetNik = prompt("Masukkan NIK / ID Telegram Tujuan:");
        if (!targetNik) return;
        const amount = prompt("Masukkan Nominal Crest:");
        if (!amount) return;
        const note = prompt("Catatan (Opsional):") || 'Transfer Crest P2P';

        this.transferCrest(targetNik, amount, note);
        openApp('economy');
    }
};

window.EconomyModule = EconomyModule;
