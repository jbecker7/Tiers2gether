import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

interface AuthProps {
  onAuthSuccess: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await axios.post(
        `http://localhost:5003${endpoint}`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        },
      );
      onAuthSuccess(response.data.username);
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="logo.png" alt="logo" className="auth-logo" />
        <h1 className="auth-title">{isLogin ? "Login" : "Register"}</h1>
        <p className="auth-subtitle">
          {isLogin ? "Sign in to continue" : "Create your account"}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter username"
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="switch-mode-button"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
