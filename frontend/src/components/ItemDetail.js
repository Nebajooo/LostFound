import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom"; // ← Link added here

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

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/items/${id}`);
      setItem(response.data);

      // If user is logged in and owns this item, fetch matches
      if (user && response.data.userId._id === user.id) {
        const matchesResponse = await axios.get(`/matching/find/${id}`);
        setMatches(matchesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
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
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert(error.response?.data?.error || "Failed to submit claim");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!item) return <div className="error">Item not found</div>;

  const isOwner = user && item.userId._id === user.id;
  const canClaim = user && item.type === "found" && !isOwner;

  return (
    <div className="item-detail">
      <div className="item-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <div className="item-type-badge-large" data-type={item.type}>
          {item.type === "lost" ? "Lost Item" : "Found Item"}
        </div>
      </div>

      <div className="item-detail-content">
        <div className="item-main-info">
          <h1>{item.title}</h1>
          <div className="item-meta-detail">
            <div className="meta-item">
              <strong>📍 Location:</strong> {item.location}
            </div>
            <div className="meta-item">
              <strong>📅 Date:</strong>{" "}
              {new Date(item.date).toLocaleDateString()}
            </div>
            <div className="meta-item">
              <strong>📂 Category:</strong> {item.category}
            </div>
            <div className="meta-item">
              <strong>👤 Reported by:</strong> {item.userId.name}
            </div>
            <div className="meta-item">
              <strong>🕒 Reported on:</strong>{" "}
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="item-description-detail">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>
        </div>

        <div className="item-actions">
          {canClaim && !claimStatus && (
            <button
              onClick={() => setShowClaimForm(!showClaimForm)}
              className="btn-primary"
            >
              Claim This Item
            </button>
          )}

          {isOwner && matches.length > 0 && (
            <button
              onClick={() => setShowMatches(!showMatches)}
              className="btn-secondary"
            >
              View Potential Matches ({matches.length})
            </button>
          )}
        </div>

        {showClaimForm && (
          <div className="claim-form">
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
            </form>
          </div>
        )}

        {claimStatus && (
          <div className="claim-status">
            <div className="success-alert">
              <h4>{claimStatus.message}</h4>
              <p>Confidence Score: {claimStatus.claim.score}%</p>
              <p>Status: {claimStatus.claim.status}</p>
            </div>
          </div>
        )}

        {showMatches && matches.length > 0 && (
          <div className="matches-section">
            <h3>Potential Matches</h3>
            {matches.map((match) => (
              <div key={match.item._id} className="match-card">
                <div className="match-score">
                  <div className="score-circle">{match.score}%</div>
                  <div className="score-label">Match Confidence</div>
                </div>
                <div className="match-details">
                  <h4>{match.item.title}</h4>
                  <p>{match.item.description.substring(0, 100)}...</p>
                  <div className="match-meta">
                    <span>📍 {match.item.location}</span>
                    <span>
                      📅 {new Date(match.item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <Link to={`/items/${match.item._id}`} className="view-link">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemDetail;
