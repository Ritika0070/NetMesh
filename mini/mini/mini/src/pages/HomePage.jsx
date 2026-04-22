import "./HomePage.css";
import { useState } from "react";
import api from "../services/api";

/* ── SVG Illustrations ── */
function IllustrationNetwork() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxHeight:180}}>
      <circle cx="140" cy="90" r="75" fill="#EEF4FF" opacity="0.8"/>
      <circle cx="140" cy="72" r="18" fill="#0a66c2" opacity="0.15"/>
      <circle cx="140" cy="72" r="18" stroke="#0a66c2" strokeWidth="1.5"/>
      <circle cx="140" cy="66" r="7" fill="#0a66c2"/>
      <path d="M124 84 Q124 76 140 76 Q156 76 156 84" fill="#0a66c2" opacity="0.7"/>
      {[
        {cx:60, cy:50, label:"AM", color:"#8B5CF6"},
        {cx:220,cy:50, label:"PS", color:"#10B981"},
        {cx:40, cy:130,label:"RK", color:"#F59E0B"},
        {cx:240,cy:130,label:"NJ", color:"#EF4444"},
        {cx:140,cy:155,label:"SK", color:"#06B6D4"},
      ].map(n=>(
        <g key={n.label}>
          <line x1={n.cx} y1={n.cy} x2="140" y2="72" stroke={n.color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
          <circle cx={n.cx} cy={n.cy} r="18" fill={n.color} opacity="0.1"/>
          <circle cx={n.cx} cy={n.cy} r="18" stroke={n.color} strokeWidth="1.5"/>
          <circle cx={n.cx} cy={n.cy-6} r="6" fill={n.color} opacity="0.6"/>
          <path d={`M${n.cx-10} ${n.cy+6} Q${n.cx-10} ${n.cy+1} ${n.cx} ${n.cy+1} Q${n.cx+10} ${n.cy+1} ${n.cx+10} ${n.cy+6}`} fill={n.color} opacity="0.4"/>
        </g>
      ))}
      <rect x="82" y="38" width="28" height="14" rx="7" fill="#8B5CF6"/>
      <text x="86" y="48" fontSize="8" fill="white" fontWeight="700" fontFamily="sans-serif">94%</text>
      <rect x="194" y="38" width="28" height="14" rx="7" fill="#10B981"/>
      <text x="198" y="48" fontSize="8" fill="white" fontWeight="700" fontFamily="sans-serif">87%</text>
    </svg>
  );
}

function IllustrationSession() {
  return (
    <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxHeight:160}}>
      <rect x="20" y="20" width="240" height="120" rx="16" fill="#EEF4FF"/>
      <rect x="36" y="36" width="208" height="88" rx="10" fill="white" style={{filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.08))"}}/> 
      <rect x="36" y="36" width="208" height="4" rx="10" fill="#0a66c2"/>
      <text x="52" y="58" fontSize="9" fill="#9faab4" fontWeight="700" letterSpacing="2" fontFamily="sans-serif">SESSION ID</text>
      <text x="52" y="78" fontSize="22" fill="#0a66c2" fontWeight="800" letterSpacing="6" fontFamily="monospace">NM4829</text>
      <circle cx="218" cy="56" r="5" fill="#10B981"/>
      <circle cx="218" cy="56" r="9" fill="#10B981" opacity="0.2"/>
      <text x="196" y="60" fontSize="8" fill="#057642" fontWeight="700" fontFamily="sans-serif">Live</text>
      {[{x:52,c:"#0a66c2"},{x:74,c:"#8B5CF6"},{x:96,c:"#10B981"},{x:118,c:"#F59E0B"},{x:140,c:"#EF4444"}].map((p,i)=>(
        <circle key={i} cx={p.x+8} cy="108" r="10" fill={p.c} opacity="0.7"/>
      ))}
      <text x="168" y="112" fontSize="9" fill="#6b7a85" fontWeight="600" fontFamily="sans-serif">+8 joined</text>
    </svg>
  );
}

