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
      .limit(20)
      .populate("senderId", "name bio interests")
      .select("message type status read createdAt sessionId senderId");

    res.json({
      success: true,
      notifications: notifications.map((item) => ({
        id: item._id,
        message: item.message,
        type: item.type,
        status: item.status,
        read: item.read,
        createdAt: item.createdAt,
        sessionId: item.sessionId,
        senderId: item.senderId?._id || null,
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
      })),
    });
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
