import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

// Components
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ReportLost from "./components/ReportLost";
import ReportFound from "./components/ReportFound";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";

// Configure axios
axios.defaults.baseURL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("User restored:", parsedUser);
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container">
          <Routes>
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Register onRegister={handleLogin} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                user ? <Dashboard user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/admin"
              element={
                user && user.role === "admin" ? (
                  <AdminDashboard user={user} />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route
              path="/report-lost"
              element={user ? <ReportLost /> : <Navigate to="/login" />}
            />
            <Route
              path="/report-found"
              element={user ? <ReportFound /> : <Navigate to="/login" />}
            />
            <Route path="/items" element={<ItemList />} />
            <Route path="/items/:id" element={<ItemDetail user={user} />} />
            <Route path="/" element={<Navigate to="/items" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
