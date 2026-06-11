import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", category: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchItems();
  }, [filter, searchTerm]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.category) params.category = filter.category;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get("/items", { params });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter({ ...filter, [key]: value });
  };

  return (
    <div className="items-page">
      <div className="items-header">
        <h1>Browse Items</h1>
        <p>Find lost items or help return found ones</p>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={filter.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <option value="">All Types</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>

          <select
            value={filter.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="phone">Phones</option>
            <option value="wallet">Wallets</option>
            <option value="id_card">ID Cards</option>
            <option value="keys">Keys</option>
            <option value="laptop">Laptops</option>
            <option value="bag">Bags</option>
            <option value="books">Books</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No items found</p>
          <Link to="/report-lost" className="btn-primary">
            Report an Item
          </Link>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <div className="item-content">
                <div className="item-type-badge" data-type={item.type}>
                  {item.type === "lost" ? "🔴 Lost" : "🟢 Found"}
                </div>
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">
                  {item.description.substring(0, 100)}...
                </p>
                <div className="item-meta">
                  <span>📍 {item.location}</span>
                  <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="item-footer">
                  <span className="item-category">{item.category}</span>
                  <Link to={`/items/${item._id}`} className="view-link">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemList;
