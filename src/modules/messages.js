// ==========================================
// ENGINE PERPESANAN WEBSOCKET REALTIME (MESSAGES.JS)
// ==========================================

const TelegramUserBridge = {
    getApiUrl() {
        return window.APP_CONFIG?.API_URL || window.location.origin;
    },

    getRealUser() {
        const identity = window.gameState?.user?.identity || {};
        let myNik = identity.nik || 'TG-320199201';

        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            myNik = `TG-${tgUser.id}`;
        }

        const fullName = identity.fullName || (window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Warga');

        return {
            nik: String(myNik).trim(),
            name: fullName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`
        };
    }
};

const MessagingService = {
    socket: null,
    onlineUsersSet: new Set(),

    getConversationId(nikA, nikB) {
        return 'conv_' + [String(nikA).trim(), String(nikB).trim()].sort().join('_');
    },

    // INISIALISASI KONEKSI WEBSOCKET INSTAN
    initSocket() {
        if (this.socket) return;

        const baseUrl = TelegramUserBridge.getApiUrl();
        if (typeof io === 'undefined') {
            console.error('[SocketError]: SDK Socket.io belum di-load di index.html!');
            return;
        }

        this.socket = io(baseUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10
        });

        const me = TelegramUserBridge.getRealUser();

        // 1. Register NIK ke server setelah terkoneksi
        this.socket.on('connect', () => {
            this.socket.emit('register_user', me.nik);
        });

        // 2. Menerima Pesan Real-Time Masuk
        this.socket.on('receive_message', (msg) => {
            this.handleIncomingMessage(msg);
        });

        // 3. Konfirmasi Pesan Terkirim
        this.socket.on('message_sent_confirm', (msg) => {
            this.saveMessageToLocal(msg);
        });

        // 4. Update Daftar User Online Live
        this.socket.on('online_users_list', (usersArray) => {
            this.onlineUsersSet = new Set(usersArray);
            if (typeof openApp === 'function' && window.gameState?.chats?.activeConvId === null) {
                // Re-render UI list kontak untuk update titik hijau online
                openApp('messages');
            }
        });
    },

    // OLah Pesan Masuk dari Socket
    handleIncomingMessage(msg) {
        this.saveMessageToLocal(msg);

        const me = TelegramUserBridge.getRealUser();
        if (String(msg.senderNik) !== String(me.nik)) {
            if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
            if (typeof window.showIOSNotification === 'function') {
                window.showIOSNotification(msg.senderName || `NIK: ${msg.senderNik}`, msg.text, 'Igna Talk', 'fa-comment');
            }
        }

        if (typeof openApp === 'function') openApp('messages');
    },

    saveMessageToLocal(msg) {
        if (!window.gameState.chats) window.gameState.chats = { conversations: {}, contacts: [] };
        
        const convId = this.getConversationId(msg.senderNik, msg.recipientNik);
        const chats = window.gameState.chats;

        if (!chats.conversations[convId]) {
            chats.conversations[convId] = {
                id: convId,
                participants: [msg.senderNik, msg.recipientNik],
                messages: [],
                lastMessageAt: msg.createdAt
            };
        }

        const exists = chats.conversations[convId].messages.some(m => m.id === msg.id);
        if (!exists) {
            chats.conversations[convId].messages.push(msg);
            chats.conversations[convId].lastMessageAt = msg.createdAt;
            if (typeof window.saveState === 'function') window.saveState();
        }
    },

    // KIRIM PESAN VIA SOCKET
    sendMessage({ senderNik, senderName, recipientNik, text, type = 'text', payload = null }) {
        if (!this.socket) this.initSocket();

        this.socket.emit('send_message', {
            senderNik,
            senderName,
            recipientNik,
            text,
            type,
            payload
        });
    },

    isUserOnline(nik) {
        return this.onlineUsersSet.has(String(nik).trim());
    }
};

const MessagesModule = {
    searchQuery: '',

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

    initChats() {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.chats) {
            window.gameState.chats = {
                contacts: [],
                activeConvId: null,
                conversations: {}
            };
        }
        if (!window.gameState.chats.conversations) {
            window.gameState.chats.conversations = {};
        }
        if (!Array.isArray(window.gameState.chats.contacts)) {
            window.gameState.chats.contacts = [];
        }

        // Aktifkan Socket Connection
        MessagingService.initSocket();
    },

    addContactPrompt() {
        this.initChats();
        const me = TelegramUserBridge.getRealUser();
        const targetNik = prompt("Masukkan NIK Warga Target:");
        if (!targetNik || !targetNik.trim()) return;

        const cleanNik = targetNik.trim();

        if (String(cleanNik) === String(me.nik)) {
            if (typeof showToast === 'function') showToast('Kamu tidak bisa menambahkan NIK milikmu sendiri!', 'error');
            return;
        }

        const namePrompt = prompt("Nama Kontak (Opsional):") || `Warga (${cleanNik})`;

        const targetUser = {
            nik: cleanNik,
            name: namePrompt,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(namePrompt)}&background=0284c7&color=fff`
        };

        const existingIndex = window.gameState.chats.contacts.findIndex(c => c.nik === cleanNik);
        if (existingIndex === -1) {
            window.gameState.chats.contacts.push(targetUser);
        } else {
            window.gameState.chats.contacts[existingIndex] = targetUser;
        }

        const convId = MessagingService.getConversationId(me.nik, cleanNik);
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Kontak NIK ${cleanNik} Ditambahkan!`, 'success');
        
        this.openChatRoom(convId);
    },

    deleteContact(nik) {
        this.initChats();
        const confirmDelete = confirm(`Hapus kontak NIK (${nik}) beserta seluruh chat-nya?`);
        if (!confirmDelete) return;

        const me = TelegramUserBridge.getRealUser();
        const chats = window.gameState.chats;

        chats.contacts = chats.contacts.filter(c => c.nik !== nik);
        const convId = MessagingService.getConversationId(me.nik, nik);
        if (chats.conversations[convId]) {
            delete chats.conversations[convId];
        }

        if (chats.activeConvId === convId) {
            chats.activeConvId = null;
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast('Kontak & percakapan berhasil dihapus!', 'info');
        
        openApp('messages');
    },

    openChatRoom(convId) {
        this.initChats();
        window.gameState.chats.activeConvId = convId;
        if (typeof openApp === 'function') openApp('messages');
    },

    closeChatRoom() {
        this.initChats();
        window.gameState.chats.activeConvId = null;
        if (typeof openApp === 'function') openApp('messages');
    },

    sendMessage() {
        this.initChats();
        const input = document.getElementById('chat-input-msg');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        const activeConvId = window.gameState.chats.activeConvId;
        if (!activeConvId) return;

        const me = TelegramUserBridge.getRealUser();
        const conv = window.gameState.chats.conversations[activeConvId];
        
        let targetNik = conv ? conv.participants.find(p => p !== me.nik) : null;
        if (!targetNik) {
            const parts = activeConvId.replace('conv_', '').split('_');
            targetNik = parts.find(p => p !== me.nik) || parts[0];
        }

        let targetUser = window.gameState.chats.contacts.find(c => c.nik === targetNik) || {
            nik: targetNik,
            name: `Warga (${targetNik})`
        };

        MessagingService.sendMessage({
            senderNik: me.nik,
            senderName: me.name,
            recipientNik: targetUser.nik,
            text: text,
            type: 'text'
        });

        input.value = '';
    },

    shareCurrentLocation() {
        this.initChats();
        const activeConvId = window.gameState.chats.activeConvId;
        if (!activeConvId) return;

        const me = TelegramUserBridge.getRealUser();
        const currentLocId = window.gameState?.map?.currentLocId || 'loc_capil';
        const locs = (window.MapModule && typeof window.MapModule.getLocationsList === 'function') ? window.MapModule.getLocationsList() : [];
        const currentLoc = locs.find(l => l.id === currentLocId) || { name: 'Pusat Kota', district: 'Downtown' };

        const conv = window.gameState.chats.conversations[activeConvId];
        const targetNik = conv ? conv.participants.find(p => p !== me.nik) : activeConvId.replace('conv_', '').replace(me.nik, '').replace('_', '');

        MessagingService.sendMessage({
            senderNik: me.nik,
            senderName: me.name,
            recipientNik: targetNik,
            text: `📍 Berbagi Lokasi GPS: ${currentLoc.name} (${currentLoc.district})`,
            type: 'location',
            payload: { locId: currentLocId, name: currentLoc.name }
        });

        if (typeof showToast === 'function') showToast('Lokasi GPS dikirim!', 'success');
    },

    renderMessagesAppUI() {
        this.initChats();
        const me = TelegramUserBridge.getRealUser();
        const activeConvId = window.gameState.chats.activeConvId;
        const chats = window.gameState.chats;
        const contacts = chats.contacts || [];

        // 1. RUANG CHAT AKTIF
        if (activeConvId) {
            const conv = chats.conversations[activeConvId] || { messages: [] };
            let targetNik = conv.participants ? conv.participants.find(p => p !== me.nik) : null;
            if (!targetNik) {
                const parts = activeConvId.replace('conv_', '').split('_');
                targetNik = parts.find(p => p !== me.nik) || parts[0];
            }
            
            let targetUser = contacts.find(c => c.nik === targetNik) || { name: `Warga (${targetNik})`, nik: targetNik, avatar: 'https://ui-avatars.com/api/?name=Warga' };
            const isOnline = MessagingService.isUserOnline(targetUser.nik);

            let msgsHtml = '';
            conv.messages.forEach(m => {
                const isMe = String(m.senderNik) === String(me.nik);
                const timeStr = new Date(m.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                if (m.type === 'location') {
                    msgsHtml += `
                        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5">
                            <div class="max-w-[80%] p-3 rounded-2xl text-xs bg-sky-900/80 border border-sky-400/40 text-white shadow-lg space-y-1">
                                <span class="font-bold text-sky-300 block flex items-center gap-1.5 text-[11px]">
                                    <i class="fa-solid fa-location-dot text-rose-400"></i> Lokasi GPS Dibagikan
                                </span>
                                <p class="text-[10px] text-slate-200">${this.escapeHTML(m.text)}</p>
                            </div>
                            <span class="text-[8px] text-slate-400 px-1 font-mono">${timeStr}</span>
                        </div>
                    `;
                } else {
                    msgsHtml += `
                        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5">
                            <div class="max-w-[78%] px-3.5 py-2 rounded-2xl text-xs ${isMe ? 'bg-emerald-600 text-white rounded-tr-none shadow-md' : 'glass-card text-white border border-white/10 rounded-tl-none'}">
                                ${this.escapeHTML(m.text)}
                            </div>
                            <div class="flex items-center gap-1 px-1">
                                <span class="text-[8px] text-slate-400 font-mono">${timeStr}</span>
                                ${isMe ? '<i class="fa-solid fa-check-double text-[8px] text-emerald-400"></i>' : ''}
                            </div>
                        </div>
                    `;
                }
            });

            return `
                <div class="flex flex-col h-full justify-between space-y-3 pt-1">
                    <div class="glass-ios p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between shrink-0 shadow-lg">
                        <div class="flex items-center gap-2.5">
                            <button onclick="MessagesModule.closeChatRoom()" class="text-xs text-sky-400 font-bold flex items-center gap-1 pr-1 active:scale-95">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <div class="relative">
                                <img src="${targetUser.avatar}" class="w-8 h-8 rounded-full object-cover border border-emerald-400/40" alt="PP">
                                ${isOnline ? '<div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>' : ''}
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
                                    ${this.escapeHTML(targetUser.name)}
                                    <span class="text-[8px] font-mono ${isOnline ? 'text-emerald-400' : 'text-slate-500'}">(${isOnline ? 'Online' : 'Offline'})</span>
                                </h4>
                                <span class="text-[9px] text-slate-400 font-mono">NIK: ${this.escapeHTML(targetUser.nik)}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-1">
                            <button onclick="MessagesModule.shareCurrentLocation()" class="p-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-xs rounded-xl transition-all" title="Bagikan Lokasi GPS">
                                <i class="fa-solid fa-location-crosshairs"></i>
                            </button>
                            <button onclick="MessagesModule.deleteContact('${targetUser.nik}')" class="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-xs rounded-xl transition-all" title="Hapus Kontak & Chat">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto space-y-2.5 p-1 max-h-[280px]">
                        ${msgsHtml || '<p class="text-[10px] text-slate-500 text-center py-8">Belum ada obrolan. Ketik pesan di bawah!</p>'}
                    </div>

                    <div class="flex gap-2 pt-1 border-t border-white/10 shrink-0">
                        <input type="text" id="chat-input-msg" onkeydown="if(event.key==='Enter') MessagesModule.sendMessage()" 
                               placeholder="Ketik pesan..." 
                               class="flex-1 px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 shadow-inner">
                        <button onclick="MessagesModule.sendMessage()" class="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // 2. DAFTAR KONTAK WARGA
        let contactsHtml = '';
        const filteredList = contacts.filter(c => 
            !this.searchQuery || 
            c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
            c.nik.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

        if (filteredList.length === 0) {
            contactsHtml = `
                <div class="glass-card p-6 rounded-2xl text-center space-y-2">
                    <p class="text-[10px] text-slate-400">Belum ada kontak terhubung.</p>
                    <button onclick="MessagesModule.addContactPrompt()" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md">
                        + Tambah Kontak NIK
                    </button>
                </div>
            `;
        } else {
            filteredList.forEach(c => {
                const convId = MessagingService.getConversationId(me.nik, c.nik);
                const conv = chats.conversations[convId];
                const lastMsgs = conv ? conv.messages : [];
                const lastMsgObj = lastMsgs.length > 0 ? lastMsgs[lastMsgs.length - 1] : null;
                const lastMsgText = lastMsgObj ? lastMsgObj.text : 'Klik untuk membuka percakapan';
                const timeStr = lastMsgObj ? new Date(lastMsgObj.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
                const isOnline = MessagingService.isUserOnline(c.nik);

                contactsHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 transition-all">
                        <div onclick="MessagesModule.openChatRoom('${convId}')" class="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer">
                            <div class="relative shrink-0">
                                <img src="${c.avatar}" class="w-10 h-10 rounded-2xl object-cover border border-emerald-500/30" alt="PP">
                                ${isOnline ? '<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>' : '<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-slate-600 border-2 border-slate-900 rounded-full"></div>'}
                            </div>
                            <div class="overflow-hidden">
                                <div class="flex items-center gap-2">
                                    <h5 class="text-xs font-bold text-white">${this.escapeHTML(c.name)}</h5>
                                    <span class="text-[8px] text-slate-500 font-mono">${timeStr}</span>
                                </div>
                                <p class="text-[10px] text-slate-400 truncate max-w-[170px]">${this.escapeHTML(lastMsgText)}</p>
                            </div>
                        </div>

                        <button onclick="MessagesModule.deleteContact('${c.nik}')" class="p-2 text-slate-500 hover:text-rose-400 text-xs transition-all" title="Hapus Kontak">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/60 shadow-xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[8px] text-sky-400 font-mono uppercase font-bold block flex items-center gap-1">
                                <i class="fa-solid fa-wifi text-emerald-400 animate-pulse"></i> REALTIME SOCKET MESSAGING
                            </span>
                            <h4 class="text-xs font-bold text-white">${this.escapeHTML(me.name)} (NIK: ${this.escapeHTML(me.nik)})</h4>
                        </div>
                        <button onclick="MessagesModule.addContactPrompt()" class="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px] rounded-xl shadow-md flex items-center gap-1 transition-all active:scale-95">
                            <i class="fa-solid fa-user-plus text-[9px]"></i> + Tambah NIK
                        </button>
                    </div>
                </div>

                <div class="relative">
                    <input type="text" value="${this.searchQuery}" oninput="MessagesModule.searchQuery = this.value; if(typeof openApp==='function') openApp('messages');" 
                           placeholder="🔍 Cari NIK atau nama..." 
                           class="w-full px-4 py-2 bg-slate-900/90 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium">
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">💬 Daftar Kontak NIK & Obrolan</h4>
                    <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                        ${contactsHtml}
                    </div>
                </div>
            </div>
        `;
    }
};

MessagesModule.initChats();

window.TelegramUserBridge = TelegramUserBridge;
window.MessagingService = MessagingService;
window.MessagesModule = MessagesModule;
