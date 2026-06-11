import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportFound() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    date: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (
      !formData.category ||
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.date
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting found item:", formData);

      const response = await axios.post("/items/found", {
        category: formData.category,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: formData.date,
      });

      console.log("Response:", response.data);
      setSuccess("Found item reported successfully! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error reporting found item:", err);
      if (err.response) {
        setError(err.response.data?.error || "Server error");
      } else if (err.request) {
        setError(
          "Cannot connect to server. Make sure backend is running on port 5000",
        );
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>🔍 Report Found Item</h1>
        <p>Help someone reunite with their lost item</p>
      </div>

      {error && <div className="error-alert">⚠️ {error}</div>}

      {success && <div className="success-alert">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-section">
          <h3>Item Information</h3>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="phone">📱 Phone / Smartphone</option>
              <option value="wallet">👛 Wallet / Purse</option>
              <option value="id_card">🪪 ID Card / Student Card</option>
              <option value="keys">🔑 Keys</option>
              <option value="laptop">💻 Laptop / Tablet</option>
              <option value="bag">🎒 Bag / Backpack</option>
              <option value="books">📚 Books / Notebooks</option>
              <option value="other">📦 Other</option>
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
              placeholder="Describe the item you found (color, condition, etc.)..."
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
                placeholder="e.g., Library 3rd floor, Student Union, Cafeteria"
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
        </div>

        <div className="form-section">
          <div className="info-box">
            <p>
              💡 <strong>Tip:</strong> Don't include sensitive details like
              serial numbers. The owner will need to verify those during the
              claim process.
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
