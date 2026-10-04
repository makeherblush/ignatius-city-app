// ==========================================
// RAILWAY BACKEND SERVER V7 (SERVER.JS)
// FULL PARITY WEBSOCKET ENGINE & USER REGISTRY
// ==========================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

// Central User Registry: NIK -> User Object & Socket ID
// Format: { nik, telegramId, name, avatar, socketId, online, lastSeen }
const userRegistry = new Map();
const socketToNik = new Map();

// Storage Pesan Offline: recipientNik -> Array<MessageObject>
const offlineQueue = new Map();

// Global Message Store (Memory Persistence)
const globalMessageStore = [];

io.on('connection', (socket) => {

    // 1. REGISTRASI IDENTITAS LENGKAP WARGA (NIK + TELEGRAM ID)
    socket.on('register_user', (userData) => {
        if (!userData || !userData.nik) return;

        const cleanNik = String(userData.nik).trim();
        const cleanTgId = userData.telegramId ? String(userData.telegramId).trim() : '';

        const userObj = {
            nik: cleanNik,
            telegramId: cleanTgId,
            name: userData.name || `Warga (${cleanNik})`,
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || cleanNik)}`,
            socketId: socket.id,
            online: true,
            lastSeen: Date.now()
        };

        userRegistry.set(cleanNik, userObj);
        socketToNik.set(socket.id, cleanNik);

        // Broadcast Daftar User Online
        const onlineNiks = Array.from(userRegistry.values())
            .filter(u => u.online)
            .map(u => u.nik);
        
        io.emit('online_users_list', onlineNiks);

        // KANTONG PESAN OFFLINE: Kirim pesan yang tertunda saat penerima baru login
        if (offlineQueue.has(cleanNik)) {
            const pendingMsgs = offlineQueue.get(cleanNik) || [];
            if (pendingMsgs.length > 0) {
                socket.emit('pending_messages', pendingMsgs);
                offlineQueue.delete(cleanNik);
            }
        }
    });

    // 2. KIRIM PESAN REAL-TIME DENGAN COCOK PROTOKOL 1:1
    socket.on('send_message', async (data) => {
        const { senderNik, senderName, recipientNik, text, type, payload } = data;

        if (!senderNik || !recipientNik || !text) return;

        const cleanSender = String(senderNik).trim();
        const cleanRecipient = String(recipientNik).trim();

        const messageObj = {
            id: `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            conversationId: 'conv_' + [cleanSender, cleanRecipient].sort().join('_'),
            senderNik: cleanSender,
            senderName: senderName || 'Warga',
            recipientNik: cleanRecipient,
            text: text,
            type: type || 'text',
            payload: payload || null,
            createdAt: Date.now()
        };

        // Simpan ke memory persistence
        globalMessageStore.push(messageObj);

        // 2a. Konfirmasi balik ke socket pengirim (message_sent_confirm)
        socket.emit('message_sent_confirm', messageObj);

        // 2b. Cek apakah penerima terhubung via WebSocket
        const recipientUser = userRegistry.get(cleanRecipient);

        if (recipientUser && recipientUser.online && recipientUser.socketId) {
            // TERKIRIM REALTIME INSTAN
            io.to(recipientUser.socketId).emit('receive_message', messageObj);
        } else {
            // OFFLINE QUEUE: Simpan pesan untuk diterima saat user online
            if (!offlineQueue.has(cleanRecipient)) {
                offlineQueue.set(cleanRecipient, []);
            }
            offlineQueue.get(cleanRecipient).push(messageObj);

            // TELEGRAM BOT NOTIFICATION PUSH
            const tgId = recipientUser?.telegramId || cleanRecipient.replace('TG-', '');
            const cleanTgId = String(tgId).replace('@', '').trim();

            if (BOT_TOKEN && !isNaN(cleanTgId) && cleanTgId.length >= 5) {
                try {
                    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: cleanTgId,
                            text: `💬 *Pesan Baru dari ${senderName} (NIK: ${cleanSender})*:\n\n"${text}"\n\n_Buka Virtual Phone WebApp untuk membalas._`,
                            parse_mode: 'Markdown'
                        })
                    });
                } catch (err) {
                    console.warn('[Bot Push Failed]:', err.message);
                }
            }
        }
    });

    // 3. SINKRONISASI KONTAK SERVER-SIDE (TAMBAH KONTAK OTOMATIS DI USER TARGET)
    socket.on('add_contact', (data) => {
        const { senderNik, senderName, senderAvatar, targetNik } = data;
        if (!targetNik || !senderNik) return;

        const cleanTarget = String(targetNik).trim();
        const targetUser = userRegistry.get(cleanTarget);

        if (targetUser && targetUser.online && targetUser.socketId) {
            io.to(targetUser.socketId).emit('contact_added', {
                nik: senderNik,
                name: senderName || `Warga (${senderNik})`,
                avatar: senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderNik)}`
            });
        }
    });

    // 4. DISCONNECT HANDLER
    socket.on('disconnect', () => {
        const userNik = socketToNik.get(socket.id);
        if (userNik && userRegistry.has(userNik)) {
            const userObj = userRegistry.get(userNik);
            userObj.online = false;
            userObj.lastSeen = Date.now();
            socketToNik.delete(socket.id);

            const onlineNiks = Array.from(userRegistry.values())
                .filter(u => u.online)
                .map(u => u.nik);

            io.emit('online_users_list', onlineNiks);
        }
    });
});

// Endpoint fallback REST API untuk sync riwayat obrolan
app.get('/api/messages/:nik', (req, res) => {
    const userNik = String(req.params.nik).trim();
    const userMsgs = globalMessageStore.filter(m => m.recipientNik === userNik || m.senderNik === userNik);
    return res.json({ success: true, messages: userMsgs });
});

server.listen(PORT, () => console.log(`🚀 Server Railway Engine V7 Aktif di Port ${PORT}`));
