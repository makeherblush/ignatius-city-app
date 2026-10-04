// ==========================================
// ENGINE PERPESANAN INSTAN & DIREKTORI WARGA V3 (MESSAGES.JS)
// ==========================================

// --- 1. USER DIRECTORY MODULE (DIREKTORI WARGA KOTA) ---
const UserDirectoryModule = {
    getUsers() {
        if (!window.virtualUsers || !Array.isArray(window.virtualUsers)) {
            window.virtualUsers = [
                { userId: 'usr_budi', nik: 'TG-10001', telegramId: '@budi_capil', name: 'Pak Budi (Dukcapil)', avatar: 'https://ui-avatars.com/api/?name=Pak+Budi&background=0284c7&color=fff', online: true, role: 'Civil Officer' },
                { userId: 'usr_sarah', nik: 'TG-10002', telegramId: '@dr_sarah', name: 'dr. Sarah (RSUD)', avatar: 'https://ui-avatars.com/api/?name=dr+Sarah&background=e11d48&color=fff', online: true, role: 'IGD Specialist' },
                { userId: 'usr_roy', nik: 'TG-10003', telegramId: '@apt_roy', name: 'Apt. Roy (Polres)', avatar: 'https://ui-avatars.com/api/?name=Apt+Roy&background=4f46e5&color=fff', online: false, role: 'Kanit Lantas' },
                { userId: 'usr_rian', nik: 'TG-10004', telegramId: '@rian_barista', name: 'Rian (Ignatius Cafe)', avatar: 'https://ui-avatars.com/api/?name=Rian+Cafe&background=d97706&color=fff', online: true, role: 'Barista' }
            ];
        }
        return window.virtualUsers;
    },

    findUser(query) {
        if (!query) return null;
        const q = query.trim().toLowerCase();
        const users = this.getUsers();
        return users.find(u => 
            u.nik.toLowerCase() === q || 
            u.telegramId.toLowerCase() === q || 
            u.userId.toLowerCase() === q || 
            u.name.toLowerCase().includes(q)
        ) || null;
    }
};

// --- 2. MESSAGING SERVICE & DELIVERY BUS ---
const MessagingService = {
    getConversationId(myId, targetId) {
        return 'conv_' + [myId, targetId].sort().join('_');
    },

    sendMessage({ senderId, recipientId, text, type = 'text', payload = null }) {
        if (!window.gameState.chats) window.gameState.chats = { conversations: {}, contacts: [] };
        
        const convId = this.getConversationId(senderId, recipientId);
        const msgId = 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

        const message = {
            id: msgId,
            conversationId: convId,
            senderId: senderId,
            recipientId: recipientId,
            type: type, // 'text' atau 'location'
            text: text,
            payload: payload,
            createdAt: Date.now(),
            status: 'read'
        };

        const chats = window.gameState.chats;
        if (!chats.conversations[convId]) {
            chats.conversations[convId] = {
                id: convId,
                participants: [senderId, recipientId],
                messages: [],
                unreadCount: 0,
                lastMessageAt: Date.now(),
                pinned: false
            };
        }

        chats.conversations[convId].messages.push(message);
        chats.conversations[convId].lastMessageAt = Date.now();

        if (typeof window.saveState === 'function') window.saveState();

        // Simulasi auto-reply NPC jika penerima adalah NPC Kota
        this.simulateNPCReplyIfNeeded(recipientId, text, convId);

        return message;
    },

    simulateNPCReplyIfNeeded(targetUserId, userText, convId) {
        const npcReplies = {
            'usr_budi': 'Halo! Ada yang bisa saya bantu mengenai pengurusan dokumen KTP / Akta di Dukcapil?',
            'usr_sarah': 'Halo! Jika Vitality kamu drop atau butuh bantuan darurat, panggil Tim Medis via Halodoc ya.',
            'usr_roy': 'Laporan diterima. Tetap patuhi aturan lalu lintas dan gunakan helm saat berkendara.',
            'usr_rian': 'Siap bro! Mampir ke Ignatius Bistro untuk cobain menu racikan espresso terbaru kita!'
        };

        if (npcReplies[targetUserId]) {
            setTimeout(() => {
                const replyText = npcReplies[targetUserId];
                const replyMsg = {
                    id: 'msg_reply_' + Date.now(),
                    conversationId: convId,
                    senderId: targetUserId,
                    recipientId: 'usr_me',
                    type: 'text',
                    text: replyText,
                    createdAt: Date.now(),
                    status: 'read'
                };

                if (window.gameState?.chats?.conversations[convId]) {
                    window.gameState.chats.conversations[convId].messages.push(replyMsg);
                    window.gameState.chats.conversations[convId].lastMessageAt = Date.now();
                    if (typeof window.saveState === 'function') window.saveState();

                    const user = UserDirectoryModule.getUsers().find(u => u.userId === targetUserId);
                    if (typeof window.showIOSNotification === 'function') {
                        window.showIOSNotification(
                            user ? user.name : 'Pesan Masuk',
                            replyText,
                            'Igna Talk',
                            'fa-comment'
                        );
                    }

                    if (window.gameState?.chats?.activeConvId === convId && typeof openApp === 'function') {
                        openApp('messages');
                    }
                }
            }, 1200);
        }
    }
};

