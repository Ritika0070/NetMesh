// ─────────────────────────────────────────────
//  pages/RegisterPage.jsx
//  New user sign-up form
//  Fields: name, email, password, bio, interests
// ─────────────────────────────────────────────

import { useState } from "react";
import { ALL_INTERESTS } from "../data/mockData";
import api from "../services/api";

export default function RegisterPage({ onRegisterSuccess, onGoToLogin }) {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [bio, setBio]             = useState("");
  const [interests, setInterests] = useState([]); // selected interest chips

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Toggle an interest chip on/off
  function toggleInterest(interest) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleSubmit() {
    // Basic validation
    if (!name.trim())         return setError("Please enter your name.");
    if (!email.includes("@")) return setError("Please enter a valid email.");
    if (password.length < 6)  return setError("Password must be at least 6 characters.");
    if (!bio.trim())          return setError("Please write a short bio.");
    if (interests.length < 2) return setError("Please select at least 2 interests.");

    setLoading(true);
    setError("");

    const result = await api.register(name, email, password, interests, bio);

    setLoading(false);

    if (result.success) {
      onRegisterSuccess(result.user);
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="page-center">
      <div className="form-card">

        {/* Header */}
        <div className="form-header">
          <div className="form-icon">⚡</div>
          <h2 className="form-title">Create Account</h2>
          <p className="form-subtitle">Join the event network</p>
        </div>

        {/* Name */}
        <div className="field">
          <label className="field-label">Full Name</label>
          <input
            className="field-input"
            placeholder="e.g. Aryan Mehta"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Bio */}
        <div className="field">
          <label className="field-label">Short Bio</label>
          <textarea
            className="field-textarea"
            placeholder="What do you do? What are you passionate about?"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
        </div>

        {/* Interests — multi-select chips */}
        <div className="field">
          <label className="field-label">
            Your Interests
            <span className="field-label-hint"> (select at least 2 — saved permanently)</span>
          </label>
          <div className="chip-row">
            {ALL_INTERESTS.map((interest) => (
              <button
                key={interest}
                className={`chip ${interests.includes(interest) ? "chip--selected" : ""}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && <p className="error-text">{error}</p>}

        {/* Submit */}
        <button
          className="big-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account →"}
        </button>

        {/* Switch to login */}
        <p className="switch-text">
          Already have an account?{" "}
          <span className="switch-link" onClick={onGoToLogin}>Log in</span>
        </p>

      </div>
    </div>
  );
}
