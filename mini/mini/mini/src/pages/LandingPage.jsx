import { useEffect, useRef, useState } from "react";
import "./LandingPage.css";

function NetworkMesh3D() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, animId, nodes = [], mouse = { x: 0, y: 0 };
    const NODE_COUNT = 55, MAX_DIST = 160, DEPTH_LAYERS = 4;
    function resize() { width = canvas.width = canvas.offsetWidth; height = canvas.height = canvas.offsetHeight; buildNodes(); }
    function buildNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => {
        const layer = Math.floor(Math.random() * DEPTH_LAYERS);
        const depth = 0.3 + (layer / (DEPTH_LAYERS - 1)) * 0.7;
        return { z: depth, vx: (Math.random()-0.5)*0.4*depth, vy: (Math.random()-0.5)*0.4*depth, r: 1.5+depth*2.5, pulsePhase: Math.random()*Math.PI*2, orbitAngle: Math.random()*Math.PI*2, orbitSpeed: (Math.random()-0.5)*0.004*depth, orbitRadius: 20+Math.random()*40, cx: Math.random()*(width||800), cy: Math.random()*(height||600), active: Math.random()>0.7 };
      });
    }
    function project(node) {
      const tiltX = (mouse.x/(width||1)-0.5)*0.4, tiltY = (mouse.y/(height||1)-0.5)*0.4;
      node.orbitAngle += node.orbitSpeed;
      const ox = Math.cos(node.orbitAngle)*node.orbitRadius, oy = Math.sin(node.orbitAngle*0.7)*node.orbitRadius*0.6;
      return { px: node.cx+ox+tiltX*(1-node.z)*80, py: node.cy+oy+tiltY*(1-node.z)*80 };
    }
    function draw(t) {
      ctx.clearRect(0,0,width,height);
      nodes.forEach(n => { n.cx+=n.vx; n.cy+=n.vy; if(n.cx<0||n.cx>width)n.vx*=-1; if(n.cy<0||n.cy>height)n.vy*=-1; });
      const projected = nodes.map(n=>({node:n,...project(n)}));
      projected.sort((a,b)=>a.node.z-b.node.z);
      for(let i=0;i<projected.length;i++) for(let j=i+1;j<projected.length;j++) {
        const a=projected[i],b=projected[j],dx=a.px-b.px,dy=a.py-b.py,dist=Math.sqrt(dx*dx+dy*dy),avgZ=(a.node.z+b.node.z)/2;
        if(dist<MAX_DIST*avgZ){const alpha=(1-dist/(MAX_DIST*avgZ))*avgZ*0.55,pulse=0.6+0.4*Math.sin(t*0.001+a.node.pulsePhase);ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.strokeStyle=`rgba(${Math.round(120+avgZ*80)},${Math.round(80+avgZ*80)},${Math.round(20+avgZ*20)},${alpha*pulse})`;ctx.lineWidth=avgZ*1.2;ctx.stroke();}
      }
      projected.forEach(({node:n,px,py})=>{
        const pulse=0.7+0.3*Math.sin(t*0.002+n.pulsePhase),baseR=n.r*pulse;
        if(n.active){const grad=ctx.createRadialGradient(px,py,0,px,py,baseR*4);grad.addColorStop(0,`rgba(196,160,80,${0.2*n.z})`);grad.addColorStop(1,"rgba(196,160,80,0)");ctx.beginPath();ctx.arc(px,py,baseR*4,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();}
        const coreGrad=ctx.createRadialGradient(px,py,0,px,py,baseR);
        if(n.active){coreGrad.addColorStop(0,`rgba(237,216,152,${n.z})`);coreGrad.addColorStop(0.5,`rgba(196,160,80,${n.z*0.9})`);coreGrad.addColorStop(1,"rgba(120,90,20,0)");}
        else{coreGrad.addColorStop(0,`rgba(200,185,140,${n.z*0.7})`);coreGrad.addColorStop(1,"rgba(140,110,50,0)");}
        ctx.beginPath();ctx.arc(px,py,baseR,0,Math.PI*2);ctx.fillStyle=coreGrad;ctx.fill();
      });
    }
    let start=null; function loop(ts){if(!start)start=ts;draw(ts-start);animId=requestAnimationFrame(loop);}
    const onMouse=e=>{const r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;};
    const onTouch=e=>{if(e.touches[0]){const r=canvas.getBoundingClientRect();mouse.x=e.touches[0].clientX-r.left;mouse.y=e.touches[0].clientY-r.top;}};
    window.addEventListener("resize",resize);canvas.addEventListener("mousemove",onMouse);canvas.addEventListener("touchmove",onTouch,{passive:true});
    resize();animId=requestAnimationFrame(loop);
    return ()=>{cancelAnimationFrame(animId);window.removeEventListener("resize",resize);canvas.removeEventListener("mousemove",onMouse);canvas.removeEventListener("touchmove",onTouch);};
  }, []);
  return <canvas ref={canvasRef} className="mesh-canvas" aria-hidden="true" />;
}

