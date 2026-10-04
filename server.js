// Express.js route di Railway Backend
app.post('/api/send-telegram', async (req, res) => {
    const { recipientTgId, senderName, senderTag, text } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN; // Diambil aman dari Environment Variable Railway

    if (!botToken || !recipientTgId || !text) {
        return res.status(400).json({ error: 'Missing parameters or BOT_TOKEN' });
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: recipientTgId,
                text: `💬 *Pesan dari ${senderName} (${senderTag})*:\n\n"${text}"\n\n_Buka Mini App untuk membalas._`,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();
        return res.json({ success: true, telegramResponse: data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
