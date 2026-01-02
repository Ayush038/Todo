import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import AuthLayout from "../utils/AuthLayout";
import { setTheme, getTheme } from "../utils/themes";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setThemeState] = useState(getTheme());
  const navigate = useNavigate();

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      Swal.fire("Success", "Logged in successfully!", "success");
      navigate("/dashboard");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Login failed", "error");
    }
  };

  return (
    <AuthLayout direction="login">
      <div className={`login-page ${theme}-mode`}>
        <div className="login-info">
          <h1>Welcome Back</h1>
          <p>Log in to continue managing your tasks📋</p>
        </div>
        <div className="login-card">
          <h2>Login</h2>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>

          <p className="signup-text">
            Don’t have an account?{" "}
            <Link to="/signup" className="signup-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
