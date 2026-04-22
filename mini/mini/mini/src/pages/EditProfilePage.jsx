import "./EditProfilePage.css";
import "./AuthPages.css";
import { useState } from "react";
import { ALL_INTERESTS } from "../data/mockData";

export default function EditProfilePage({ currentUser, onSave, onBack }) {
  const [name, setName]           = useState(currentUser.name || "");
  const [bio, setBio]             = useState(currentUser.bio || "");
  const [interests, setInterests] = useState(currentUser.interests || []);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const initials = name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2) || "?";

  function toggleInterest(i) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  async function handleSave() {
    if (!name.trim())         return setError("Name cannot be empty.");
    if (!bio.trim())          return setError("Bio cannot be empty.");
    if (interests.length < 2) return setError("Please select at least 2 interests.");
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name, bio, interests }),
      });
      const result = await res.json();
      setLoading(false);
      if (result.success) {
        const u = { ...currentUser, name, bio, interests };
        localStorage.setItem("user", JSON.stringify(u));
        setSuccess(true);
        setTimeout(() => onSave(u), 1200);
      } else { setError(result.message || "Could not update profile."); }
    } catch {
      setLoading(false);
      const u = { ...currentUser, name, bio, interests };
      localStorage.setItem("user", JSON.stringify(u));
      setSuccess(true);
      setTimeout(() => onSave(u), 1200);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"'DM Sans',sans-serif" }}>
      <header style={{ background:"white", borderBottom:"1px solid var(--border)", padding:"0 24px", height:52, display:"flex", alignItems:"center", boxShadow:"var(--sh-sm)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:34, height:34, borderRadius:6, background:"var(--blue)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 36 36" fill="none" width="20" height="20">
              <circle cx="9" cy="9" r="4" fill="white"/>
              <circle cx="27" cy="9" r="4" fill="white"/>
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
            <div className="ep-header__avatar">{initials}</div>
            <div>
              <h2 className="ep-header__title">Edit Profile</h2>
              <p className="ep-header__sub">{currentUser.email}</p>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input className="auth-input" placeholder="Your full name" value={name} onChange={e => { setName(e.target.value); setError(""); }} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Short Bio</label>
            <textarea className="auth-textarea" placeholder="What do you do? What are you passionate about?" value={bio} onChange={e => { setBio(e.target.value); setError(""); }} rows={4}/>
            <p className="auth-field-hint">{bio.length}/200 characters</p>
          </div>

          <div className="auth-field">
            <label className="auth-label">Interests <span className="auth-field-hint-inline">— select at least 2</span></label>
            <div className="auth-chip-grid">
              {ALL_INTERESTS.map(i => (
                <button key={i} className={`auth-chip ${interests.includes(i) ? "auth-chip--on" : ""}`} onClick={() => { toggleInterest(i); setError(""); }}>
                  {interests.includes(i) && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  {i}
                </button>
              ))}
            </div>
            {interests.length > 0 && <p className="auth-field-hint">{interests.length} selected</p>}
          </div>

          {error && <div className="auth-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}

          {success && <div className="auth-error" style={{background:"var(--green-dim)",borderColor:"rgba(5,118,66,0.25)",color:"var(--green)"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Profile updated!</div>}

          <div className="ep-actions">
            <button className="ep-cancel-btn" onClick={onBack}>Cancel</button>
            <button className="auth-submit-btn ep-save-btn" onClick={handleSave} disabled={loading || success}>
              {loading ? <span className="auth-loading"><span className="auth-spinner"/>&nbsp;Saving…</span> : success ? "✓ Saved!" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}