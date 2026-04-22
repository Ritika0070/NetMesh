import "./AuthPages.css";
import { useState } from "react";
import { ALL_INTERESTS } from "../data/mockData";
import api from "../services/api";

export default function RegisterPage({ onRegisterSuccess, onGoToLogin }) {
  const [step, setStep]           = useState(1);
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [bio, setBio]             = useState("");
  const [interests, setInterests] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [focused, setFocused]     = useState("");

  function toggleInterest(i) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  function handleNext() {
    if (!name.trim())         return setError("Please enter your full name.");
    if (!email.includes("@")) return setError("Please enter a valid email.");
    if (password.length < 6)  return setError("Password must be at least 6 characters.");
    setError(""); setStep(2);
  }

  async function handleSubmit() {
    if (!bio.trim())          return setError("Please write a short bio.");
    if (interests.length < 2) return setError("Please select at least 2 interests.");
    setLoading(true); setError("");
    const result = await api.register(name, email, password, interests, bio);
    setLoading(false);
    if (result.success) { onRegisterSuccess(result.user); }
    else { setError(result.message || "Registration failed. Please try again."); }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="auth-left-logo-mark">
            <svg viewBox="0 0 36 36" fill="none" width="22" height="22">
              <circle cx="9"  cy="9"  r="4" fill="#0a66c2"/>
              <circle cx="27" cy="9"  r="4" fill="#0a66c2"/>
              <circle cx="18" cy="27" r="4" fill="#0a66c2"/>
              <line x1="9" y1="9" x2="27" y2="9"  stroke="#0a66c2" strokeWidth="2"/>
              <line x1="9" y1="9" x2="18" y2="27" stroke="#0a66c2" strokeWidth="2"/>
              <line x1="27" y1="9" x2="18" y2="27" stroke="#0a66c2" strokeWidth="2"/>
            </svg>
          </div>
          <span className="auth-left-logo-text">NetMesh</span>
        </div>
        <p className="auth-left-tagline">Build your network.<br/>Find your people.</p>
        <p className="auth-left-sub">NetMesh uses AI to connect you with the most relevant professionals at every event.</p>
      </div>

      <div className="auth-right">
        <div className="auth-card auth-card--wide">
          <div className="auth-steps">
            <div className={`auth-step ${step >= 1 ? "auth-step--active" : ""}`}>
              <span className="auth-step-num">1</span>
              <span className="auth-step-label">Account</span>
            </div>
            <div className="auth-step-line"/>
            <div className={`auth-step ${step >= 2 ? "auth-step--active" : ""}`}>
              <span className="auth-step-num">2</span>
              <span className="auth-step-label">Profile</span>
            </div>
          </div>

          {step === 1 && (
            <>
              <div className="auth-header">
                <h2 className="auth-title">Make the most of your professional life</h2>
              </div>

              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className={`auth-input-wrap ${focused === "name" ? "auth-input-wrap--focused" : ""}`}>
                  <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input className="auth-input" placeholder="First and last name"
                    value={name} onChange={e => { setName(e.target.value); setError(""); }}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                    onKeyDown={e => e.key === "Enter" && handleNext()} />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Email</label>
                <div className={`auth-input-wrap ${focused === "email" ? "auth-input-wrap--focused" : ""}`}>
                  <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input className="auth-input" type="email" placeholder="you@example.com"
                    value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    onKeyDown={e => e.key === "Enter" && handleNext()} />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password (6+ characters)</label>
                <div className={`auth-input-wrap ${focused === "pw" ? "auth-input-wrap--focused" : ""}`}>
                  <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input className="auth-input auth-input--pass"
                    type={showPass ? "text" : "password"} placeholder="Password"
                    value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                    onFocus={() => setFocused("pw")} onBlur={() => setFocused("")}
                    onKeyDown={e => e.key === "Enter" && handleNext()} />
                  <button className="auth-eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1} type="button">
                    {showPass
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="auth-strength">
                    <div className="auth-strength-bar">
                      <div className={`auth-strength-fill auth-strength-fill--${password.length < 6 ? "weak" : password.length < 10 ? "medium" : "strong"}`} style={{width:`${Math.min(100,(password.length/12)*100)}%`}}/>
                    </div>
                    <span className="auth-strength-label">{password.length < 6 ? "Too short" : password.length < 10 ? "Good" : "Strong"}</span>
                  </div>
                )}
              </div>

              {error && <div className="auth-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}

              <button className="auth-submit-btn" onClick={handleNext}>Agree &amp; Join</button>
              <p style={{fontSize:11,color:"var(--text-dim)",textAlign:"center",marginTop:12,lineHeight:1.5}}>
                By clicking Agree &amp; Join, you agree to the NetMesh User Agreement, Privacy Policy, and Cookie Policy.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-header">
                <button className="auth-back-btn" onClick={() => { setStep(1); setError(""); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Back
                </button>
                <h2 className="auth-title">Complete your profile</h2>
                <p className="auth-subtitle">Let others know who you are</p>
              </div>

              <div className="auth-field">
                <label className="auth-label">Short Bio</label>
                <textarea className="auth-textarea"
                  placeholder="What do you do? What are you passionate about?"
                  value={bio} onChange={e => { setBio(e.target.value); setError(""); }} rows={3}/>
                <p className="auth-field-hint">{bio.length}/200</p>
              </div>

              <div className="auth-field">
                <label className="auth-label">Your Interests <span className="auth-field-hint-inline">— select at least 2</span></label>
                <div className="auth-chip-grid">
                  {ALL_INTERESTS.map(i => (
                    <button key={i} className={`auth-chip ${interests.includes(i) ? "auth-chip--on" : ""}`}
                      onClick={() => { toggleInterest(i); setError(""); }}>
                      {interests.includes(i) && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      {i}
                    </button>
                  ))}
                </div>
                {interests.length > 0 && <p className="auth-field-hint">{interests.length} selected</p>}
              </div>

              {error && <div className="auth-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}

              <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="auth-loading"><span className="auth-spinner"/>&nbsp;Creating account…</span> : "Create account"}
              </button>
            </>
          )}

          <div className="auth-divider"><span>Already on NetMesh?</span></div>
          <button className="auth-secondary-btn" onClick={onGoToLogin}>Sign in</button>
        </div>
      </div>
    </div>
  );
}