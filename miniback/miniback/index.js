// ─────────────────────────────────────────────
//  index.js
//  Entry point — pehle MongoDB connect, phir server start
// ─────────────────────────────────────────────
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import express    from "express";
import cors       from "cors";
import mongoose   from "mongoose";
import dotenv     from "dotenv";

// ── .env load karo — SABSE PEHLE ──
dotenv.config();

// ── Routes import ──
import authRoutes      from "./routes/auth.js";
import sessionRoutes   from "./routes/session.js";
import recommendRoutes from "./routes/recommend.js";
import chatRoutes      from "./routes/chat.js";
import notificationRoutes from "./routes/notification.js";

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use("/api/auth",      authRoutes);
app.use("/api/session",   sessionRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/chat",      chatRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Test route ──
app.get("/", (req, res) => {
  res.send("Backend is running ⚡");
});

// ── Debug: check kar lo MONGO_URI load hua ya nahi ──
console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "✅ Yes" : "❌ NOT FOUND — check .env file");

// ── MongoDB connect karo, phir server start ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection FAILED:");
    console.error("   Reason:", err.message);
    console.error("   Check your MONGO_URI in .env file");
    process.exit(1); // server band karo agar DB connect nahi hua
  });
