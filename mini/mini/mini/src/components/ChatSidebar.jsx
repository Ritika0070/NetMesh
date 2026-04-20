// ─────────────────────────────────────────────
//  components/ChatSidebar.jsx
//  LinkedIn-style right sidebar.
//  Shows:
//    • Connected people  → click to open chat
//    • Pending sent      → shows "awaiting" badge, chat locked until accepted
// ─────────────────────────────────────────────

import { AVATAR_COLORS } from "../data/mockData";

export default function ChatSidebar({ connections, pendingSent = [], openChats, onOpenChat, sessionExpired }) {
  // FIX: filter out any undefined/null entries before rendering
  const safeConnections = connections.filter((p) => p && p.id != null);
  const safePending     = pendingSent.filter((p) => p && p.id != null);

  const hasAny = safeConnections.length > 0 || safePending.length > 0;

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar__header">
        <span className="chat-sidebar__title">Your Connections</span>
        {safeConnections.length > 0 && (
          <span className="chat-sidebar__count">{safeConnections.length}</span>
        )}
      </div>

      <div className="chat-sidebar__list">
        {!hasAny ? (
          <p className="chat-sidebar__empty">
            Connect with someone to start chatting
          </p>
        ) : (
          <>
            {/* ── Connected ── */}
            {safeConnections.length > 0 && (
              <>
                <p className="chat-sidebar__section-label">Connected</p>
                {safeConnections.map((person) => {
                  const color  = AVATAR_COLORS[person.id.toString().charCodeAt(1) % AVATAR_COLORS.length];
                  const isOpen = openChats.some((c) => c && c.id === person.id);
                  return (
                    <button
                      key={person.id}
                      className={`chat-sidebar__item ${isOpen ? "chat-sidebar__item--active" : ""}`}
                      disabled={sessionExpired}
                      onClick={() => onOpenChat(person)}
                      title={sessionExpired ? "Session ended" : `Chat with ${person.name}`}
                    >
                      <span
                        className="chat-sidebar__avatar"
                        style={{ background: color + "22", color, border: `1.5px solid ${color}55` }}
                      >
                        {person.avatar}
                      </span>
                      <span className="chat-sidebar__name">{person.name}</span>
                      {isOpen && <span className="chat-sidebar__dot" />}
                    </button>
                  );
                })}
              </>
            )}

            {/* ── Pending sent ── */}
            {safePending.length > 0 && (
              <>
                <p className="chat-sidebar__section-label chat-sidebar__section-label--pending">
                  Awaiting Response
                </p>
                {safePending.map((person) => {
                  const color = AVATAR_COLORS[person.id.toString().charCodeAt(1) % AVATAR_COLORS.length];
                  return (
                    <div
                      key={person.id}
                      className="chat-sidebar__item chat-sidebar__item--pending"
                      title={`Waiting for ${person.name} to accept your request`}
                    >
                      <span
                        className="chat-sidebar__avatar chat-sidebar__avatar--pending"
                        style={{ background: color + "11", color: color + "88", border: `1.5px dashed ${color}44` }}
                      >
                        {person.avatar}
                      </span>
                      <span className="chat-sidebar__name chat-sidebar__name--pending">
                        {person.name}
                      </span>
                      <span className="chat-sidebar__pending-badge">Pending</span>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}