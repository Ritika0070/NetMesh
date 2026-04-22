import { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import JoinSessionPage from "./pages/JoinSessionPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import EditProfilePage from "./pages/EditProfilePage";
import "./App.css";

const PAGE_PATHS = {
  landing:        "/",
  home:           "/home",
  register:       "/register",
  login:          "/login",
  "join-session": "/join-session",
  dashboard:      "/dashboard",
  "edit-profile": "/edit-profile",
};

function getDefaultPage(savedUser, savedSession) {
  if (savedUser && savedSession) return "dashboard";
  if (savedUser) return "home";
  return "landing";
}

function getPageFromPath(pathname, savedUser, savedSession) {
  switch (pathname) {
    case "/":             return "landing";
    case "/home":         return savedUser ? "home" : "landing";
    case "/register":     return savedUser ? getDefaultPage(savedUser, savedSession) : "register";
    case "/login":        return savedUser ? getDefaultPage(savedUser, savedSession) : "login";
    case "/join-session": return savedUser ? "join-session" : "landing";
    case "/dashboard":    return savedUser && savedSession ? "dashboard" : getDefaultPage(savedUser, savedSession);
    case "/edit-profile": return savedUser ? "edit-profile" : "landing";
    default:              return getDefaultPage(savedUser, savedSession);
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState(() => {
    const savedUser    = localStorage.getItem("user");
    const savedSession = localStorage.getItem("sessionInfo");
    return getPageFromPath(window.location.pathname, savedUser, savedSession);
  });
  const [sessionInfo, setSessionInfo] = useState(() => {
    const saved = localStorage.getItem("sessionInfo");
    return saved ? JSON.parse(saved) : null;
  });

  function goToPage(nextPage, { replace = false } = {}) {
    const nextPath    = PAGE_PATHS[nextPage] || "/";
    const currentPath = window.location.pathname;
    setPage(nextPage);
    if (currentPath === nextPath) return;
    const historyMethod = replace ? "replaceState" : "pushState";
    window.history[historyMethod]({ page: nextPage }, "", nextPath);
  }

  useEffect(() => {
    if (sessionInfo) {
      localStorage.setItem("sessionInfo", JSON.stringify(sessionInfo));
    } else {
      localStorage.removeItem("sessionInfo");
    }
  }, [sessionInfo]);

  useEffect(() => {
    const handlePopState = () => {
      const savedUser    = localStorage.getItem("user");
      const savedSession = localStorage.getItem("sessionInfo");
      setPage(getPageFromPath(window.location.pathname, savedUser, savedSession));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const expectedPath = PAGE_PATHS[page] || "/";
    if (window.location.pathname !== expectedPath) {
      window.history.replaceState({ page }, "", expectedPath);
    }
  }, [page]);

  function handleRegisterSuccess(user) { setCurrentUser(user); goToPage("home"); }
  function handleLoginSuccess(user)    { setCurrentUser(user); goToPage("home"); }

  function handleJoinSession(sid, requirement, sessionInterests, expiresAt) {
    setSessionInfo({ sessionId: sid, requirement, sessionInterests, expiresAt });
    goToPage("dashboard");
  }

  function handleLeaveSession() { setSessionInfo(null); goToPage("home"); }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionInfo");
    setCurrentUser(null);
    setSessionInfo(null);
    goToPage("landing", { replace: true });
  }

  function handleProfileSave(updatedUser) { setCurrentUser(updatedUser); goToPage("home"); }

  return (
    <>
      {page === "landing" && (
        <LandingPage
          currentUser={currentUser}
          onGoToLogin={() => goToPage("login")}
          onGoToRegister={() => goToPage("register")}
          onGoToHome={() => goToPage("home")}
        />
      )}
      {page === "home" && currentUser && (
        <HomePage
          currentUser={currentUser}
          onGoToJoinSession={() => goToPage("join-session")}
          onLogout={handleLogout}
          onGoToDashboard={sessionInfo ? () => goToPage("dashboard") : null}
          onGoToEditProfile={() => goToPage("edit-profile")}
        />
      )}
      {page === "register" && (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onGoToLogin={() => goToPage("login")}
        />
      )}
      {page === "login" && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => goToPage("register")}
        />
      )}
      {page === "join-session" && currentUser && (
        <JoinSessionPage
          currentUser={currentUser}
          onJoinSuccess={handleJoinSession}
          onBackToHome={() => goToPage("home")}
        />
      )}
      {page === "dashboard" && currentUser && sessionInfo && (
        <DashboardPage
          currentUser={currentUser}
          sessionId={sessionInfo.sessionId}
          requirement={sessionInfo.requirement}
          sessionInterests={sessionInfo.sessionInterests}
          expiresAt={sessionInfo.expiresAt}
          onLeaveSession={handleLeaveSession}
          onLogout={handleLogout}
        />
      )}
      {page === "edit-profile" && currentUser && (
        <EditProfilePage
          currentUser={currentUser}
          onSave={handleProfileSave}
          onBack={() => goToPage("home")}
        />
      )}
    </>
  );
}