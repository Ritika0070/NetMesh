import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const SESSION_ID = ""; // your session ID

const userSchema = new mongoose.Schema({
  name:         String,
  email:        String,
  passwordHash: String,
  bio:          String,
  interests:    [String],
  embedding:    [Number],
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

const sessionSchema = new mongoose.Schema({
  sessionId:    String,
  name:         String,
  createdBy:    String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  expiresAt:    Date,
}, { timestamps: true });
const Session = mongoose.model("Session", sessionSchema);

async function addUsers() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[OK] Connected!");

  const session = await Session.findOne({ sessionId: SESSION_ID });
  if (!session) {
    console.error(`[ERROR] Session ${SESSION_ID} not found!`);
    process.exit(1);
  }
  console.log(`[OK] Found session: ${session.name} (${SESSION_ID})`);
  console.log(`   Current participants: ${session.participants.length}`);

  session.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const seededUsers = await User.find({ email: /\.\d+@/ }).select("_id name");
  console.log(`   Found ${seededUsers.length} seeded users to add`);

  const existingIds = new Set(session.participants.map(id => id.toString()));
  let added = 0;

  for (const user of seededUsers) {
    if (!existingIds.has(user._id.toString())) {
      session.participants.push(user._id);
      added++;
    }
  }

  await session.save();

  console.log(`[OK] Added ${added} users to session ${SESSION_ID}`);
  console.log(`   Total participants now: ${session.participants.length}`);
  console.log(`   Session extended to 48 hours`);
  console.log("\nGo refresh your app — you should now see recommendations!");

  await mongoose.disconnect();
}

addUsers().catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});