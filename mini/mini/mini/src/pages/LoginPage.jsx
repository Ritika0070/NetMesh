import { useState } from "react";
import api from "../services/api";

export default function LoginPage({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin() {
    if (!email.includes("@")) return setError("Enter a valid email.");
    if (!password)            return setError("Enter your password.");
    setLoading(true);
    setError("");
    const result = await api.login(email, password);
    setLoading(false);
    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="page-center">
      <div className="form-card">

        <div className="form-header">
          {/* NetMesh node-graph mark — a person entering a network */}
          <div className="form-icon">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              {/* outer ring */}
              <circle cx="19" cy="19" r="17" stroke="#C4A050" strokeWidth="0.8" strokeOpacity="0.18"/>
              {/* three network nodes */}
              <circle cx="19" cy="10" r="3"  fill="#C4A050" fillOpacity="0.9"/>
              <circle cx="10" cy="26" r="2.5" fill="#DDB96A" fillOpacity="0.7"/>
              <circle cx="28" cy="26" r="2.5" fill="#DDB96A" fillOpacity="0.7"/>
              {/* connecting lines */}
              <line x1="19" y1="13" x2="10" y2="23.5" stroke="#C4A050" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="19" y1="13" x2="28" y2="23.5" stroke="#C4A050" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="12.5" y1="26" x2="25.5" y2="26" stroke="#C4A050" strokeWidth="1" strokeOpacity="0.25"/>
              {/* entry arrow — "entering the network" */}
              <path d="M19 4 L19 7" stroke="#EDD898" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M17 6 L19 4 L21 6" stroke="#EDD898" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Log in to continue</p>
        </div>

        <div className="field">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="big-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Log In →"}
        </button>

        <p className="switch-text">
          New here?{" "}
          <span className="switch-link" onClick={onGoToRegister}>Create account</span>
        </p>

      </div>
    </div>
  );
}