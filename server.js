// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // For handling file uploads

// Set up storage configuration for multer to save uploaded files to the 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp for unique file names
  }
});

const upload = multer({ storage: storage });

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' and 'uploads' folders
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up WebSocket communication
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for chat messages from clients
  socket.on('chat message', (data) => {
    // Emit the message to all connected clients
    io.emit('chat message', data);
  });

  // Handle file upload
  socket.on('file message', (fileData) => {
    // Generate a unique filename to prevent overwriting
    const uniqueFileName = Date.now() + '-' + fileData.fileName;
    const filePath = path.join(__dirname, 'uploads', uniqueFileName);
    const buffer = Buffer.from(fileData.file, 'base64'); // Convert base64 string to buffer
    fs.writeFileSync(filePath, buffer); // Save the file

    // Emit file information (URL to access the file)
    io.emit('file message', {
      user: fileData.user,
      fileUrl: `/uploads/${uniqueFileName}`,
      fileName: uniqueFileName,
    });
  });

  // Listen for typing indicator events
  socket.on('typing', (user) => {
    socket.broadcast.emit('typing', user);
  });

  // Stop typing indicator when user stops typing
  socket.on('stop typing', (user) => {
    socket.broadcast.emit('stop typing', user);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
