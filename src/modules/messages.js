// ==========================================
// MODUL PESAN & CHAT LINE-STYLE (MESSAGES.JS)
// ==========================================

const MessagesModule = {
    initChats() {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.chats) {
            window.gameState.chats = {
                contacts: [
                    { nik: 'TG-8853198899', name: 'Owner / Admin Kota', avatar: 'https://ui-avatars.com/api/?name=Admin+Kota&background=10b981&color=fff' }
                ],
                activeChatNik: null,
                messagesHistory: {
                    'TG-8853198899': [
                        { sender: 'them', text: 'Halo! Selamat datang di IgnaTalk Kota Ignatius.', time: '12:00' }
                    ]
                }
            };
        }
    },

    addContactPrompt() {
        this.initChats();
        const targetNik = prompt("Masukkan NIK / ID Telegram Warga yang mau di-chat:");
        if (!targetNik) return;

        const existing = window.gameState.chats.contacts.find(c => c.nik === targetNik);
        if (existing) {
            this.openChatRoom(targetNik);
            return;
        }

        const name = prompt("Nama Kontak (Opsional):") || `Warga (${targetNik})`;
        const newContact = {
            nik: targetNik,
            name: name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`
        };

        window.gameState.chats.contacts.push(newContact);
        if (!window.gameState.chats.messagesHistory[targetNik]) {
            window.gameState.chats.messagesHistory[targetNik] = [];
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Kontak ${name} tersinkron & ditambahkan!`, 'success');
        this.openChatRoom(targetNik);
    },

    openChatRoom(nik) {
        this.initChats();
        window.gameState.chats.activeChatNik = nik;
        if (typeof openApp === 'function') openApp('messages');
    },

    closeChatRoom() {
        this.initChats();
        window.gameState.chats.activeChatNik = null;
        if (typeof openApp === 'function') openApp('messages');
    },

    sendMessage() {
    this.initChats();
    const input = document.getElementById('chat-input-msg');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    const activeNik = window.gameState.chats.activeChatNik;
    if (!activeNik) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (!window.gameState.chats.messagesHistory[activeNik]) {
        window.gameState.chats.messagesHistory[activeNik] = [];
    }

    // Simpan pesan murni dari pengirim
    window.gameState.chats.messagesHistory[activeNik].push({
        sender: 'me',
        text: text,
        time: timeStr
    });

    input.value = '';
    if (typeof window.saveState === 'function') window.saveState();
    if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
    if (typeof openApp === 'function') openApp('messages');
}

        // Simulated Response / Auto Reply
        setTimeout(() => {
            if (window.gameState.chats.activeChatNik === activeNik) {
                window.gameState.chats.messagesHistory[activeNik].push({
                    sender: 'them',
                    text: 'Pesan kamu sudah masuk & tersinkron!',
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                });
                if (typeof window.saveState === 'function') window.saveState();
                if (typeof openApp === 'function') openApp('messages');
            }
        }, 1000);

        if (typeof openApp === 'function') openApp('messages');
    },

    renderMessagesAppUI() {
        this.initChats();
        const activeNik = window.gameState.chats.activeChatNik;
        const contacts = window.gameState.chats.contacts || [];

        // 1. TAMPILAN DALAM RUANG CHAT (CHAT ROOM)
        if (activeNik) {
            const contact = contacts.find(c => c.nik === activeNik) || { name: `Warga (${activeNik})`, nik: activeNik, avatar: 'https://ui-avatars.com/api/?name=Warga' };
            const msgs = window.gameState.chats.messagesHistory[activeNik] || [];

            let msgsHtml = '';
            msgs.forEach(m => {
                const isMe = m.sender === 'me';
                msgsHtml += `
                    <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5">
                        <div class="max-w-[78%] px-3 py-2 rounded-2xl text-xs ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'glass-card text-white border border-white/10 rounded-tl-none'}">
                            ${m.text}
                        </div>
                        <span class="text-[8px] text-slate-400 px-1 font-mono">${m.time}</span>
                    </div>
                `;
            });

            return `
                <div class="flex flex-col h-full justify-between space-y-3 pt-1">
                    <div class="glass-ios p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between shrink-0">
                        <div class="flex items-center gap-2.5">
                            <button onclick="MessagesModule.closeChatRoom()" class="text-xs text-sky-400 font-bold flex items-center gap-1 pr-1">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <img src="${contact.avatar}" class="w-8 h-8 rounded-full object-cover border border-emerald-400/40" alt="PP">
                            <div>
                                <h4 class="text-xs font-bold text-white">${contact.name}</h4>
                                <span class="text-[9px] text-emerald-400 font-mono">${contact.nik}</span>
                            </div>
                        </div>
                        <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[8px] font-bold rounded">ONLINE</span>
                    </div>

                    <div class="flex-1 overflow-y-auto space-y-2.5 p-1 max-h-[280px]">
                        ${msgsHtml || '<p class="text-[10px] text-slate-500 text-center py-6">Belum ada obrolan. Ketik pesan di bawah!</p>'}
                    </div>

                    <div class="flex gap-2 pt-1 border-t border-white/10 shrink-0">
                        <input type="text" id="chat-input-msg" onkeydown="if(event.key==='Enter') MessagesModule.sendMessage()" placeholder="Ketik pesan..." class="flex-1 px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500">
                        <button onclick="MessagesModule.sendMessage()" class="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // 2. TAMPILAN DAFTAR KONTAK & PESAN (LINE / IGNA TALK)
        let contactsHtml = '';
        if (contacts.length === 0) {
            contactsHtml = `<p class="text-[10px] text-slate-500 text-center py-8">Belum ada kontak. Klik "+ Tambah Teman" untuk mulai chat!</p>`;
        } else {
            contacts.forEach(c => {
                const lastMsgs = window.gameState.chats.messagesHistory[c.nik] || [];
                const lastMsg = lastMsgs.length > 0 ? lastMsgs[lastMsgs.length - 1].text : 'Klik untuk mulai obrolan';

                contactsHtml += `
                    <div onclick="MessagesModule.openChatRoom('${c.nik}')" class="glass-card p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all">
                        <div class="flex items-center gap-3">
                            <img src="${c.avatar}" class="w-10 h-10 rounded-2xl object-cover border border-emerald-500/30 shrink-0" alt="PP">
                            <div class="overflow-hidden">
                                <h5 class="text-xs font-bold text-white">${c.name}</h5>
                                <p class="text-[10px] text-slate-400 truncate max-w-[180px]">${lastMsg}</p>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-xs text-slate-500"></i>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-emerald-500/40 space-y-2 bg-gradient-to-br from-slate-900 to-emerald-950/60">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-comments text-emerald-400 text-base"></i>
                            <h4 class="text-xs font-bold text-emerald-300 uppercase tracking-wider">IGNA TALK (LINE CHAT)</h4>
                        </div>
                        <button onclick="MessagesModule.addContactPrompt()" class="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg shadow-md flex items-center gap-1">
                            <i class="fa-solid fa-user-plus text-[9px]"></i> Tambah Teman
                        </button>
                    </div>
                    <p class="text-[10px] text-slate-300">Aplikasi perpesanan instan sekota. Masukkan NIK / ID Telegram untuk terhubung.</p>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">💬 Daftar Obrolan & Kontak</h4>
                    <div class="space-y-2">
                        ${contactsHtml}
                    </div>
                </div>
            </div>
        `;
    }
};

window.MessagesModule = MessagesModule;
