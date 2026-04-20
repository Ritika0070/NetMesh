import { useState, useEffect, useRef } from "react";
import { AVATAR_COLORS } from "../data/mockData";

const WINDOW_WIDTH  = 328;
const WINDOW_GAP    = 12;
const RIGHT_OFFSET  = 280;

export default function ChatWindow({ chatUser, messages = [], onSend, onClose, sessionExpired, stackIndex = 0 }) {
  const [messageText, setMessageText] = useState("");
  const [minimized, setMinimized]     = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, minimized]);

  function handleSend() {
    if (!messageText.trim() || sessionExpired) return;
    onSend(chatUser.id, messageText.trim());
    setMessageText("");
  }

  const avatarColor = AVATAR_COLORS[chatUser.id.toString().charCodeAt(1) % AVATAR_COLORS.length];
  const rightPx = RIGHT_OFFSET + stackIndex * (WINDOW_WIDTH + WINDOW_GAP);

  return (
    <div
      className={`chat-window ${minimized ? "chat-window--minimized" : ""}`}
      style={{ right: rightPx }}
    >
      <div className="chat-window__header" onClick={() => setMinimized((v) => !v)}>
        <div className="chat-window__header-left">
          <span
            className="chat-window__avatar"
            style={{ background: avatarColor + "22", color: avatarColor }}
          >
            {chatUser.avatar}
          </span>
          <span className="chat-window__name">{chatUser.name}</span>
        </div>
        <div className="chat-window__header-actions">
          <button
            className="chat-window__btn"
            onClick={(e) => { e.stopPropagation(); setMinimized((v) => !v); }}
            title={minimized ? "Restore" : "Minimize"}
          >
            {minimized ? "▲" : "▼"}
          </button>
          <button
            className="chat-window__btn"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="chat-window__messages">
            {messages.length === 0 && (
              <p className="chat-window__empty">Say hello to {chatUser.name}!</p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`bubble ${msg.fromMe ? "bubble--mine" : "bubble--theirs"}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chat-window__input-row">
            <input
              className="chat-window__input"
              disabled={sessionExpired}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={sessionExpired ? "Session ended" : "Write a message…"}
              autoFocus
            />
            <button
              className="btn btn-send"
              onClick={handleSend}
              disabled={sessionExpired || !messageText.trim()}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}