import { useState } from "react";
import { ALL_INTERESTS } from "../data/mockData";
import api from "../services/api";

export default function HomePage({ currentUser, onGoToJoinSession, onLogout, onGoToDashboard, onProfileUpdate }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile]     = useState(false);
  const [editName, setEditName]                   = useState(currentUser.name);
  const [editBio, setEditBio]                     = useState(currentUser.bio || "");
  const [editInterests, setEditInterests]         = useState(currentUser.interests || []);
  const [editLoading, setEditLoading]             = useState(false);
  const [editError, setEditError]                 = useState("");
  const [editSuccess, setEditSuccess]             = useState(false);

  const initials = currentUser.name
    .split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  function handleLogout() {
    api.logout();
    onLogout();
  }

  function openEdit() {
    setEditName(currentUser.name);
    setEditBio(currentUser.bio || "");
    setEditInterests(currentUser.interests || []);
    setEditError("");
    setEditSuccess(false);
    setShowEditProfile(true);
  }

  function toggleEditInterest(interest) {
    setEditInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
    setEditError("");
  }

  async function handleSaveProfile() {
    if (!editName.trim())           return setEditError("Name cannot be empty.");
    if (editInterests.length < 2)   return setEditError("Please select at least 2 interests.");
    setEditLoading(true);
    setEditError("");
    const result = await api.updateProfile(editName.trim(), editBio.trim(), editInterests);
    setEditLoading(false);
    if (result.success) {
      setEditSuccess(true);
      onProfileUpdate && onProfileUpdate(result.user);
      setTimeout(() => setShowEditProfile(false), 1000);
    } else {
      setEditError(result.message || "Could not save changes.");
    }
  }

  return (
    <div className="home-page">

      {/* ── Header ── */}
      <header className="home-header">
        <div className="home-header__logo">
          <svg viewBox="0 0 36 36" fill="none" width="28" height="28">
            <circle cx="9"  cy="9"  r="4" fill="#C4A050"/>
            <circle cx="27" cy="9"  r="4" fill="#DDB96A"/>
            <circle cx="18" cy="27" r="4" fill="#EDD898"/>
            <line x1="9"  y1="9" x2="27" y2="9"  stroke="#C4A050" strokeWidth="1.5" strokeOpacity="0.6"/>
            <line x1="9"  y1="9" x2="18" y2="27" stroke="#C4A050" strokeWidth="1.5" strokeOpacity="0.6"/>
            <line x1="27" y1="9" x2="18" y2="27" stroke="#DDB96A" strokeWidth="1.5" strokeOpacity="0.6"/>
          </svg>
          <span className="home-header__brand">NetMesh</span>
        </div>
        <div className="home-header__right">
          <div className="home-header__user">
            <span className="home-header__avatar">{initials}</span>
            <span className="home-header__name">{currentUser.name}</span>
          </div>
          <button className="home-header__logout" onClick={() => setShowLogoutConfirm(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="home-main">

        {/* Greeting */}
        <div className="home-greeting">
          <p className="home-greeting__sub">{greeting()},</p>
          <h1 className="home-greeting__name">{currentUser.name}</h1>
          <p className="home-greeting__tagline">
            Your professional network starts with the right session.
          </p>
        </div>

        {/* Action cards */}
        <div className="home-actions">

          {onGoToDashboard && (
            <div className="home-card home-card--highlight" onClick={onGoToDashboard}>
              <div className="home-card__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
              <div>
                <h3 className="home-card__title">Resume Active Session</h3>
                <p className="home-card__desc">You have an ongoing session. Jump back in.</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:"auto",opacity:0.4,flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )}

          <div className="home-card" onClick={onGoToJoinSession}>
            <div className="home-card__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div>
              <h3 className="home-card__title">Join or Create a Session</h3>
              <p className="home-card__desc">Enter a session ID or create a new event space.</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:"auto",opacity:0.4,flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        {/* Profile summary card */}
        <div className="home-profile-card">
          <div className="home-profile-card__header">
            <span className="home-profile-card__label">Your Profile</span>
            <button className="home-profile-card__edit-btn" onClick={openEdit}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </button>
          </div>
          <div className="home-profile-card__body">
            <div className="home-profile-card__avatar">{initials}</div>
            <div className="home-profile-card__info">
              <p className="home-profile-card__name">{currentUser.name}</p>
              <p className="home-profile-card__email">{currentUser.email}</p>
              {currentUser.bio && (
                <p className="home-profile-card__bio">{currentUser.bio}</p>
              )}
              {currentUser.interests?.length > 0 && (
                <div className="home-profile-card__interests">
                  {currentUser.interests.map((interest) => (
                    <span key={interest} className="home-profile-card__tag">{interest}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div className="home-info-strip">
          <div className="home-info-strip__item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:"#C4A050"}}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Sessions auto-expire — your data stays clean
          </div>
          <div className="home-info-strip__item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:"#C4A050"}}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            AI matches you with the most compatible people
          </div>
          <div className="home-info-strip__item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:"#C4A050"}}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Live chat — no email follow-ups needed
          </div>
        </div>

      </main>

      {/* ── Edit Profile Modal ── */}
      {showEditProfile && (
        <div className="home-modal-backdrop" onClick={() => setShowEditProfile(false)}>
          <div className="home-modal home-modal--large" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 className="home-modal__title" style={{ margin: 0 }}>Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 4 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label className="field-label">Full Name</label>
              <input
                className="field-input"
                value={editName}
                onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                placeholder="Your name"
                autoFocus
              />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label className="field-label">Bio</label>
              <textarea
                className="field-textarea"
                value={editBio}
                onChange={(e) => { setEditBio(e.target.value); setEditError(""); }}
                placeholder="Tell people about yourself..."
                rows={3}
              />
            </div>

            <div className="field" style={{ marginBottom: 20 }}>
              <label className="field-label">
                Interests
                <span className="field-label-hint"> (select at least 2)</span>
              </label>
              <div className="chip-row">
                {ALL_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    className={`chip ${editInterests.includes(interest) ? "chip--selected" : ""}`}
                    onClick={() => toggleEditInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {editError && (
              <div className="form-error-box" style={{ marginBottom: 14 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="form-success-box" style={{ marginBottom: 14 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Profile updated successfully!
              </div>
            )}

            <div className="home-modal__actions">
              <button className="btn btn-connect" onClick={handleSaveProfile} disabled={editLoading} style={{ flex: 1, padding: "12px 0" }}>
                {editLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="btn-spinner" />
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
              <button className="btn btn-skip" onClick={() => setShowEditProfile(false)} style={{ padding: "12px 20px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Logout confirm modal ── */}
      {showLogoutConfirm && (
        <div className="home-modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="home-modal" onClick={e => e.stopPropagation()}>
            <h3 className="home-modal__title">Log out?</h3>
            <p className="home-modal__desc">You'll be taken back to the landing page.</p>
            <div className="home-modal__actions">
              <button className="btn btn-connect" onClick={handleLogout}>Yes, log out</button>
              <button className="btn btn-skip" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
