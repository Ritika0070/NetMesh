// ─────────────────────────────────────────────
//  pages/LoginPage.jsx
//  Existing user login — email + password only
// ─────────────────────────────────────────────

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

        {/* Header */}
        <div className="form-header">
          <div className="form-icon">👋</div>
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Log in to continue</p>
        </div>

        {/* Email */}
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

        {/* Password */}
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

        {/* Error */}
        {error && <p className="error-text">{error}</p>}

        {/* Submit */}
        <button
          className="big-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In →"}
        </button>

        {/* Switch to register */}
        <p className="switch-text">
          New here?{" "}
          <span className="switch-link" onClick={onGoToRegister}>Create account</span>
        </p>

      </div>
    </div>
  );
}
