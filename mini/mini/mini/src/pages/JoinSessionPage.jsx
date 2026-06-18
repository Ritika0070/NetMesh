import "./JoinSessionPage.css";
import { useState } from "react";
import api from "../services/api";

const DURATION_OPTIONS = [
  { label: "5 min",   value: 5    },
  { label: "30 min",  value: 30   },
  { label: "1 hour",  value: 60   },
  { label: "2 hours", value: 120  },
  { label: "4 hours", value: 240  },
  { label: "8 hours", value: 480  },
  { label: "1 day",   value: 1440 },
];

const ALL_INTERESTS    = ["AI","Startups","Music","Design","Web3","Climate","Health","Fintech","Education","Gaming","Robotics","Marketing"];
const ALL_REQUIREMENTS = ["Networking","Job Opportunities","Collaboration","Mentorship","Investment","Co-founder Hunt"];

function saveSessionToHistory(sessionId, sessionName, requirement, sessionInterests, type) {
  const history = JSON.parse(localStorage.getItem("sessionHistory") || "[]");
  const filtered = history.filter(s => s.sessionId !== sessionId);
  const entry = {
    sessionId,
    sessionName: sessionName || sessionId,
    requirement,
    sessionInterests,
    type, // "joined" or "created"
    joinedAt: new Date().toISOString(),
    connectionsCount: 0,
    connectionNames: [],
    participantNames: [],   // for created sessions
    participantCount: 0,
  };
  localStorage.setItem("sessionHistory", JSON.stringify([entry, ...filtered].slice(0, 30)));
}

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

  function toggleInterest(interest) {
    setSessionInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  }

async function handleCreateSession() {
  if (!sessionName.trim()) return setError("Please enter a session name.");
  setLoading(true); setError("");
  const result = await api.createSession(sessionName, durationMinutes);
  setLoading(false);
  if (result.success) {
    setCreatedSessionId(result.sessionId);
    setSessionId(result.sessionId);
    // Save created session to history immediately
    saveSessionToHistory(result.sessionId, sessionName, "", [], "created");
  } else {
    setError("Could not create session. Try again.");
  }
}

