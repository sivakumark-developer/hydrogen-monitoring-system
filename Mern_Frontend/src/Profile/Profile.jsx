import React, { useState } from "react";
import "./Profile.css";

function Profile({ user, onBack }) {
const [showDetails, setShowDetails] = useState(false);

const displayName = user?.name || "User";
const displayEmail = user?.email || "Not available";
const userId = user?.id || user?._id || "Not available";

return (
<div className="profile-page">
<header className="profile-header">
<div>
<h1>My Profile</h1>
<p>Manage and view your account information.</p>
</div>

    <button className="profile-back-button" onClick={onBack}>
      ← Back to Dashboard
    </button>
  </header>

  <section className="profile-card">
    <div className="profile-avatar">
      {displayName.charAt(0).toUpperCase()}
    </div>

    <h2>{displayName}</h2>
    <p className="profile-role">Plant Monitoring System User</p>

    <div className="profile-divider" />

    <div className="profile-info">
      <div className="profile-info-item">
        <span className="profile-label">Full Name</span>
        <span className="profile-value">{displayName}</span>
      </div>

      <div className="profile-info-item">
        <span className="profile-label">Email Address</span>
        <span className="profile-value">{displayEmail}</span>
      </div>

      <div className="profile-info-item">
        <span className="profile-label">Account Status</span>
        <span className="profile-status">● Authenticated</span>
      </div>
    </div>

    <button
      className="profile-details-button"
      onClick={() => setShowDetails((previous) => !previous)}
    >
      {showDetails ? "Hide Account Details" : "View Account Details"}
    </button>

    {showDetails && (
      <div className="profile-account-details">
        <span className="profile-label">Account ID</span>
        <span className="profile-value profile-id">{userId}</span>
      </div>
    )}
  </section>
</div>

);
}

export default Profile;