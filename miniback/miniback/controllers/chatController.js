import Message from "../models/Message.js";
import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import BlockedUser from "../models/BlockedUser.js";
import Session from "../models/Session.js";

async function isBlockedForSession({ sessionId, senderId, recipientId }) {
  return BlockedUser.findOne({
    sessionId,
    blockerId: recipientId,
    blockedUserId: senderId,
  });
}

async function createNotification({ userId, senderId, sessionId, type, message }) {
  if (!userId || !senderId || userId.toString() === senderId.toString()) return null;

  const blocked = await isBlockedForSession({ sessionId, senderId, recipientId: userId });
  if (blocked) return null;

  return Notification.create({
    userId,
    senderId,
    sessionId,
    type,
    message,
  });
}

async function ensureConnection({ sessionId, myUserId, targetUserId }) {
  const existing = await Connection.findOne({
    sessionId,
    $or: [
      { user1Id: myUserId, user2Id: targetUserId },
      { user1Id: targetUserId, user2Id: myUserId },
    ],
  });

  if (existing) return existing;

  const connection = new Connection({
    sessionId,
    user1Id: myUserId,
    user2Id: targetUserId,
  });

  await connection.save();
  return connection;
}

export async function getConnections(req, res) {
  try {
    const { sessionId } = req.query;
    const myUserId = req.user.userId;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required." });
    }

    const connections = await Connection.find({
      sessionId,
      $or: [{ user1Id: myUserId }, { user2Id: myUserId }],
    });

    if (connections.length === 0) {
      return res.json({ success: true, connections: [] });
    }

    const otherUserIds = connections.map((conn) =>
      conn.user1Id.toString() === myUserId
        ? conn.user2Id
        : conn.user1Id
    );

    const users = await User.find({ _id: { $in: otherUserIds } }).select("name bio interests");

    const profiles = users.map((user) => ({
      id: user._id,
      name: user.name,
      bio: user.bio || "",
      interests: user.interests || [],
      avatar: user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
      matchScore: 0,
    }));

    res.json({ success: true, connections: profiles });
  } catch (err) {
    console.error("Get connections error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

export async function sendMessage(req, res) {
  try {
    const { sessionId, toUserId, text } = req.body;
    const fromUserId = req.user.userId;

    if (!sessionId || !toUserId || !text) {
      return res.status(400).json({ message: "sessionId, toUserId, and text are required." });
    }

    const isConnected = await Connection.findOne({
      sessionId,
      $or: [
        { user1Id: fromUserId, user2Id: toUserId },
        { user1Id: toUserId, user2Id: fromUserId },
      ],
    });

    if (!isConnected) {
      return res.status(403).json({ message: "You are not connected with this user in this session." });
    }

    const message = new Message({ sessionId, fromUserId, toUserId, text });
    await message.save();

    const sender = await User.findById(fromUserId).select("name");
    await createNotification({
      userId: toUserId,
      senderId: fromUserId,
      sessionId,
      type: "message",
      message: `${sender?.name || "Someone"} sent you a message.`,
    });

    res.status(201).json({ success: true, message: "Message sent." });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

export async function getMessages(req, res) {
  try {
    const { sessionId, withUserId } = req.query;
    const myUserId = req.user.userId;

    if (!sessionId || !withUserId) {
      return res.status(400).json({ message: "sessionId and withUserId are required." });
    }

    const messages = await Message.find({
      sessionId,
      $or: [
        { fromUserId: myUserId, toUserId: withUserId },
        { fromUserId: withUserId, toUserId: myUserId },
      ],
    }).sort({ createdAt: 1 });

    const formatted = messages.map((msg) => ({
      id: msg._id,
      text: msg.text,
      fromMe: msg.fromUserId.toString() === myUserId,
      time: msg.createdAt,
    }));

    res.json({ success: true, messages: formatted });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

export async function connectWithUser(req, res) {
  try {
    const { sessionId, targetUserId } = req.body;
    const myUserId = req.user.userId;

    if (!sessionId || !targetUserId) {
      return res.status(400).json({ message: "sessionId and targetUserId are required." });
    }

    const blocked = await isBlockedForSession({
      sessionId,
      senderId: myUserId,
      recipientId: targetUserId,
    });

    if (blocked) {
      return res.status(403).json({ success: false, message: "This user has blocked connection requests for this session." });
    }

    const existing = await Connection.findOne({
      sessionId,
      $or: [
        { user1Id: myUserId, user2Id: targetUserId },
        { user1Id: targetUserId, user2Id: myUserId },
      ],
    });

    if (existing) {
      return res.json({ success: true, message: "Already connected.", status: "connected" });
    }

    const pending = await Notification.findOne({
      userId: targetUserId,
      senderId: myUserId,
      sessionId,
      type: "connect",
      status: "pending",
    });

    if (pending) {
      return res.json({ success: true, message: "Connection request already sent.", status: "pending" });
    }

    const sender = await User.findById(myUserId).select("name");
    await createNotification({
      userId: targetUserId,
      senderId: myUserId,
      sessionId,
      type: "connect",
      message: `${sender?.name || "Someone"} wants to connect with you!`,
    });

    res.status(201).json({ success: true, message: "Connection request sent.", status: "pending" });
  } catch (err) {
    console.error("Connect error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

export async function respondToConnectionRequest(req, res) {
  try {
    const { notificationId, action } = req.body;
    const myUserId = req.user.userId;

    if (!notificationId || !action) {
      return res.status(400).json({ success: false, message: "notificationId and action are required." });
    }

    if (!["accept", "reject", "block"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action." });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: myUserId,
      type: "connect",
    }).populate("senderId", "name bio interests");

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    if (notification.status !== "pending") {
      return res.json({
        success: true,
        message: `Request already ${notification.status}.`,
        status: notification.status,
      });
    }

    if (action === "accept") {
      await ensureConnection({
        sessionId: notification.sessionId,
        myUserId,
        targetUserId: notification.senderId._id,
      });
      notification.status = "accepted";
      notification.read = true;
      await notification.save();

      const acceptingUser = await User.findById(myUserId).select("name");
      await createNotification({
        userId: notification.senderId._id,
        senderId: myUserId,
        sessionId: notification.sessionId,
        type: "message",
        message: `${acceptingUser?.name || "Someone"} accepted your connection request!`,
      });

      return res.json({
        success: true,
        message: "Connection accepted.",
        status: "accepted",
        profile: {
          id: notification.senderId._id,
          name: notification.senderId.name,
          bio: notification.senderId.bio || "",
          interests: notification.senderId.interests || [],
          avatar: notification.senderId.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase(),
          matchScore: 0,
        },
      });
    }

    if (action === "block") {
      await BlockedUser.updateOne(
        {
          sessionId: notification.sessionId,
          blockerId: myUserId,
          blockedUserId: notification.senderId._id,
        },
        {
          $setOnInsert: {
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          },
        },
        { upsert: true }
      );

      await Notification.deleteMany({
        userId: myUserId,
        senderId: notification.senderId._id,
        sessionId: notification.sessionId,
      });

      return res.json({
        success: true,
        message: "User blocked for this session.",
        status: "blocked",
      });
    }

    notification.status = "rejected";
    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: "Connection rejected.",
      status: "rejected",
    });
  } catch (err) {
    console.error("Respond to connection request error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

export async function leaveSession(req, res) {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;

    if (!sessionId)
      return res.status(400).json({ success: false, message: "sessionId is required." });

    await Session.updateOne(
      { sessionId },
      {
        $pull: {
          participants: userId,
          participantPreferences: { userId },
        },
      }
    );

    await Connection.deleteMany({
      sessionId,
      $or: [{ user1Id: userId }, { user2Id: userId }],
    });

    await Notification.deleteMany({
      sessionId,
      $or: [{ userId }, { senderId: userId }],
    });

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