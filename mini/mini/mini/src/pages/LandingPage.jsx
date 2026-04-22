import { useEffect, useRef, useState } from "react";
import "./LandingPage.css";

function Card3D({ icon, title, body }) {
  const cardRef = useRef(null);
  const handleMouseMove = e => {
    const card = cardRef.current; if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX-rect.left)/rect.width-0.5, y = (e.clientY-rect.top)/rect.height-0.5;
    card.style.transform = `perspective(700px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateZ(4px)`;
    card.style.setProperty("--mx",`${(x+0.5)*100}%`);
    card.style.setProperty("--my",`${(y+0.5)*100}%`);
  };
  const handleMouseLeave = () => {
    const card = cardRef.current; if (!card) return;
    card.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  };
  return (
    <div ref={cardRef} className="lp-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="lp-card-shine"/>
      <div className="lp-card-icon">{icon}</div>
      <h3 className="lp-card-title">{title}</h3>
      <p className="lp-card-body">{body}</p>
    </div>
  );
}

function VisualProfile() {
  return (
    <div className="lp-step-visual">
      <div className="sv-profile-card">
        <div className="sv-avatar">
          <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
            <circle cx="20" cy="15" r="7" stroke="#1a6fc4" strokeWidth="1.5"/>
            <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#1a6fc4" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="sv-profile-lines">
          <div className="sv-line sv-line--name"/>
          <div className="sv-line sv-line--role"/>
        </div>
      </div>
      <div className="sv-interest-chips">
        <span className="sv-chip sv-chip--lit">AI</span>
        <span className="sv-chip sv-chip--lit">Startups</span>
        <span className="sv-chip">Design</span>
        <span className="sv-chip sv-chip--lit">Web3</span>
        <span className="sv-chip">Health</span>
      </div>
      <div className="sv-goal-row">
        <span className="sv-goal-label">Goal</span>
        <span className="sv-goal-value">Co-founder Hunt</span>
      </div>
    </div>
  );
}

function VisualSession() {
  return (
    <div className="lp-step-visual">
      <div className="sv-session-box">
        <div className="sv-session-label">Session ID</div>
        <div className="sv-session-code">
          {"JFRCC4".split("").map((ch, i) => (
            <span key={i} className="sv-code-char" style={{"--d":`${i*0.07}s`}}>{ch}</span>
          ))}
        </div>
      </div>
      <div className="sv-participants">
        <span className="sv-p-label">Participants joining</span>
        <div className="sv-p-dots">
          {[0,1,2,3,4,5,6,7].map(i => (
            <span key={i} className="sv-p-dot" style={{"--d":`${i*0.15}s`}}/>
          ))}
          <span className="sv-p-more">+12</span>
        </div>
      </div>
      <div className="mock-session-chip">
        <span className="mock-dot"/>Session Active
      </div>
    </div>
  );
}

function VisualRecommend() {
  const people = [
    {initials:"AR", score:92, delay:"0s"},
    {initials:"SK", score:78, delay:"0.2s"},
    {initials:"PM", score:65, delay:"0.4s"},
  ];
  return (
    <div className="lp-step-visual">
      <div className="sv-rec-label">Top Matches</div>
      {people.map(({initials, score, delay}) => (
        <div className="sv-rec-row" key={initials} style={{"--d":delay}}>
          <div className="sv-rec-avatar">{initials}</div>
          <div className="sv-rec-bar-wrap">
            <div className="sv-rec-bar" style={{"--w":`${score}%`, "--d":delay}}/>
          </div>
          <span className="sv-rec-score">{score}%</span>
        </div>
      ))}
    </div>
  );
}

