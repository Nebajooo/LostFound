import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard({ user }) {
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        axios.get("/users/items"),
        axios.get("/users/claims"),
      ]);
      setMyItems(itemsRes.data);
      setMyClaims(claimsRes.data);

      // Get recent matches for lost items
      const lostItems = itemsRes.data.filter(
        (i) => i.type === "lost" && i.status === "open",
      );
      if (lostItems.length > 0) {
        const matchesPromises = lostItems
          .slice(0, 3)
          .map((item) =>
            axios.get(`/matching/find/${item.id}`).catch(() => ({ data: [] })),
          );
        const matchesResults = await Promise.all(matchesPromises);
        const allMatches = matchesResults.flatMap((res) => res.data || []);
        setRecentMatches(allMatches.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    lost: myItems.filter((i) => i.type === "lost" && i.status === "open")
      .length,
    found: myItems.filter((i) => i.type === "found" && i.status === "open")
      .length,
    resolved: myItems.filter((i) => i.status === "resolved").length,
    pendingClaims: myClaims.filter((c) => c.status === "pending").length,
    recoveryRate:
      myItems.length > 0
        ? Math.round(
            (myItems.filter((i) => i.status === "resolved").length /
              myItems.length) *
              100,
          )
        : 0,
  };

  if (loading) return <div className="loading">Loading the dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}! 👋</h1>
        <p>Track your lost items, claims, and reunite with your belongings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-value">{stats.lost}</div>
          <div className="stat-label">Items Lost</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-value">{stats.found}</div>
          <div className="stat-label">Items Found</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.resolved}</div>
          <div className="stat-label">Successfully Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pendingClaims}</div>
          <div className="stat-label">Pending Claims</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.recoveryRate}%</div>
          <div className="stat-label">Recovery Rate</div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/report-lost" className="action-btn lost-btn">
          📱 Report Lost Item
        </Link>
        <Link to="/report-found" className="action-btn found-btn">
          🔍 Report Found Item
        </Link>
        <Link to="/items" className="action-btn browse-btn">
          👁️ Browse All Items
        </Link>
      </div>

      {recentMatches.length > 0 && (
        <div className="section" style={{ marginBottom: "2rem" }}>
          <h2>🎯 Potential Matches Found!</h2>
          <div className="items-list">
            {recentMatches.map((match, idx) => (
              <div key={idx} className="item-card-small">
                <div className="item-info">
                  <h4>{match.item?.title || "Potential match"}</h4>
                  <p>Match score: {match.score}% confidence</p>
                </div>
                <Link to={`/items/${match.item?.id}`} className="view-link">
                  View Match →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-sections">
        <div className="section">
          <h2>📦 Your Recent Items</h2>
          {myItems.length === 0 ? (
            <div className="empty-state">
              <p>You haven't reported any items yet.</p>
              <Link
                to="/report-lost"
                className="btn-primary"
                style={{ marginTop: "1rem", display: "inline-block" }}
              >
                Report Your First Item
              </Link>
            </div>
          ) : (
            <div className="items-list">
              {myItems.slice(0, 5).map((item) => (
                <div key={item.id} className="item-card-small">
                  <div>
                    <div className="item-type-badge" data-type={item.type}>
                      {item.type === "lost" ? "Lost" : "Found"}
                    </div>
                    <div className="item-info">
                      <h4>{item.title}</h4>
                      <p>
                        {item.location} •{" "}
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <Link to={`/items/${item.id}`} className="view-link">
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h2>📋 Your Recent Claims</h2>
          {myClaims.length === 0 ? (
            <div className="empty-state">
              <p>No claims yet. Found an item? Claim it!</p>
              <Link
                to="/items"
                className="btn-primary"
                style={{ marginTop: "1rem", display: "inline-block" }}
              >
                Browse Found Items
              </Link>
            </div>
          ) : (
            <div className="claims-list">
              {myClaims.slice(0, 5).map((claim) => (
                <div key={claim.id} className="item-card-small">
                  <div>
                    <div
                      className="status-badge"
                      style={{
                        background:
                          claim.status === "approved"
                            ? "#dcfce7"
                            : claim.status === "pending"
                              ? "#fed7aa"
                              : "#fee2e2",
                        color:
                          claim.status === "approved"
                            ? "#166534"
                            : claim.status === "pending"
                              ? "#9a3412"
                              : "#dc2626",
                      }}
                    >
                      {claim.status.toUpperCase()}
                    </div>
                    <div className="item-info">
                      <h4>Claim for: {claim.itemId?.title || "Item"}</h4>
                      <p>Confidence Score: {Math.round(claim.score)}%</p>
                      <small>
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
