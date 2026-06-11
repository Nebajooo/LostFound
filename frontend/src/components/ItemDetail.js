import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

function ItemDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimAnswers, setClaimAnswers] = useState({});
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimStatus, setClaimStatus] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching item with ID:", id);
      const response = await axios.get(`/items/${id}`);
      console.log("Item data received:", response.data);

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
      if (error.response) {
        setError(
          `Server error: ${error.response.data.error || error.response.status}`,
        );
      } else if (error.request) {
        setError(
          "Cannot connect to server. Make sure backend is running on port 5000",
        );
      } else {
        setError(`Error: ${error.message}`);
      }
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
        itemId: id,
        answers: claimAnswers,
      });
      setClaimStatus(response.data);
      setShowClaimForm(false);
      // Refresh item to update status
      fetchItem();
    } catch (error) {
      console.error("Error submitting claim:", error);
      setError(error.response?.data?.error || "Failed to submit claim");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Failed to Load Item</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/items")} className="btn-primary">
          Back to Items
        </button>
        <button onClick={fetchItem} className="btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="error-container">
        <div className="error-icon">🔍</div>
        <h2>Item Not Found</h2>
        <p>The item you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/items")} className="btn-primary">
          Browse Items
        </button>
      </div>
    );
  }

  const isOwner = user && item.userId === user.id;
  const canClaim =
    user && item.type === "found" && !isOwner && item.status === "open";

  return (
    <div className="item-detail-modern">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back to Items
      </button>

      <div className="item-detail-card">
        <div className="item-detail-header">
          <div className={`item-status-badge ${item.type}`}>
            {item.type === "lost" ? "🔴 LOST ITEM" : "🟢 FOUND ITEM"}
          </div>
          <h1>{item.title}</h1>
          <div className="item-date">
            <span>📅 Lost/Found on: {formatDate(item.date)}</span>
            <span>🕒 Reported: {formatDate(item.createdAt)}</span>
          </div>
        </div>

        <div className="item-detail-body">
          <div className="info-grid">
            <div className="info-section">
              <h3>📋 Item Information</h3>
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
              <h3>👤 Reported By</h3>
              <div className="reporter-info">
                <div className="reporter-name">
                  {item.userName || "Anonymous User"}
                </div>
                <div className="reporter-contact">
                  {item.userEmail && <span>📧 {item.userEmail}</span>}
                </div>
                <div className="reporter-note">
                  <small>✅ Verified University Community Member</small>
                </div>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>📝 Description</h3>
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
              {claimStatus.claim && (
                <div>
                  <small>
                    Confidence Score: {Math.round(claimStatus.claim.score || 0)}
                    %
                  </small>
                  <br />
                  <small>Status: {claimStatus.claim.status}</small>
                </div>
              )}
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
                    <h4>{match.item?.title}</h4>
                    <p className="match-description">
                      {match.item?.description?.substring(0, 100)}...
                    </p>
                    <div className="match-meta-modern">
                      <span>📍 {match.item?.location}</span>
                      <span>📅 {formatDate(match.item?.date)}</span>
                    </div>
                    <Link to={`/items/${match.item?.id}`} className="view-link">
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
