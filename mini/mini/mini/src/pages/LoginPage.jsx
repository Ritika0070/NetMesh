import { useState } from "react";
import api from "../services/api";

export default function LoginPage({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email.trim())            return setError("Please enter your email.");
    if (!email.includes("@"))     return setError("Enter a valid email address.");
    if (!password)                return setError("Please enter your password.");
    setLoading(true);
    setError("");
    const result = await api.login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setError(result.message || "Invalid email or password.");
    }
  }

  return (
    <div className="page-center">
      <div className="form-card">

        <div className="form-header">
          <div className="form-icon">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="19" cy="19" r="17" stroke="#C4A050" strokeWidth="0.8" strokeOpacity="0.18"/>
              <circle cx="19" cy="10" r="3"  fill="#C4A050" fillOpacity="0.9"/>
              <circle cx="10" cy="26" r="2.5" fill="#DDB96A" fillOpacity="0.7"/>
              <circle cx="28" cy="26" r="2.5" fill="#DDB96A" fillOpacity="0.7"/>
              <line x1="19" y1="13" x2="10" y2="23.5" stroke="#C4A050" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="19" y1="13" x2="28" y2="23.5" stroke="#C4A050" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="12.5" y1="26" x2="25.5" y2="26" stroke="#C4A050" strokeWidth="1" strokeOpacity="0.25"/>
              <path d="M19 4 L19 7" stroke="#EDD898" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M17 6 L19 4 L21 6" stroke="#EDD898" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Sign in to continue to NetMesh</p>
        </div>

        <div className="field">
          <label className="field-label">Email address</label>
          <input
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label className="field-label">Password</label>
          <div style={{ position: "relative" }}>
            <input
              className="field-input"
              type={showPass ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              style={{
                position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-dim)", padding: 0, display: "flex", alignItems: "center",
              }}
              tabIndex={-1}
            >
              {showPass ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
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

        <button className="big-btn" onClick={handleLogin} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span className="btn-spinner" />
              Signing in...
            </span>
          ) : "Sign In →"}
        </button>

        <p className="switch-text" style={{ marginTop: 24 }}>
          New to NetMesh?{" "}
          <span className="switch-link" onClick={onGoToRegister}>Create account</span>
        </p>

      </div>
    </div>
  );
}
