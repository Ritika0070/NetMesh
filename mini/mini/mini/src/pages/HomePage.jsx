import "./HomePage.css";
import { useState } from "react";
import api from "../services/api";
import { Player } from "@lottiefiles/react-lottie-player";
import workingPeopleAnim from "../assets/Working_People.json";

/* ── Faint constellation texture behind the visual panel — abstract, not literal nodes ── */
const DOTS = [
  { x: 60, y: 70 }, { x: 150, y: 35 }, { x: 230, y: 100 }, { x: 95, y: 190 },
  { x: 305, y: 55 }, { x: 345, y: 170 }, { x: 195, y: 250 }, { x: 35, y: 250 },
];
function ConstellationBackdrop({ className }) {
  return (
    <svg className={className} viewBox="0 0 380 320" preserveAspectRatio="xMidYMid slice">
      {DOTS.map((d, i) =>
        DOTS.slice(i + 1).map((d2, j) =>
          Math.hypot(d.x - d2.x, d.y - d2.y) < 150 ? (
            <line key={`l-${i}-${j}`} x1={d.x} y1={d.y} x2={d2.x} y2={d2.y}
              stroke="white" strokeWidth="1" opacity="0.18" />
          ) : null
        )
      )}
      {DOTS.map((d, i) => (
        <circle key={`c-${i}`} cx={d.x} cy={d.y} r="2.5" fill="white" opacity="0.4" />
      ))}
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
              <div className="sidebar-subpanel__item-icon" style={{"--item-color":"#3A5BA0"}}>
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
      color: "#3A5BA0",
      onClick: () => setActiveSubPanel("history"),
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      label: "Edit Profile",
      desc:  "Update your info & interests",
      color: "#5FAE8B",
      onClick: () => { onClose(); onGoToEditProfile(); },
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
      label: "Settings",
      desc:  "Preferences & notifications",
      color: "#E3A53E",
      onClick: () => { onClose(); onGoToSettings(); },
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      label: "Contact Us",
      desc:  "Get help or send feedback",
      color: "#DD7A60",
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
          <svg className="home-header__logo-mark" viewBox="0 0 36 36" fill="none" width="28" height="28">
            <line x1="9" y1="9" x2="27" y2="9" stroke="#3A5BA0" strokeWidth="2"/>
            <line x1="9" y1="9" x2="18" y2="27" stroke="#3A5BA0" strokeWidth="2"/>
            <line x1="27" y1="9" x2="18" y2="27" stroke="#3A5BA0" strokeWidth="2"/>
            <circle cx="9" cy="9" r="4" fill="#3A5BA0"/>
            <circle cx="27" cy="9" r="4" fill="#E3A53E"/>
            <circle cx="18" cy="27" r="4" fill="#28407A"/>
          </svg>
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

      {/* ── Main — full-width dashboard, no side panel ── */}
      <main className="home-main">

        {/* Hero banner */}
        <section className="home-hero">
          <div className="home-hero__blob-a" />
          <div className="home-hero__blob-b" />
          <ConstellationBackdrop className="home-hero__dots" />

          <div className="home-hero__text">
            <p className="home-hero__eyebrow">{greeting()}</p>
            <h1 className="home-hero__name">{currentUser.name.split(" ")[0]},</h1>
            <p className="home-hero__tagline">Your professional network starts with the right session.</p>
          </div>

          <div className="home-hero__visual">
            <Player autoplay loop src={workingPeopleAnim} style={{ width: "100%", height: "100%" }} />
            <p className="home-hero__visual-caption">Every session is a new connection.</p>
          </div>
        </section>

        {/* Quick actions */}
        <nav className={`home-actions-grid ${!onGoToDashboard ? "home-actions-grid--single" : ""}`}>
          {onGoToDashboard && (
            <button className="home-row home-row--accent" onClick={onGoToDashboard}>
              <span className="home-row__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span>
              <span className="home-row__text">
                <span className="home-row__title">Resume active session</span>
                <span className="home-row__desc">You have an ongoing session — jump back in</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="home-row__chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
          <button className="home-row" onClick={onGoToJoinSession}>
            <span className="home-row__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </span>
            <span className="home-row__text">
              <span className="home-row__title">Join or create a session</span>
              <span className="home-row__desc">Enter a session ID or start a new event space</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="home-row__chevron"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </nav>

        {/* Feature highlights */}
        <div className="home-features">

          {/* Live sessions */}
          <div className="home-feature">
            <div className="home-feature__preview home-feature__preview--sessions">
              <div className="feature-mock-session">
                <div className="feature-mock-session__top">
                  <span className="feature-mock-session__label">Session ID</span>
                  <span className="feature-mock-session__live">Live</span>
                </div>
                <div className="feature-mock-session__code">NM 4829</div>
                <div className="feature-mock-session__avatars">
                  <span className="avatar-dot" style={{"--c":"#3A5BA0"}} />
                  <span className="avatar-dot" style={{"--c":"#9B7FD4"}} />
                  <span className="avatar-dot" style={{"--c":"#5FAE8B"}} />
                  <span className="avatar-dot" style={{"--c":"#E3A53E"}} />
                  <span className="avatar-dot" style={{"--c":"#DD7A60"}} />
                  <span className="feature-mock-session__more">+8 joined</span>
                </div>
              </div>
            </div>
            <span className="home-feature__title">Live sessions</span>
            <span className="home-feature__desc">Join event sessions and connect in real time</span>
          </div>

          {/* AI matching */}
          <div className="home-feature">
            <div className="home-feature__preview home-feature__preview--ai">
              <div className="feature-mock-ai">
                <div className="feature-mock-ai__orbit" />
                <div className="feature-mock-ai__center">AI</div>
                <span className="feature-mock-ai__node" style={{"--c":"#3A5BA0","--x":"50%","--y":"4%"}}>92%</span>
                <span className="feature-mock-ai__node" style={{"--c":"#E3A53E","--x":"6%","--y":"40%"}}>76%</span>
                <span className="feature-mock-ai__node" style={{"--c":"#5FAE8B","--x":"94%","--y":"38%"}}>84%</span>
                <span className="feature-mock-ai__node" style={{"--c":"#4FA0C9","--x":"30%","--y":"94%"}}>68%</span>
                <span className="feature-mock-ai__node" style={{"--c":"#C0473A","--x":"70%","--y":"92%"}}>71%</span>
              </div>
            </div>
            <span className="home-feature__title">AI matching</span>
            <span className="home-feature__desc">AI ranks attendees by interest and goal alignment</span>
          </div>

          {/* Live chat */}
          <div className="home-feature">
            <div className="home-feature__preview home-feature__preview--chat">
              <div className="feature-mock-chat">
                <div className="feature-mock-chat__bubble">
                  <span /><span />
                </div>
                <div className="feature-mock-chat__input">
                  <span />
                  <button className="feature-mock-chat__connect" tabIndex={-1}>+ Connect</button>
                </div>
              </div>
            </div>
            <span className="home-feature__title">Live chat</span>
            <span className="home-feature__desc">Chat and connect without leaving the app</span>
          </div>

        </div>

        {/* Profile summary */}
        <div className="home-profile-flow">
          <div className="home-profile-flow__main">
            <div className="home-profile-flow__avatar-ring">
              <div className="home-profile-flow__avatar">{initials}</div>
            </div>
            <div className="home-profile-flow__info">
              <p className="home-profile-flow__name">{currentUser.name}</p>
              <p className="home-profile-flow__email">{currentUser.email}</p>
              {currentUser.bio && <p className="home-profile-flow__bio">{currentUser.bio}</p>}
            </div>
          </div>
          {currentUser.interests?.length > 0 && (
            <>
              <div className="home-profile-flow__divider" />
              <div className="home-profile-flow__interests-col">
                <span className="home-profile-flow__interests-label">Interests</span>
                <div className="home-profile-flow__interests">
                  {currentUser.interests.map(i => <span key={i} className="home-profile-flow__tag">{i}</span>)}
                </div>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  );
}