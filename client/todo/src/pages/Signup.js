import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import AuthLayout from "../utils/AuthLayout";
import { setTheme, getTheme } from "../utils/themes";
import Swal from "sweetalert2";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [theme, setThemeState] = useState(getTheme());
  const navigate = useNavigate();

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/signup", { name, email, password, role });
      await Swal.fire("Success", "Signup successful! Please login.", "success");
      navigate("/");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Signup failed", "error");
    }
  };

  return (
    <AuthLayout direction="signup">
      <div className={`signup-page ${theme}-mode`}>
        <div className="signup-card">
          <h2>Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit">Create Account</button>
          </form>

          <p className="login-text">
            Already have an account?{" "}
            <Link to="/" className="login-link">
              Login
            </Link>
          </p>
        </div>

        <div className="signup-info">
          <h1>❗Sign Yourself Up❗</h1>
          <p>Todo List Welcomes You!!</p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;