function Card3D({ icon, title, body, accent }) {
  const cardRef = useRef(null);
  const handleMouseMove = e => {
    const card = cardRef.current; if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX-rect.left)/rect.width-0.5, y = (e.clientY-rect.top)/rect.height-0.5;
    card.style.transform = `perspective(700px) rotateY(${x*18}deg) rotateX(${-y*18}deg) translateZ(8px)`;
    card.style.setProperty("--mx",`${(x+0.5)*100}%`);card.style.setProperty("--my",`${(y+0.5)*100}%`);
  };
  const handleMouseLeave = () => { const card = cardRef.current; if (!card) return; card.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0px)"; };
  return (
    <div ref={cardRef} className={`lp-card lp-card--${accent}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="lp-card-shine" /><div className="lp-card-icon">{icon}</div>
      <h3 className="lp-card-title">{title}</h3><p className="lp-card-body">{body}</p>
    </div>
  );
}

function StepBadge({ number }) { return <span className="step-badge">{number}</span>; }

function VisualProfile() {
  return (
    <div className="lp-step-visual">
      <div className="sv-profile-card">
        <div className="sv-avatar"><svg viewBox="0 0 40 40" fill="none" width="26" height="26"><circle cx="20" cy="15" r="7" stroke="#C4A050" strokeWidth="1.5"/><path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#C4A050" strokeWidth="1.5" strokeLinecap="round"/></svg></div>
        <div className="sv-profile-lines"><div className="sv-line sv-line--name" /><div className="sv-line sv-line--role" /></div>
      </div>
      <div className="sv-interest-chips">
        <span className="sv-chip sv-chip--lit">AI</span><span className="sv-chip sv-chip--lit">Startups</span>
        <span className="sv-chip">Design</span><span className="sv-chip sv-chip--lit">Web3</span><span className="sv-chip">Health</span>
      </div>
      <div className="sv-goal-row"><span className="sv-goal-label">Goal</span><span className="sv-goal-value">Co-founder Hunt</span></div>
    </div>
  );
}
function VisualSession() {
  return (
    <div className="lp-step-visual">
      <div className="sv-session-box">
        <div className="sv-session-label">Session ID</div>
        <div className="sv-session-code">{"JFRCC4".split("").map((ch,i)=><span key={i} className="sv-code-char" style={{"--d":`${i*0.07}s`}}>{ch}</span>)}</div>
      </div>
      <div className="sv-participants">
        <span className="sv-p-label">Participants joining</span>
        <div className="sv-p-dots">{[0,1,2,3,4,5,6,7].map(i=><span key={i} className="sv-p-dot" style={{"--d":`${i*0.15}s`}}/>)}<span className="sv-p-more">+12</span></div>
      </div>
      <div className="mock-session-chip"><span className="mock-dot"/>Session Active</div>
    </div>
  );
}
function VisualRecommend() {
  const people = [{initials:"AR",score:92,delay:"0s"},{initials:"SK",score:78,delay:"0.2s"},{initials:"PM",score:65,delay:"0.4s"}];
  return (
    <div className="lp-step-visual">
      <div className="sv-rec-label">Top Matches</div>
      {people.map(({initials,score,delay})=>(
        <div className="sv-rec-row" key={initials} style={{"--d":delay}}>
          <div className="sv-rec-avatar">{initials}</div>
          <div className="sv-rec-bar-wrap"><div className="sv-rec-bar" style={{"--w":`${score}%`,"--d":delay}}/></div>
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
        <div><div className="sv-chat-name">Aryan Mehta</div><div className="sv-chat-status"><span className="sv-online-dot"/>online</div></div>
      </div>
      <div className="sv-chat-messages">
        <div className="sv-msg sv-msg--in" style={{"--d":"0.2s"}}>Hey! I saw you work in ML too.</div>
        <div className="sv-msg sv-msg--out" style={{"--d":"0.8s"}}>Yes! What are you building?</div>
        <div className="sv-msg sv-msg--in" style={{"--d":"1.4s"}}>A recommendation engine — want to connect?</div>
        <div className="sv-msg sv-msg--out sv-msg--action" style={{"--d":"2s"}}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5}}><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
          Connect
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ currentUser, onGoToLogin, onGoToRegister, onGoToHome }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown on outside click
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
            <circle cx="9"  cy="9"  r="4" fill="#C4A050"/><circle cx="27" cy="9"  r="4" fill="#DDB96A"/><circle cx="18" cy="27" r="4" fill="#EDD898"/>
            <line x1="9"  y1="9" x2="27" y2="9"  stroke="#C4A050" strokeWidth="1.5" strokeOpacity="0.6"/>
            <line x1="9"  y1="9" x2="18" y2="27" stroke="#C4A050" strokeWidth="1.5" strokeOpacity="0.6"/>
            <line x1="27" y1="9" x2="18" y2="27" stroke="#DDB96A" strokeWidth="1.5" strokeOpacity="0.6"/>
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
            /* Logged-in state: show "Go to App" + profile dropdown */
            <>
              <button className="lp-btn-primary" onClick={onGoToHome}>
                Go to App
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="lp-btn-icon">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="lp-profile-wrap" ref={profileRef}>
                <button
                  className={`lp-profile-btn ${profileOpen ? "lp-profile-btn--open" : ""}`}
                  onClick={() => setProfileOpen(v => !v)}
                  title={currentUser.name}
                >
                  <span className="lp-profile-avatar">{initials}</span>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{transition:"transform 0.2s",transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)"}}>
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
                    <button className="lp-profile-dropdown__item" onClick={() => { setProfileOpen(false); onGoToHome(); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      Home
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logged-out state: profile dropdown with login/register */
            <>
              <div className="lp-profile-wrap" ref={profileRef}>
                <button
                  className={`lp-profile-btn ${profileOpen ? "lp-profile-btn--open" : ""}`}
                  onClick={() => setProfileOpen(v => !v)}
                  title="Account"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.8}}>
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{transition:"transform 0.2s",transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)"}}>
                    <polyline points="4 6 8 10 12 6"/>
                  </svg>
                </button>
                {profileOpen && (
                  <div className="lp-profile-dropdown">
                    <p className="lp-profile-dropdown__prompt">Welcome to NetMesh</p>
                    <button
                      className="lp-profile-dropdown__item lp-profile-dropdown__item--primary"
                      onClick={() => { setProfileOpen(false); onGoToRegister(); }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                      Create Account
                    </button>
                    <button
                      className="lp-profile-dropdown__item"
                      onClick={() => { setProfileOpen(false); onGoToLogin(); }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                      Log In
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <NetworkMesh3D />
        <div className="lp-hero-content">
          <div className="lp-hero-badge"><span className="lp-badge-dot"/>Professional Networking, Reimagined</div>
          <h1 className="lp-hero-title">Connect with the right people<br/><span className="lp-hero-accent">at every event</span></h1>
          <p className="lp-hero-sub">NetMesh matches you with professionals who share your goals and interests, live and in real time. Join a session, chat, and grow your network.</p>
          <div className="lp-hero-cta">
            {currentUser ? (
              <button className="lp-btn-primary lp-btn-lg" onClick={onGoToHome}>
                Go to App
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="lp-btn-icon"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ) : (
              <>
                <button className="lp-btn-primary lp-btn-lg" onClick={onGoToRegister}>
                  Get Started Free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="lp-btn-icon"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="lp-btn-ghost lp-btn-lg" onClick={onGoToLogin}>I already have an account</button>
              </>
            )}
          </div>
          <div className="lp-trust-strip">
            <span className="lp-trust-label">Built for</span>
            <div className="lp-trust-items">
              <span className="lp-trust-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>Conferences</span>
              <span className="lp-trust-dot"/>
              <span className="lp-trust-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Hackathons</span>
              <span className="lp-trust-dot"/>
              <span className="lp-trust-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Summits</span>
              <span className="lp-trust-dot"/>
              <span className="lp-trust-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Meetups</span>
              <span className="lp-trust-dot"/>
              <span className="lp-trust-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>Campus Events</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features" id="features">
        <p className="lp-section-label">WHY NETMESH</p>
        <h2 className="lp-section-title">Everything you need to network smarter</h2>
        <div className="lp-cards">
          <Card3D accent="purple" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>} title="Real-Time Matching" body="Session engine instantly surfaces attendees who match your professional goals and interests."/>
          <Card3D accent="teal"   icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} title="Live Chat" body="Start meaningful conversations right inside the platform. No card swapping, no follow-up hassle."/>
          <Card3D accent="blue"   icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>} title="Smart Notifications" body="Get alerted when someone with complementary skills joins your session so you never miss a connection."/>
          <Card3D accent="purple" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} title="Private Sessions" body="Each networking session is scoped and time-bound. Share only what you want, when you want."/>
          <Card3D accent="teal"   icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} title="Any Event, Any Scale" body="From intimate meetups to large conferences, NetMesh scales to every room size effortlessly."/>
          <Card3D accent="blue"   icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} title="Interest Graph" body="Your profile builds a live interest graph that gets smarter with every session you join."/>
        </div>
      </section>

      {/* ── Why Us ── */}
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
            <p className="lp-why-stat__desc">Connection requests, messages, and alerts reach you in under 2 seconds via live polling.</p>
          </div>
          <div className="lp-why-stat">
            <span className="lp-why-stat__num">∞</span>
            <span className="lp-why-stat__label">Sessions, No Limit</span>
            <p className="lp-why-stat__desc">Create as many sessions as you need. Each event gets its own isolated, clean space.</p>
          </div>
        </div>

        <div className="lp-why-compare">
          <div className="lp-why-compare__col lp-why-compare__col--them">
            <p className="lp-why-compare__label">Other Tools</p>
            <ul>
              <li>❌ Manual card exchange</li>
              <li>❌ No smart matching</li>
              <li>❌ Data stored forever</li>
              <li>❌ Clunky follow-up emails</li>
              <li>❌ No real-time chat</li>
            </ul>
          </div>
          <div className="lp-why-compare__vs">VS</div>
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

      {/* ── How It Works ── */}
      <section className="lp-guide" id="how-it-works">
        <p className="lp-section-label">USAGE GUIDE</p>
        <h2 className="lp-section-title">Up and running in four steps</h2>
        <p className="lp-guide-sub">NetMesh is built for zero-friction onboarding. Here's exactly how it works.</p>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-left"><StepBadge number="01"/><div className="lp-step-connector"/></div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Create Your Profile</h3>
              <p className="lp-step-desc">Register with your name, email, and a short bio. Add your professional interests and the goals you want to accomplish at events. Your profile is permanent and carries across all sessions.</p>
              <div className="lp-step-tags"><span className="lp-tag">Name + Bio</span><span className="lp-tag">Interests</span><span className="lp-tag">Goals</span></div>
            </div>
            <VisualProfile/>
          </div>
          <div className="lp-step">
            <div className="lp-step-left"><StepBadge number="02"/><div className="lp-step-connector"/></div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Join or Create a Session</h3>
              <p className="lp-step-desc">Enter a session code provided by the event organizer, or create your own session with a custom topic and requirement. Sessions are ephemeral and auto-expire after the event ends.</p>
              <div className="lp-step-tags"><span className="lp-tag lp-tag--teal">Session Code</span><span className="lp-tag lp-tag--teal">Topic / Requirement</span><span className="lp-tag lp-tag--teal">Auto-Expiry</span></div>
            </div>
            <VisualSession/>
          </div>
          <div className="lp-step">
            <div className="lp-step-left"><StepBadge number="03"/><div className="lp-step-connector"/></div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Get Smart Recommendations</h3>
              <p className="lp-step-desc">Once inside a session, the recommendation engine analyzes all attendees and ranks them by compatibility with your interests and goals. A live-ranked list, updated in real time.</p>
              <div className="lp-step-tags"><span className="lp-tag lp-tag--blue">Interest Matching</span><span className="lp-tag lp-tag--blue">Live Ranking</span><span className="lp-tag lp-tag--blue">Profile Scores</span></div>
            </div>
            <VisualRecommend/>
          </div>
          <div className="lp-step lp-step--last">
            <div className="lp-step-left"><StepBadge number="04"/></div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Chat and Connect</h3>
              <p className="lp-step-desc">Tap any recommendation to open a real-time chat. Send messages, request to connect, and save the connection to your profile for future follow-ups.</p>
              <div className="lp-step-tags"><span className="lp-tag lp-tag--purple">Real-Time Chat</span><span className="lp-tag lp-tag--purple">Connection Requests</span><span className="lp-tag lp-tag--purple">Saved Contacts</span></div>
            </div>
            <VisualChat/>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-orb"/>
        <h2 className="lp-cta-title">Ready to build real connections?</h2>
        <p className="lp-cta-sub">Join thousands of professionals who network with intent.</p>
        {currentUser ? (
          <button className="lp-btn-primary lp-btn-lg" onClick={onGoToHome}>
            Go to App <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="lp-btn-icon"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ) : (
          <button className="lp-btn-primary lp-btn-lg" onClick={onGoToRegister}>
            Create Free Account <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="lp-btn-icon"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </section>

      <footer className="lp-footer">
        <div className="lp-logo">
          <svg className="lp-logo-svg" viewBox="0 0 36 36" fill="none">
            <circle cx="9" cy="9" r="4" fill="#C4A050"/><circle cx="27" cy="9" r="4" fill="#DDB96A"/><circle cx="18" cy="27" r="4" fill="#EDD898"/>
            <line x1="9" y1="9" x2="27" y2="9" stroke="#C4A050" strokeWidth="1.5" strokeOpacity="0.6"/>
            <line x1="9" y1="9" x2="18" y2="27" stroke="#C4A050" strokeWidth="1.5" strokeOpacity="0.6"/>
            <line x1="27" y1="9" x2="18" y2="27" stroke="#DDB96A" strokeWidth="1.5" strokeOpacity="0.6"/>
          </svg>
          <span className="lp-logo-text">NetMesh</span>
        </div>
        <span className="lp-footer-copy">© 2025 NetMesh. All rights reserved.</span>
      </footer>

    </div>
  );
}