// routes/streamRoutes.js
const express = require("express");
const { startStream, stopStream } = require("../controllers/streamController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/start", authMiddleware, startStream);
router.post("/stop", authMiddleware, stopStream);

module.exports = router;