function VisualChat() {
  return (
    <div className="lp-step-visual sv-chat-visual">
      <div className="sv-chat-header">
        <div className="sv-chat-avatar">AR</div>
        <div>
          <div className="sv-chat-name">Aryan Mehta</div>
          <div className="sv-chat-status"><span className="sv-online-dot"/>online</div>
        </div>
      </div>
      <div className="sv-chat-messages">
        <div className="sv-msg sv-msg--in"  style={{"--d":"0.2s"}}>Hey! I saw you work in ML too.</div>
        <div className="sv-msg sv-msg--out" style={{"--d":"0.8s"}}>Yes! What are you building?</div>
        <div className="sv-msg sv-msg--in"  style={{"--d":"1.4s"}}>A recommendation engine — want to connect?</div>
        <div className="sv-msg sv-msg--out sv-msg--action" style={{"--d":"2s"}}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}>
            <line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/>
          </svg>
          Connect
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ currentUser, onGoToLogin, onGoToRegister, onGoToHome }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
    : null;

  return (
    <div className="lp">

      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <svg className="lp-logo-svg" viewBox="0 0 36 36" fill="none">
            <circle cx="9"  cy="9"  r="4" fill="#1a6fc4"/>
            <circle cx="27" cy="9"  r="4" fill="#c4932a"/>
            <circle cx="18" cy="27" r="4" fill="#1a6fc4" opacity="0.7"/>
            <line x1="9"  y1="9" x2="27" y2="9"  stroke="#1a6fc4" strokeWidth="1.5" strokeOpacity="0.5"/>
            <line x1="9"  y1="9" x2="18" y2="27" stroke="#1a6fc4" strokeWidth="1.5" strokeOpacity="0.5"/>
            <line x1="27" y1="9" x2="18" y2="27" stroke="#c4932a" strokeWidth="1.5" strokeOpacity="0.5"/>
          </svg>
          <span className="lp-logo-text">NetMesh</span>
        </div>

        <div className="lp-nav-links">
          <a href="#features"     className="lp-nav-link">Features</a>
          <a href="#why-us"       className="lp-nav-link">Why Us</a>
          <a href="#how-it-works" className="lp-nav-link">How it Works</a>
        </div>

        <div className="lp-nav-actions">
          {currentUser ? (
            <>
              <button className="lp-btn-primary" onClick={onGoToHome}>
                Go to App
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="lp-btn-icon">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="lp-profile-wrap" ref={profileRef}>
                <button className={`lp-profile-btn ${profileOpen ? "lp-profile-btn--open" : ""}`}
                  onClick={() => setProfileOpen(v => !v)}>
                  <span className="lp-profile-avatar">{initials}</span>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    style={{transition:"transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)"}}>
                    <polyline points="4 6 8 10 12 6"/>
                  </svg>
                </button>
                {profileOpen && (
                  <div className="lp-profile-dropdown">
                    <div className="lp-profile-dropdown__user">
                      <span className="lp-profile-dropdown__avatar">{initials}</span>
                      <div>
                        <p className="lp-profile-dropdown__name">{currentUser.name}</p>
                        <p className="lp-profile-dropdown__email">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="lp-profile-dropdown__divider"/>
                    <button className="lp-profile-dropdown__item"
                      onClick={() => { setProfileOpen(false); onGoToHome(); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      Home
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="lp-profile-wrap" ref={profileRef}>
              <button className={`lp-profile-btn ${profileOpen ? "lp-profile-btn--open" : ""}`}
                onClick={() => setProfileOpen(v => !v)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.7}}>
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{transition:"transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)"}}>
                  <polyline points="4 6 8 10 12 6"/>
                </svg>
              </button>
              {profileOpen && (
                <div className="lp-profile-dropdown">
                  <p className="lp-profile-dropdown__prompt">Welcome to NetMesh</p>
                  <button className="lp-profile-dropdown__item lp-profile-dropdown__item--primary"
                    onClick={() => { setProfileOpen(false); onGoToRegister(); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="19" y1="8" x2="19" y2="14"/>
                      <line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    Create Account
                  </button>
                  <button className="lp-profile-dropdown__item"
                    onClick={() => { setProfileOpen(false); onGoToLogin(); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO — Blue left + Form card right
          ══════════════════════════════════════ */}
      <section className="lp-hero">

        {/* Blue left panel */}
        <div className="lp-hero-left">
          <div className="lp-hero-left-content">
            <h1 className="lp-hero-headline">
              Build your network.<br/>Find your people.
            </h1>
            <p className="lp-hero-tagline">
              NetMesh uses AI to connect you with the most relevant professionals at every event.
            </p>
          </div>

          {/* ── Illustration Cards ── */}
          <div className="lp-hero-illustrations">

            {/* Card 1 — Connect */}
            <div className="lp-illus-card lp-illus-card--connect">
              <div className="lp-illus-card__visual">
                <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" width="160" height="110">
                  {/* Sky bg */}
                  <rect width="160" height="110" rx="10" fill="#e8f4ff" fillOpacity="0.15"/>
                  {/* Ground */}
                  <rect x="0" y="80" width="160" height="30" rx="0" fill="rgba(255,255,255,0.06)"/>

                  {/* Person 1 — left, orange jacket */}
                  <g transform="translate(18, 22)">
                    {/* head */}
                    <circle cx="18" cy="8" r="8" fill="#FBBF97"/>
                    {/* hair */}
                    <ellipse cx="18" cy="4" rx="7" ry="4" fill="#1a1814"/>
                    {/* body — orange jacket */}
                    <path d="M8 28 Q18 20 28 28 L30 56 L6 56 Z" fill="#EA580C"/>
                    {/* arm raised */}
                    <path d="M28 30 Q38 18 40 12" stroke="#FBBF97" strokeWidth="5" strokeLinecap="round"/>
                    {/* hand */}
                    <circle cx="40" cy="11" r="4" fill="#FBBF97"/>
                    {/* legs */}
                    <rect x="10" y="54" width="7" height="18" rx="3" fill="#1e3a5f"/>
                    <rect x="20" y="54" width="7" height="18" rx="3" fill="#1e3a5f"/>
                    {/* shoes */}
                    <ellipse cx="13" cy="72" rx="6" ry="3" fill="#1a1814"/>
                    <ellipse cx="24" cy="72" rx="6" ry="3" fill="#1a1814"/>
                    {/* laptop */}
                    <rect x="5" y="40" width="22" height="14" rx="2" fill="#1a6fc4"/>
                    <rect x="7" y="42" width="18" height="10" rx="1" fill="#3a8fd4"/>
                  </g>

                  {/* Person 2 — right, mustard dress */}
                  <g transform="translate(90, 18)">
                    {/* head */}
                    <circle cx="22" cy="10" r="8" fill="#C97B4B"/>
                    {/* hijab */}
                    <path d="M14 10 Q22 0 30 10 Q34 18 30 22 Q22 26 14 22 Q10 18 14 10Z" fill="#E8A030"/>
                    {/* body — mustard dress */}
                    <path d="M10 30 Q22 22 34 30 L38 65 L6 65 Z" fill="#D4A030"/>
                    {/* arm raised */}
                    <path d="M10 32 Q2 20 0 14" stroke="#C97B4B" strokeWidth="5" strokeLinecap="round"/>
                    {/* hand */}
                    <circle cx="0" cy="13" r="4" fill="#C97B4B"/>
                    {/* legs */}
                    <rect x="12" y="62" width="7" height="16" rx="3" fill="#92400E"/>
                    <rect x="23" y="62" width="7" height="16" rx="3" fill="#92400E"/>
                    {/* shoes */}
                    <ellipse cx="15" cy="78" rx="6" ry="3" fill="#1a1814"/>
                    <ellipse cx="27" cy="78" rx="6" ry="3" fill="#1a1814"/>
                  </g>

                  {/* High-five spark */}
                  <g transform="translate(73, 12)">
                    <line x1="0" y1="0" x2="-6" y2="-6" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="0" x2="6" y2="-6" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="0" x2="0" y2="-8" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="0" cy="0" r="3" fill="#FCD34D"/>
                  </g>

                  {/* Connection line between them */}
                  <path d="M58 50 Q80 40 100 50" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4 3"/>

                  {/* Briefcase */}
                  <g transform="translate(22, 68)">
                    <rect x="0" y="4" width="20" height="14" rx="2" fill="#92400E"/>
                    <rect x="5" y="0" width="10" height="6" rx="1" fill="#78350F" stroke="#92400E" strokeWidth="1"/>
                    <line x1="0" y1="11" x2="20" y2="11" stroke="#78350F" strokeWidth="1"/>
                  </g>
                </svg>
              </div>
              <p className="lp-illus-card__label">Connect with people who can help</p>
              <button className="lp-illus-card__btn" onClick={onGoToRegister}>
                Find people you know
              </button>
            </div>

            {/* Card 2 — Learn / Grow */}
            <div className="lp-illus-card lp-illus-card--learn">
              <div className="lp-illus-card__visual">
                <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" width="160" height="110">
                  <rect width="160" height="110" rx="10" fill="rgba(255,255,255,0.08)"/>

                  {/* Bookshelf bg */}
                  <rect x="90" y="5" width="65" height="80" rx="4" fill="rgba(255,255,255,0.08)"/>
                  {/* shelf lines */}
                  <line x1="90" y1="32" x2="155" y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                  <line x1="90" y1="58" x2="155" y2="58" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>

                  {/* Books row 1 */}
                  <rect x="93" y="10" width="8" height="22" rx="1" fill="#1a6fc4"/>
                  <rect x="102" y="13" width="6" height="19" rx="1" fill="#c4932a"/>
                  <rect x="109" y="10" width="10" height="22" rx="1" fill="#10B981"/>
                  <rect x="120" y="14" width="7" height="18" rx="1" fill="#EF4444"/>
                  <rect x="128" y="10" width="9" height="22" rx="1" fill="#8B5CF6"/>
                  <rect x="138" y="12" width="6" height="20" rx="1" fill="#F59E0B"/>
                  <rect x="145" y="10" width="8" height="22" rx="1" fill="#1a6fc4" fillOpacity="0.6"/>

                  {/* Books row 2 */}
                  <rect x="93" y="36" width="10" height="22" rx="1" fill="#c4932a" fillOpacity="0.8"/>
                  <rect x="104" y="38" width="7" height="20" rx="1" fill="#10B981" fillOpacity="0.7"/>
                  <rect x="112" y="36" width="8" height="22" rx="1" fill="#1a6fc4" fillOpacity="0.5"/>
                  <rect x="121" y="39" width="9" height="19" rx="1" fill="#F59E0B" fillOpacity="0.8"/>
                  <rect x="131" y="36" width="7" height="22" rx="1" fill="#EF4444" fillOpacity="0.6"/>
                  <rect x="139" y="38" width="6" height="20" rx="1" fill="#8B5CF6" fillOpacity="0.7"/>
                  <rect x="146" y="36" width="8" height="22" rx="1" fill="#10B981" fillOpacity="0.5"/>

                  {/* Decorative globe */}
                  <circle cx="96" cy="72" r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                  <ellipse cx="96" cy="72" rx="5" ry="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                  <line x1="86" y1="72" x2="106" y2="72" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>

                  {/* Guitar hint */}
                  <path d="M148 62 Q152 68 148 74 Q144 80 140 76 Q136 72 140 66 Q144 60 148 62Z" fill="rgba(196,147,42,0.4)" stroke="rgba(196,147,42,0.6)" strokeWidth="1"/>
                  <line x1="148" y1="62" x2="150" y2="50" stroke="rgba(196,147,42,0.5)" strokeWidth="2" strokeLinecap="round"/>

                  {/* Person sitting at desk */}
                  <g transform="translate(10, 15)">
                    {/* Chair */}
                    <rect x="8" y="58" width="40" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
                    <rect x="12" y="61" width="4" height="20" rx="2" fill="rgba(255,255,255,0.15)"/>
                    <rect x="36" y="61" width="4" height="20" rx="2" fill="rgba(255,255,255,0.15)"/>
                    <rect x="8" y="35" width="5" height="24" rx="2" fill="rgba(255,255,255,0.1)"/>

                    {/* Desk */}
                    <rect x="0" y="55" width="70" height="4" rx="2" fill="rgba(255,255,255,0.25)"/>
                    <rect x="2" y="59" width="4" height="25" rx="2" fill="rgba(255,255,255,0.15)"/>
                    <rect x="64" y="59" width="4" height="25" rx="2" fill="rgba(255,255,255,0.15)"/>

                    {/* Monitor */}
                    <rect x="35" y="20" width="32" height="22" rx="3" fill="#1a3a5c"/>
                    <rect x="37" y="22" width="28" height="18" rx="2" fill="#1a6fc4" fillOpacity="0.6"/>
                    {/* screen content lines */}
                    <rect x="39" y="24" width="14" height="2" rx="1" fill="rgba(255,255,255,0.5)"/>
                    <rect x="39" y="28" width="20" height="1.5" rx="1" fill="rgba(255,255,255,0.3)"/>
                    <rect x="39" y="31" width="16" height="1.5" rx="1" fill="rgba(255,255,255,0.3)"/>
                    <rect x="39" y="34" width="12" height="1.5" rx="1" fill="rgba(255,255,255,0.25)"/>
                    {/* monitor stand */}
                    <rect x="48" y="42" width="4" height="8" rx="1" fill="rgba(255,255,255,0.2)"/>
                    <rect x="43" y="50" width="14" height="2" rx="1" fill="rgba(255,255,255,0.2)"/>

                    {/* keyboard */}
                    <rect x="30" y="52" width="22" height="3" rx="1" fill="rgba(255,255,255,0.15)"/>

                    {/* Person */}
                    {/* head */}
                    <circle cx="20" cy="20" r="10" fill="#8B6346"/>
                    {/* hair */}
                    <path d="M10 18 Q12 8 20 8 Q28 8 30 18 Q28 12 20 12 Q12 12 10 18Z" fill="#1a1814"/>
                    {/* glasses */}
                    <circle cx="16" cy="20" r="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                    <circle cx="24" cy="20" r="3" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                    <line x1="19" y1="20" x2="21" y2="20" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                    {/* beard hint */}
                    <path d="M14 26 Q20 30 26 26" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" fill="none"/>
                    {/* body */}
                    <path d="M8 40 Q20 32 32 40 L34 56 L6 56Z" fill="#2D4A6B"/>
                    {/* arm on desk */}
                    <path d="M30 42 Q38 48 40 52" stroke="#8B6346" strokeWidth="5" strokeLinecap="round"/>
                    {/* legs */}
                    <rect x="10" y="56" width="8" height="20" rx="3" fill="#3D6B3D"/>
                    <rect x="22" y="56" width="8" height="20" rx="3" fill="#3D6B3D"/>
                    {/* shoes */}
                    <ellipse cx="14" cy="76" rx="7" ry="3.5" fill="#C87941" fillOpacity="0.8"/>
                    <ellipse cx="26" cy="76" rx="7" ry="3.5" fill="#C87941" fillOpacity="0.8"/>
                  </g>

                  {/* Thinking bubble */}
                  <circle cx="55" cy="22" r="2" fill="rgba(255,255,255,0.25)"/>
                  <circle cx="60" cy="17" r="3" fill="rgba(255,255,255,0.2)"/>
                  <circle cx="67" cy="12" r="5" fill="rgba(255,255,255,0.15)"/>
                </svg>
              </div>
              <p className="lp-illus-card__label">Learn the skills you need to succeed</p>
              <div className="lp-illus-card__select-wrap">
                <select className="lp-illus-card__select" defaultValue="">
                  <option value="" disabled>Choose a topic to learn about</option>
                  <option>AI &amp; Machine Learning</option>
                  <option>Startup Building</option>
                  <option>Product Design</option>
                  <option>Web3 &amp; Blockchain</option>
                  <option>Professional Networking</option>
                </select>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="lp-illus-select-arrow">
                  <polyline points="4 6 8 10 12 6"/>
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* White right panel — same as before */}
        <div className="lp-hero-right">
          <div className="lp-hero-form-card">
            {currentUser ? (
              <div className="lp-hero-loggedin">
                <h2>Welcome back,<br/>{currentUser.name}</h2>
                <p>Ready to start networking?</p>
                <button className="lp-hero-cta-btn" onClick={onGoToHome}>
                  Go to App →
                </button>
              </div>
            ) : (
              <>
                <h2>Make the most of your professional life</h2>

                <div className="lp-field">
                  <label className="lp-field-label">Email</label>
                  <input
                    className="lp-field-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && email && onGoToRegister()}
                  />
                </div>

                <button className="lp-hero-cta-btn" onClick={onGoToRegister}>
                  Agree &amp; Join
                </button>

                <p className="lp-hero-legal">
                  By clicking Agree &amp; Join, you agree to the NetMesh{" "}
                  <a href="#!">User Agreement</a>,{" "}
                  <a href="#!">Privacy Policy</a>, and{" "}
                  <a href="#!">Cookie Policy</a>.
                </p>

                <div className="lp-hero-divider"><span>or</span></div>

                <button className="lp-hero-signin-btn" onClick={onGoToLogin}>
                  Sign in
                </button>

                <p className="lp-hero-legal" style={{marginTop:16}}>
                  New to NetMesh?{" "}
                  <a href="#!" onClick={e => { e.preventDefault(); onGoToRegister(); }}
                    style={{color:"#1a6fc4", fontWeight:600}}>Join now</a>
                </p>
              </>
            )}
          </div>
        </div>

      </section>
      {/* ══════════════════════════════════════
          WHY US
          ══════════════════════════════════════ */}
      <section className="lp-why" id="why-us">
        <p className="lp-section-label">WHY US</p>
        <h2 className="lp-section-title">Built different, on purpose</h2>
        <div className="lp-why-grid">
          <div className="lp-why-stat">
            <span className="lp-why-stat__num">AI</span>
            <span className="lp-why-stat__label">Powered Matching</span>
            <p className="lp-why-stat__desc">Cosine similarity on bio embeddings + interest overlap — not random, not alphabetical.</p>
          </div>
          <div className="lp-why-stat">
            <span className="lp-why-stat__num">0</span>
            <span className="lp-why-stat__label">Data After Session</span>
            <p className="lp-why-stat__desc">Sessions auto-expire. Messages, connections, and chats are deleted. No digital footprint.</p>
          </div>
          <div className="lp-why-stat">
            <span className="lp-why-stat__num">2s</span>
            <span className="lp-why-stat__label">Notification Latency</span>
            <p className="lp-why-stat__desc">Connection requests and alerts reach you in under 2 seconds via live polling.</p>
          </div>
          <div className="lp-why-stat">
            <span className="lp-why-stat__num">∞</span>
            <span className="lp-why-stat__label">Sessions, No Limit</span>
            <p className="lp-why-stat__desc">Create as many sessions as you need. Each event gets its own isolated, clean space.</p>
          </div>
        </div>
        <div className="lp-why-compare">
          <div className="lp-why-compare__col">
            <p className="lp-why-compare__label">Other Tools</p>
            <ul>
              <li>❌ Manual card exchange</li>
              <li>❌ No smart matching</li>
              <li>❌ Data stored forever</li>
              <li>❌ Clunky follow-up emails</li>
              <li>❌ No real-time chat</li>
            </ul>
          </div>
          <div className="lp-why-compare__vs">vs</div>
          <div className="lp-why-compare__col lp-why-compare__col--us">
            <p className="lp-why-compare__label">NetMesh</p>
            <ul>
              <li>✓ One-tap connect</li>
              <li>✓ AI interest matching</li>
              <li>✓ Auto-expiring sessions</li>
              <li>✓ In-session live chat</li>
              <li>✓ Real-time notifications</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <section className="lp-guide" id="how-it-works">
        <p className="lp-section-label">USAGE GUIDE</p>
        <h2 className="lp-section-title">Up and running in four steps</h2>
        <p className="lp-guide-sub">NetMesh is built for zero-friction onboarding. Here's exactly how it works.</p>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-left">
              <span className="step-badge">1</span>
              <div className="lp-step-connector"/>
            </div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Create Your Profile</h3>
              <p className="lp-step-desc">Register with your name, email, and a short bio. Add your professional interests and the goals you want to accomplish at events. Your profile is permanent and carries across all sessions.</p>
              <div className="lp-step-tags">
                <span className="lp-tag">Name + Bio</span>
                <span className="lp-tag">Interests</span>
                <span className="lp-tag">Goals</span>
              </div>
            </div>
            <VisualProfile/>
          </div>

          <div className="lp-step">
            <div className="lp-step-left">
              <span className="step-badge">2</span>
              <div className="lp-step-connector"/>
            </div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Join or Create a Session</h3>
              <p className="lp-step-desc">Enter a session code provided by the event organizer, or create your own session with a custom topic and requirement. Sessions are ephemeral and auto-expire after the event ends.</p>
              <div className="lp-step-tags">
                <span className="lp-tag lp-tag--teal">Session Code</span>
                <span className="lp-tag lp-tag--teal">Auto-Expiry</span>
              </div>
            </div>
            <VisualSession/>
          </div>

          <div className="lp-step">
            <div className="lp-step-left">
              <span className="step-badge">3</span>
              <div className="lp-step-connector"/>
            </div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Get Smart Recommendations</h3>
              <p className="lp-step-desc">Once inside a session, the recommendation engine analyzes all attendees and ranks them by compatibility with your interests and goals. A live-ranked list, updated in real time.</p>
              <div className="lp-step-tags">
                <span className="lp-tag lp-tag--blue">AI Matching</span>
                <span className="lp-tag lp-tag--blue">Live Ranking</span>
              </div>
            </div>
            <VisualRecommend/>
          </div>

          <div className="lp-step lp-step--last">
            <div className="lp-step-left">
              <span className="step-badge">4</span>
            </div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Chat and Connect</h3>
              <p className="lp-step-desc">Tap any recommendation to open a real-time chat. Send messages, request to connect, and grow your professional network — all within the session.</p>
              <div className="lp-step-tags">
                <span className="lp-tag lp-tag--purple">Real-Time Chat</span>
                <span className="lp-tag lp-tag--purple">Connection Requests</span>
              </div>
            </div>
            <VisualChat/>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
          ══════════════════════════════════════ */}
      <section className="lp-cta-banner">
        <div className="lp-cta-orb"/>
        <h2 className="lp-cta-title">Ready to build real connections?</h2>
        <p className="lp-cta-sub">Join thousands of professionals who network with intent.</p>
        {currentUser ? (
          <button className="lp-btn-primary lp-btn-lg" onClick={onGoToHome}>
            Go to App
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="lp-btn-icon">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <button className="lp-btn-primary lp-btn-lg" onClick={onGoToRegister}>
            Create Free Account
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="lp-btn-icon">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-logo">
          <svg className="lp-logo-svg" viewBox="0 0 36 36" fill="none">
            <circle cx="9"  cy="9"  r="4" fill="#1a6fc4"/>
            <circle cx="27" cy="9"  r="4" fill="#c4932a"/>
            <circle cx="18" cy="27" r="4" fill="#1a6fc4" opacity="0.7"/>
            <line x1="9"  y1="9" x2="27" y2="9"  stroke="#1a6fc4" strokeWidth="1.5" strokeOpacity="0.5"/>
            <line x1="9"  y1="9" x2="18" y2="27" stroke="#1a6fc4" strokeWidth="1.5" strokeOpacity="0.5"/>
            <line x1="27" y1="9" x2="18" y2="27" stroke="#c4932a" strokeWidth="1.5" strokeOpacity="0.5"/>
          </svg>
          <span className="lp-logo-text">NetMesh</span>
        </div>
        <span className="lp-footer-copy">© 2025 NetMesh. All rights reserved.</span>
      </footer>

    </div>
  );
}