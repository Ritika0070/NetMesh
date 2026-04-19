import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { name, durationMinutes } = req.body;
    const createdBy = req.user.name;
    const creatorId = req.user.userId;

    if (!name || !name.trim())
      return res.status(400).json({ message: "Session name is required." });

    // Default 120 mins, max 1 day (1440 mins)
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
      participants: [creatorId],
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
    const { sessionId } = req.body;
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
      await session.save();
    }

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
