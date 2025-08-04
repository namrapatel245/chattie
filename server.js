const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path"); // ✅ Needed for static serving

// Load environment variables
dotenv.config();

// Express app setup
const app = express();
app.use(express.json());

// CORS setup — allow frontend
app.use(cors({
  origin: "https://chetlify.netlify.app", // ✅ your frontend domain
  methods: ["GET", "POST"],
  credentials: true,
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ✅

/* ---------------- Routes ---------------- */
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const postRoutes = require("./routes/posts");

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("Chat server is running ✅");
});

/* ---------------- Socket.IO ---------------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://chetlify.netlify.app",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send-message", (data) => {
    const { roomId, message } = data;
    socket.to(roomId).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

/* ---------------- Server Start ---------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
