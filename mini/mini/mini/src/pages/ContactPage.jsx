import "./EditProfilePage.css";
import "./AuthPages.css";
import { useState } from "react";

export default function ContactPage({ currentUser, onBack }) {
  const [subject, setSubject]   = useState("");
  const [message, setMessage]   = useState("");
  const [type, setType]         = useState("feedback");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState("");

  async function handleSend() {
    if (!subject.trim()) return setError("Please enter a subject.");
    if (message.trim().length < 10) return setError("Please write a message (min 10 characters).");
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 1000)); // simulate send
    setLoading(false);
    setSent(true);
  }

  const types = [
    { val:"feedback", label:"Feedback" },
    { val:"bug",      label:"Bug Report" },
    { val:"help",     label:"Help" },
    { val:"other",    label:"Other" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"'DM Sans',sans-serif" }}>
      <header style={{ background:"white", borderBottom:"1px solid var(--border)", padding:"0 24px", height:52, display:"flex", alignItems:"center", boxShadow:"var(--sh-sm)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:34, height:34, borderRadius:6, background:"var(--blue)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 36 36" fill="none" width="20" height="20">
              <circle cx="9" cy="9" r="4" fill="white"/><circle cx="27" cy="9" r="4" fill="white"/>
              <circle cx="18" cy="27" r="4" fill="white"/>
              <line x1="9" y1="9" x2="27" y2="9" stroke="white" strokeWidth="2"/>
              <line x1="9" y1="9" x2="18" y2="27" stroke="white" strokeWidth="2"/>
              <line x1="27" y1="9" x2="18" y2="27" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <span style={{ fontSize:18, fontWeight:700, color:"var(--dark)", letterSpacing:"-0.02em" }}>NetMesh</span>
        </div>
      </header>

      <div className="ep-wrap">
        <button className="ep-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Home
        </button>

        <div className="ep-card">
          <div className="ep-header">
            <div className="ep-header__avatar" style={{ background:"#06B6D4", borderRadius:12 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <h2 className="ep-header__title">Contact Us</h2>
              <p className="ep-header__sub">We'd love to hear from you</p>
            </div>
          </div>

          {sent ? (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--green-dim)", border:"2px solid rgba(5,118,66,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:"var(--dark)", marginBottom:10 }}>Message Sent!</h3>
              <p style={{ color:"var(--text-sub)", fontSize:14, marginBottom:24 }}>Thanks for reaching out. We'll get back to you at <strong>{currentUser.email}</strong> within 24 hours.</p>
              <button className="auth-submit-btn" onClick={onBack}>Back to Home</button>
            </div>
          ) : (
            <>
              {/* Type selector */}
              <div className="auth-field">
                <label className="auth-label">Type</label>
                <div style={{ display:"flex", gap:8 }}>
                  {types.map(t => (
                    <button key={t.val} onClick={() => setType(t.val)} style={{
                      flex:1, padding:"9px 0",
                      borderRadius:"var(--rf)",
                      border: type===t.val ? "1.5px solid var(--blue)" : "1.5px solid var(--border)",
                      background: type===t.val ? "var(--blue-dim)" : "white",
                      color: type===t.val ? "var(--blue)" : "var(--text-sub)",
                      fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif",
                      cursor:"pointer", transition:"all 0.15s",
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="auth-field">
                <label className="auth-label">Subject</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                  <input className="auth-input" placeholder="Brief description of your issue or feedback"
                    value={subject} onChange={e => { setSubject(e.target.value); setError(""); }}/>
                </div>
              </div>

              {/* Message */}
              <div className="auth-field">
                <label className="auth-label">Message</label>
                <textarea className="auth-textarea" rows={5}
                  placeholder="Tell us more..."
                  value={message} onChange={e => { setMessage(e.target.value); setError(""); }}/>
                <p className="auth-field-hint">{message.length} characters</p>
              </div>

              {/* From */}
              <div style={{ background:"var(--bg)", borderRadius:"var(--r1)", padding:"12px 14px", marginBottom:16 }}>
                <p style={{ fontSize:12, color:"var(--text-sub)", margin:0 }}>
                  Sending as <strong style={{color:"var(--text)"}}>{currentUser.name}</strong> · {currentUser.email}
                </p>
              </div>

              {error && (
                <div className="auth-error">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <div className="ep-actions">
                <button className="ep-cancel-btn" onClick={onBack}>Cancel</button>
                <button className="auth-submit-btn ep-save-btn" onClick={handleSend} disabled={loading}>
                  {loading ? <span className="auth-loading"><span className="auth-spinner"/>&nbsp;Sending…</span> : "Send Message"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}