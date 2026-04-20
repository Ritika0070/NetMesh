import Notification from "../models/Notification.js";

export async function getNotifications(req, res) {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required." });
    }

    const notifications = await Notification.find({
      userId,
      sessionId,
      $or: [
        { type: "message" },
        { type: "connect", status: "pending" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("senderId", "name bio interests")
      .select("message type status read createdAt sessionId senderId");

    // Group message notifications by sender — show count if multiple
    const connectNotifs = notifications.filter((n) => n.type === "connect");
    const messageNotifs = notifications.filter((n) => n.type === "message");

    // Group messages by senderId
    const messageGroupMap = new Map();
    for (const item of messageNotifs) {
      const key = item.senderId?._id?.toString();
      if (!key) continue;
      if (!messageGroupMap.has(key)) {
        messageGroupMap.set(key, { latest: item, count: 1 });
      } else {
        messageGroupMap.get(key).count += 1;
      }
    }

    // Build grouped message notifications
    const groupedMessages = Array.from(messageGroupMap.values()).map(({ latest, count }) => ({
      id: latest._id,
      message: count > 1
        ? `${latest.senderId?.name || "Someone"} sent you ${count}+ messages`
        : latest.message,
      type: "message",
      status: latest.status,
      read: latest.read,
      createdAt: latest.createdAt,
      sessionId: latest.sessionId,
      senderId: latest.senderId?._id || null,
      count,
      senderProfile: latest.senderId ? {
        id: latest.senderId._id,
        name: latest.senderId.name,
        bio: latest.senderId.bio || "",
        interests: latest.senderId.interests || [],
        avatar: latest.senderId.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase(),
        matchScore: 0,
      } : null,
    }));

    // Connect notifications — no grouping
    const formattedConnect = connectNotifs.map((item) => ({
      id: item._id,
      message: item.message,
      type: item.type,
      status: item.status,
      read: item.read,
      createdAt: item.createdAt,
      sessionId: item.sessionId,
      senderId: item.senderId?._id || null,
      count: 1,
      senderProfile: item.senderId ? {
        id: item.senderId._id,
        name: item.senderId.name,
        bio: item.senderId.bio || "",
        interests: item.senderId.interests || [],
        avatar: item.senderId.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase(),
        matchScore: 0,
      } : null,
    }));

    // Merge and sort by latest first
    const allFormatted = [...formattedConnect, ...groupedMessages]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, notifications: allFormatted });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

export async function markNotificationsRead(req, res) {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required." });
    }

    await Notification.updateMany(
      { userId, sessionId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Mark notifications read error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}