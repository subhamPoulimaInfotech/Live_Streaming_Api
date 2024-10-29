// models/Stream.js
const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  streamer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["live", "offline"], default: "offline" },
  streamKey: { type: String, unique: true },
  viewers: { type: Number, default: 0 },
});

const Stream = mongoose.model("Stream", streamSchema);
module.exports = Stream;
