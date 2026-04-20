import mongoose from "mongoose";

const participantPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requirement: { type: String, default: "" },
  interests: { type: [String], default: [] },
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  participantPreferences: { type: [participantPreferenceSchema], default: [] },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) },
}, { timestamps: true });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
