const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Serve Static Files (Frontend Virtual Phone di folder 'public')
app.use(express.static(path.join(__dirname, 'public')));

// Database memori server berdasarkan NIK
// Struktur: { "TG-12345": [ { id, senderNik, senderName, text, createdAt, read } ] }
const messageDatabase = {};

// 1. Endpoint Kirim Pesan Antar NIK
app.post('/api/send-message', async (req, res) => {
    const { recipientNik, senderNik, senderName, senderTag, text } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!recipientNik || !senderNik || !text) {
        return res.status(400).json({ error: 'Missing required parameters (recipientNik, senderNik, text)' });
    }

    const newMessage = {
        id: 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        senderNik: String(senderNik),
        recipientNik: String(recipientNik),
        senderName: senderName || 'Warga Kota',
        senderTag: senderTag || '@citizen',
        text: text,
        createdAt: Date.now(),
        read: false
    };

    // Simpan ke database memori server berdasarkan NIK penerima
    if (!messageDatabase[recipientNik]) {
        messageDatabase[recipientNik] = [];
    }
    messageDatabase[recipientNik].push(newMessage);

    // Opsional: Jika user punya Telegram ID asli yang terikat ke NIK, bisa diteruskan ke bot
    // Tapi untuk komunikasi antar virtual phone di satu web, ini sudah masuk ke database NIK.

    return res.json({ success: true, data: newMessage });
});

// 2. Endpoint Tarik Pesan Berdasarkan NIK (Polling oleh WebApp)
app.get('/api/messages/:nik', (req, res) => {
    const nik = req.params.nik;
    const messages = messageDatabase[nik] || [];
    return res.json({ success: true, messages });
});

// 3. Endpoint Tandai Pesan Sudah Dibaca
app.post('/api/messages/read', (req, res) => {
    const { nik, messageId } = req.body;
    if (messageDatabase[nik]) {
        const msg = messageDatabase[nik].find(m => m.id === messageId);
        if (msg) msg.read = true;
    }
    return res.json({ success: true });
});

// Fallback route untuk SPA (Single Page Application) agar tidak 404
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Ignatius City Core running on port ${PORT}`);
});
