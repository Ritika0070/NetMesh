import mongoose from "mongoose";
const connectionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  user1Id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user2Id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) },
}, { timestamps: true });
connectionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;
