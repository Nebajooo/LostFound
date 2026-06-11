import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportLost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    date: "",
    privateDetails: {},
  });

  const [verificationData, setVerificationData] = useState({
    serialNumber: "",
    uniqueMarks: "",
    color: "",
    brand: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerificationChange = (e) => {
    setVerificationData({
      ...verificationData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Add private verification details
    const submitData = {
      ...formData,
      privateDetails: verificationData,
    };

    try {
      await axios.post("/items/lost", submitData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to report item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Report Lost Item</h1>
        <p>Help us find your lost item by providing detailed information</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-section">
          <h3>Basic Information</h3>

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
              placeholder="Describe your item in detail..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location Lost *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Library 3rd floor, Student Union"
                required
              />
            </div>

            <div className="form-group">
              <label>Date Lost *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Verification Details (Private - Only for Claim Verification)</h3>
          <p className="note">
            These details help verify you're the real owner. They remain
            private.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label>Serial Number (if applicable)</label>
              <input
                type="text"
                name="serialNumber"
                value={verificationData.serialNumber}
                onChange={handleVerificationChange}
                placeholder="Last 4 digits is enough"
              />
            </div>

            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={verificationData.brand}
                onChange={handleVerificationChange}
                placeholder="e.g., Apple, Samsung, Nike"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                value={verificationData.color}
                onChange={handleVerificationChange}
                placeholder="e.g., Black, Blue with red case"
              />
            </div>

            <div className="form-group">
              <label>Unique Marks/Features</label>
              <input
                type="text"
                name="uniqueMarks"
                value={verificationData.uniqueMarks}
                onChange={handleVerificationChange}
                placeholder="Scratches, stickers, engravings"
              />
            </div>
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
            {loading ? "Submitting..." : "Report Lost Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportLost;
