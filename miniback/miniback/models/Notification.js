import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: String, default: "" },
  type: { type: String, enum: ["connect", "message"], required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected", "blocked"], default: "pending" },
  message: { type: String, required: true, trim: true },
  read: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) },
}, { timestamps: true });

notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
