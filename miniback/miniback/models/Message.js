import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxlength: 1000 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) },
}, { timestamps: true });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Message = mongoose.model("Message", messageSchema);
export default Message;
