import "./HomePage.css";
import { useState } from "react";
import api from "../services/api";

export default function HomePage({ currentUser, onGoToJoinSession, onLogout, onGoToDashboard, onGoToEditProfile }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const initials = currentUser.name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };
  function handleLogout() { api.logout(); onLogout(); }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header__logo">
          <div className="home-header__logo-mark">
            <svg viewBox="0 0 36 36" fill="none" width="20" height="20">
              <circle cx="9" cy="9" r="4" fill="white"/>
              <circle cx="27" cy="9" r="4" fill="white"/>
              <circle cx="18" cy="27" r="4" fill="white"/>
              <line x1="9" y1="9" x2="27" y2="9" stroke="white" strokeWidth="2"/>
              <line x1="9" y1="9" x2="18" y2="27" stroke="white" strokeWidth="2"/>
              <line x1="27" y1="9" x2="18" y2="27" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <span className="home-header__brand">NetMesh</span>
        </div>
        <div className="home-header__right">
          <div className="home-header__user">
            <div className="home-header__avatar">{initials}</div>
            <span className="home-header__name">{currentUser.name}</span>
          </div>
          <button className="home-header__logout" onClick={() => setShowLogoutConfirm(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="home-greeting">
          <p className="home-greeting__sub">{greeting()}</p>
          <h1 className="home-greeting__name">{currentUser.name.split(" ")[0]},</h1>
          <p className="home-greeting__tagline">Your professional network starts with the right session.</p>
        </div>

        <div className="home-actions">
          {onGoToDashboard && (
            <div className="home-card home-card--highlight" onClick={onGoToDashboard}>
              <div className="home-card__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <div>
                <h3 className="home-card__title">Resume Active Session</h3>
                <p className="home-card__desc">You have an ongoing session. Jump back in.</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:"auto",opacity:0.35,flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )}
          <div className="home-card" onClick={onGoToJoinSession}>
            <div className="home-card__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <div>
              <h3 className="home-card__title">Join or Create a Session</h3>
              <p className="home-card__desc">Enter a session ID or create a new event space.</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:"auto",opacity:0.35,flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        <div className="home-profile-card">
          <div className="home-profile-card__header">
            <span className="home-profile-card__label">Your Profile</span>
            <button className="home-profile-card__edit-btn" onClick={onGoToEditProfile}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
          </div>
          <div className="home-profile-card__body">
            <div className="home-profile-card__avatar">{initials}</div>
            <div className="home-profile-card__info">
              <p className="home-profile-card__name">{currentUser.name}</p>
              <p className="home-profile-card__email">{currentUser.email}</p>
              {currentUser.bio && <p className="home-profile-card__bio">{currentUser.bio}</p>}
              {currentUser.interests?.length > 0 && (
                <div className="home-profile-card__interests">
                  {currentUser.interests.map(i => <span key={i} className="home-profile-card__tag">{i}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="home-stats-row">
          <div className="home-stat">
            <span className="home-stat__num">{currentUser.interests?.length || 0}</span>
            <span className="home-stat__label">Interests</span>
          </div>
          <div className="home-stat__divider"/>
          <div className="home-stat">
            <span className="home-stat__num">AI</span>
            <span className="home-stat__label">Powered Matching</span>
          </div>
          <div className="home-stat__divider"/>
          <div className="home-stat">
            <span className="home-stat__num">∞</span>
            <span className="home-stat__label">Sessions</span>
          </div>
        </div>

        <div className="home-info-strip">
          {[
            ["Sessions auto-expire — your data stays clean", "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v4l3 3"],
            ["AI matches you with the most compatible people", "M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
            ["Live chat — no email follow-ups needed", "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
          ].map(([text, d]) => (
            <div key={text} className="home-info-strip__item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d={d}/></svg>
              {text}
            </div>
          ))}
        </div>
      </main>

      {showLogoutConfirm && (
        <div className="home-modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="home-modal" onClick={e => e.stopPropagation()}>
            <h3 className="home-modal__title">Sign out?</h3>
            <p className="home-modal__desc">You'll be taken back to the landing page.</p>
            <div className="home-modal__actions">
              <button className="btn btn-connect" style={{flex:1,padding:"10px 0"}} onClick={handleLogout}>Yes, sign out</button>
              <button className="btn btn-skip" style={{padding:"10px 20px"}} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}