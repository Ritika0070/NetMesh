import mongoose from "mongoose";

const blockedUserSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  blockerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blockedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) },
}, { timestamps: true });

blockedUserSchema.index(
  { sessionId: 1, blockerId: 1, blockedUserId: 1 },
  { unique: true }
);
blockedUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlockedUser = mongoose.model("BlockedUser", blockedUserSchema);
export default BlockedUser;
