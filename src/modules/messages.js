// ==========================================
// MODUL PESAN (MESSAGES.JS) - BERBASIS NIK
// ==========================================

const MessagesModule = {
    railwayUrl: 'https://ignatius-city-app-production.up.railway.app', // Sesuaikan URL Railway kamu

    // Kirim Pesan ke NIK Tujuan via Backend Railway
    async sendMessage(recipientNik, text) {
        const myNik = window.gameState?.user?.identity?.nik;
        const myName = window.gameState?.user?.identity?.name || 'Warga Ignatius';
        const myTag = window.gameState?.user?.identity?.tag || '@warga';

        if (!myNik) {
            if (typeof showToast === 'function') showToast('Identitas NIK kamu belum terdeteksi!', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.railwayUrl}/api/send-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientNik: recipientNik,
                    senderNik: myNik,
                    senderName: myName,
                    senderTag: myTag,
                    text: text
                })
            });

            const result = await response.json();
            if (result.success) {
                if (typeof showToast === 'function') showToast('Pesan terkirim ke kota!', 'success');
                this.appendMessageLocal(recipientNik, result.data);
            } else {
                if (typeof showToast === 'function') showToast('Gagal mengirim pesan.', 'error');
            }
        } catch (err) {
            console.error('[Message Error]:', err);
            if (typeof showToast === 'function') showToast('Kesalahan koneksi server pesan.', 'error');
        }
    },

    // Cek Pesan Masuk secara Berkala berdasarkan NIK Sendiri (Polling tiap 5 detik)
    startPollingMessages() {
        if (this._pollingInterval) clearInterval(this._pollingInterval);
        
        this._pollingInterval = setInterval(async () => {
            const myNik = window.gameState?.user?.identity?.nik;
            if (!myNik) return;

            try {
                const res = await fetch(`${this.railwayUrl}/api/messages/${myNik}`);
                const data = await res.json();

                if (data.success && data.messages) {
                    let hasNew = false;
                    data.messages.forEach(msg => {
                        if (!msg.read) {
                            this.handleIncomingMessage(msg);
                            hasNew = true;
                            this.markAsReadOnServer(myNik, msg.id);
                        }
                    });

                    if (hasNew && typeof playAudioSfx === 'function') {
                        playAudioSfx('notification');
                    }
                }
            } catch (err) {
                console.error('[Polling Error]:', err);
            }
        }, 5000);
    },

    // Tangani Pesan Masuk ke State Lokal Virtual Phone
    handleIncomingMessage(msg) {
        if (!window.gameState) window.gameState = {};
        if (!window.gameState.messages) window.gameState.messages = [];

        window.gameState.messages.push(msg);

        if (typeof renderMessagesUI === 'function') {
            renderMessagesUI();
        }

        if (typeof showNotificationBubble === 'function') {
            showNotificationBubble({
                title: `Pesan dari ${msg.senderName}`,
                body: msg.text,
                app: 'messages'
            });
        }
    },

    markAsReadOnServer(nik, messageId) {
        fetch(`${this.railwayUrl}/api/messages/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nik, messageId })
        }).catch(err => console.error(err));
    },

    appendMessageLocal(recipientNik, messageObj) {
        if (!window.gameState.messages) window.gameState.messages = [];
        window.gameState.messages.push(messageObj);
        if (typeof renderMessagesUI === 'function') renderMessagesUI();
    }
};

window.MessagesModule = MessagesModule;
