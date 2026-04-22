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
    setSessionInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  }

  async function handleCreateSession() {
    if (!sessionName.trim()) return setError("Please enter a session name.");
    setLoading(true); setError("");
    const result = await api.createSession(sessionName, durationMinutes);
    setLoading(false);
    if (result.success) { setCreatedSessionId(result.sessionId); setSessionId(result.sessionId); }
    else { setError("Could not create session. Try again."); }
  }

  async function handleJoinSession() {
    if (!sessionId.trim()) return setError("Please enter a Session ID.");
    if (!requirement)      return setError("Please select what you are looking for.");
    setLoading(true); setError("");
    const result = await api.joinSession(sessionId, requirement, sessionInterests);
    setLoading(false);
    if (result.success) { onJoinSuccess(result.sessionId, requirement, sessionInterests, result.expiresAt); }
    else { setError(result.error); }
  }

  return (
    <div className="page-center">
      <div className="form-card" style={{ maxWidth: 560 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <div>
            <h2 className="form-title" style={{ margin:0, fontSize:22 }}>Join an Event</h2>
            <p style={{ margin:"5px 0 0 0", color:"var(--text-sub)", fontSize:14 }}>Welcome, {currentUser.name}</p>
          </div>
          <button onClick={onBackToHome} className="join-back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Home
          </button>
        </div>

        <div className="tab-row">
          <button className={`tab-btn ${activeTab === "join" ? "tab-btn--active" : ""}`} onClick={() => { setActiveTab("join"); setError(""); }}>Join Session</button>
          <button className={`tab-btn ${activeTab === "create" ? "tab-btn--active" : ""}`} onClick={() => { setActiveTab("create"); setError(""); }}>Create Session</button>
        </div>

        {activeTab === "create" && (
          <div className="tab-content">
            <div className="field">
              <label className="field-label">Event / Session Name</label>
              <input className="field-input" placeholder="e.g. TechFest 2025, AI Summit" value={sessionName} onChange={e => setSessionName(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Session Duration</label>
              <div className="chip-row">
                {DURATION_OPTIONS.map(opt => (
                  <button key={opt.value} className={`chip chip--small ${durationMinutes === opt.value ? "chip--selected" : ""}`} onClick={() => setDurationMinutes(opt.value)}>{opt.label}</button>
                ))}
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="big-btn" onClick={handleCreateSession} disabled={loading}>{loading ? "Creating..." : "Generate Session ID"}</button>
            {createdSessionId && (
              <div className="session-id-box">
                <p className="session-id-label">Your Session ID (share with participants)</p>
                <div className="session-id-value">{createdSessionId}</div>
                <p className="session-id-hint">Session set for {DURATION_OPTIONS.find(o => o.value === durationMinutes)?.label}. Switch to Join Session tab to enter.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "join" && (
          <div className="tab-content">
            <div className="field">
              <label className="field-label">Session ID</label>
              <input className="field-input mono-input" placeholder="Enter Session ID (e.g. AB12CD)" value={sessionId} onChange={e => setSessionId(e.target.value.toUpperCase())} />
            </div>
            <div className="field">
              <label className="field-label">What are you looking for?</label>
              <div className="chip-row">
                {ALL_REQUIREMENTS.map(req => (
                  <button key={req} className={`chip chip--green ${requirement === req ? "chip--green-selected" : ""}`} onClick={() => setRequirement(req)}>{req}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="field-label">Your interests <span className="field-label-hint">(optional — override for this session)</span></label>
              <div className="chip-row">
                {ALL_INTERESTS.map(interest => (
                  <button key={interest} className={`chip chip--small ${sessionInterests.includes(interest) ? "chip--selected" : ""}`} onClick={() => toggleInterest(interest)}>{interest}</button>
                ))}
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="big-btn" onClick={handleJoinSession} disabled={loading}>{loading ? "Joining..." : "Enter Event"}</button>
          </div>
        )}
      </div>
    </div>
  );
}