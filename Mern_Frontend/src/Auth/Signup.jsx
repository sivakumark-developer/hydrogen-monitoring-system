import React, { useState } from "react";
import { registerUser } from "../api/auth";
import "./Auth.css";

const Signup = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      onSignup(response.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        {/* Left branding panel */}
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
              Start your
              <br />
              journey with <span>us.</span>
            </h1>

            <p>
              Create your account to monitor hydrogen production,
              track electrolyzer performance, and manage plant
              operations from one dashboard.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Monitor hydrogen production and targets</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Track energy and water consumption</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Access reports, analytics, and alerts</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            Hydrogen Production Plant Monitoring System
          </div>
        </section>

        {/* Right registration panel */}
        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-form-heading">
              <h1>Create account</h1>
              <p>
                Enter your details to get started with Hydrogen Monitor.
              </p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  minLength={2}
                  maxLength={50}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email address</label>
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

              {/* Password field with eye button */}
              <div className="auth-field">
                <label htmlFor="password">Password</label>

                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    minLength={8}
                    maxLength={72}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.5 0 9 7 9 7a15 15 0 01-3.1 3.9" />
                        <path d="M6.2 6.2C3.9 7.7 3 12 3 12s3.5 7 9 7a10 10 0 004-.8" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password field with eye button */}
              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>

                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    minLength={8}
                    maxLength={72}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.5 0 9 7 9 7a15 15 0 01-3.1 3.9" />
                        <path d="M6.2 6.2C3.9 7.7 3 12 3 12s3.5 7 9 7a10 10 0 004-.8" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?{" "}
              <button type="button" onClick={onSwitchToLogin}>
                Sign in
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;