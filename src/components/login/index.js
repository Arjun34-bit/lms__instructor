import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { envConstant } from "../../constants";
import { setLocalStorageUser } from "../../utils/localStorageUtils";

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState(
    localStorage.getItem("password") || ""
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check if a valid token exists
    const token = localStorage.getItem("token");
    const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");

    if (token && new Date(tokenExpiresAt) > new Date()) {
      window.location.href = "/dashboard";
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${envConstant.BACKEND_BASE_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      const { message, token, user, expiresAt } = response.data;

      if (token) {
        setLocalStorageUser(user);
        localStorage.setItem("token", token);
        localStorage.setItem("tokenExpiresAt", expiresAt);

        if (rememberMe) {
          localStorage.setItem("email", email);
          localStorage.setItem("password", password); // Warning: Avoid storing passwords in plain text!
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }

        setSuccess(message);
        setError("");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    } catch (error) {
      setSuccess("");
      setError(
        error.response?.data?.message ||
          error?.message ||
          "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container login-form">
      <div className="form-container">
        <div className="p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Login Form</h2>
            <p className="text-muted">Sign in to your account</p>
          </div>

          {/* Validation Errors */}
          {error && <div className="mb-4 alert alert-danger">{error}</div>}

          {/* Success Message */}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label text-muted">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="remember"
                  id="remember_me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  className="form-check-label text-muted"
                  htmlFor="remember_me"
                >
                  Remember me
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <a href="/forgot-password" className="text-decoration-none">
                Forgot your password?
              </a>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
