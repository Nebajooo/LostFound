import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="modern-navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">
            <span className="brand-icon">🔄</span>
            <span className="brand-text">Lost & Found</span>
            <span className="brand-badge">University</span>
          </Link>
        </div>

        <div className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <Link to="/items" className="nav-link">
            <span className="nav-icon">🔍</span>
            Browse Items
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
              <Link to="/report-lost" className="nav-link nav-link-lost">
                <span className="nav-icon">📱</span>
                Lost
              </Link>
              <Link to="/report-found" className="nav-link nav-link-found">
                <span className="nav-icon">🔍</span>
                Found
              </Link>
              <div className="nav-user">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-dropdown">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                  <button onClick={handleLogout} className="logout-button">
                    <span className="nav-icon">🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link nav-link-login">
                Login
              </Link>
              <Link to="/register" className="nav-link nav-link-register">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
