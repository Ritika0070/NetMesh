import "./AuthPages.css";
import { useState } from "react";
import api from "../services/api";

export default function LoginPage({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [focused, setFocused]   = useState("");

  async function handleLogin() {
    if (!email.includes("@")) return setError("Please enter a valid email address.");
    if (!password)            return setError("Please enter your password.");
    setLoading(true); setError("");
    const result = await api.login(email, password);
    setLoading(false);
    if (result.success) { onLoginSuccess(result.user); }
    else { setError("Invalid email or password. Please try again."); }
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
        <p className="auth-left-tagline">Where meaningful<br/>connections begin.</p>
        <p className="auth-left-sub">
          Join sessions, get AI-powered matches, and build your professional network — all in real time.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Sign in</h2>
            <p className="auth-subtitle">Stay updated on your professional world</p>
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className={`auth-input-wrap ${focused === "email" ? "auth-input-wrap--focused" : ""}`}>
              <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input className="auth-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className={`auth-input-wrap ${focused === "password" ? "auth-input-wrap--focused" : ""}`}>
              <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input className="auth-input auth-input--pass"
                type={showPass ? "text" : "password"} placeholder="Your password"
                value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
              <button className="auth-eye-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1} type="button">
                {showPass
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button className="auth-submit-btn" onClick={handleLogin} disabled={loading}>
            {loading ? <span className="auth-loading"><span className="auth-spinner"/>&nbsp;Signing in…</span> : "Sign in"}
          </button>

          <div className="auth-divider"><span>New to NetMesh?</span></div>
          <button className="auth-secondary-btn" onClick={onGoToRegister}>Join now</button>
        </div>
      </div>
    </div>
  );
}