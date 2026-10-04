// ==========================================
// RAILWAY BACKEND SERVER (SERVER.JS)
// ==========================================
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database In-Memory Pesan (Bisa ditingkatkan ke PostgreSQL / Redis)
const messageStore = [];

// 1. ENDPOINT: KIRIM PESAN DARI WEBAPP A
app.post('/api/send-message', async (req, res) => {
    const { senderId, senderName, senderTag, recipientId, text, type, payload } = req.body;

    if (!senderId || !recipientId || !text) {
        return res.status(400).json({ success: false, message: 'Parameter tidak lengkap!' });
    }

    const messageObj = {
        id: 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        senderId: String(senderId),
        senderName: senderName || 'Warga',
        senderTag: senderTag || '@warga',
        recipientId: String(recipientId),
        text: text,
        type: type || 'text',
        payload: payload || null,
        createdAt: Date.now(),
        read: false
    };

    // Simpan ke database server
    messageStore.push(messageObj);

    // Kirim Notifikasi Telegram Bot jika recipientId adalah ID Angka murni
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && !isNaN(recipientId)) {
        try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: recipientId,
                    text: `💬 *Pesan Baru dari ${senderName} (${senderTag})*:\n\n"${text}"\n\n_Buka Virtual Phone WebApp untuk membalas._`,
                    parse_mode: 'Markdown'
                })
            });
        } catch (err) {
            console.warn('[Bot Error]: Gagal mengirim notifikasi bot:', err.message);
        }
    }

    return res.json({ success: true, data: messageObj });
});

// 2. ENDPOINT: POLLING PESAN UNTUK WEBAPP B (FETCH INBOX)
app.get('/api/messages/:userId', (req, res) => {
    const userId = String(req.params.userId);
    const since = parseInt(req.query.since) || 0;

    // Filter pesan yang ditujukan untuk userId ini dan dibuat setelah timestamp 'since'
    const userMessages = messageStore.filter(m => 
        (m.recipientId === userId || m.senderId === userId) && m.createdAt > since
    );

    return res.json({ success: true, messages: userMessages });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Railway aktif di port ${PORT}`));
