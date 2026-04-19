// ─────────────────────────────────────────────
//  components/ChatBox.jsx
//  Floating chat window — fixed to bottom-right
//  Opens when you click Chat on a connected person
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { AVATAR_COLORS } from "../data/mockData";

export default function ChatBox({ chatUser, messages, onSend, onClose, sessionExpired }) {
  const [messageText, setMessageText] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!messageText.trim() || sessionExpired) return;
    onSend(chatUser.id, messageText.trim());
    setMessageText("");
  }

  const avatarColor = AVATAR_COLORS[chatUser.id.charCodeAt(1) % AVATAR_COLORS.length];

  return (
    <div className="chat-box">

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div
            className="mini-avatar"
            style={{ background: avatarColor + "22", color: avatarColor, width: 32, height: 32, borderRadius: 9, fontSize: 11 }}
          >
            {chatUser.avatar}
          </div>
          <span className="chat-username">{chatUser.name}</span>
        </div>
        <button className="chat-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">Say hello to {chatUser.name}!</p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`bubble ${msg.fromMe ? "bubble--mine" : "bubble--theirs"}`}
          >
            {msg.text}
          </div>
        ))}
        {/* Invisible div at bottom — used for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          disabled={sessionExpired}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={sessionExpired ? "Session ended" : "Type a message..."}
        />
        <button
          className="btn btn-send"
          onClick={handleSend}
          disabled={sessionExpired || !messageText.trim()}
        >
          Send
        </button>
      </div>

    </div>
  );
}
