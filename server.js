const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();

// ✅ Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Store users
let users = {};

// Socket connection
io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    // Register user
    socket.on("newuser", (user) => {
        users[user] = socket.id;
        console.log("👤 Users:", users);
    });

    // Private message
    socket.on("privateMessage", (data) => {
        const receiverSocket = users[data.to];

        if (receiverSocket) {
            io.to(receiverSocket).emit("privateMessage", data);
        }
    });

    // Disconnect
    socket.on("disconnect", () => {
        for (let user in users) {
            if (users[user] === socket.id) {
                delete users[user];
                break;
            }
        }
    });
});

// Start server
server.listen(5000, "0.0.0.0", () => {
    console.log("🚀 Server running at http://localhost:5000");
});