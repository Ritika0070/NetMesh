import { useState } from "react";
import { AVATAR_COLORS } from "../data/mockData";

export default function Header({
  currentUser,
  sessionId,
  onLeaveSession,
  notifications = [],
  unreadCount = 0,
  onNotificationsOpen,
  onNotificationsPanelOpen,
  connections = [],
  onOpenChat,
  sessionExpired = false,
}) {
  const [showConnections, setShowConnections] = useState(false);

  function handlePersonClick(person) {
    setShowConnections(false);
    onOpenChat?.(person);
  }

  function handleNotifClick() {
    if (onNotificationsOpen) onNotificationsOpen();
    if (onNotificationsPanelOpen) onNotificationsPanelOpen();
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">N</span>
          <span className="logo-text">NetMesh</span>
        </div>
        {sessionId && (
          <span className="session-badge">SESSION · {sessionId}</span>
        )}
      </div>

      {currentUser && (
        <div className="header-right">

          {/* Connections dropdown */}
          {sessionId && (
            <div className="notification-wrap">
              <button
                className={`notification-btn ${showConnections ? "notification-btn--active" : ""}`}
                onClick={() => setShowConnections(v => !v)}
                title="Connected users"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.75}}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Connections</span>
                {connections.length > 0 && (
                  <span className="notification-count">{connections.length}</span>
                )}
              </button>

              {showConnections && (
                <div className="notification-panel" style={{minWidth: 240}}>
                  <p className="notification-title">Connected</p>
                  {connections.length === 0 ? (
                    <p className="notification-empty">No connections yet in this session.</p>
                  ) : (
                    connections.map((person) => {
                      const color = AVATAR_COLORS[person.id.toString().charCodeAt(1) % AVATAR_COLORS.length];
                      return (
                        <button
                          key={person.id}
                          type="button"
                          className="connection-item"
                          disabled={sessionExpired}
                          onClick={() => handlePersonClick(person)}
                          title={sessionExpired ? "Session ended" : `Open chat with ${person.name}`}
                        >
                          <span
                            className="connection-item__avatar"
                            style={{ background: color + "22", color, border: `1.5px solid ${color}55` }}
                          >
                            {person.avatar}
                          </span>
                          <span className="connection-item__name">{person.name}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.35,flexShrink:0}}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notification button */}
          {sessionId && (
            <button
              className="notification-btn"
              onClick={handleNotifClick}
              title="Notifications"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.75}}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </button>
          )}

          <span className="header-username">{currentUser.name}</span>

          {onLeaveSession && (
            <button className="logout-btn" onClick={onLeaveSession}>
              Leave Session
            </button>
          )}
        </div>
      )}
    </header>
  );
}
