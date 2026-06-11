import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard({ user }) {
  const [pendingClaims, setPendingClaims] = useState([]);
  const [approvedClaims, setApprovedClaims] = useState([]);
  const [rejectedClaims, setRejectedClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin" && user.role !== "security") {
      navigate("/dashboard");
      return;
    }
    fetchClaims();
    fetchStats();
  }, [user]);

  const fetchClaims = async () => {
    try {
      // Fetch claims for items in your university
      const response = await axios.get("/api/admin/claims");
      const allClaims = response.data.claims;

      setPendingClaims(allClaims.filter((c) => c.status === "pending"));
      setApprovedClaims(allClaims.filter((c) => c.status === "approved"));
      setRejectedClaims(allClaims.filter((c) => c.status === "rejected"));
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/admin/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleApprove = async (claimId) => {
    if (
      window.confirm(
        "Approve this claim? The item will be released to the claimant.",
      )
    ) {
      try {
        await axios.put(`/api/admin/claims/${claimId}/approve`, {
          adminNotes: adminNotes,
          approvedBy: user.name,
        });
        alert("Claim approved successfully!");
        fetchClaims();
        setSelectedClaim(null);
        setAdminNotes("");
      } catch (error) {
        console.error("Error approving claim:", error);
        alert("Failed to approve claim");
      }
    }
  };

  const handleReject = async (claimId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      try {
        await axios.put(`/api/admin/claims/${claimId}/reject`, {
          adminNotes: reason,
          rejectedBy: user.name,
        });
        alert("Claim rejected successfully!");
        fetchClaims();
        setSelectedClaim(null);
        setAdminNotes("");
      } catch (error) {
        console.error("Error rejecting claim:", error);
        alert("Failed to reject claim");
      }
    }
  };

  const handleRequestMoreInfo = async (claimId) => {
    const questions = prompt(
      "What additional information do you need from the claimant?",
    );
    if (questions) {
      try {
        await axios.post(`/api/admin/claims/${claimId}/request-info`, {
          questions: questions,
          requestedBy: user.name,
        });
        alert("Request sent to claimant!");
      } catch (error) {
        console.error("Error requesting info:", error);
        alert("Failed to send request");
      }
    }
  };

  const viewClaimDetails = (claim) => {
    setSelectedClaim(claim);
    setShowVerificationModal(true);
  };

  const getPriorityColor = (score) => {
    if (score >= 70) return "🟢 High - Auto Approve";
    if (score >= 50) return "🟡 Medium - Review";
    return "🔴 Low - Needs Investigation";
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🏛️ Admin Dashboard</h1>
        <p>Manage and verify lost & found claims</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-value">{pendingClaims.length}</div>
          <div className="admin-stat-label">Pending Claims</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-value">{stats.totalApproved || 0}</div>
          <div className="admin-stat-label">Approved This Month</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📦</div>
          <div className="admin-stat-value">{stats.totalItems || 0}</div>
          <div className="admin-stat-label">Total Items</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-value">{stats.totalUsers || 0}</div>
          <div className="admin-stat-label">Active Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📊</div>
          <div className="admin-stat-value">{stats.recoveryRate || 0}%</div>
          <div className="admin-stat-label">Recovery Rate</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending Claims ({pendingClaims.length})
        </button>
        <button
          className={`admin-tab ${filter === "approved" ? "active" : ""}`}
          onClick={() => setFilter("approved")}
        >
          Approved ({approvedClaims.length})
        </button>
        <button
          className={`admin-tab ${filter === "rejected" ? "active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          Rejected ({rejectedClaims.length})
        </button>
      </div>

      {/* Claims List */}
      <div className="admin-claims-list">
        {filter === "pending" && pendingClaims.length === 0 && (
          <div className="empty-state">No pending claims to review 🎉</div>
        )}

        {filter === "pending" &&
          pendingClaims.map((claim) => (
            <div key={claim.id} className="admin-claim-card pending">
              <div className="claim-header">
                <div className="claim-priority">
                  {getPriorityColor(claim.score)}
                </div>
                <div className="claim-date">
                  Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="claim-body">
                <div className="claim-item-info">
                  <h3>📦 {claim.itemId?.title || "Unknown Item"}</h3>
                  <p>📍 {claim.itemId?.location}</p>
                  <p>
                    📅 Lost on:{" "}
                    {new Date(claim.itemId?.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="claim-claimant-info">
                  <h4>
                    👤 Claimant: {claim.claimantName || claim.claimantId?.name}
                  </h4>
                  <p>📧 {claim.claimantEmail || claim.claimantId?.email}</p>
                  <p>🆔 Student ID: {claim.claimantId?.studentId}</p>
                </div>

                <div className="claim-score">
                  <div
                    className="score-circle-large"
                    style={{
                      background: `conic-gradient(${getScoreColor(claim.score)} 0deg ${claim.score * 3.6}deg, #e2e8f0 ${claim.score * 3.6}deg 360deg)`,
                    }}
                  >
                    <div className="score-inner">
                      <span className="score-number">
                        {Math.round(claim.score)}%
                      </span>
                      <span className="score-label">Match</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="claim-actions">
                <button
                  className="btn-view"
                  onClick={() => viewClaimDetails(claim)}
                >
                  🔍 View Details
                </button>
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(claim.id)}
                >
                  ✅ Approve
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(claim.id)}
                >
                  ❌ Reject
                </button>
                <button
                  className="btn-info"
                  onClick={() => handleRequestMoreInfo(claim.id)}
                >
                  📝 Request Info
                </button>
              </div>
            </div>
          ))}

        {filter === "approved" &&
          approvedClaims.map((claim) => (
            <div key={claim.id} className="admin-claim-card approved">
              <div className="claim-header">
                <div className="claim-status-badge approved">✅ APPROVED</div>
                <div className="claim-date">
                  Approved: {new Date(claim.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="claim-body">
                <div className="claim-item-info">
                  <h3>📦 {claim.itemId?.title}</h3>
                  <p>📍 {claim.itemId?.location}</p>
                </div>
                <div className="claim-claimant-info">
                  <h4>👤 Claimant: {claim.claimantName}</h4>
                </div>
                <div className="claim-score">
                  <span className="score-badge">
                    {Math.round(claim.score)}% Match
                  </span>
                </div>
              </div>
            </div>
          ))}

        {filter === "rejected" &&
          rejectedClaims.map((claim) => (
            <div key={claim.id} className="admin-claim-card rejected">
              <div className="claim-header">
                <div className="claim-status-badge rejected">❌ REJECTED</div>
                <div className="claim-date">
                  Rejected: {new Date(claim.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="claim-body">
                <div className="claim-item-info">
                  <h3>📦 {claim.itemId?.title}</h3>
                </div>
                <div className="claim-claimant-info">
                  <h4>👤 Claimant: {claim.claimantName}</h4>
                </div>
                {claim.adminNotes && (
                  <div className="rejection-reason">
                    <strong>Reason:</strong> {claim.adminNotes}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Verification Modal */}
      {showVerificationModal && selectedClaim && (
        <div
          className="modal-overlay"
          onClick={() => setShowVerificationModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Claim Verification Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowVerificationModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="verification-section">
                <h3>Item Information</h3>
                <div className="info-row">
                  <strong>Title:</strong> {selectedClaim.itemId?.title}
                </div>
                <div className="info-row">
                  <strong>Category:</strong> {selectedClaim.itemId?.category}
                </div>
                <div className="info-row">
                  <strong>Location:</strong> {selectedClaim.itemId?.location}
                </div>
                <div className="info-row">
                  <strong>Date Lost:</strong>{" "}
                  {new Date(selectedClaim.itemId?.date).toLocaleDateString()}
                </div>
                <div className="info-row">
                  <strong>Finder's Description:</strong>
                  <p>{selectedClaim.itemId?.description}</p>
                </div>
              </div>

              <div className="verification-section">
                <h3>Claimant's Verification Answers</h3>
                {Object.entries(selectedClaim.answers || {}).map(
                  ([key, value]) => (
                    <div className="answer-row" key={key}>
                      <div className="question">
                        {key.replace(/([A-Z])/g, " $1").toUpperCase()}:
                      </div>
                      <div className="answer">{value}</div>
                      <div className="verification-status">
                        {selectedClaim.itemId?.privateDetails?.[
                          key
                        ]?.toLowerCase() === value?.toLowerCase()
                          ? "✅ Correct"
                          : "❌ Incorrect"}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="verification-section">
                <h3>Match Analysis</h3>
                <div className="score-analysis">
                  <div className="score-meter">
                    <div
                      className="score-fill"
                      style={{
                        width: `${selectedClaim.score}%`,
                        background: getScoreColor(selectedClaim.score),
                      }}
                    />
                  </div>
                  <p className="score-text">
                    Confidence Score: {Math.round(selectedClaim.score)}%
                  </p>
                  <p className="recommendation">
                    {selectedClaim.score >= 70
                      ? "✅ Recommendation: APPROVE - High confidence match"
                      : selectedClaim.score >= 50
                        ? "⚠️ Recommendation: Request more information before deciding"
                        : "❌ Recommendation: REJECT - Low confidence match"}
                  </p>
                </div>
              </div>

              <div className="verification-section">
                <h3>Admin Notes</h3>
                <textarea
                  className="admin-notes-input"
                  placeholder="Add notes about this claim..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-approve"
                onClick={() => handleApprove(selectedClaim.id)}
              >
                ✅ Approve Claim
              </button>
              <button
                className="btn-reject"
                onClick={() => handleReject(selectedClaim.id)}
              >
                ❌ Reject Claim
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowVerificationModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
