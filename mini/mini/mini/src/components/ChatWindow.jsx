import { useState, useEffect, useRef } from "react";
import { AVATAR_COLORS } from "../data/mockData";

const WINDOW_WIDTH  = 328;
const WINDOW_GAP    = 12;
const RIGHT_OFFSET  = 280;

// Creative SVG icons for chat window header buttons
const IconMinimize = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="2" y1="14" x2="14" y2="14"/>
  </svg>
);

const IconRestore = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 10 8 6 12 10"/>
  </svg>
);

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="2" y1="2" x2="14" y2="14"/>
    <line x1="14" y1="2" x2="2" y2="14"/>
  </svg>
);

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
            {minimized ? <IconRestore /> : <IconMinimize />}
          </button>
          <button
            className="chat-window__btn"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Close"
          >
            <IconClose />
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
              {/* Creative send icon: paper plane */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}