import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportLost() {
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
    privateDetails: {
      color: "",
      brand: "",
      serialNumber: "",
      uniqueMarks: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.privateDetails) {
      setFormData({
        ...formData,
        privateDetails: {
          ...formData.privateDetails,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
      console.log("Submitting lost item:", formData);

      const response = await axios.post("/items/lost", {
        category: formData.category,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        privateDetails: formData.privateDetails,
      });

      console.log("Response:", response.data);
      setSuccess("Lost item reported successfully! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error reporting lost item:", err);
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
        <h1>📱 Report Lost Item</h1>
        <p>Help us find your lost item by providing detailed information</p>
      </div>

      {error && <div className="error-alert">⚠️ {error}</div>}

      {success && <div className="success-alert">✅ {success}</div>}

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
              placeholder="Describe your item in detail (color, size, brand, etc.)..."
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
                placeholder="e.g., Library 3rd floor, Student Union, Cafeteria"
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
          <h3>🔐 Verification Details (Private)</h3>
          <p className="note">
            These details help verify you're the real owner. They remain private
            and are only used for claim verification.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                value={formData.privateDetails.color}
                onChange={handleChange}
                placeholder="e.g., Black, Silver, Blue"
              />
            </div>

            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.privateDetails.brand}
                onChange={handleChange}
                placeholder="e.g., Apple, Samsung, Nike"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Serial Number (Last 4 digits)</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.privateDetails.serialNumber}
                onChange={handleChange}
                placeholder="Last 4 digits of serial number"
              />
            </div>

            <div className="form-group">
              <label>Unique Marks/Features</label>
              <input
                type="text"
                name="uniqueMarks"
                value={formData.privateDetails.uniqueMarks}
                onChange={handleChange}
                placeholder="Scratches, stickers, engravings, etc."
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
