import { useState, useEffect, useRef } from "react";
import Header from "../components/header";
import ProfileCard from "../components/ProfileCard";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import api from "../services/api";

export default function DashboardPage({ expiresAt, currentUser, sessionId, requirement, sessionInterests, onLeaveSession, onLogout }) {
  const [recommendations, setRecommendations] = useState([]);
  const [connections, setConnections]         = useState([]);
  const [seenIds, setSeenIds]                 = useState([]);
  const [openChats, setOpenChats]             = useState([]);
  const [pendingSent, setPendingSent]         = useState([]);
  const [allMessages, setAllMessages]         = useState({});
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [notifications, setNotifications]     = useState([]);
  const [toastNotification, setToastNotification] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (expiresAt) {
      const secs = Math.floor((new Date(expiresAt) - new Date()) / 1000);
      return Math.max(0, secs);
    }
    return 300;
  });
  const [sessionExpired, setSessionExpired]   = useState(false);
  const hasLoadedNotifications = useRef(false);
  const previousNotificationIds = useRef(new Set());
  const notificationClickHandlerRef = useRef(null);
  const expiredHandled = useRef(false);

  // ─── On mount: restore connections + load recommendations ───
  useEffect(() => {
    async function loadInitial() {
      hasLoadedNotifications.current = false;
      previousNotificationIds.current = new Set();
      setNotifications([]);
      setToastNotification(null);
      setSelectedNotification(null);

      setLoading(true);

      let restoredConnections = [];
      try {
        const connResult = await api.getConnections(sessionId);
        if (connResult.success && connResult.connections?.length > 0) {
          restoredConnections = connResult.connections;
          const restoredIds = restoredConnections.map((c) => c.id.toString());
          setConnections(restoredConnections);
          setSeenIds(restoredIds);
          setAllMessages((prev) => {
            const next = { ...prev };
            restoredIds.forEach((id) => { if (!next[id]) next[id] = []; });
            return next;
          });
        }
      } catch (err) {
        console.warn("[loadInitial] getConnections failed:", err.message);
      }

      const excludeIds = restoredConnections.map((c) => c.id.toString());
      const result = await api.getRecommendations(sessionInterests, excludeIds, sessionId, requirement);
      setRecommendations(result);
      setLoading(false);
    }
    loadInitial();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Poll for new recommendations ───
  useEffect(() => {
    if (sessionExpired) return;

    const pollRecommendations = setInterval(async () => {
      const allExcluded = [
        ...seenIds,
        ...recommendations.map((profile) => profile.id),
        ...connections.map((connection) => connection.id),
      ];
      const freshProfiles = await api.getRecommendations(sessionInterests, allExcluded, sessionId, requirement);
      if (freshProfiles.length > 0) {
        setRecommendations((prev) => [...prev, ...freshProfiles].slice(0, 5));
      }
    }, 5000);

    return () => clearInterval(pollRecommendations);
  }, [connections, recommendations, requirement, seenIds, sessionExpired, sessionId, sessionInterests]);

  // ─── Session countdown ───
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Handle session expiry ───
  useEffect(() => {
    if (timeLeft > 0) return;
    if (expiredHandled.current) return;
    expiredHandled.current = true;

    const timeout = setTimeout(() => {
      setSessionExpired(true);
      setConnections([]);
      setAllMessages({});
      setOpenChats([]);
      setPendingSent([]);
    }, 0);

    return () => clearTimeout(timeout);
  }, [timeLeft]);

  // ─── Browser notification permission ───
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // ─── Poll notifications ───
  useEffect(() => {
    const loadNotifications = async () => {
      const result = await api.getNotifications(sessionId);
      if (result.success) {
        const nextNotifications = result.notifications || [];

        if (hasLoadedNotifications.current) {
          const freshUnread = nextNotifications.find(
            (item) => !item.read && !previousNotificationIds.current.has(item.id)
          );

          if (freshUnread) {
            setToastNotification(freshUnread);

            if ("Notification" in window && Notification.permission === "granted") {
              const desktopNotification = new Notification("NetMesh", {
                body: freshUnread.message,
              });
              desktopNotification.onclick = () => {
                window.focus();
                notificationClickHandlerRef.current?.(freshUnread);
                desktopNotification.close();
              };
            }
          }
        }

        previousNotificationIds.current = new Set(nextNotifications.map((item) => item.id));
        hasLoadedNotifications.current = true;
        setNotifications(nextNotifications);
      }
    };

    loadNotifications();
    const poll = setInterval(loadNotifications, 2000);
    return () => clearInterval(poll);
  }, [sessionId]);

  // ─── Toast auto-dismiss ───
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => setToastNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // ─── Poll messages for all open chats ───
  useEffect(() => {
    if (openChats.length === 0) return;

    const loadAllMessages = async () => {
      for (const chatUser of openChats) {
        const result = await api.getMessages(sessionId, chatUser.id);
        if (result.messages) {
          setAllMessages((prev) => ({ ...prev, [chatUser.id]: result.messages }));
        }
      }
    };

    loadAllMessages();
    const poll = setInterval(loadAllMessages, 3000);
    return () => clearInterval(poll);
  }, [openChats, sessionId]);

  function openChat(profile) {
    setOpenChats((prev) => {
      if (prev.some((c) => c.id === profile.id)) {
        return [...prev.filter((c) => c.id !== profile.id), profile];
      }
      return [...prev, profile].slice(-3);
    });
  }

  function closeChat(profileId) {
    setOpenChats((prev) => prev.filter((c) => c.id !== profileId));
  }

  async function handleLeaveSession() {
    try {
      await api.leaveSession(sessionId);
    } catch (err) {
      console.warn("leaveSession error:", err.message);
    }
    onLeaveSession();
  }

  async function handleConnect(profile, action) {
    if (action === "open-chat") {
      setError("");
      openChat(profile);
      return;
    }
    setError("");
    const result = await api.connectWithUser(sessionId, profile.id);
    if (!result.success) {
      setError(result.message || "Could not connect right now.");
      return;
    }

    const updatedSeen = seenIds.includes(profile.id) ? seenIds : [...seenIds, profile.id];
    setSeenIds(updatedSeen);
    const remaining = recommendations.filter((r) => r.id !== profile.id);

    if (result.status === "connected") {
      addConnectionProfile(profile);
      await refillToFive(remaining, updatedSeen);
    } else if (result.status === "pending") {
      setPendingSent((prev) =>
        prev.some((p) => p.id === profile.id) ? prev : [...prev, profile]
      );
      setRecommendations(remaining);
      await refillToFive(remaining, updatedSeen);
    }
  }

  async function handleSkip(profileId) {
    const updatedSeen = [...seenIds, profileId];
    setSeenIds(updatedSeen);
    const remaining = recommendations.filter((r) => r.id !== profileId);
    await refillToFive(remaining, updatedSeen);
  }

  async function refillToFive(currentCards, excludeIds) {
    if (currentCards.length >= 5) { setRecommendations(currentCards.slice(0, 5)); return; }
    const allExcluded = [...excludeIds, ...currentCards.map((r) => r.id), ...connections.map((c) => c.id)];
    const newCards = await api.getRecommendations(sessionInterests, allExcluded, sessionId, requirement);
    setRecommendations([...currentCards, ...newCards].slice(0, 5));
  }

  async function handleSendMessage(toUserId, text) {
    setError("");
    const sendResult = await api.sendMessage(sessionId, toUserId, text);
    if (!sendResult.success) {
      setError(sendResult.message || "Message could not be sent.");
      return;
    }
    const result = await api.getMessages(sessionId, toUserId);
    if (result.messages) {
      setAllMessages((prev) => ({ ...prev, [toUserId]: result.messages }));
    }
  }

  async function handleNotificationsOpen() {
    const unread = notifications.some((item) => !item.read);
    if (!unread) return;
    const result = await api.markNotificationsRead(sessionId);
    if (result.success) {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    }
  }

  function addConnectionProfile(profile) {
    if (!profile?.id) return;
    setConnections((prev) =>
      prev.some((item) => item.id === profile.id) ? prev : [...prev, profile]
    );
    setAllMessages((prev) =>
      prev[profile.id] ? prev : { ...prev, [profile.id]: [] }
    );
    setSeenIds((prev) =>
      prev.includes(profile.id) ? prev : [...prev, profile.id]
    );
    setRecommendations((prev) => prev.filter((item) => item.id !== profile.id));
    setPendingSent((prev) => prev.filter((item) => item.id !== profile.id));
  }

  async function handleNotificationClick(notification) {
    if (!notification?.senderProfile) return;
    if (sessionExpired) {
      setError("This session has ended, so this connection can no longer be opened.");
      return;
    }

    setError("");
    if (notification.type === "connect") {
      setSelectedNotification(notification);
      setToastNotification(null);
      return;
    }

    const profile = notification.senderProfile;

    try {
      const connResult = await api.getConnections(sessionId);
      if (connResult.success && connResult.connections?.length > 0) {
        connResult.connections.forEach((c) => addConnectionProfile(c));
      }
    } catch {
      addConnectionProfile(profile);
    }

    openChat(profile);
    setToastNotification(null);
    if (!notification.read) await handleNotificationsOpen();
  }

  async function handleNotificationAction(action) {
    if (!selectedNotification?.id) return;
    setError("");
    const result = await api.respondToConnectionRequest(selectedNotification.id, action);
    if (!result.success) {
      setError(result.message || "Could not update this request right now.");
      return;
    }

    const profile = result.profile || selectedNotification.senderProfile;
    if (action === "accept" && profile) {
      addConnectionProfile(profile);
      openChat(profile);
    }

    setNotifications((prev) => prev.filter((item) => item.id !== selectedNotification.id));
    setToastNotification((prev) =>
      prev?.id === selectedNotification.id ? null : prev
    );
    setSelectedNotification(null);
  }

  useEffect(() => {
    notificationClickHandlerRef.current = handleNotificationClick;
  });

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="dashboard">
      {toastNotification && (
        <button
          type="button"
          className="toast-notification"
          onClick={() => handleNotificationClick(toastNotification)}
        >
          <p className="toast-notification__title">New Notification</p>
          <p className="toast-notification__message">{toastNotification.message}</p>
        </button>
      )}

      {selectedNotification && (
        <div className="notification-modal-backdrop" onClick={() => setSelectedNotification(null)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <p className="notification-modal__eyebrow">Connection Request</p>
            <h2 className="notification-modal__title">
              {selectedNotification.senderProfile?.name || "This user"} wants to connect
            </h2>
            <p className="notification-modal__message">{selectedNotification.message}</p>
            <div className="notification-modal__actions">
              <button className="btn btn-connect" onClick={() => handleNotificationAction("accept")}>Accept</button>
              <button className="btn btn-skip"    onClick={() => handleNotificationAction("reject")}>Reject</button>
              <button className="btn btn-block"   onClick={() => handleNotificationAction("block")}>Block</button>
            </div>
          </div>
        </div>
      )}

      <Header
        currentUser={currentUser}
        sessionId={sessionId}
        onLeaveSession={handleLeaveSession}
        onLogout={onLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationsOpen={handleNotificationsOpen}
        onNotificationClick={handleNotificationClick}
      />

   {sessionExpired && (
  <div className="expired-banner">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px',verticalAlign:'middle',opacity:0.7}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    Session has ended — All connections and chats have been cleared
  </div>
)}

      <div className="dashboard-layout">
        <main className="dashboard-main">
          <div className="dashboard-title-row">
            <div>
              <h1 className="dashboard-title">Recommended for You</h1>
              <p className="dashboard-subtitle">
                Based on your interests · Goal: <span className="goal-highlight">{requirement}</span>
              </p>
            </div>
            <div className={`timer-box ${sessionExpired ? "timer-box--expired" : ""}`}>
              <p className="timer-label">Session ends in</p>
              <p className={`timer-value ${sessionExpired ? "timer-value--expired" : ""}`}>
                {sessionExpired ? "EXPIRED" : `${minutes}:${seconds}`}
              </p>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <div className="cards-grid">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="cards-grid">
              {recommendations.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isConnected={connections.some((c) => c.id === profile.id)}
                  onConnect={handleConnect}
                  onSkip={handleSkip}
                  sessionExpired={sessionExpired}
                />
              ))}
            </div>
          )}
{!loading && recommendations.length === 0 && (
  <div className="empty-state">
    {/* Creative: all nodes connected — mesh complete illustration */}
    <svg width="64" height="48" viewBox="0 0 64 48" fill="none" style={{display:'block',margin:'0 auto 20px',opacity:0.5}}>
      <circle cx="32" cy="8"  r="4" fill="#C4A050"/>
      <circle cx="10" cy="38" r="4" fill="#C4A050"/>
      <circle cx="54" cy="38" r="4" fill="#C4A050"/>
      <circle cx="32" cy="28" r="3" fill="#DDB96A" fillOpacity="0.6"/>
      <line x1="32" y1="12" x2="32" y2="25"  stroke="#C4A050" strokeWidth="1.2" strokeOpacity="0.5"/>
      <line x1="32" y1="12" x2="10"  y2="34"  stroke="#C4A050" strokeWidth="1.2" strokeOpacity="0.4"/>
      <line x1="32" y1="12" x2="54"  y2="34"  stroke="#C4A050" strokeWidth="1.2" strokeOpacity="0.4"/>
      <line x1="13"  y1="38" x2="29" y2="28"  stroke="#C4A050" strokeWidth="1"   strokeOpacity="0.3"/>
      <line x1="51"  y1="38" x2="35" y2="28"  stroke="#C4A050" strokeWidth="1"   strokeOpacity="0.3"/>
      <line x1="14"  y1="40" x2="50" y2="40"  stroke="#C4A050" strokeWidth="1"   strokeOpacity="0.2"/>
      {/* pulse ring on center node */}
      <circle cx="32" cy="28" r="7" stroke="#C4A050" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="2 3"/>
    </svg>
    <p style={{color:'#8A7A60',fontSize:'15px',letterSpacing:'0.04em'}}>
      Your mesh is complete — you've seen everyone in this session.
    </p>
  </div>
)}
        </main>

        <ChatSidebar
          connections={connections}
          pendingSent={pendingSent}
          openChats={openChats}
          onOpenChat={openChat}
          sessionExpired={sessionExpired}
        />
      </div>

      {openChats.map((chatUser, index) => (
        <ChatWindow
          key={chatUser.id}
          chatUser={chatUser}
          messages={allMessages[chatUser.id] || []}
          onSend={handleSendMessage}
          onClose={() => closeChat(chatUser.id)}
          sessionExpired={sessionExpired}
          stackIndex={index}
        />
      ))}
    </div>
  );
}