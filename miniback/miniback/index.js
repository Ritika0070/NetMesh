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

dotenv.config();

import authRoutes         from "./routes/auth.js";
import sessionRoutes      from "./routes/session.js";
import recommendRoutes    from "./routes/recommend.js";
import chatRoutes         from "./routes/chat.js";
import notificationRoutes from "./routes/notification.js";

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth",          authRoutes);
app.use("/api/session",       sessionRoutes);
app.use("/api/recommend",     recommendRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("NetMesh backend is running.");
});

console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "[OK]" : "[MISSING] — check .env file");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[DB] MongoDB connected.");
    app.listen(PORT, () => {
      console.log(`[SERVER] http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[ERROR] MongoDB connection failed:", err.message);
    process.exit(1);
  });