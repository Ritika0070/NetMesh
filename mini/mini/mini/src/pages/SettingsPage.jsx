import "./EditProfilePage.css";
import "./AuthPages.css";
import { useState, useEffect } from "react";

function EyeIcon({ show }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      )}
    </svg>
  );
}

export default function SettingsPage({ currentUser, onBack }) {
  const saved = JSON.parse(localStorage.getItem("nm_settings") || "{}");

  const [notifConnect, setNotifConnect] = useState(saved.notifConnect ?? true);
  const [notifMessage, setNotifMessage] = useState(saved.notifMessage ?? true);
  const [notifSession, setNotifSession] = useState(saved.notifSession ?? false);
  const [theme, setTheme]               = useState(saved.theme ?? "light");

  const [currentPwd, setCurrentPwd]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [pwdError, setPwdError]       = useState("");
  const [pwdSuccess, setPwdSuccess]   = useState(false);
  const [pwdLoading, setPwdLoading]   = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  const [saveStatus, setSaveStatus] = useState("idle");
  const [notifPermission, setNotifPermission] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [theme]);

  async function handleSave() {
    setSaveStatus("saving");
    const settings = { notifConnect, notifMessage, notifSession, theme };
    localStorage.setItem("nm_settings", JSON.stringify(settings));

    if ((notifConnect || notifMessage) && "Notification" in window) {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
      }
    }

    setTimeout(() => setSaveStatus("saved"), 500);
    setTimeout(() => setSaveStatus("idle"), 2500);
  }

  async function handlePasswordChange() {
    setPwdError("");
    setPwdSuccess(false);
    if (!currentPwd) return setPwdError("Please enter your current password.");
    if (newPwd.length < 6) return setPwdError("New password must be at least 6 characters.");
    if (newPwd !== confirmPwd) return setPwdError("Passwords do not match.");
    if (currentPwd === newPwd) return setPwdError("New password must be different from current.");

    setPwdLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const result = await res.json();
      setPwdLoading(false);
      if (result.success) {
        setPwdSuccess(true);
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
        setTimeout(() => setPwdSuccess(false), 3000);
      } else {
        setPwdError(result.message || "Could not change password.");
      }
    } catch {
      setPwdLoading(false);
      setPwdError("Server error. Please try again.");
    }
  }

  function pwdStrength(p) {
    if (!p) return { w: "0%", label: "", color: "" };
    if (p.length < 6) return { w: "33%", label: "Weak", color: "#dc3545" };
    if (p.length < 10 || !/[^a-zA-Z0-9]/.test(p)) return { w: "66%", label: "Medium", color: "#f59e0b" };
    return { w: "100%", label: "Strong", color: "#057642" };
  }
  const strength = pwdStrength(newPwd);

  const toggleItems = [
    { label: "Connection Requests", desc: "Get notified when someone wants to connect", val: notifConnect, set: setNotifConnect, color: "#0a66c2" },
    { label: "New Messages",        desc: "Get notified when you receive a chat message", val: notifMessage, set: setNotifMessage, color: "#10B981" },
    { label: "Session Reminders",   desc: "Alert when your session is about to expire",  val: notifSession, set: setNotifSession, color: "#F59E0B" },
  ];

  const themeOptions = [
    {
      val: "light",
      label: "Light",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ),
    },
    {
      val: "dark",
      label: "Dark",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ),
    },
    {
      val: "system",
      label: "System",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'DM Sans',sans-serif" }}>

      <header style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 52, display: "flex", alignItems: "center", boxShadow: "var(--sh-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 6, background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 36 36" fill="none" width="20" height="20">
              <circle cx="9" cy="9" r="4" fill="white"/><circle cx="27" cy="9" r="4" fill="white"/>
              <circle cx="18" cy="27" r="4" fill="white"/>
              <line x1="9" y1="9" x2="27" y2="9" stroke="white" strokeWidth="2"/>
              <line x1="9" y1="9" x2="18" y2="27" stroke="white" strokeWidth="2"/>
              <line x1="27" y1="9" x2="18" y2="27" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--dark)", letterSpacing: "-0.02em" }}>NetMesh</span>
        </div>
      </header>

      <div className="ep-wrap">
        <button className="ep-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Home
        </button>

        <div className="ep-card">
          <div className="ep-header">
            <div className="ep-header__avatar" style={{ background: "var(--blue)", borderRadius: 14 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            </div>
            <div>
              <h2 className="ep-header__title">Settings</h2>
              <p className="ep-header__sub">Manage your preferences</p>
            </div>
          </div>

          {/* ── NOTIFICATIONS ── */}
          <div className="settings-section">
            <div className="settings-section__head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              Notifications
            </div>

            {notifPermission === "denied" && (
              <div className="settings-warning">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Browser notifications are blocked. Enable them in your browser site settings.
              </div>
            )}
            {notifPermission === "granted" && (notifConnect || notifMessage) && (
              <div className="settings-info">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Browser notifications are active.
              </div>
            )}

            {toggleItems.map(item => (
              <div key={item.label} className="settings-toggle-row">
                <div className="settings-toggle-row__dot" style={{ background: item.color }}/>
                <div className="settings-toggle-row__text">
                  <p className="settings-toggle-row__label">{item.label}</p>
                  <p className="settings-toggle-row__desc">{item.desc}</p>
                </div>
                <button
                  className={`settings-toggle ${item.val ? "settings-toggle--on" : ""}`}
                  onClick={() => item.set(v => !v)}
                >
                  <span className="settings-toggle__knob"/>
                </button>
              </div>
            ))}
          </div>

          {/* ── APPEARANCE ── */}
          <div className="settings-section">
            <div className="settings-section__head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Appearance
            </div>
            <div className="settings-theme-grid">
              {themeOptions.map(t => (
                <button
                  key={t.val}
                  className={`settings-theme-btn ${theme === t.val ? "settings-theme-btn--on" : ""}`}
                  onClick={() => setTheme(t.val)}
                >
                  <span className="settings-theme-btn__icon">{t.icon}</span>
                  <span className="settings-theme-btn__label">{t.label}</span>
                  {theme === t.val && (
                    <span className="settings-theme-btn__check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── CHANGE PASSWORD ── */}
          <div className="settings-section">
            <div className="settings-section__head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Change Password
            </div>

            <div className="auth-field">
              <label className="auth-label">Current Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  className="auth-input auth-input--pass"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPwd}
                  onChange={e => { setCurrentPwd(e.target.value); setPwdError(""); }}
                />
                <button className="auth-eye-btn" type="button" onClick={() => setShowCurrent(v => !v)}>
                  <EyeIcon show={showCurrent}/>
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">New Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  className="auth-input auth-input--pass"
                  type={showNew ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={newPwd}
                  onChange={e => { setNewPwd(e.target.value); setPwdError(""); }}
                />
                <button className="auth-eye-btn" type="button" onClick={() => setShowNew(v => !v)}>
                  <EyeIcon show={showNew}/>
                </button>
              </div>
              {newPwd && (
                <div className="auth-strength">
                  <div className="auth-strength-bar">
                    <div className="auth-strength-fill" style={{ width: strength.w, background: strength.color }}/>
                  </div>
                  <span className="auth-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm New Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  className="auth-input auth-input--pass"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPwd}
                  onChange={e => { setConfirmPwd(e.target.value); setPwdError(""); }}
                  onKeyDown={e => e.key === "Enter" && handlePasswordChange()}
                />
              </div>
            </div>

            {pwdError && (
              <div className="auth-error">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="ep-success">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Password changed successfully!
              </div>
            )}

            <button
              className="auth-submit-btn"
              style={{ marginTop: 4 }}
              onClick={handlePasswordChange}
              disabled={pwdLoading || (!currentPwd && !newPwd && !confirmPwd)}
            >
              {pwdLoading
                ? <span className="auth-loading"><span className="auth-spinner"/>&nbsp;Updating…</span>
                : "Update Password"
              }
            </button>
          </div>

          {/* ── ACCOUNT INFO ── */}
          <div className="settings-section">
            <div className="settings-section__head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Account
            </div>
            <div className="settings-account-card">
              <div className="settings-account-card__avatar">
                {currentUser.name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="settings-account-card__name">{currentUser.name}</p>
                <p className="settings-account-card__email">{currentUser.email}</p>
              </div>
            </div>
          </div>

          {/* ── SAVE PREFERENCES ── */}
          {saveStatus === "saved" && (
            <div className="ep-success">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Preferences saved!
            </div>
          )}

          <button
            className="auth-submit-btn"
            onClick={handleSave}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving"
              ? <span className="auth-loading"><span className="auth-spinner"/>&nbsp;Saving…</span>
              : saveStatus === "saved" ? "✓ Saved!" : "Save Preferences"
            }
          </button>

        </div>
      </div>
    </div>
  );
}
