const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// Save a new message
router.post("/", async (req, res) => {
  const { sender, receiver, content } = req.body;
  try {
    const msg = await Message.create({ sender, receiver, content });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Get message history between two users
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
