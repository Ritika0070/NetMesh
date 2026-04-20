import Session from "../models/Session.js";
import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";

export async function createSession(req, res) {
  try {
    const { name, durationMinutes } = req.body;
    const createdBy = req.user.name;

    if (!name || !name.trim())
      return res.status(400).json({ message: "Session name is required." });

    const duration = Math.min(Math.max(parseInt(durationMinutes) || 120, 1), 1440);
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    let sessionId;
    let isUnique = false;
    while (!isUnique) {
      sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await Session.findOne({ sessionId });
      if (!existing) isUnique = true;
    }

    const session = new Session({
      sessionId,
      name,
      createdBy,
      participants: [],
      expiresAt,
    });

    await session.save();

    res.status(201).json({
      success:   true,
      sessionId: session.sessionId,
      name:      session.name,
      expiresAt: session.expiresAt,
      duration,
    });
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

export async function joinSession(req, res) {
  try {
    const { sessionId, requirement = "", sessionInterests = [] } = req.body;
    const userId = req.user.userId;

    if (!sessionId)
      return res.status(400).json({ message: "Session ID is required." });

    const session = await Session.findOne({ sessionId: sessionId.toUpperCase() });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found. Please check the Session ID." });

    if (new Date() > new Date(session.expiresAt))
      return res.status(400).json({ success: false, message: "This session has expired. Please join a new session." });

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
    }

    const safeInterests = Array.isArray(sessionInterests)
      ? sessionInterests.filter(Boolean)
      : [];

    const existingPreference = session.participantPreferences.find(
      (item) => item.userId.toString() === userId
    );

    if (existingPreference) {
      existingPreference.requirement = requirement;
      existingPreference.interests = safeInterests;
    } else {
      session.participantPreferences.push({
        userId,
        requirement,
        interests: safeInterests,
      });
    }

    await session.save();

    res.json({
      success:     true,
      sessionId:   session.sessionId,
      sessionName: session.name,
      expiresAt:   session.expiresAt,
    });
  } catch (err) {
    console.error("Join session error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

export async function leaveSession(req, res) {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;

    if (!sessionId)
      return res.status(400).json({ success: false, message: "sessionId is required." });

    // 1. Remove user from session participants + preferences
    await Session.updateOne(
      { sessionId },
      {
        $pull: {
          participants: userId,
          participantPreferences: { userId },
        },
      }
    );

    // 2. Delete all connections this user had in this session
    await Connection.deleteMany({
      sessionId,
      $or: [{ user1Id: userId }, { user2Id: userId }],
    });

    // 3. Delete all notifications sent to OR from this user in this session
    await Notification.deleteMany({
      sessionId,
      $or: [{ userId }, { senderId: userId }],
    });

    // 4. Delete all messages sent to OR from this user in this session
    await Message.deleteMany({
      sessionId,
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });

    res.json({ success: true, message: "Left session successfully." });
  } catch (err) {
    console.error("Leave session error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}
