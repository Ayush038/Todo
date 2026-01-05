import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

/* ---------- Route Guards ---------- */

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/* ---------- Routes + Theme Brain ---------- */

const AppRoutes = () => {
  const { isAuthenticated, login, signup } = useAuth();
  const navigate = useNavigate();

  /* 🔥 THEME INITIALIZATION */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  /* 🔥 THEME TOGGLE (global, reusable) */
  const toggleTheme = useCallback(() => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";

    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login onSubmit={login} />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup
                onSubmit={async (data) => {
                  await signup(data);
                  navigate("/login");
                }}
              />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

/* ---------- App Root ---------- */

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
