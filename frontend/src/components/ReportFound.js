import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportFound() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/items/found", formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to report found item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Report Found Item</h1>
        <p>Help someone reunite with their lost item</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-section">
          <h3>Item Details</h3>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="phone">Phone / Smartphone</option>
              <option value="wallet">Wallet / Purse</option>
              <option value="id_card">ID Card / Student Card</option>
              <option value="keys">Keys</option>
              <option value="laptop">Laptop / Tablet</option>
              <option value="bag">Bag / Backpack</option>
              <option value="books">Books / Notebooks</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Black iPhone 14 Pro"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the item you found..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location Found *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Library, Cafeteria, Parking Lot"
                required
              />
            </div>

            <div className="form-group">
              <label>Date Found *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="info-box">
            <p>
              💡 Tip: Don't include sensitive details like serial numbers. The
              owner will need to verify those.
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Submitting..." : "Report Found Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportFound;
