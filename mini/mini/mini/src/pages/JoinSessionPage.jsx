import { useState } from "react";
import api from "../services/api";
import { ALL_INTERESTS } from "../data/mockData";

const DURATION_OPTIONS = [
  { label: "5 min",   value: 5    },
  { label: "30 min",  value: 30   },
  { label: "1 hour",  value: 60   },
  { label: "2 hours", value: 120  },
  { label: "4 hours", value: 240  },
  { label: "8 hours", value: 480  },
  { label: "1 day",   value: 1440 },
];

const ALL_REQUIREMENTS = ["Networking","Job Opportunities","Collaboration","Mentorship","Investment","Co-founder Hunt"];

export default function JoinSessionPage({ currentUser, onJoinSuccess, onBackToHome }) {
  const [activeTab, setActiveTab]               = useState("join");
  const [sessionId, setSessionId]               = useState("");
  const [requirement, setRequirement]           = useState("");
  const [sessionInterests, setSessionInterests] = useState([...currentUser.interests]);
  const [sessionName, setSessionName]           = useState("");
  const [createdSessionId, setCreatedSessionId] = useState("");
  const [durationMinutes, setDurationMinutes]   = useState(120);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");
  const [copied, setCopied]                     = useState(false);

  function toggleInterest(interest) {
    setSessionInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleCreateSession() {
    if (!sessionName.trim()) return setError("Please enter a session name.");
    setLoading(true);
    setError("");
    const result = await api.createSession(sessionName, durationMinutes);
    setLoading(false);
    if (result.success) {
      setCreatedSessionId(result.sessionId);
      setSessionId(result.sessionId);
    } else {
      setError("Could not create session. Try again.");
    }
  }

  async function handleJoinSession() {
    if (!sessionId.trim()) return setError("Please enter a Session ID.");
    if (!requirement)      return setError("Please select what you are looking for.");
    setLoading(true);
    setError("");
    const result = await api.joinSession(sessionId, requirement, sessionInterests);
    setLoading(false);
    if (result.success) {
      onJoinSuccess(result.sessionId, requirement, sessionInterests, result.expiresAt);
    } else {
      setError(result.error || "Could not join session. Check the ID and try again.");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(createdSessionId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="page-center">
      <div className="form-card" style={{ maxWidth: 560 }}>

        {/* ── Top bar with back button ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button
            onClick={onBackToHome}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-secondary)", borderRadius: 6,
              padding: "7px 14px", cursor: "pointer",
              fontSize: 12, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'Jost', sans-serif", letterSpacing: "0.06em",
              transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(196,160,80,0.4)"; e.currentTarget.style.color = "var(--cream-muted)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Home
          </button>
          <div style={{ flex: 1 }}>
            <h2 className="form-title" style={{ margin: 0, fontSize: 22 }}>Join an Event</h2>
            <p style={{ margin: "3px 0 0 0", color: "#9ca3af", fontSize: 13 }}>
              Welcome, {currentUser.name}
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tab-row">
          <button
            className={`tab-btn ${activeTab === "join" ? "tab-btn--active" : ""}`}
            onClick={() => { setActiveTab("join"); setError(""); }}
          >
            Join Session
          </button>
          <button
            className={`tab-btn ${activeTab === "create" ? "tab-btn--active" : ""}`}
            onClick={() => { setActiveTab("create"); setError(""); }}
          >
            Create Session
          </button>
        </div>

        {/* ── CREATE TAB ── */}
        {activeTab === "create" && (
          <div className="tab-content">
            <div className="field">
              <label className="field-label">Event / Session Name</label>
              <input
                className="field-input"
                placeholder="e.g. TechFest 2025, AI Summit"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="field">
              <label className="field-label">Session Duration</label>
              <div className="chip-row">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`chip chip--small ${durationMinutes === opt.value ? "chip--selected" : ""}`}
                    onClick={() => setDurationMinutes(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="form-error-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button className="big-btn" onClick={handleCreateSession} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="btn-spinner" />
                  Creating...
                </span>
              ) : "Generate Session ID"}
            </button>

            {createdSessionId && (
              <div className="session-id-box">
                <p className="session-id-label">Session ID — share with participants</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div className="session-id-value">{createdSessionId}</div>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? "rgba(196,160,80,0.15)" : "transparent",
                      border: "1px solid rgba(196,160,80,0.3)",
                      borderRadius: 6, padding: "6px 12px",
                      color: copied ? "var(--gold-pale)" : "var(--gold)",
                      cursor: "pointer", fontSize: 12, fontFamily: "'Jost', sans-serif",
                      transition: "all 0.18s", letterSpacing: "0.06em",
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="session-id-hint">
                  Session set for {DURATION_OPTIONS.find(o => o.value === durationMinutes)?.label}.
                  Switch to the Join tab to enter the event.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── JOIN TAB ── */}
        {activeTab === "join" && (
          <div className="tab-content">
            <div className="field">
              <label className="field-label">Session ID</label>
              <input
                className="field-input mono-input"
                placeholder="Enter Session ID (e.g. AB12CD)"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>

            <div className="field">
              <label className="field-label">What are you looking for?</label>
              <div className="chip-row">
                {ALL_REQUIREMENTS.map((req) => (
                  <button
                    key={req}
                    className={`chip chip--green ${requirement === req ? "chip--green-selected" : ""}`}
                    onClick={() => setRequirement(req)}
                  >
                    {req}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">
                Your interests for this session
                <span className="field-label-hint"> (optional override)</span>
              </label>
              <div className="chip-row">
                {ALL_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    className={`chip chip--small ${sessionInterests.includes(interest) ? "chip--selected" : ""}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="form-error-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button className="big-btn" onClick={handleJoinSession} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="btn-spinner" />
                  Joining...
                </span>
              ) : "Enter Event →"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
