import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  // ✅ Nayi field — is session mein kaun kaun join kiya
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) },
}, { timestamps: true });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Session = mongoose.model("Session", sessionSchema);
export default Session;
