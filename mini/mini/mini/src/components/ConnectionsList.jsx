// ─────────────────────────────────────────────
//  components/ConnectionsList.jsx
//  Horizontal bar showing your connected people
//  Click any name to open chat with them
// ─────────────────────────────────────────────

import { AVATAR_COLORS } from "../data/mockData";

export default function ConnectionsList({ connections, onOpenChat, sessionExpired }) {
  // Don't render anything if no connections yet
  if (connections.length === 0) return null;

  return (
    <div className="connections-bar">
      <span className="connections-label">
        Your Connections ({connections.length})
      </span>

      <div className="connections-chips">
        {connections.map((person) => {
          const color = AVATAR_COLORS[person.id.charCodeAt(1) % AVATAR_COLORS.length];
          return (
            <button
              key={person.id}
              disabled={sessionExpired}
              onClick={() => onOpenChat(person)}
              className="connection-chip"
              style={{ opacity: sessionExpired ? 0.4 : 1, cursor: sessionExpired ? "not-allowed" : "pointer" }}
            >
              {/* Mini avatar circle */}
              <span
                className="mini-avatar"
                style={{ background: color + "22", color }}
              >
                {person.avatar}
              </span>
              {/* First name only */}
              {person.name.split(" ")[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
