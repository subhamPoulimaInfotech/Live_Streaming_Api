// controllers/streamController.js
const Stream = require("../models/Stream");
const { v4: uuidv4 } = require("uuid");
const { io } = require("../server");

// Start a new stream
exports.startStream = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    // Check if user already has an active stream
    const existingStream = await Stream.findOne({ streamer: userId, status: "live" });
    if (existingStream) {
      return res.status(400).json({ message: "You already have a live stream." });
    }

    // Generate a unique stream key
    const streamKey = uuidv4();

    // Create a new stream
    const stream = new Stream({
      title,
      description,
      streamer: userId,
      status: "live",
      streamKey,
      viewers: 0,
    });

    await stream.save();
    res.status(201).json({ message: "Stream started successfully", stream });
    
    // Emit stream started event
    io.emit("streamStatus", { streamId: stream._id, status: "live" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stop an ongoing stream
exports.stopStream = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the active stream
    const stream = await Stream.findOne({ streamer: userId, status: "live" });
    if (!stream) {
      return res.status(404).json({ message: "No active stream found." });
    }

    // Update stream status to offline
    stream.status = "offline";
    await stream.save();

    res.status(200).json({ message: "Stream stopped successfully" });

    // Emit stream stopped event
    io.emit("streamStatus", { streamId: stream._id, status: "offline" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update viewer count for a stream
exports.updateViewerCount = (streamId, count) => {
  io.to(streamId).emit("viewerCount", count);
};
