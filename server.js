const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Peta koneksi NIK ke Socket ID
const onlineUsers = new Map();

io.on('connection', (socket) => {
    // User login ke WebSocket membawa NIK
    socket.on('register_user', (nik) => {
        onlineUsers.set(nik, socket.id);
        io.emit('user_status_change', Array.from(onlineUsers.keys())); // Broadcast daftar user online
    });

    // Kirim pesan antar NIK secara real-time
    socket.on('send_message', (data) => {
        const { recipientNik, message } = data;
        const recipientSocketId = onlineUsers.get(recipientNik);

        if (recipientSocketId) {
            // Langsung tembak ke HP penerima jika sedang online
            io.to(recipientSocketId).emit('receive_message', message);
        }
    });

    socket.on('disconnect', () => {
        // Hapus user dari status online saat keluar
        for (let [nik, id] of onlineUsers.entries()) {
            if (id === socket.id) onlineUsers.delete(nik);
        }
    });
});

server.listen(process.env.PORT || 3000);
