// ==========================================
// ENGINE PERPESANAN REAL TELEGRAM SYNC V4 (MESSAGES.JS)
// ==========================================

// --- 1. TELEGRAM REAL USER CONNECTOR ---
const TelegramUserBridge = {
    // URL Backend Webhook / Supabase / Bot API Bridge milikmu (Opsional jika pakai backend)
    SYNC_API_ENDPOINT: 'https://api.yourserver.com/telegram-bridge', 

    // Mengambil data pengguna Telegram REAL yang sedang membuka Mini App
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

        // Fallback untuk mode Testing Browser tanpa Telegram WebApp
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

// --- 2. USER DIRECTORY REALTIME SYNC ---
const UserDirectoryModule = {
    getUsers() {
        if (!window.virtualUsers || !Array.isArray(window.virtualUsers)) {
            window.virtualUsers = [];
        }
        return window.virtualUsers;
    },

    // Mencari pengguna real berdasarkan @username Telegram atau ID Telegram
    findUser(query) {
        if (!query) return null;
        let q = query.trim().toLowerCase();
        if (!q.startsWith('@') && !q.startsWith('TG-') && isNaN(q)) {
            q = '@' + q; // Auto format ke @username jika diinput tanpa @
        }

        const users = this.getUsers();
        
        // Cek database lokal kontak tersimpan
        let found = users.find(u => 
            u.telegramId.toLowerCase() === q || 
            u.nik.toLowerCase() === q || 
            u.userId.toLowerCase() === q
        );

        if (found) return found;

        // Cek jika yang dicari adalah ID Telegram Angka
        const cleanId = q.replace('@', '').replace('TG-', '');
        if (!isNaN(cleanId) && cleanId.length >= 5) {
            return {
                userId: String(cleanId),
                nik: `TG-${cleanId}`,
                telegramId: `@user_${cleanId}`,
                name: `Warga Telegram (${cleanId})`,
                avatar: `https://ui-avatars.com/api/?name=${cleanId}&background=0284c7&color=fff`,
                isRealTelegram: true
            };
        }

        return null;
    }
};

// --- 3. REALTIME MESSAGING SERVICE & TELEGRAM BRIDGE ---
const MessagingService = {
    getConversationId(myId, targetId) {
        return 'conv_' + [String(myId), String(targetId)].sort().join('_');
    },

    async sendMessage({ sender, recipient, text, type = 'text', payload = null }) {
        if (!window.gameState.chats) window.gameState.chats = { conversations: {}, contacts: [] };
        
        const convId = this.getConversationId(sender.userId, recipient.userId);
        const msgId = 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

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

        chats.conversations[convId].messages.push(message);
        chats.conversations[convId].lastMessageAt = Date.now();

        if (typeof window.saveState === 'function') window.saveState();

        // CHAT BRIDGE: Kirim pesan ke API Telegram / Server Realtime jika tersedia
        this.dispatchToRealTelegramBridge(sender, recipient, text);

        return message;
    },

    // Pengiriman Pesan Nyata ke Telegram Receiver (via Bot Webhook / Cloud API)
    async dispatchToRealTelegramBridge(sender, recipient, text) {
        try {
            // Cek jika dikirim ke Telegram ID Real (berupa ID angka)
            const recipientTgId = recipient.userId || recipient.nik?.replace('TG-', '');

            if (recipientTgId && !isNaN(recipientTgId)) {
                console.log(`[TelegramBridge]: Dispatching message to Telegram User ID: ${recipientTgId}...`);

                // Jika kamu menyambungkan Bot Telegram API milikmu
                if (window.TELEGRAM_BOT_TOKEN) {
                    await fetch(`https://api.telegram.org/bot${window.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: recipientTgId,
                            text: `💬 *Pesan Baru dari ${sender.name} (${sender.telegramId})*:\n\n"${text}"\n\n_Buka Mini App untuk membalas._`,
                            parse_mode: 'Markdown'
                        })
                    });
                }
            }
        } catch (err) {
            console.warn('[TelegramBridge Error]: Gagal meneruskan ke Telegram Bot API:', err);
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

    // TAMBAH KONTAK REAL TELEGRAM
    addContactPrompt() {
        this.initChats();
        const me = TelegramUserBridge.getRealUser();
        const query = prompt("Masukkan @username Telegram atau ID Telegram Warga Real (contoh: @jex_user atau 12345678):");
        if (!query || !query.trim()) return;

        const cleanQuery = query.trim();
        const foundUser = UserDirectoryModule.findUser(cleanQuery);

        let targetUser = foundUser;

        if (!targetUser) {
            // Buat entitas kontak real berdasarkan input username / Telegram ID
            const isUsername = cleanQuery.startsWith('@');
            const cleanId = cleanQuery.replace('@', '').replace('TG-', '');

            targetUser = {
                userId: isNaN(cleanId) ? 'usr_tg_' + cleanId : cleanId,
                nik: `TG-${cleanId}`,
                telegramId: isUsername ? cleanQuery : `@user_${cleanId}`,
                name: `Warga (${cleanQuery})`,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanQuery)}&background=0284c7&color=fff`,
                isRealTelegram: true
            };
        }

        if (targetUser.userId === me.userId) {
            if (typeof showToast === 'function') showToast('Kamu tidak bisa menambahkan ID Telegram milikmu sendiri!', 'error');
            return;
        }

        // Simpan Kontak
        const existingIndex = window.gameState.chats.contacts.findIndex(c => c.userId === targetUser.userId);
        if (existingIndex === -1) {
            window.gameState.chats.contacts.push(targetUser);
        } else {
            window.gameState.chats.contacts[existingIndex] = targetUser;
        }

        const convId = MessagingService.getConversationId(me.userId, targetUser.userId);
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Kontak Telegram ${targetUser.name} Terdeteksi & Ditambahkan!`, 'success');
        
        this.openChatRoom(convId);
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

    // KIRIM PESAN SINKRON
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

        let targetUser = window.gameState.chats.contacts.find(c => c.userId === targetUserId) || UserDirectoryModule.findUser(targetUserId);
        if (!targetUser) {
            targetUser = {
                userId: targetUserId,
                nik: `TG-${targetUserId}`,
                telegramId: `@user_${targetUserId}`,
                name: `Warga (${targetUserId})`
            };
        }

        await MessagingService.sendMessage({
            sender: me,
            recipient: targetUser,
            text: text,
            type: 'text'
        });

        input.value = '';
        if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
        if (typeof openApp === 'function') openApp('messages');
    },

    // BAGIKAN LOKASI REALTIME GPS
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
        if (typeof openApp === 'function') openApp('messages');
    },

    // RENDER UI APP MESSAGES
    renderMessagesAppUI() {
        this.initChats();
        const me = TelegramUserBridge.getRealUser();
        const activeConvId = window.gameState.chats.activeConvId;
        const chats = window.gameState.chats;
        const contacts = chats.contacts || [];

        // 1. RUANG CHAT AKTIF (CONVERSATION VIEW)
        if (activeConvId) {
            const conv = chats.conversations[activeConvId] || { messages: [] };
            const targetUserId = conv.participants ? conv.participants.find(p => p !== me.userId) : activeConvId.replace('conv_', '').replace(me.userId, '').replace('_', '');
            
            let targetUser = contacts.find(c => c.userId === targetUserId) || UserDirectoryModule.findUser(targetUserId);
            if (!targetUser) {
                targetUser = { name: `Warga (${targetUserId})`, userId: targetUserId, avatar: 'https://ui-avatars.com/api/?name=Warga', telegramId: `@user_${targetUserId}` };
            }

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
                    <!-- HEADER CHAT -->
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

                        <button onclick="MessagesModule.shareCurrentLocation()" class="p-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-xs rounded-xl transition-all" title="Bagikan Lokasi GPS">
                            <i class="fa-solid fa-location-crosshairs"></i>
                        </button>
                    </div>

                    <!-- AREA PESAN -->
                    <div class="flex-1 overflow-y-auto space-y-2.5 p-1 max-h-[280px]">
                        ${msgsHtml || '<p class="text-[10px] text-slate-500 text-center py-8">Belum ada obrolan. Ketik pesan untuk mengirim ke Telegram!</p>'}
                    </div>

                    <!-- INPUT CHAT BAR -->
                    <div class="flex gap-2 pt-1 border-t border-white/10 shrink-0">
                        <input type="text" id="chat-input-msg" onkeydown="if(event.key==='Enter') MessagesModule.sendMessage()" 
                               placeholder="Ketik pesan Telegram..." 
                               class="flex-1 px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 shadow-inner">
                        <button onclick="MessagesModule.sendMessage()" class="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // 2. DAFTAR KONTAK TELEGRAM
        let contactsHtml = '';
        const filteredList = contacts.filter(c => 
            !this.searchQuery || 
            c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
            c.telegramId.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

        if (filteredList.length === 0) {
            contactsHtml = `
                <div class="glass-card p-6 rounded-2xl text-center space-y-2">
                    <p class="text-[10px] text-slate-400">Belum ada teman Telegram terhubung.</p>
                    <button onclick="MessagesModule.addContactPrompt()" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md">
                        + Tambah @username Telegram
                    </button>
                </div>
            `;
        } else {
            filteredList.forEach(c => {
                const convId = MessagingService.getConversationId(me.userId, c.userId);
                const conv = chats.conversations[convId];
                const lastMsgs = conv ? conv.messages : [];
                const lastMsgObj = lastMsgs.length > 0 ? lastMsgs[lastMsgs.length - 1] : null;
                const lastMsgText = lastMsgObj ? lastMsgObj.text : 'Klik untuk buka percakapan Telegram';
                const timeStr = lastMsgObj ? new Date(lastMsgObj.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

                contactsHtml += `
                    <div onclick="MessagesModule.openChatRoom('${convId}')" class="glass-card p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all active:scale-98">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <div class="relative shrink-0">
                                <img src="${c.avatar}" class="w-10 h-10 rounded-2xl object-cover border border-emerald-500/30" alt="PP">
                                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sky-400 border-2 border-slate-900 rounded-full"></div>
                            </div>
                            <div class="overflow-hidden">
                                <div class="flex items-center gap-2">
                                    <h5 class="text-xs font-bold text-white">${this.escapeHTML(c.name)}</h5>
                                    <span class="text-[8px] text-slate-500 font-mono">${timeStr}</span>
                                </div>
                                <p class="text-[10px] text-slate-400 truncate max-w-[180px]">${this.escapeHTML(lastMsgText)}</p>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-xs text-slate-500 shrink-0"></i>
                    </div>
                `;
            });
        }

        return `
            <div class="space-y-4">
                <!-- HERO HEADER TELEGRAM SYNC -->
                <div class="glass-ios p-4 rounded-3xl border border-sky-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/60 shadow-xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[8px] text-sky-400 font-mono uppercase font-bold block flex items-center gap-1">
                                <i class="fa-brands fa-telegram text-sky-400"></i> TELEGRAM REALTIME CONNECTED
                            </span>
                            <h4 class="text-xs font-bold text-white">${this.escapeHTML(me.name)} (${this.escapeHTML(me.telegramId)})</h4>
                        </div>
                        <button onclick="MessagesModule.addContactPrompt()" class="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px] rounded-xl shadow-md flex items-center gap-1 transition-all active:scale-95">
                            <i class="fa-solid fa-user-plus text-[9px]"></i> + Telegram ID
                        </button>
                    </div>
                </div>

                <!-- SEARCH BAR -->
                <div class="relative">
                    <input type="text" value="${this.searchQuery}" oninput="MessagesModule.searchQuery = this.value; if(typeof openApp==='function') openApp('messages');" 
                           placeholder="🔍 Cari @username atau ID Telegram..." 
                           class="w-full px-4 py-2 bg-slate-900/90 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium">
                </div>

                <!-- DAFTAR CHAT -->
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">💬 Kontak & Obrolan Telegram</h4>
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