async function handleJoinSession() {
  if (!sessionId.trim()) return setError("Please enter a Session ID.");
  if (!requirement)      return setError("Please select what you are looking for.");
  setLoading(true); setError("");
  const result = await api.joinSession(sessionId, requirement, sessionInterests);
  setLoading(false);
  if (result.success) {
    saveSessionToHistory(result.sessionId, result.sessionName, requirement, sessionInterests, "joined");
    onJoinSuccess(result.sessionId, requirement, sessionInterests, result.expiresAt);
  } else {
    setError(result.error);
  }
}
  return (
    <div className="js-page">
      {/* Header */}
      <header className="js-header">
        <div className="js-header__logo">
          <div className="js-header__logo-mark">
            <svg viewBox="0 0 36 36" fill="none" width="18" height="18">
              <circle cx="9" cy="9" r="4" fill="white"/>
              <circle cx="27" cy="9" r="4" fill="white"/>
              <circle cx="18" cy="27" r="4" fill="white"/>
              <line x1="9" y1="9" x2="27" y2="9" stroke="white" strokeWidth="2"/>
              <line x1="9" y1="9" x2="18" y2="27" stroke="white" strokeWidth="2"/>
              <line x1="27" y1="9" x2="18" y2="27" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <span className="js-header__brand">NetMesh</span>
        </div>
        <button className="js-header__back" onClick={onBackToHome}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Home
        </button>
      </header>

      <div className="js-body">
        {/* Left — decorative panel */}
        <div className="js-left">
          <div className="js-left__content">
            <h2 className="js-left__title">Join an Event</h2>
            <p className="js-left__sub">Welcome, {currentUser.name.split(" ")[0]} 👋</p>
            <p className="js-left__desc">Enter a session ID shared by your event organizer, or create your own session for any event.</p>
            <div className="js-left__stats">
              <div className="js-left__stat">
                <span className="js-left__stat-num">AI</span>
                <span className="js-left__stat-label">Smart Matching</span>
              </div>
              <div className="js-left__stat-div"/>
              <div className="js-left__stat">
                <span className="js-left__stat-num">∞</span>
                <span className="js-left__stat-label">Sessions</span>
              </div>
              <div className="js-left__stat-div"/>
              <div className="js-left__stat">
                <span className="js-left__stat-num">Live</span>
                <span className="js-left__stat-label">Real-time</span>
              </div>
            </div>
            {/* Decorative mesh SVG */}
            <svg viewBox="0 0 260 200" fill="none" className="js-left__deco">
              <circle cx="130" cy="80" r="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
              <circle cx="130" cy="80" r="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
              {[
                {cx:60,cy:40},{cx:200,cy:40},{cx:40,cy:130},{cx:220,cy:130},{cx:130,cy:160}
              ].map((n,i) => (
                <g key={i}>
                  <line x1={n.cx} y1={n.cy} x2="130" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3"/>
                  <circle cx={n.cx} cy={n.cy} r="14" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                  <circle cx={n.cx} cy={n.cy-4} r="4" fill="rgba(255,255,255,0.4)"/>
                </g>
              ))}
              <circle cx="130" cy="80" r="18" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <text x="122" y="85" fontSize="13" fill="white" fontWeight="700" fontFamily="sans-serif">NM</text>
            </svg>
          </div>
        </div>

        {/* Right — form */}
        <div className="js-right">
          <div className="js-card">
            {/* Tabs */}
            <div className="js-tabs">
              <button
                className={`js-tab ${activeTab === "join" ? "js-tab--active" : ""}`}
                onClick={() => { setActiveTab("join"); setError(""); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Join Session
              </button>
              <button
                className={`js-tab ${activeTab === "create" ? "js-tab--active" : ""}`}
                onClick={() => { setActiveTab("create"); setError(""); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Create Session
              </button>
            </div>

            {/* ── Create Tab ── */}
            {activeTab === "create" && (
              <div className="js-form">
                <div className="js-field">
                  <label className="js-label">Event / Session Name</label>
                  <input
                    className="js-input"
                    placeholder="e.g. TechFest 2025, AI Summit"
                    value={sessionName}
                    onChange={e => setSessionName(e.target.value)}
                  />
                </div>

                <div className="js-field">
                  <label className="js-label">Session Duration</label>
                  <div className="js-chip-row">
                    {DURATION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`js-chip ${durationMinutes === opt.value ? "js-chip--on" : ""}`}
                        onClick={() => setDurationMinutes(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="js-error">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <button className="js-btn" onClick={handleCreateSession} disabled={loading}>
                  {loading ? <span className="auth-loading"><span className="auth-spinner"/>&nbsp;Creating…</span> : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Generate Session ID
                    </>
                  )}
                </button>

                {createdSessionId && (
                  <div className="js-created-box">
                    <div className="js-created-box__pulse"/>
                    <p className="js-created-box__label">Session Created!</p>
                    <div className="js-created-box__id">{createdSessionId}</div>
                    <p className="js-created-box__hint">
                      Share this ID with participants. Duration: <strong>{DURATION_OPTIONS.find(o => o.value === durationMinutes)?.label}</strong>
                    </p>
                    <button className="js-btn js-btn--outline" style={{marginTop:14}} onClick={() => setActiveTab("join")}>
                      Enter Session →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Join Tab ── */}
            {activeTab === "join" && (
              <div className="js-form">
                <div className="js-field">
                  <label className="js-label">Session ID</label>
                  <input
                    className="js-input js-input--mono"
                    placeholder="AB12CD"
                    value={sessionId}
                    onChange={e => setSessionId(e.target.value.toUpperCase())}
                    maxLength={8}
                  />
                </div>

                <div className="js-field">
                  <label className="js-label">What are you looking for?</label>
                  <div className="js-chip-row">
                    {ALL_REQUIREMENTS.map(req => (
                      <button
                        key={req}
                        className={`js-chip js-chip--green ${requirement === req ? "js-chip--green-on" : ""}`}
                        onClick={() => setRequirement(req)}
                      >
                        {requirement === req && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                        {req}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="js-field">
                  <label className="js-label">
                    Your interests
                    <span className="js-label-hint"> — for this session</span>
                  </label>
                  <div className="js-chip-row">
                    {ALL_INTERESTS.map(interest => (
                      <button
                        key={interest}
                        className={`js-chip ${sessionInterests.includes(interest) ? "js-chip--on" : ""}`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  {sessionInterests.length > 0 && (
                    <p className="js-hint">{sessionInterests.length} selected</p>
                  )}
                </div>

                {error && (
                  <div className="js-error">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <button className="js-btn" onClick={handleJoinSession} disabled={loading}>
                  {loading ? <span className="auth-loading"><span className="auth-spinner"/>&nbsp;Joining…</span> : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                      Enter Event
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}