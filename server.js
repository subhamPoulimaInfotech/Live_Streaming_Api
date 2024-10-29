// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const streamRoutes = require("./routes/streamRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/stream", streamRoutes);

// Helper function to broadcast the viewer count to a stream room
const broadcastViewerCount = (streamId) => {
  const room = io.sockets.adapter.rooms.get(streamId);
  const viewerCount = room ? room.size : 0;
  io.to(streamId).emit("viewerCount", viewerCount);
};

io.on("connection", (socket) => {
  console.log("New client connected");

  // When a client joins a stream
  socket.on("joinStream", (streamId) => {
    socket.join(streamId);
    broadcastViewerCount(streamId); // Emit updated viewer count
  });

  // When a client leaves a stream
  socket.on("leaveStream", (streamId) => {
    socket.leave(streamId);
    broadcastViewerCount(streamId); // Emit updated viewer count
  });

  // Cleanup when a client disconnects
  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((streamId) => {
      if (streamId !== socket.id) {
        broadcastViewerCount(streamId); // Emit updated viewer count
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
