import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import User   from "../models/User.js";

async function getEmbedding(text) {
  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );
    const data = await response.json();
    if (Array.isArray(data) && typeof data[0] === "number") return data;
    if (Array.isArray(data) && Array.isArray(data[0])) return data[0];
    return [];
  } catch (err) {
    console.error("Embedding error:", err.message);
    return [];
  }
}

// ── REGISTER ──
export async function register(req, res) {
  try {
    const { name, email, password, interests, bio } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email already registered. Please log in." });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email:     email.toLowerCase(),
      passwordHash,
      interests: interests || [],
      bio:       bio || "",
    });

    const profileText = `${(interests || []).join(", ")}. ${bio || ""}`.trim();
    if (profileText.length > 3) {
      newUser.embedding = await getEmbedding(profileText);
    }

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id:        newUser._id,
        name:      newUser.name,
        email:     newUser.email,
        interests: newUser.interests,
        bio:       newUser.bio,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
}

// ── LOGIN ──
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ success: false, message: "No account found with this email." });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Incorrect password." });

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        interests: user.interests,
        bio:       user.bio,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
}

// ── UPDATE PROFILE ──
export async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, bio, interests } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: "Name is required." });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    user.name      = name.trim();
    user.bio       = bio || "";
    user.interests = interests || [];

    const profileText = `${(interests || []).join(", ")}. ${bio || ""}`.trim();
    if (profileText.length > 3) {
      user.embedding = await getEmbedding(profileText);
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        interests: user.interests,
        bio:       user.bio,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
}

// ── CHANGE PASSWORD ──
export async function changePassword(req, res) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Both current and new password are required." });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Current password is incorrect." });

    if (currentPassword === newPassword)
      return res.status(400).json({ success: false, message: "New password must be different from current password." });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
}