import { AVATAR_COLORS } from "../data/mockData";

export default function ProfileCard({ profile, isConnected, onConnect, onSkip, sessionExpired }) {
  const avatarColor = AVATAR_COLORS[profile.id.charCodeAt(1) % AVATAR_COLORS.length];

  function getMatchColor(score) {
    if (score >= 60) return "#10B981";
    if (score >= 30) return "#F59E0B";
    return "#6B7280";
  }

  return (
    <div className={`profile-card ${isConnected ? "profile-card--connected" : ""}`}>

      {isConnected && (
        <span className="connected-badge">✓ Connected</span>
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
            color:      getMatchColor(profile.matchScore),
            fontWeight: 600,
            fontSize:   13,
            margin:     "2px 0 0 0",
          }}>
            {profile.matchScore}% match
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
              💬 Chat
            </button>
          ) : (
            <>
              <button className="btn btn-connect" onClick={() => onConnect(profile)}>
                Connect
              </button>
              <button className="btn btn-skip" onClick={() => onSkip(profile.id)}>
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