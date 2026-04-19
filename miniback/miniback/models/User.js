import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: "" },
  interests: { type: [String], default: [] },
  embedding: { type: [Number], default: [] },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
