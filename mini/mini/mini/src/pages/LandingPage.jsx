import { useEffect, useRef } from "react";
import "./LandingPage.css";

// ─── 3D Network Mesh Canvas ───────────────────────────────────────────────────
function NetworkMesh3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height, animId;
    let nodes = [];
    let mouse = { x: 0, y: 0 };

    const NODE_COUNT = 55;
    const MAX_DIST = 160;
    const DEPTH_LAYERS = 4;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      buildNodes();
    }

    function buildNodes() {
      nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
        const layer = Math.floor(Math.random() * DEPTH_LAYERS);
        const depth = 0.3 + (layer / (DEPTH_LAYERS - 1)) * 0.7; // 0.3 → 1.0
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z: depth,
          vx: (Math.random() - 0.5) * 0.4 * depth,
          vy: (Math.random() - 0.5) * 0.4 * depth,
          r: 1.5 + depth * 2.5,
          pulsePhase: Math.random() * Math.PI * 2,
          // 3D orbit params
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (Math.random() - 0.5) * 0.004 * depth,
          orbitRadius: 20 + Math.random() * 40,
          cx: Math.random() * width,
          cy: Math.random() * height,
          active: Math.random() > 0.7,
        };
      });
    }

    function project(node, t) {
      // Gentle tilt based on mouse + time
      const tiltX = (mouse.x / width - 0.5) * 0.4;
      const tiltY = (mouse.y / height - 0.5) * 0.4;

      node.orbitAngle += node.orbitSpeed;
      const ox = Math.cos(node.orbitAngle) * node.orbitRadius;
      const oy = Math.sin(node.orbitAngle * 0.7) * node.orbitRadius * 0.6;

      const px = node.cx + ox + tiltX * (1 - node.z) * 80;
      const py = node.cy + oy + tiltY * (1 - node.z) * 80;

      return { px, py };
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);

      // Update center drift
      nodes.forEach(n => {
        n.cx += n.vx;
        n.cy += n.vy;
        if (n.cx < 0 || n.cx > width) n.vx *= -1;
        if (n.cy < 0 || n.cy > height) n.vy *= -1;
      });

      // Compute projected positions
      const projected = nodes.map(n => ({ node: n, ...project(n, t) }));

      // Sort back→front for painter's algorithm
      projected.sort((a, b) => a.node.z - b.node.z);

      // Draw edges
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.px - b.px;
          const dy = a.py - b.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const avgZ = (a.node.z + b.node.z) / 2;
          const scaledMax = MAX_DIST * avgZ;

          if (dist < scaledMax) {
            const alpha = (1 - dist / scaledMax) * avgZ * 0.55;
            const pulse = 0.6 + 0.4 * Math.sin(t * 0.001 + a.node.pulsePhase);

            // Color: purple → teal gradient based on depth
            const r = Math.round(120 + avgZ * 80);
            const g = Math.round(80 + avgZ * 80);
            const bv = Math.round(20 + avgZ * 20);

            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.strokeStyle = `rgba(${r},${g},${bv},${alpha * pulse})`;
            ctx.lineWidth = avgZ * 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      projected.forEach(({ node: n, px, py }) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.002 + n.pulsePhase);
        const baseR = n.r * pulse;

        if (n.active) {
          // Outer glow ring
          const grad = ctx.createRadialGradient(px, py, 0, px, py, baseR * 4);
          grad.addColorStop(0, `rgba(196,160,80,${0.2 * n.z})`);
          grad.addColorStop(1, "rgba(196,160,80,0)");
          ctx.beginPath();
          ctx.arc(px, py, baseR * 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Core dot
        const coreGrad = ctx.createRadialGradient(px, py, 0, px, py, baseR);
        if (n.active) {
          coreGrad.addColorStop(0, `rgba(237,216,152,${n.z})`);
          coreGrad.addColorStop(0.5, `rgba(196,160,80,${n.z * 0.9})`);
          coreGrad.addColorStop(1, `rgba(120,90,20,0)`);
        } else {
          coreGrad.addColorStop(0, `rgba(200,185,140,${n.z * 0.7})`);
          coreGrad.addColorStop(1, `rgba(140,110,50,0)`);
        }
        ctx.beginPath();
        ctx.arc(px, py, baseR, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();
      });
    }

    let start = null;
    function loop(ts) {
      if (!start) start = ts;
      draw(ts - start);
      animId = requestAnimationFrame(loop);
    }

    const onMouse = e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onTouch = e => {
      if (e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    resize();
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return <canvas ref={canvasRef} className="mesh-canvas" aria-hidden="true" />;
}

// ─── Floating 3D Card ─────────────────────────────────────────────────────────
function Card3D({ icon, title, body, accent }) {
  const cardRef = useRef(null);

  const handleMouseMove = e => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `
      perspective(700px)
      rotateY(${x * 18}deg)
      rotateX(${-y * 18}deg)
      translateZ(8px)
    `;
    card.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  };

  return (
    <div
      ref={cardRef}
      className={`lp-card lp-card--${accent}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="lp-card-shine" />
      <div className="lp-card-icon">{icon}</div>
      <h3 className="lp-card-title">{title}</h3>
      <p className="lp-card-body">{body}</p>
    </div>
  );
}

// ─── Step Badge ───────────────────────────────────────────────────────────────
function StepBadge({ number }) {
  return <span className="step-badge">{number}</span>;
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage({ onGoToLogin, onGoToRegister }) {
  return (
    <div className="lp">

      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <svg className="lp-logo-svg" viewBox="0 0 36 36" fill="none">
            <circle cx="9" cy="9" r="4" fill="#C4A050"/>
            <circle cx="27" cy="9" r="4" fill="#DDB96A"/>
            <circle cx="18" cy="27" r="4" fill="#EDD898"/>
            <line x1="9" y1="9" x2="27" y2="9" stroke="#C4A050" strokeWidth="1.5" strokeOpacity="0.6"/>
            <line x1="9" y1="9" x2="18" y2="27" stroke="#C4A050" strokeWidth="1.5" strokeOpacity="0.6"/>
            <line x1="27" y1="9" x2="18" y2="27" stroke="#DDB96A" strokeWidth="1.5" strokeOpacity="0.6"/>
          </svg>
          <span className="lp-logo-text">NetMesh</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How it Works</a>
        </div>
        <div className="lp-nav-actions">
          <button className="lp-btn-ghost" onClick={onGoToLogin}>Log In</button>
          <button className="lp-btn-primary" onClick={onGoToRegister}>Sign Up Free</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <NetworkMesh3D />

        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            Professional Networking, Reimagined
          </div>
          <h1 className="lp-hero-title">
            Connect with the right people
            <br />
            <span className="lp-hero-accent">at every event</span>
          </h1>
          <p className="lp-hero-sub">
            NetMesh matches you with professionals who share your goals and interests,
            live and in real time. Join a session, chat, and grow your network.
          </p>
          <div className="lp-hero-cta">
            <button className="lp-btn-primary lp-btn-lg" onClick={onGoToRegister}>
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="lp-btn-icon">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="lp-btn-ghost lp-btn-lg" onClick={onGoToLogin}>
              I already have an account
            </button>
          </div>

          <div className="lp-hero-stats">
            <div className="lp-stat">
              <span className="lp-stat-num">10k+</span>
              <span className="lp-stat-label">Connections Made</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-num">500+</span>
              <span className="lp-stat-label">Events Hosted</span>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <span className="lp-stat-num">98%</span>
              <span className="lp-stat-label">Match Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features" id="features">
        <p className="lp-section-label">WHY NETMESH</p>
        <h2 className="lp-section-title">Everything you need to network smarter</h2>
        <div className="lp-cards">
          <Card3D accent="purple" icon="⚡" title="Real-Time Matching"
            body="Session engine instantly surfaces attendees who match your professional goals and interests." />
          <Card3D accent="teal" icon="💬" title="Live Chat"
            body="Start meaningful conversations right inside the platform. No card swapping, no follow-up hassle." />
          <Card3D accent="blue" icon="🔔" title="Smart Notifications"
            body="Get alerted when someone with complementary skills joins your session so you never miss a connection." />
          <Card3D accent="purple" icon="🔒" title="Private Sessions"
            body="Each networking session is scoped and time-bound. Share only what you want, when you want." />
          <Card3D accent="teal" icon="🌐" title="Any Event, Any Scale"
            body="From intimate meetups to large conferences, NetMesh scales to every room size effortlessly." />
          <Card3D accent="blue" icon="📊" title="Interest Graph"
            body="Your profile builds a live interest graph that gets smarter with every session you join." />
        </div>
      </section>

      {/* ── How It Works / Usage Guide ── */}
      <section className="lp-guide" id="how-it-works">
        <p className="lp-section-label">USAGE GUIDE</p>
        <h2 className="lp-section-title">Up and running in four steps</h2>
        <p className="lp-guide-sub">
          NetMesh is built for zero-friction onboarding. Here's exactly how it works.
        </p>

        <div className="lp-steps">

          <div className="lp-step">
            <div className="lp-step-left">
              <StepBadge number="01" />
              <div className="lp-step-connector" />
            </div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Create Your Profile</h3>
              <p className="lp-step-desc">
                Register with your name, email, and a short bio. Add your professional
                interests and the goals you want to accomplish at events. Your profile
                is permanent and carries across all sessions.
              </p>
              <div className="lp-step-tags">
                <span className="lp-tag">Name + Bio</span>
                <span className="lp-tag">Interests</span>
                <span className="lp-tag">Goals</span>
              </div>
            </div>
            <div className="lp-step-visual lp-step-visual--register">
              <div className="mock-card">
                <div className="mock-avatar">S</div>
                <div className="mock-lines">
                  <div className="mock-line mock-line--name" />
                  <div className="mock-line mock-line--role" />
                </div>
              </div>
              <div className="mock-tags-row">
                <div className="mock-tag" />
                <div className="mock-tag mock-tag--wide" />
                <div className="mock-tag" />
              </div>
            </div>
          </div>

          <div className="lp-step">
            <div className="lp-step-left">
              <StepBadge number="02" />
              <div className="lp-step-connector" />
            </div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Join or Create a Session</h3>
              <p className="lp-step-desc">
                Enter a session code provided by the event organizer, or create your
                own session with a custom topic and requirement. Sessions are ephemeral
                and auto-expire after the event ends, keeping your data clean.
              </p>
              <div className="lp-step-tags">
                <span className="lp-tag lp-tag--teal">Session Code</span>
                <span className="lp-tag lp-tag--teal">Topic / Requirement</span>
                <span className="lp-tag lp-tag--teal">Auto-Expiry</span>
              </div>
            </div>
            <div className="lp-step-visual lp-step-visual--session">
              <div className="mock-input-group">
                <div className="mock-input-label" />
                <div className="mock-input-box">
                  <span className="mock-code">NM-2024</span>
                </div>
              </div>
              <div className="mock-session-chip">
                <span className="mock-dot" />
                Session Active
              </div>
            </div>
          </div>

          <div className="lp-step">
            <div className="lp-step-left">
              <StepBadge number="03" />
              <div className="lp-step-connector" />
            </div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Get Smart Recommendations</h3>
              <p className="lp-step-desc">
                Once inside a session, the recommendation engine analyzes all attendees
                and ranks them by compatibility with your interests and goals. You see
                a live-ranked list of people worth talking to, updated in real time.
              </p>
              <div className="lp-step-tags">
                <span className="lp-tag lp-tag--blue">Interest Matching</span>
                <span className="lp-tag lp-tag--blue">Live Ranking</span>
                <span className="lp-tag lp-tag--blue">Profile Scores</span>
              </div>
            </div>
            <div className="lp-step-visual lp-step-visual--recommend">
              {[85, 72, 61].map((score, i) => (
                <div className="mock-rec-row" key={i}>
                  <div className={`mock-rec-avatar mock-rec-avatar--${i}`} />
                  <div className="mock-rec-bar-wrap">
                    <div className="mock-rec-bar" style={{ "--w": `${score}%` }} />
                  </div>
                  <span className="mock-rec-score">{score}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-step lp-step--last">
            <div className="lp-step-left">
              <StepBadge number="04" />
            </div>
            <div className="lp-step-body">
              <h3 className="lp-step-title">Chat and Connect</h3>
              <p className="lp-step-desc">
                Tap any recommendation to open a real-time chat. Send messages via
                WebSocket-powered live chat, request to connect, and save the
                connection to your permanent profile for future follow-ups.
              </p>
              <div className="lp-step-tags">
                <span className="lp-tag lp-tag--purple">Real-Time Chat</span>
                <span className="lp-tag lp-tag--purple">Connection Requests</span>
                <span className="lp-tag lp-tag--purple">Saved Contacts</span>
              </div>
            </div>
            <div className="lp-step-visual lp-step-visual--chat">
              <div className="mock-chat">
                <div className="mock-bubble mock-bubble--in">Hey! I saw you work in ML too 👋</div>
                <div className="mock-bubble mock-bubble--out">Yes! Let's connect.</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-orb" />
        <h2 className="lp-cta-title">Ready to build real connections?</h2>
        <p className="lp-cta-sub">Join thousands of professionals who network with intent.</p>
        <button className="lp-btn-primary lp-btn-lg" onClick={onGoToRegister}>
          Create Free Account
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="lp-btn-icon">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-logo">
          <svg className="lp-logo-svg" viewBox="0 0 36 36" fill="none">
            <circle cx="9" cy="9" r="4" fill="#C4A050"/>
            <circle cx="27" cy="9" r="4" fill="#DDB96A"/>
            <circle cx="18" cy="27" r="4" fill="#EDD898"/>
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
