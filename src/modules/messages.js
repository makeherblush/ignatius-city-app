// ==========================================
// ENGINE PERPESANAN REAL TELEGRAM SYNC V5 (MESSAGES.JS)
// ==========================================

// --- 1. TELEGRAM REAL USER CONNECTOR ---
const TelegramUserBridge = {
    // URL Backend Railway kamu
    RAILWAY_BACKEND_URL: 'https://nama-app-lu.up.railway.app/api/send-telegram', 

    getRealUser() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            const username = tgUser.username ? `@${tgUser.username}` : `id_${tgUser.id}`;
            const fullName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'Warga Telegram';
            
            return {
                userId: String(tgUser.id),
                nik: `TG-${tgUser.id}`,
                telegramId: username,
                name: fullName,
                avatar: tgUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`,
                isRealTelegram: true
            };
        }

        // Fallback testing lokal browser
        return {
            userId: 'usr_me_real',
            nik: 'TG-90128',
            telegramId: '@me_demo',
            name: 'Warga Real (Local)',
            avatar: 'https://ui-avatars.com/api/?name=Warga+Real&background=10b981&color=fff',
            isRealTelegram: false
        };
    }
};

// --- 2. USER DIRECTORY & CONTACT MANAGEMENT ---
const UserDirectoryModule = {
    getUsers() {
        if (!window.virtualUsers || !Array.isArray(window.virtualUsers)) {
            window.virtualUsers = [];
        }
        return window.virtualUsers;
    },

    findUser(query) {
        if (!query) return null;
        let q = query.trim().toLowerCase();
        const users = this.getUsers();
        
        return users.find(u => 
            u.telegramId.toLowerCase() === q || 
            u.nik.toLowerCase() === q || 
            u.userId.toLowerCase() === q
        ) || null;
    }
};

// --- 3. MESSAGING SERVICE & RAILWAY RELAY ---
const MessagingService = {
    getConversationId(myId, targetId) {
        return 'conv_' + [String(myId), String(targetId)].sort().join('_');
    },

    async sendMessage({ sender, recipient, text, type = 'text', payload = null }) {
        if (!window.gameState.chats) window.gameState.chats = { conversations: {}, contacts: [] };
        
        const activeConvId = window.gameState.chats.activeConvId;
        const convId = activeConvId || this.getConversationId(sender.userId, recipient.userId);
        const msgId = 'msg_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);

        const message = {
            id: msgId,
            conversationId: convId,
            senderId: sender.userId,
            senderName: sender.name,
            recipientId: recipient.userId,
            recipientTelegramId: recipient.telegramId,
            type: type,
            text: text,
            payload: payload,
            createdAt: Date.now(),
            status: 'sent'
        };

        const chats = window.gameState.chats;
        if (!chats.conversations[convId]) {
            chats.conversations[convId] = {
                id: convId,
                participants: [sender.userId, recipient.userId],
                messages: [],
                unreadCount: 0,
                lastMessageAt: Date.now()
            };
        }

        // Push langsung ke memori chat aktif
        chats.conversations[convId].messages.push(message);
        chats.conversations[convId].lastMessageAt = Date.now();

        if (typeof window.saveState === 'function') window.saveState();

        // Kirim log ke backend Railway
        this.dispatchToRailwayBackend(sender, recipient, text);

        return message;
    },

    async dispatchToRailwayBackend(sender, recipient, text) {
        try {
            // Ambil ID Angka Telegram murni
            let cleanTgId = recipient.userId;
            if (recipient.nik && recipient.nik.startsWith('TG-')) {
                cleanTgId = recipient.nik.replace('TG-', '');
            }

            // Telegram API hanya bisa kirim ke ID angka murni
            if (!cleanTgId || isNaN(cleanTgId)) {
                console.warn('[TelegramBridge]: Pengiriman bot dilewati karena sasaran menggunakan @username, bukan ID Angka Telegram.');
                return;
            }

            await fetch(TelegramUserBridge.RAILWAY_BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientTgId: cleanTgId,
                    senderName: sender.name,
                    senderTag: sender.telegramId,
                    text: text
                })
            });
        } catch (err) {
            console.warn('[Railway Relay Error]: Gagal menghubungkan ke backend Railway:', err);
        }
    }
};

// --- 4. MESSAGES MODULE (UI & CONTROLLER) ---
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
    },

    // FITUR TAMBAH KONTAK
    addContactPrompt() {
        this.initChats();
        const me = TelegramUserBridge.getRealUser();
        const query = prompt("Masukkan ID Angka Telegram (Misal: 12345678) atau Username (@username):");
        if (!query || !query.trim()) return;

        const cleanQuery = query.trim();
        const isNumeric = !isNaN(cleanQuery) || !isNaN(cleanQuery.replace('TG-', ''));
        const cleanId = cleanQuery.replace('TG-', '').replace('@', '');

        if (String(cleanId) === String(me.userId)) {
            if (typeof showToast === 'function') showToast('Kamu tidak bisa menambah ID kamu sendiri!', 'error');
            return;
        }

        const targetUser = {
            userId: cleanId,
            nik: `TG-${cleanId}`,
            telegramId: isNumeric ? `ID: ${cleanId}` : `@${cleanId}`,
            name: isNumeric ? `Warga (${cleanId})` : cleanQuery,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanQuery)}&background=0284c7&color=fff`,
            isRealTelegram: true
        };

        const existingIndex = window.gameState.chats.contacts.findIndex(c => c.userId === targetUser.userId);
        if (existingIndex === -1) {
            window.gameState.chats.contacts.push(targetUser);
        } else {
            window.gameState.chats.contacts[existingIndex] = targetUser;
        }

        const convId = MessagingService.getConversationId(me.userId, targetUser.userId);
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Kontak ${targetUser.name} Berhasil Ditambahkan!`, 'success');
        
        this.openChatRoom(convId);
    },

    // FITUR HAPUS KONTAK & CHAT
    deleteContact(userId) {
        this.initChats();
        const confirmDelete = confirm("Apakah kamu yakin ingin menghapus kontak ini dan seluruh riwayat chat-nya?");
        if (!confirmDelete) return;

        const me = TelegramUserBridge.getRealUser();
        const chats = window.gameState.chats;

        // 1. Hapus dari daftar kontak
        chats.contacts = chats.contacts.filter(c => c.userId !== userId);

        // 2. Hapus dari riwayat percakapan
        const convId = MessagingService.getConversationId(me.userId, userId);
        if (chats.conversations[convId]) {
            delete chats.conversations[convId];
        }

        // Reset jika sedang membuka ruang chat ini
        if (chats.activeConvId === convId) {
            chats.activeConvId = null;
        }

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast('Kontak dan pesan berhasil dihapus!', 'info');
        
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

    async sendMessage() {
        this.initChats();
        const input = document.getElementById('chat-input-msg');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        const activeConvId = window.gameState.chats.activeConvId;
        if (!activeConvId) return;

        const me = TelegramUserBridge.getRealUser();
        const conv = window.gameState.chats.conversations[activeConvId];
        
        let targetUserId = conv ? conv.participants.find(p => p !== me.userId) : null;
        if (!targetUserId) {
            const parts = activeConvId.replace('conv_', '').split('_');
            targetUserId = parts.find(p => p !== me.userId) || parts[0];
        }

        let targetUser = window.gameState.chats.contacts.find(c => c.userId === targetUserId) || {
            userId: targetUserId,
            nik: `TG-${targetUserId}`,
            telegramId: `@user_${targetUserId}`,
            name: `Warga (${targetUserId})`
        };

        await MessagingService.sendMessage({
            sender: me,
            recipient: targetUser,
            text: text,
            type: 'text'
        });

        input.value = '';
        if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
        openApp('messages');
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
        const targetUserId = conv ? conv.participants.find(p => p !== me.userId) : activeConvId.replace('conv_', '').replace(me.userId, '').replace('_', '');
        
        let targetUser = window.gameState.chats.contacts.find(c => c.userId === targetUserId) || { userId: targetUserId, name: 'Warga' };

        MessagingService.sendMessage({
            sender: me,
            recipient: targetUser,
            text: `📍 Berbagi Lokasi GPS: ${currentLoc.name} (${currentLoc.district})`,
            type: 'location',
            payload: { locId: currentLocId, name: currentLoc.name }
        });

        if (typeof showToast === 'function') showToast('Lokasi GPS berhasil dikirim!', 'success');
        openApp('messages');
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
            let targetUserId = conv.participants ? conv.participants.find(p => p !== me.userId) : null;
            if (!targetUserId) {
                const parts = activeConvId.replace('conv_', '').split('_');
                targetUserId = parts.find(p => p !== me.userId) || parts[0];
            }
            
            let targetUser = contacts.find(c => c.userId === targetUserId) || { name: `Warga (${targetUserId})`, userId: targetUserId, avatar: 'https://ui-avatars.com/api/?name=Warga', telegramId: `TG-${targetUserId}` };

            let msgsHtml = '';
            conv.messages.forEach(m => {
                const isMe = String(m.senderId) === String(me.userId);
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
                    <!-- HEADER CHAT DENGAN TOMBOL HAPUS KONTAK -->
                    <div class="glass-ios p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between shrink-0 shadow-lg">
                        <div class="flex items-center gap-2.5">
                            <button onclick="MessagesModule.closeChatRoom()" class="text-xs text-sky-400 font-bold flex items-center gap-1 pr-1 active:scale-95">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <img src="${targetUser.avatar}" class="w-8 h-8 rounded-full object-cover border border-emerald-400/40" alt="PP">
                            <div>
                                <h4 class="text-xs font-bold text-white">${this.escapeHTML(targetUser.name)}</h4>
                                <span class="text-[9px] text-emerald-400 font-mono">${this.escapeHTML(targetUser.telegramId || targetUser.nik)}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-1">
                            <button onclick="MessagesModule.shareCurrentLocation()" class="p-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-xs rounded-xl transition-all" title="Bagikan Lokasi GPS">
                                <i class="fa-solid fa-location-crosshairs"></i>
                            </button>
                            <button onclick="MessagesModule.deleteContact('${targetUser.userId}')" class="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-xs rounded-xl transition-all" title="Hapus Kontak & Chat">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>

                    <!-- AREA RUANG PESAN -->
                    <div class="flex-1 overflow-y-auto space-y-2.5 p-1 max-h-[280px]">
                        ${msgsHtml || '<p class="text-[10px] text-slate-500 text-center py-8">Belum ada obrolan. Ketik pesan di bawah!</p>'}
                    </div>

                    <!-- INPUT PESAN -->
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

        // 2. DAFTAR KONTAK & CHAT
        let contactsHtml = '';
        const filteredList = contacts.filter(c => 
            !this.searchQuery || 
            c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
            c.telegramId.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

        if (filteredList.length === 0) {
            contactsHtml = `
                <div class="glass-card p-6 rounded-2xl text-center space-y-2">
                    <p class="text-[10px] text-slate-400">Belum ada kontak terhubung.</p>
                    <button onclick="MessagesModule.addContactPrompt()" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md">
                        + Tambah Kontak Telegram
                    </button>
                </div>
            `;
        } else {
            filteredList.forEach(c => {
                const convId = MessagingService.getConversationId(me.userId, c.userId);
                const conv = chats.conversations[convId];
                const lastMsgs = conv ? conv.messages : [];
                const lastMsgObj = lastMsgs.length > 0 ? lastMsgs[lastMsgs.length - 1] : null;
                const lastMsgText = lastMsgObj ? lastMsgObj.text : 'Klik untuk buka percakapan';
                const timeStr = lastMsgObj ? new Date(lastMsgObj.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

                contactsHtml += `
                    <div class="glass-card p-3 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 transition-all">
                        <div onclick="MessagesModule.openChatRoom('${convId}')" class="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer">
                            <div class="relative shrink-0">
                                <img src="${c.avatar}" class="w-10 h-10 rounded-2xl object-cover border border-emerald-500/30" alt="PP">
                                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sky-400 border-2 border-slate-900 rounded-full"></div>
                            </div>
                            <div class="overflow-hidden">
                                <div class="flex items-center gap-2">
                                    <h5 class="text-xs font-bold text-white">${this.escapeHTML(c.name)}</h5>
                                    <span class="text-[8px] text-slate-500 font-mono">${timeStr}</span>
                                </div>
                                <p class="text-[10px] text-slate-400 truncate max-w-[170px]">${this.escapeHTML(lastMsgText)}</p>
                            </div>
                        </div>

                        <button onclick="MessagesModule.deleteContact('${c.userId}')" class="p-2 text-slate-500 hover:text-rose-400 text-xs transition-all" title="Hapus Kontak">
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
                                <i class="fa-brands fa-telegram text-sky-400"></i> TELEGRAM MESSAGING
                            </span>
                            <h4 class="text-xs font-bold text-white">${this.escapeHTML(me.name)} (${this.escapeHTML(me.telegramId)})</h4>
                        </div>
                        <button onclick="MessagesModule.addContactPrompt()" class="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px] rounded-xl shadow-md flex items-center gap-1 transition-all active:scale-95">
                            <i class="fa-solid fa-user-plus text-[9px]"></i> + Tambah
                        </button>
                    </div>
                </div>

                <div class="relative">
                    <input type="text" value="${this.searchQuery}" oninput="MessagesModule.searchQuery = this.value; if(typeof openApp==='function') openApp('messages');" 
                           placeholder="🔍 Cari kontak atau obrolan..." 
                           class="w-full px-4 py-2 bg-slate-900/90 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium">
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">💬 Daftar Kontak & Obrolan</h4>
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
window.UserDirectoryModule = UserDirectoryModule;
window.MessagingService = MessagingService;
window.MessagesModule = MessagesModule;
