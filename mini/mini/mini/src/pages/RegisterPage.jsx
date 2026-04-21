import { useState } from "react";
import { ALL_INTERESTS } from "../data/mockData";
import api from "../services/api";

const STEPS = ["Account", "About You", "Interests"];

export default function RegisterPage({ onRegisterSuccess, onGoToLogin }) {
  const [step, setStep]           = useState(0);
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPass, setConfirm] = useState("");
  const [bio, setBio]             = useState("");
  const [interests, setInterests] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showPass, setShowPass]   = useState(false);

  function toggleInterest(interest) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  function nextStep() {
    setError("");
    if (step === 0) {
      if (!name.trim())           return setError("Please enter your full name.");
      if (!email.includes("@"))   return setError("Please enter a valid email.");
      if (password.length < 6)    return setError("Password must be at least 6 characters.");
      if (password !== confirmPass) return setError("Passwords do not match.");
    }
    if (step === 1) {
      if (!bio.trim())            return setError("Please write a short bio.");
    }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    if (interests.length < 2) return setError("Please select at least 2 interests.");
    setLoading(true);
    setError("");
    const result = await api.register(name.trim(), email.trim().toLowerCase(), password, interests, bio.trim());
    setLoading(false);
    if (result.success) {
      onRegisterSuccess(result.user);
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="page-center">
      <div className="form-card" style={{ maxWidth: 480 }}>

        {/* Header */}
        <div className="form-header" style={{ marginBottom: 28 }}>
          <div className="form-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="10" r="4" stroke="#C4A050" strokeWidth="1.4"/>
              <path d="M8 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#C4A050" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="27" cy="10" r="2.5" stroke="#DDB96A" strokeWidth="1.2" strokeOpacity="0.7"/>
              <line x1="24.5" y1="10" x2="20" y2="10" stroke="#DDB96A" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="2 2"/>
              <circle cx="5"  cy="10" r="2.5" stroke="#DDB96A" strokeWidth="1.2" strokeOpacity="0.7"/>
              <line x1="7.5"  y1="10" x2="12" y2="10" stroke="#DDB96A" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="2 2"/>
            </svg>
          </div>
          <h2 className="form-title">Create Account</h2>
          <p className="form-subtitle">Join the professional network</p>
        </div>

        {/* Step indicator */}
        <div className="reg-steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`reg-step ${i === step ? "reg-step--active" : i < step ? "reg-step--done" : ""}`}>
              <div className="reg-step__dot">
                {i < step ? (
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="2 7 6 11 12 3"/>
                  </svg>
                ) : i + 1}
              </div>
              <span className="reg-step__label">{label}</span>
              {i < STEPS.length - 1 && <div className={`reg-step__line ${i < step ? "reg-step__line--done" : ""}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 0: Account ── */}
        {step === 0 && (
          <div className="tab-content">
            <div className="field">
              <label className="field-label">Full Name</label>
              <input
                className="field-input"
                placeholder="e.g. Aryan Mehta"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                autoFocus
              />
            </div>
            <div className="field">
              <label className="field-label">Email address</label>
              <input
                className="field-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="field-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
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
            <div className="field">
              <label className="field-label">Confirm Password</label>
              <input
                className="field-input"
                type="password"
                placeholder="Re-enter password"
                value={confirmPass}
                onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && nextStep()}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: About You ── */}
        {step === 1 && (
          <div className="tab-content">
            <div className="field">
              <label className="field-label">Short Bio</label>
              <textarea
                className="field-textarea"
                placeholder="What do you do? What are you passionate about? (This helps AI match you better)"
                value={bio}
                onChange={(e) => { setBio(e.target.value); setError(""); }}
                rows={4}
                autoFocus
              />
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6, letterSpacing: "0.04em" }}>
                {bio.length}/200 characters
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Interests ── */}
        {step === 2 && (
          <div className="tab-content">
            <div className="field">
              <label className="field-label">
                Your Interests
                <span className="field-label-hint"> — select at least 2</span>
              </label>
              <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12, letterSpacing: "0.02em" }}>
                These are saved permanently and used for AI matching.
              </p>
              <div className="chip-row">
                {ALL_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    className={`chip ${interests.includes(interest) ? "chip--selected" : ""}`}
                    onClick={() => { toggleInterest(interest); setError(""); }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {interests.length > 0 && (
                <p style={{ fontSize: 11, color: "var(--gold)", marginTop: 10, letterSpacing: "0.06em" }}>
                  {interests.length} selected
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="form-error-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {step > 0 && (
            <button
              className="big-btn"
              onClick={() => { setStep(s => s - 1); setError(""); }}
              style={{ flex: "0 0 auto", width: "auto", padding: "15px 24px" }}
            >
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button className="big-btn" onClick={nextStep} style={{ flex: 1 }}>
              Continue →
            </button>
          ) : (
            <button className="big-btn" onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="btn-spinner" />
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          )}
        </div>

        <p className="switch-text" style={{ marginTop: 20 }}>
          Already have an account?{" "}
          <span className="switch-link" onClick={onGoToLogin}>Sign in</span>
        </p>

      </div>
    </div>
  );
}
