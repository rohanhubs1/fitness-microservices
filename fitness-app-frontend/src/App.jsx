import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router";
import { setCredentials } from "./store/authSlice";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./components/LandingPage";
import ActivityDetail from "./components/ActivityDetail";
import ProfileDialog from "./components/ProfileDialog";

const App = () => {
  const { token, tokenData, logIn, logOut } = useContext(AuthContext);
  const dispatch = useDispatch();
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(setCredentials({ token, user: tokenData }));
      // Clean up OAuth query parameters (?state=... &session_state=...) only after token is established
      if (typeof window !== 'undefined' && window.location.search && (window.location.search.includes('state=') || window.location.search.includes('session_state='))) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [token, tokenData, dispatch]);

  const isAdmin = Boolean(
    tokenData?.realm_access?.roles?.includes('ADMIN') ||
    tokenData?.resource_access?.['oauth2-pkce-client']?.roles?.includes('ADMIN') ||
    tokenData?.roles?.includes('ADMIN') ||
    tokenData?.preferred_username?.toLowerCase() === 'admin'
  );

  const defaultHome = isAdmin ? "/admin/athletes" : "/dashboard";

  return (
    <Router>
      {!token ? (
        <LandingPage onLogin={() => logIn()} />
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Navigate to={defaultHome} replace />} />
            <Route path="/activities" element={<Navigate to={defaultHome} replace />} />

            {/* Athlete Core Pages */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />
            <Route
              path="/log-workout"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />
            <Route
              path="/history"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />
            <Route
              path="/ai-coach"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />
            <Route
              path="/fitness-centres"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />
            <Route
              path="/leaderboard"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />
            <Route
              path="/contests"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />

            {/* Admin Console Pages */}
            <Route path="/admin" element={<Navigate to="/admin/athletes" replace />} />
            <Route
              path="/admin/athletes"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />
            <Route
              path="/admin/leaderboard"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />
            <Route
              path="/admin/contests"
              element={
                <DashboardLayout
                  tokenData={tokenData}
                  logOut={logOut}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              }
            />

            {/* Workout Detail & Grok AI Breakdown */}
            <Route path="/history/:id" element={<ActivityDetail />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to={defaultHome} replace />} />
          </Routes>

          {/* Profile & Goals Modal Dialog */}
          <ProfileDialog
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            onProfileUpdated={() => {}}
          />
        </>
      )}
    </Router>
  );
};

export default App;
