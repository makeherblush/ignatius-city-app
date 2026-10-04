// ==========================================
// RAILWAY BACKEND SERVER (SERVER.JS) - SECURE ENV
// ==========================================
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Menggunakan variabel lingkungan dari Railway
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

// Memory Store Pesan
const messageStore = [];

app.post('/api/send-message', async (req, res) => {
    const { senderNik, senderName, recipientNik, text, type, payload } = req.body;

    if (!senderNik || !recipientNik || !text) {
        return res.status(400).json({ success: false, message: 'Data NIK / Pesan tidak lengkap!' });
    }

    const messageObj = {
        id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        senderNik: String(senderNik).trim(),
        senderName: senderName || 'Warga',
        recipientNik: String(recipientNik).trim(),
        text: text,
        type: type || 'text',
        payload: payload || null,
        createdAt: Date.now(),
        read: false
    };

    messageStore.push(messageObj);

    const cleanTgId = String(recipientNik).replace('TG-', '').trim();

    // Jalankan pengiriman bot hanya jika variabel BOT_TOKEN terpasang di env
    if (BOT_TOKEN && !isNaN(cleanTgId) && cleanTgId.length >= 5) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: cleanTgId,
                    text: `💬 *Pesan Masuk dari NIK ${senderNik} (${senderName})*:\n\n"${text}"\n\n_Buka Virtual Phone untuk membalas._`,
                    parse_mode: 'Markdown'
                })
            });
        } catch (err) {
            console.warn('[Bot Error]: Gagal mengirim notifikasi bot:', err.message);
        }
    }

    return res.json({ success: true, data: messageObj });
});

app.get('/api/messages/:nik', (req, res) => {
    const userNik = String(req.params.nik).trim();
    const since = parseInt(req.query.since) || 0;

    const userMessages = messageStore.filter(m => 
        (m.recipientNik === userNik || m.senderNik === userNik) && m.createdAt > since
    );

    return res.json({ success: true, messages: userMessages });
});

app.listen(PORT, () => console.log(`Server NIK Messaging aktif di port ${PORT}`));
