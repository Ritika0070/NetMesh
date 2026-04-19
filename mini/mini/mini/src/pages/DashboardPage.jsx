import { useState, useEffect, useRef } from "react";
import Header from "../components/header";
import ProfileCard from "../components/ProfileCard";
import ConnectionsList from "../components/ConnectionsList";
import ChatBox from "../components/ChatBox";
import api from "../services/api";

export default function DashboardPage({ expiresAt, currentUser, sessionId, requirement, sessionInterests, onLeaveSession, onLogout }) {
  const [recommendations, setRecommendations] = useState([]);
  const [connections, setConnections]         = useState([]);
  const [seenIds, setSeenIds]                 = useState([]);
  const [activeChatUser, setActiveChatUser]   = useState(null);
  const [allMessages, setAllMessages]         = useState({});
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [notifications, setNotifications]     = useState([]);
  const [toastNotification, setToastNotification] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [timeLeft, setTimeLeft] = useState(() => { if (expiresAt) { const secs = Math.floor((new Date(expiresAt) - new Date()) / 1000); return Math.max(0, secs); } return 300; });
  const [sessionExpired, setSessionExpired]   = useState(false);
  const hasLoadedNotifications = useRef(false);
  const previousNotificationIds = useRef(new Set());
  const notificationClickHandlerRef = useRef(null);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      console.log("📌 Loading recs for sessionId:", sessionId);
      const result = await api.getRecommendations(sessionInterests, [], sessionId, requirement);
      setRecommendations(result);
      setLoading(false);
    }
    loadInitial();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sessionExpired) return;

    const pollRecommendations = setInterval(async () => {
      const allExcluded = [
        ...seenIds,
        ...recommendations.map((profile) => profile.id),
        ...connections.map((connection) => connection.id),
      ];

      const freshProfiles = await api.getRecommendations(
        sessionInterests,
        allExcluded,
        sessionId,
        requirement
      );

      if (freshProfiles.length > 0) {
        setRecommendations((prev) => [...prev, ...freshProfiles].slice(0, 5));
      }
    }, 5000);

    return () => clearInterval(pollRecommendations);
  }, [connections, recommendations, requirement, seenIds, sessionExpired, sessionId, sessionInterests]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionExpired(true);
          setConnections([]);
          setAllMessages({});
          setActiveChatUser(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    setNotifications([]);
    setToastNotification(null);
    setSelectedNotification(null);
    hasLoadedNotifications.current = false;
    previousNotificationIds.current = new Set();
  }, [sessionId]);

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

  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => setToastNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Poll messages every 3 seconds when a chat is open
  useEffect(() => {
    if (!activeChatUser) return;
    const loadMessages = async () => {
      const result = await api.getMessages(sessionId, activeChatUser.id);
      if (result.messages) {
        setAllMessages(prev => ({
          ...prev,
          [activeChatUser.id]: result.messages
        }));
      }
    };
    loadMessages();
    const poll = setInterval(loadMessages, 3000);
    return () => clearInterval(poll);
  }, [activeChatUser, sessionId]);

  async function handleConnect(profile, action) {
    if (action === "open-chat") {
      setError("");
      setActiveChatUser(profile);
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
    }
    await refillToFive(remaining, updatedSeen);
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
    // immediately fetch updated messages
    const result = await api.getMessages(sessionId, toUserId);
    if (result.messages) {
      setAllMessages(prev => ({ ...prev, [toUserId]: result.messages }));
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

    setConnections((prev) => (
      prev.some((item) => item.id === profile.id) ? prev : [...prev, profile]
    ));
    setAllMessages((prev) => (
      prev[profile.id] ? prev : { ...prev, [profile.id]: [] }
    ));
    setSeenIds((prev) => (
      prev.includes(profile.id) ? prev : [...prev, profile.id]
    ));
    setRecommendations((prev) => prev.filter((item) => item.id !== profile.id));
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
    addConnectionProfile(profile);
    setActiveChatUser(profile);
    setToastNotification(null);

    if (!notification.read) {
      await handleNotificationsOpen();
    }
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
      setActiveChatUser(profile);
    }

    setNotifications((prev) => prev.filter((item) => item.id !== selectedNotification.id));
    setToastNotification((prev) => (
      prev?.id === selectedNotification.id ? null : prev
    ));
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
          <div
            className="notification-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="notification-modal__eyebrow">Connection Request</p>
            <h2 className="notification-modal__title">
              {selectedNotification.senderProfile?.name || "This user"} wants to connect
            </h2>
            <p className="notification-modal__message">{selectedNotification.message}</p>
            <div className="notification-modal__actions">
              <button className="btn btn-connect" onClick={() => handleNotificationAction("accept")}>
                Accept
              </button>
              <button className="btn btn-skip" onClick={() => handleNotificationAction("reject")}>
                Reject
              </button>
              <button className="btn btn-block" onClick={() => handleNotificationAction("block")}>
                Block
              </button>
            </div>
          </div>
        </div>
      )}
      <Header
        currentUser={currentUser}
        sessionId={sessionId}
        onLeaveSession={onLeaveSession}
        onLogout={onLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationsOpen={handleNotificationsOpen}
        onNotificationClick={handleNotificationClick}
      />
      {sessionExpired && <div className="expired-banner">⚠ Session has ended — All connections and chats have been cleared</div>}
      <main className="dashboard-main">
        <div className="dashboard-title-row">
          <div>
            <h1 className="dashboard-title">Recommended for You</h1>
            <p className="dashboard-subtitle">Based on your interests · Goal: <span className="goal-highlight">{requirement}</span></p>
          </div>
          <div className={`timer-box ${sessionExpired ? "timer-box--expired" : ""}`}>
            <p className="timer-label">Session ends in</p>
            <p className={`timer-value ${sessionExpired ? "timer-value--expired" : ""}`}>{sessionExpired ? "EXPIRED" : `${minutes}:${seconds}`}</p>
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        <ConnectionsList connections={connections} onOpenChat={setActiveChatUser} sessionExpired={sessionExpired} />
        {loading ? (
          <div className="cards-grid">{[1,2,3,4,5].map((i) => <div key={i} className="skeleton-card" />)}</div>
        ) : (
          <div className="cards-grid">
            {recommendations.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} isConnected={connections.some((c) => c.id === profile.id)} onConnect={handleConnect} onSkip={handleSkip} sessionExpired={sessionExpired} />
            ))}
          </div>
        )}
        {!loading && recommendations.length === 0 && (
          <div className="empty-state"><span className="empty-icon">🎉</span><p>You have seen all available profiles in this session!</p></div>
        )}
      </main>
      {activeChatUser && (
        <ChatBox chatUser={activeChatUser} messages={allMessages[activeChatUser.id] || []} onSend={handleSendMessage} onClose={() => setActiveChatUser(null)} sessionExpired={sessionExpired} />
      )}
    </div>
  );
}
