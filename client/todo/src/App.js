import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddTodo from "./pages/AddTodo";
import EditTodo from "./pages/EditTodo";
import { AnimatePresence } from "framer-motion";

import { setTheme, getTheme } from "./utils/themes";

function App() {
  const locate = useLocation();
  const [theme, setThemeState] = useState(getTheme());

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  return (
    <AnimatePresence>
      <Routes location={locate} key={locate.pathname}>
        <Route path="/" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/signup" element={<Signup theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/dashboard" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/add" element={<AddTodo theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/edit/:id" element={<EditTodo theme={theme} toggleTheme={toggleTheme} />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