function IllustrationAI() {
  return (
    <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxHeight:160}}>
      <circle cx="140" cy="80" r="65" fill="#F5F3FF" opacity="0.8"/>
      <circle cx="140" cy="80" r="32" fill="#8B5CF6" opacity="0.08"/>
      <circle cx="140" cy="80" r="32" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x="124" y="64" width="32" height="32" rx="8" fill="#8B5CF6"/>
      <text x="131" y="85" fontSize="14" fill="white" fontWeight="800" fontFamily="sans-serif">AI</text>
      {[
        {cx:140,cy:32,score:"92",color:"#0a66c2"},
        {cx:196,cy:96,score:"84",color:"#10B981"},
        {cx:84,cy:96,score:"76",color:"#F59E0B"},
        {cx:168,cy:140,score:"71",color:"#EF4444"},
        {cx:112,cy:140,score:"68",color:"#06B6D4"},
      ].map((n,i)=>(
        <g key={i}>
          <line x1={n.cx} y1={n.cy} x2="140" y2="80" stroke={n.color} strokeWidth="1" opacity="0.3"/>
          <circle cx={n.cx} cy={n.cy} r="14" fill={n.color} opacity="0.12"/>
          <circle cx={n.cx} cy={n.cy} r="14" stroke={n.color} strokeWidth="1.5"/>
          <text x={n.cx-8} y={n.cy+4} fontSize="9" fill={n.color} fontWeight="700" fontFamily="sans-serif">{n.score}%</text>
        </g>
      ))}
    </svg>
  );
}

function IllustrationChat() {
  return (
    <svg viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",maxHeight:160}}>
      <rect x="20" y="15" width="240" height="130" rx="16" fill="#F0FDF4" opacity="0.8"/>
      <rect x="36" y="30" width="140" height="30" rx="10" fill="#0a66c2"/>
      <path d="M46 60 L40 70 L58 60" fill="#0a66c2"/>
      <rect x="44" y="38" width="90" height="6" rx="3" fill="white" opacity="0.8"/>
      <rect x="44" y="49" width="60" height="5" rx="2.5" fill="white" opacity="0.5"/>
      <rect x="104" y="78" width="140" height="30" rx="10" fill="white" style={{filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.08))"}}/> 
      <path d="M234 108 L240 118 L222 108" fill="white"/>
      <rect x="112" y="86" width="80" height="6" rx="3" fill="#1d2226" opacity="0.35"/>
      <rect x="112" y="96" width="55" height="5" rx="2.5" fill="#6b7a85" opacity="0.3"/>
      <rect x="36" y="116" width="110" height="24" rx="10" fill="#0a66c2" opacity="0.85"/>
      <rect x="44" y="123" width="70" height="5" rx="2.5" fill="white" opacity="0.8"/>
      <rect x="196" y="116" width="64" height="24" rx="12" fill="#10B981"/>
      <text x="204" y="132" fontSize="9" fill="white" fontWeight="700" fontFamily="sans-serif">+ Connect</text>
    </svg>
  );
}