// --- 3. MESSAGES MODULE (UI & ORCHESTRATOR) ---
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

    // --- 4. TAMBAH KONTAK VIA DIREKTORI WARGA ---
    addContactPrompt() {
        this.initChats();
        const query = prompt("Masukkan NIK / Username Telegram (@user) Warga:");
        if (!query || !query.trim()) return;

        const cleanQuery = query.trim();
        const foundUser = UserDirectoryModule.findUser(cleanQuery);

        if (!foundUser) {
            // Jika user tidak ditemukan di database resmi
            const createDyn = confirm(`Pengguna "${cleanQuery}" tidak ditemukan di direktori resmi. Tambahkan kontak manual?`);
            if (!createDyn) return;

            const name = prompt("Masukkan Nama Kontak:") || `Warga (${cleanQuery})`;
            const newContact = {
                userId: 'usr_dyn_' + Date.now(),
                nik: cleanQuery,
                telegramId: cleanQuery.startsWith('@') ? cleanQuery : '@' + cleanQuery,
                name: name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
                online: false
            };

            window.gameState.chats.contacts.push(newContact);
            const convId = MessagingService.getConversationId('usr_me', newContact.userId);
            this.openChatRoom(convId);
            return;
        }

        // Cek jika kontak sudah ada
        const existing = window.gameState.chats.contacts.find(c => c.userId === foundUser.userId);
        if (!existing) {
            window.gameState.chats.contacts.push(foundUser);
        }

        const convId = MessagingService.getConversationId('usr_me', foundUser.userId);
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Kontak ${foundUser.name} ditambahkan!`, 'success');
        
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

    // --- 5. ENVIAR PESAN (TEXT & LOCATION) ---
    sendMessage() {
        this.initChats();
        const input = document.getElementById('chat-input-msg');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        const activeConvId = window.gameState.chats.activeConvId;
        if (!activeConvId) return;

        const conv = window.gameState.chats.conversations[activeConvId];
        const targetUserId = conv ? conv.participants.find(p => p !== 'usr_me') : activeConvId.replace('conv_', '').replace('usr_me', '').replace('_', '');

        MessagingService.sendMessage({
            senderId: 'usr_me',
            recipientId: targetUserId,
            text: text,
            type: 'text'
        });

        input.value = '';
        if (typeof playAudioSfx === 'function') playAudioSfx('keypad');
        if (typeof openApp === 'function') openApp('messages');
    },

    shareCurrentLocation() {
        this.initChats();
        const activeConvId = window.gameState.chats.activeConvId;
        if (!activeConvId) return;

        const currentLocId = window.gameState?.map?.currentLocId || 'loc_capil';
        const locs = (window.MapModule && typeof window.MapModule.getLocationsList === 'function') ? window.MapModule.getLocationsList() : [];
        const currentLoc = locs.find(l => l.id === currentLocId) || { name: 'Pusat Kota', district: 'Downtown' };

        const conv = window.gameState.chats.conversations[activeConvId];
        const targetUserId = conv ? conv.participants.find(p => p !== 'usr_me') : activeConvId.replace('conv_', '').replace('usr_me', '').replace('_', '');

        MessagingService.sendMessage({
            senderId: 'usr_me',
            recipientId: targetUserId,
            text: `📍 Berbagi Lokasi GPS: ${currentLoc.name} (${currentLoc.district})`,
            type: 'location',
            payload: { locId: currentLocId, name: currentLoc.name }
        });

        if (typeof showToast === 'function') showToast('Lokasi GPS berhasil dibagikan!', 'success');
        if (typeof openApp === 'function') openApp('messages');
    },

    // --- 6. RENDER MAIN UI MESSAGES APP ---
    renderMessagesAppUI() {
        this.initChats();
        const activeConvId = window.gameState.chats.activeConvId;
        const chats = window.gameState.chats;
        const contacts = chats.contacts || [];
        const allUsers = UserDirectoryModule.getUsers();

        // A. RUANG CHAT AKTIF (CONVERSATION VIEW)
        if (activeConvId) {
            const conv = chats.conversations[activeConvId] || { messages: [] };
            const targetUserId = conv.participants ? conv.participants.find(p => p !== 'usr_me') : activeConvId.replace('conv_', '').replace('usr_me', '').replace('_', '');
            
            let targetUser = contacts.find(c => c.userId === targetUserId) || allUsers.find(u => u.userId === targetUserId);
            if (!targetUser) {
                targetUser = { name: 'Warga Kota', userId: targetUserId, avatar: 'https://ui-avatars.com/api/?name=Warga', telegramId: '@warga' };
            }

            let msgsHtml = '';
            conv.messages.forEach(m => {
                const isMe = m.senderId === 'usr_me';
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
                        ${msgsHtml || '<p class="text-[10px] text-slate-500 text-center py-8">Belum ada obrolan. Ketik pesan untuk memulai percakapan!</p>'}
                    </div>

                    <!-- INPUT CHAT BAR -->
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

        // B. DAFTAR PERCAKAPAN & CHAT MASUK
        let contactsHtml = '';
        
        // Gabungkan kontak tersimpan + NPC Direktori
        const combinedList = [...contacts];
        allUsers.forEach(u => {
            if (!combinedList.some(c => c.userId === u.userId)) {
                combinedList.push(u);
            }
        });

        const filteredList = combinedList.filter(c => 
            !this.searchQuery || 
            c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
            c.telegramId.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

        if (filteredList.length === 0) {
            contactsHtml = `<p class="text-[10px] text-slate-500 text-center py-8">Belum ada kontak terhubung. Klik "+ Tambah Teman" untuk mulai chat!</p>`;
        } else {
            filteredList.forEach(c => {
                const convId = MessagingService.getConversationId('usr_me', c.userId);
                const conv = chats.conversations[convId];
                const lastMsgs = conv ? conv.messages : [];
                const lastMsgObj = lastMsgs.length > 0 ? lastMsgs[lastMsgs.length - 1] : null;
                const lastMsgText = lastMsgObj ? lastMsgObj.text : 'Klik untuk mulai obrolan';
                const timeStr = lastMsgObj ? new Date(lastMsgObj.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

                contactsHtml += `
                    <div onclick="MessagesModule.openChatRoom('${convId}')" class="glass-card p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all active:scale-98">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <div class="relative shrink-0">
                                <img src="${c.avatar}" class="w-10 h-10 rounded-2xl object-cover border border-emerald-500/30" alt="PP">
                                ${c.online ? '<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>' : ''}
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
                <!-- HERO HEADER -->
                <div class="glass-ios p-4 rounded-3xl border border-emerald-500/40 space-y-2 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 shadow-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-comments text-emerald-400 text-base"></i>
                            <h4 class="text-xs font-bold text-emerald-300 uppercase tracking-wider">IGNA TALK V3</h4>
                        </div>
                        <button onclick="MessagesModule.addContactPrompt()" class="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg shadow-md flex items-center gap-1 transition-all active:scale-95">
                            <i class="fa-solid fa-user-plus text-[9px]"></i> Tambah Teman
                        </button>
                    </div>
                    <p class="text-[10px] text-slate-300">Aplikasi pesan instan kota. Cari NIK atau @username Telegram warga untuk memulai pesan.</p>
                </div>

                <!-- SEARCH BAR -->
                <div class="relative">
                    <input type="text" value="${this.searchQuery}" oninput="MessagesModule.searchQuery = this.value; if(typeof openApp==='function') openApp('messages');" 
                           placeholder="🔍 Cari percakapan atau kontak warga..." 
                           class="w-full px-4 py-2 bg-slate-900/90 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium">
                </div>

                <!-- LIST KONTAK & CHAT -->
                <div class="space-y-2">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">💬 Daftar Obrolan & Direktori</h4>
                    <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                        ${contactsHtml}
                    </div>
                </div>
            </div>
        `;
    }
};

// Inisialisasi State Awal saat Modul Memuat
MessagesModule.initChats();

window.UserDirectoryModule = UserDirectoryModule;
window.MessagingService = MessagingService;
window.MessagesModule = MessagesModule;
