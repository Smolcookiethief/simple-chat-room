const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // For handling file uploads

// For storing uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let activeUsers = 0; // Track active users
let messagesSent = 0; // Track messages sent

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Real-time communication with socket.io
io.on('connection', (socket) => {
  activeUsers++;
  io.emit('update stats', { activeUsers, messagesSent }); // Update active users and messages sent stats

  // Listen for chat messages from clients
  socket.on('chat message', (data) => {
    messagesSent++;
    io.emit('chat message', data);
  });

  // Handle file uploads
  socket.on('file message', (fileData) => {
    const uniqueFileName = Date.now() + '-' + fileData.fileName;
    const filePath = path.join(__dirname, 'uploads', uniqueFileName);
    const buffer = Buffer.from(fileData.file, 'base64');
    fs.writeFileSync(filePath, buffer);

    io.emit('file message', {
      user: fileData.user,
      fileUrl: `/uploads/${uniqueFileName}`,
      fileName: uniqueFileName,
    });
  });

  // Typing indicator
  socket.on('typing', (user) => {
    socket.broadcast.emit('typing', user);
  });

  socket.on('stop typing', (user) => {
    socket.broadcast.emit('stop typing', user);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    activeUsers--;
    io.emit('update stats', { activeUsers, messagesSent });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
