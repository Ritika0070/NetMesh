import { useState } from "react";

export default function Header({
  currentUser,
  sessionId,
  onLeaveSession,
  notifications = [],
  unreadCount = 0,
  onNotificationsOpen,
  onNotificationClick,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  function toggleNotifications() {
    const nextOpen = !showNotifications;
    setShowNotifications(nextOpen);
    if (nextOpen && onNotificationsOpen) {
      onNotificationsOpen();
    }
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
          <div className="notification-wrap">
            <button className="notification-btn" onClick={toggleNotifications}>
              <span>Notifications</span>
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notification-panel">
                <p className="notification-title">Recent Alerts</p>
                {notifications.length === 0 ? (
                  <p className="notification-empty">No notifications yet.</p>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`notification-item ${item.read ? "" : "notification-item--unread"}`}
                      onClick={() => onNotificationClick?.(item)}
                    >
                      <p className="notification-message">{item.message}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <span className="header-username">{currentUser.name}</span>

          {onLeaveSession && (
            <button className="logout-btn" onClick={onLeaveSession}>
              Leave
            </button>
          )}
        </div>
      )}
    </header>
  );
}
