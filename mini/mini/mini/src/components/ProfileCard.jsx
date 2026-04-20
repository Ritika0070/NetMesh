// ─────────────────────────────────────────────
//  components/ProfileCard.jsx
//  Shows connect/chat/pending state correctly
// ─────────────────────────────────────────────

import { AVATAR_COLORS } from "../data/mockData";

// Creative SVG icons used in buttons
const IconChat = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px',verticalAlign:'middle'}}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconConnect = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px',verticalAlign:'middle'}}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconSkip = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px',verticalAlign:'middle'}}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function ProfileCard({ profile, isConnected, onConnect, onSkip, sessionExpired }) {
  const avatarColor = AVATAR_COLORS[profile.id.toString().charCodeAt(1) % AVATAR_COLORS.length];
  const safeMatchScore = Number.isFinite(profile.matchScore)
    ? Math.max(0, Math.min(100, Math.round(profile.matchScore)))
    : 0;

  function getMatchColor(score) {
    if (score >= 60) return "#10B981";
    if (score >= 30) return "#F59E0B";
    return "#6B7280";
  }

  return (
    <div className={`profile-card ${isConnected ? "profile-card--connected" : ""}`}>

      {isConnected && (
        <span className="connected-badge">
          {/* Creative connected badge: two linked nodes */}
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{marginRight:'4px',verticalAlign:'middle'}}>
            <circle cx="3"  cy="8" r="2.5" fill="#C4A050"/>
            <circle cx="13" cy="8" r="2.5" fill="#C4A050"/>
            <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="#C4A050" strokeWidth="1.5"/>
          </svg>
          Connected
        </span>
      )}

      <div className="card-top">
        <div
          className="avatar"
          style={{
            background: avatarColor + "22",
            color: avatarColor,
            border: `1.5px solid ${avatarColor}55`,
          }}
        >
          {profile.avatar}
        </div>
        <div>
          <p className="card-name">{profile.name}</p>
          <p style={{
            color:      getMatchColor(safeMatchScore),
            fontWeight: 600,
            fontSize:   13,
            margin:     "2px 0 0 0",
          }}>
            {safeMatchScore}% match
          </p>
        </div>
      </div>

      <p className="card-bio">{profile.bio}</p>

      <div className="tag-row">
        {profile.interests.map((interest) => (
          <span key={interest} className="interest-tag">{interest}</span>
        ))}
      </div>

      {!sessionExpired ? (
        <div className="card-buttons">
          {isConnected ? (
            <button
              className="btn btn-chat"
              onClick={() => onConnect(profile, "open-chat")}
            >
              <IconChat />
              Chat
            </button>
          ) : (
            <>
              <button className="btn btn-connect" onClick={() => onConnect(profile)}>
                <IconConnect />
                Connect
              </button>
              <button className="btn btn-skip" onClick={() => onSkip(profile.id)}>
                <IconSkip />
                Skip
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="session-ended-label">Session ended</p>
      )}

    </div>
  );
}