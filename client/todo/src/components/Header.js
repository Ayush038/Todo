import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const Header = ({ onToggleSidebar, onAddTask }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";

    const next = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }, []);

  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";

  return (
    <header className="app-header">
      <div className="app-header__left">
        {/* Mobile sidebar toggle */}
        <button
          className="header-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <h1 className="app-header__title">Todo Excellence</h1>
      </div>

      <div className="app-header__right" ref={ref}>
        {/* Mobile Add Task */}
        <button
          className="header-add-task-btn"
          onClick={onAddTask}
        >
          + Add Task
        </button>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {currentTheme === "dark" ? "☀️" : "🌙"}
        </button>

        <button
          className="header-user"
          onClick={() => setOpen((prev) => !prev)}
        >
          {user.name}
          <span className="header-role">({user.role})</span>
        </button>

        {open && (
          <div className="header-dropdown">
            <div className="header-dropdown__row">
              <span className="label">Name</span>
              <span>{user.name}</span>
            </div>

            <div className="header-dropdown__row">
              <span className="label">Role</span>
              <span>{user.role}</span>
            </div>

            <div className="header-dropdown__divider" />

            <button
              className="header-dropdown__logout"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
