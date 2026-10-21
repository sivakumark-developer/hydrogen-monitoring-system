import React, { useState } from "react";
import { loginUser, forgotPassword } from "../api/auth";
import "./Auth.css";

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // LOGIN
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(formData);
      onLogin(response.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async (event) => {
    event.preventDefault();

    setForgotError("");
    setForgotMessage("");
    setForgotLoading(true);

    try {
      const response = await forgotPassword(formData.email.trim());

      setForgotMessage(
        response.message ||
          "If an account exists for this email, a password reset link will be sent."
      );
    } catch (err) {
      setForgotError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotPassword = () => {
    setError("");
    setForgotError("");
    setForgotMessage("");
    setShowForgotPassword(true);
  };

  const backToLogin = () => {
    setShowForgotPassword(false);
    setForgotError("");
    setForgotMessage("");
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-brand-panel">
          <div className="auth-brand">
            <div className="auth-brand-icon">⚡</div>

            <div>
              <h2>Hydrogen Monitor</h2>
              <p>Plant Intelligence Platform</p>
            </div>
          </div>

          <div className="auth-brand-content">
            <h1>
              Monitor smarter.
              <br />
              Manage <span>efficiently.</span>
            </h1>

            <p>
              Track hydrogen production, monitor electrolyzer
              performance, and make informed decisions with your
              plant monitoring dashboard.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Real-time production monitoring</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Energy and water consumption tracking</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Performance analytics and plant alerts</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            Hydrogen Production Plant Monitoring System
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            {showForgotPassword ? (
              <>
                <div className="auth-form-heading">
                  <h1>Forgot Password?</h1>
                  <p>
                    Enter your registered email address and we'll
                    send you instructions to reset your password.
                  </p>
                </div>

                {forgotError && (
                  <div className="auth-error" role="alert">
                    {forgotError}
                  </div>
                )}

                {forgotMessage && (
                  <div
                    className="auth-success"
                    role="status"
                  >
                    {forgotMessage}
                  </div>
                )}

                <form
                  onSubmit={handleForgotPassword}
                  className="auth-form"
                >
                  <div className="auth-field">
                    <label htmlFor="forgot-email">
                      Email address
                    </label>

                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          email: event.target.value,
                        })
                      }
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-button"
                    disabled={forgotLoading}
                  >
                    {forgotLoading
                      ? "Sending..."
                      : "Send Reset Link"}
                  </button>
                </form>

                <div className="auth-switch">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={backToLogin}
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="auth-form-heading">
                  <h1>Welcome back</h1>
                  <p>
                    Sign in to access your hydrogen plant dashboard.
                  </p>
                </div>

                {error && (
                  <div className="auth-error" role="alert">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="auth-form"
                >
                  <div className="auth-field">
                    <label htmlFor="email">
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="password">
                      Password
                    </label>

                    <div className="password-input-wrapper">
                      <input
                        id="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        name="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                      />

                      <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        aria-pressed={showPassword}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={openForgotPassword}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#2563eb",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 600,
                          padding: 0,
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-button"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div className="auth-switch">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                  >
                    Create an account
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;