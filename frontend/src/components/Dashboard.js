import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard({ user }) {
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Track your lost items, claims, and matches</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.lost}</div>
          <div className="stat-label">Items Lost</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.found}</div>
          <div className="stat-label">Items Found</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingClaims}</div>
          <div className="stat-label">Pending Claims</div>
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

      <div className="dashboard-sections">
        <div className="section">
          <h2>My Recent Items</h2>
          {myItems.length === 0 ? (
            <p className="empty-state">You haven't reported any items yet.</p>
          ) : (
            <div className="items-list">
              {myItems.slice(0, 5).map((item) => (
                <div key={item._id} className="item-card-small">
                  <div className="item-type-badge" data-type={item.type}>
                    {item.type === "lost" ? "Lost" : "Found"}
                  </div>
                  <div className="item-info">
                    <h4>{item.title}</h4>
                    <p>
                      {item.location} •{" "}
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                    <span className={`status-${item.status}`}>
                      {item.status}
                    </span>
                  </div>
                  <Link to={`/items/${item._id}`} className="view-link">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h2>Recent Claims</h2>
          {myClaims.length === 0 ? (
            <p className="empty-state">No claims yet.</p>
          ) : (
            <div className="claims-list">
              {myClaims.slice(0, 5).map((claim) => (
                <div key={claim._id} className="claim-card-small">
                  <div className="claim-status" data-status={claim.status}>
                    {claim.status}
                  </div>
                  <div className="claim-info">
                    <h4>Claim for: {claim.itemId?.title}</h4>
                    <p>Confidence Score: {claim.score}%</p>
                    <small>
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </small>
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
