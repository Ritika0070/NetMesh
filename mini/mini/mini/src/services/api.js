// const BASE_URL = "https://netmesh.onrender.com/api";
const BASE_URL = "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return response.json();
}

const api = {

  async register(name, email, password, interests, bio) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, interests, bio }),
    });
    const result = await res.json();
    if (result.success && result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    return result;
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (result.success && result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    return result;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async createSession(sessionName, durationMinutes = 120) {
    return authFetch(`${BASE_URL}/session/create`, {
      method: "POST",
      body: JSON.stringify({ name: sessionName, durationMinutes }),
    });
  },

  async joinSession(sessionId, requirement, sessionInterests) {
    const result = await authFetch(`${BASE_URL}/session/join`, {
      method: "POST",
      body: JSON.stringify({ sessionId, requirement, sessionInterests }),
    });
    if (result.success) {
      return { success: true, sessionId: result.sessionId, expiresAt: result.expiresAt };
    }
    return { success: false, error: result.message };
  },

  async leaveSession(sessionId) {
    try {
      return await authFetch(`${BASE_URL}/chat/leave`, {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.warn("[leaveSession] failed:", err.message);
      return { success: false };
    }
  },

  async getRecommendations(userInterests, alreadySeenIds, sessionId, requirement) {
    const interestsParam   = userInterests.join(",");
    const excludeParam     = alreadySeenIds.join(",");
    const requirementParam = encodeURIComponent(requirement || "");
    const url = `${BASE_URL}/recommend?sessionId=${sessionId}&interests=${interestsParam}&exclude=${excludeParam}&requirement=${requirementParam}`;
    const result = await authFetch(url);
    return result.recommendations || [];
  },

  async getConnections(sessionId) {
    try {
      const token = getToken();
      const response = await fetch(
        `${BASE_URL}/chat/connections?sessionId=${encodeURIComponent(sessionId)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const text = await response.text();
      if (!text || text.trimStart().startsWith("<")) {
        console.warn("[getConnections] non-JSON response — skipping connection restore");
        return { success: false, connections: [] };
      }
      return JSON.parse(text);
    } catch (err) {
      console.warn("[getConnections] failed — skipping connection restore:", err.message);
      return { success: false, connections: [] };
    }
  },

  async connectWithUser(sessionId, targetUserId) {
    return authFetch(`${BASE_URL}/chat/connect`, {
      method: "POST",
      body: JSON.stringify({ sessionId, targetUserId }),
    });
  },

  async sendMessage(sessionId, toUserId, text) {
    return authFetch(`${BASE_URL}/chat/send`, {
      method: "POST",
      body: JSON.stringify({ sessionId, toUserId, text }),
    });
  },

  async getMessages(sessionId, withUserId) {
    const url = `${BASE_URL}/chat/messages?sessionId=${sessionId}&withUserId=${withUserId}`;
    return authFetch(url);
  },

  async getNotifications(sessionId) {
    return authFetch(`${BASE_URL}/notifications?sessionId=${encodeURIComponent(sessionId)}`);
  },

  async markNotificationsRead(sessionId) {
    return authFetch(`${BASE_URL}/notifications/read`, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  },

  async respondToConnectionRequest(notificationId, action) {
    return authFetch(`${BASE_URL}/chat/connect/respond`, {
      method: "POST",
      body: JSON.stringify({ notificationId, action }),
    });
  },
};

export default api;