import { useState } from "react";
import { Link } from "react-router-dom";

const Signup = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ name, email, password, role });
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-card">
          <h2>Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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

            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit">Create Account</button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/">Login</Link>
          </div>
        </div>
      </div>
      <div className="auth-right auth-info">
        <div>
          <h1>❗Sign Yourself Up❗</h1>
          <p>Todo List Welcomes You!!</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
