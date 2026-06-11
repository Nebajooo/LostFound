import React from "react";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Lost Something?
          <span className="hero-gradient"> We'll Help You Find It.</span>
        </h1>
        <p className="hero-subtitle">
          University-wide lost & found platform powered by AI matching
          technology. Report lost items, discover found items, and get reunited
          in minutes.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="hero-btn-primary">
            Get Started Free
          </Link>
          <Link to="/items" className="hero-btn-secondary">
            Browse Items
          </Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-number">85%</div>
            <div className="hero-stat-label">Recovery Rate</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">2,500+</div>
            <div className="hero-stat-label">Items Recovered</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">10,000+</div>
            <div className="hero-stat-label">Active Users</div>
          </div>
        </div>
      </div>
      <div className="hero-image">
        <div className="floating-card card-1">📱 Lost iPhone?</div>
        <div className="floating-card card-2">🔑 Found Keys!</div>
        <div className="floating-card card-3">🎓 Student ID</div>
      </div>
    </div>
  );
}

export default HeroSection;
