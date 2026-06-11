import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

function ItemDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimAnswers, setClaimAnswers] = useState({});
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimStatus, setClaimStatus] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/items/${id}`);
      setItem(response.data);

      // If user is logged in and owns this item, fetch matches
      if (user && response.data.userId === user.id) {
        try {
          const matchesResponse = await axios.get(`/matching/find/${id}`);
          setMatches(matchesResponse.data);
        } catch (err) {
          console.log("No matches found");
        }
      }
    } catch (error) {
      console.error("Error fetching item:", error);
      setError("Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimChange = (e) => {
    setClaimAnswers({
      ...claimAnswers,
      [e.target.name]: e.target.value,
    });
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/claims", {
        itemId: parseInt(id),
        answers: claimAnswers,
      });
      setClaimStatus(response.data);
      setShowClaimForm(false);
    } catch (error) {
      console.error("Error submitting claim:", error);
      setError(error.response?.data?.error || "Failed to submit claim");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      phone: "📱",
      wallet: "👛",
      id_card: "🪪",
      keys: "🔑",
      laptop: "💻",
      bag: "🎒",
      books: "📚",
      other: "📦",
    };
    return icons[category] || "📦";
  };

  if (loading) return <div className="loading">Loading item details...</div>;
  if (error) return <div className="alert-modern alert-error">{error}</div>;
  if (!item)
    return <div className="alert-modern alert-error">Item not found</div>;

  const isOwner = user && item.userId === user.id;
  const canClaim = user && item.type === "found" && !isOwner;

  return (
    <div className="item-detail-modern">
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary"
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Items
      </button>

      <div className="item-detail-card">
        <div className="item-detail-header">
          <div className={`item-status-badge ${item.type}`}>
            {item.type === "lost" ? "🔴 LOST ITEM" : "🟢 FOUND ITEM"}
          </div>
          <h1>{item.title}</h1>
          <div className="item-date">
            <span>📅 {formatDate(item.date)}</span>
            <span>🕒 Reported on {formatDate(item.createdAt)}</span>
          </div>
        </div>

        <div className="item-detail-body">
          <div className="info-grid">
            <div className="info-section">
              <h3>
                <span>📋</span> Item Information
              </h3>
              <div className="info-row">
                <div className="info-label">Category:</div>
                <div className="info-value">
                  {getCategoryIcon(item.category)}{" "}
                  {item.category?.toUpperCase()}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Location:</div>
                <div className="info-value">📍 {item.location}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Status:</div>
                <div className="info-value">
                  <span className={`status-badge status-${item.status}`}>
                    {item.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-section reported-by-card">
              <h3>
                <span>👤</span> Reported By
              </h3>
              <div className="reporter-info">
                <div className="reporter-name">
                  {item.userName || "Anonymous User"}
                  {item.userRole === "admin" && (
                    <span className="reporter-badge">Admin</span>
                  )}
                </div>
                <div className="reporter-contact">
                  {item.userEmail && <span>📧 {item.userEmail}</span>}
                  {item.userPhone && <span>📞 {item.userPhone}</span>}
                </div>
                <div className="reporter-note">
                  <small>✅ Verified University Community Member</small>
                </div>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>
              <span>📝</span> Description
            </h3>
            <div className="description-text">{item.description}</div>
          </div>

          <div className="action-buttons">
            {canClaim && !claimStatus && (
              <button
                onClick={() => setShowClaimForm(!showClaimForm)}
                className="btn-primary"
              >
                {showClaimForm ? "Cancel" : "🔐 Claim This Item"}
              </button>
            )}

            {isOwner && matches.length > 0 && (
              <button
                onClick={() => setShowMatches(!showMatches)}
                className="btn-secondary"
              >
                🎯 View Potential Matches ({matches.length})
              </button>
            )}
          </div>

          {showClaimForm && (
            <div className="claim-form-modern">
              <h3>Verify Ownership</h3>
              <p>
                Please answer these questions to prove this item belongs to you:
              </p>
              <form onSubmit={handleClaimSubmit}>
                <div className="form-group">
                  <label>What color is the item?</label>
                  <input
                    type="text"
                    name="color"
                    onChange={handleClaimChange}
                    placeholder="e.g., Black, Blue with red case"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Any unique marks or features?</label>
                  <input
                    type="text"
                    name="uniqueMarks"
                    onChange={handleClaimChange}
                    placeholder="Describe scratches, stickers, etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Where was it lost/found?</label>
                  <input
                    type="text"
                    name="location"
                    onChange={handleClaimChange}
                    placeholder="Be specific about location"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Additional identifying information</label>
                  <textarea
                    name="additionalInfo"
                    onChange={handleClaimChange}
                    placeholder="Serial number, IMEI, contents, etc."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Submit Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClaimForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {claimStatus && (
            <div
              className={`alert-modern ${claimStatus.claim?.status === "approved" ? "alert-success" : "alert-info"}`}
            >
              <strong>{claimStatus.message}</strong>
              <br />
              <small>
                Confidence Score: {Math.round(claimStatus.claim?.score || 0)}%
              </small>
            </div>
          )}

          {showMatches && matches.length > 0 && (
            <div className="matches-section-modern">
              <h3>🎯 Potential Matches</h3>
              {matches.map((match, idx) => (
                <div key={idx} className="match-card-modern">
                  <div className="match-score-modern">
                    <div className="score-circle-modern">
                      <div className="score-number">{match.score}</div>
                      <div className="score-label">Match</div>
                    </div>
                  </div>
                  <div className="match-content-modern">
                    <h4>{match.item.title}</h4>
                    <p className="match-description">
                      {match.item.description.substring(0, 100)}...
                    </p>
                    <div className="match-meta-modern">
                      <span>📍 {match.item.location}</span>
                      <span>📅 {formatDate(match.item.date)}</span>
                    </div>
                    <Link to={`/items/${match.item.id}`} className="view-link">
                      View Match Details →
                    </Link>
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

export default ItemDetail;
