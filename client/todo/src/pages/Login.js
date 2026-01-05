import { useState } from "react";
import { Link } from "react-router-dom";

const Login = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-left auth-info">
        <div>
          <h1>Welcome Back</h1>
          <p>Log in to continue managing your tasks 📋</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Login</h2>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div className="auth-footer">
            Don’t have an account?{" "}
            <Link to="/signup">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