/* ── Session History (inline in sidebar) ── */
function SessionHistoryPanel({ onClose }) {
  const sessions = JSON.parse(localStorage.getItem("sessionHistory") || "[]");
  return (
    <div className="sidebar-subpanel">
      <div className="sidebar-subpanel__header">
        <button className="sidebar-subpanel__back" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>
        <span className="sidebar-subpanel__title">Session History</span>
      </div>
      <div className="sidebar-subpanel__body">
        {sessions.length === 0 ? (
          <div className="sidebar-subpanel__empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p>No sessions yet</p>
            <span>Sessions you join will appear here.</span>
          </div>
        ) : (
          sessions.map((s, i) => (
            <div key={i} className="sidebar-subpanel__item">
              <div className="sidebar-subpanel__item-icon" style={{"--item-color":"#8B5CF6"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <p className="sidebar-subpanel__item-label">{s.sessionId}</p>
                <p className="sidebar-subpanel__item-meta">{s.requirement} · {new Date(s.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Profile Sidebar ── */
function ProfileSidebar({ isOpen, onClose, currentUser, onGoToEditProfile, onLogout, onGoToSettings, onGoToContact }) {
  const initials = currentUser.name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeSubPanel, setActiveSubPanel] = useState(null); // "history"

  const menuItems = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      label: "Session History",
      desc:  "View your past sessions",
      color: "#8B5CF6",
      onClick: () => setActiveSubPanel("history"),
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      label: "Edit Profile",
      desc:  "Update your info & interests",
      color: "#10B981",
      onClick: () => { onClose(); onGoToEditProfile(); },
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
      label: "Settings",
      desc:  "Preferences & notifications",
      color: "#F59E0B",
      onClick: () => { onClose(); onGoToSettings(); },
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      label: "Contact Us",
      desc:  "Get help or send feedback",
      color: "#06B6D4",
      onClick: () => { onClose(); onGoToContact(); },
    },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}/>}
      <div className={`profile-sidebar ${isOpen ? "profile-sidebar--open" : ""}`}>

        {/* Sub-panel: Session History */}
        {activeSubPanel === "history" && (
          <SessionHistoryPanel onClose={() => setActiveSubPanel(null)}/>
        )}

        {/* Main sidebar content */}
        {!activeSubPanel && (
          <>
            <div className="profile-sidebar__header">
              <div className="profile-sidebar__user">
                <div className="profile-sidebar__avatar">{initials}</div>
                <div className="profile-sidebar__info">
                  <p className="profile-sidebar__name">{currentUser.name}</p>
                  <p className="profile-sidebar__email">{currentUser.email}</p>
                </div>
              </div>
              <button className="profile-sidebar__close" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {currentUser.interests?.length > 0 && (
              <div className="profile-sidebar__chips">
                {currentUser.interests.slice(0,5).map(i => (
                  <span key={i} className="profile-sidebar__chip">{i}</span>
                ))}
                {currentUser.interests.length > 5 && (
                  <span className="profile-sidebar__chip profile-sidebar__chip--more">+{currentUser.interests.length - 5}</span>
                )}
              </div>
            )}

            <nav className="profile-sidebar__nav">
              {menuItems.map(item => (
                <button key={item.label} className="profile-sidebar__item" onClick={item.onClick}>
                  <div className="profile-sidebar__item-icon" style={{"--item-color": item.color}}>
                    {item.icon}
                  </div>
                  <div className="profile-sidebar__item-text">
                    <span className="profile-sidebar__item-label">{item.label}</span>
                    <span className="profile-sidebar__item-desc">{item.desc}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{opacity:0.3,flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </nav>

            <div className="profile-sidebar__footer">
              {showLogoutConfirm ? (
                <div className="profile-sidebar__logout-confirm">
                  <p>Are you sure you want to sign out?</p>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button className="profile-sidebar__logout-yes" onClick={() => { api.logout(); onLogout(); }}>Yes, sign out</button>
                    <button className="profile-sidebar__logout-no" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="profile-sidebar__logout" onClick={() => setShowLogoutConfirm(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ── Main HomePage ── */
export default function HomePage({ currentUser, onGoToJoinSession, onLogout, onGoToDashboard, onGoToEditProfile, onGoToSettings, onGoToContact }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = currentUser.name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="home-page">

      {/* ── Header ── */}
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

        <button className="home-header__profile-btn" onClick={() => setSidebarOpen(true)}>
          <div className="home-header__profile-avatar">{initials}</div>
          <span className="home-header__profile-name">{currentUser.name.split(" ")[0]}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </header>

      {/* ── Sidebar ── */}
      <ProfileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        onGoToEditProfile={onGoToEditProfile}
        onLogout={onLogout}
        onGoToSettings={onGoToSettings}
        onGoToContact={onGoToContact}
      />

      {/* ── Main ── */}
      <main className="home-main">

        {/* Greeting with illustration */}
        <div className="home-greeting">
          <div className="home-greeting__text">
            <p className="home-greeting__sub">{greeting()}</p>
            <h1 className="home-greeting__name">{currentUser.name.split(" ")[0]},</h1>
            <p className="home-greeting__tagline">Your professional network starts with the right session.</p>
          </div>
          <div className="home-greeting__illustration">
            <IllustrationNetwork/>
          </div>
        </div>

        {/* Action cards */}
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

        {/* Feature illustration cards */}
        <div className="home-feature-grid">
          <div className="home-feature-card">
            <div className="home-feature-card__illustration"><IllustrationSession/></div>
            <h3 className="home-feature-card__title">Live Sessions</h3>
            <p className="home-feature-card__desc">Join event sessions and connect in real time.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-card__illustration"><IllustrationAI/></div>
            <h3 className="home-feature-card__title">AI Matching</h3>
            <p className="home-feature-card__desc">AI ranks attendees by interest & goal alignment.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-card__illustration"><IllustrationChat/></div>
            <h3 className="home-feature-card__title">Live Chat</h3>
            <p className="home-feature-card__desc">Chat and connect without leaving the app.</p>
          </div>
        </div>

        {/* Profile card — NO edit button, just display */}
        <div className="home-profile-card">
          <div className="home-profile-card__header">
            <span className="home-profile-card__label">Your Profile</span>
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

        {/* Stats */}
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

        {/* Info strip */}
        <div className="home-info-strip">
          {[
            ["Sessions auto-expire — your data stays clean","M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v4l3 3"],
            ["AI matches you with the most compatible people","M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
            ["Live chat — no email follow-ups needed","M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
          ].map(([text,d]) => (
            <div key={text} className="home-info-strip__item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d={d}/></svg>
              {text}
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}