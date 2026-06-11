const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory storage (no MongoDB required for testing)
const users = [];
const items = [];
const claims = [];

console.log("🚀 Starting server without MongoDB for testing...");

// ============ HEALTH CHECK ============
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    users: users.length,
    items: items.length,
  });
});

// ============ AUTH ROUTES ============

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, studentId, university, phone } = req.body;

    console.log("Register attempt:", { name, email, studentId });

    // Check if user exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      studentId,
      university,
      phone: phone || "",
      role: "student",
    };

    users.push(user);

    // Create token
    const token = jwt.sign({ id: user.id, email: user.email }, "secret123", {
      expiresIn: "7d",
    });

    console.log("✅ User registered:", user.email);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user.id, email: user.email }, "secret123", {
      expiresIn: "7d",
    });

    console.log("✅ User logged in:", user.email);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get("/api/auth/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "secret123");
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ============ ITEM ROUTES ============

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "secret123");
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Report lost item
app.post("/api/items/lost", auth, (req, res) => {
  try {
    const { category, title, description, location, date, privateDetails } =
      req.body;

    const item = {
      id: items.length + 1,
      type: "lost",
      category,
      title,
      description,
      location,
      date,
      privateDetails: privateDetails || {},
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      status: "open",
      createdAt: new Date(),
    };

    items.push(item);

    console.log("📱 Lost item reported:", item.title);

    res.status(201).json(item);
  } catch (error) {
    console.error("Report lost error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Report found item
app.post("/api/items/found", auth, (req, res) => {
  try {
    const { category, title, description, location, date } = req.body;

    const item = {
      id: items.length + 1,
      type: "found",
      category,
      title,
      description,
      location,
      date,
      privateDetails: {},
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      status: "open",
      createdAt: new Date(),
    };

    items.push(item);

    console.log("🔍 Found item reported:", item.title);

    res.status(201).json(item);
  } catch (error) {
    console.error("Report found error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all items
app.get("/api/items", (req, res) => {
  try {
    const { type, category } = req.query;
    let filteredItems = [...items];

    if (type) {
      filteredItems = filteredItems.filter((i) => i.type === type);
    }
    if (category) {
      filteredItems = filteredItems.filter((i) => i.category === category);
    }

    filteredItems = filteredItems
      .filter((i) => i.status === "open")
      .slice(0, 50);

    res.json(filteredItems);
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get single item
app.get("/api/items/:id", (req, res) => {
  try {
    const item = items.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Get item error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's items
app.get("/api/users/items", auth, (req, res) => {
  try {
    const userItems = items.filter((i) => i.userId === req.user.id);
    res.json(userItems);
  } catch (error) {
    console.error("Get user items error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Submit claim
app.post("/api/claims", auth, (req, res) => {
  try {
    const { itemId, answers } = req.body;
    const item = items.find((i) => i.id === parseInt(itemId));

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Calculate verification score
    let score = 0;
    let total = 0;

    if (item.privateDetails) {
      for (const [key, answer] of Object.entries(answers)) {
        if (item.privateDetails[key]) {
          total += 10;
          if (answer.toLowerCase() === item.privateDetails[key].toLowerCase()) {
            score += 10;
          }
        }
      }
    }

    const confidence = total > 0 ? (score / total) * 100 : 50;

    const claim = {
      id: claims.length + 1,
      itemId: item.id,
      claimantId: req.user.id,
      claimantName: req.user.name,
      answers,
      score: confidence,
      status: confidence >= 70 ? "approved" : "pending",
      createdAt: new Date(),
    };

    claims.push(claim);

    console.log(
      "📝 Claim submitted for item:",
      item.title,
      "Score:",
      confidence,
    );

    res.status(201).json({
      claim,
      message:
        confidence >= 70
          ? "Claim approved! Contact the finder."
          : "Claim pending review.",
    });
  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's claims
app.get("/api/users/claims", auth, (req, res) => {
  try {
    const userClaims = claims.filter((c) => c.claimantId === req.user.id);
    res.json(userClaims);
  } catch (error) {
    console.error("Get claims error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Lost & Found API is running!",
    endpoints: {
      health: "GET /api/health",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      items: "GET /api/items",
      lost: "POST /api/items/lost",
      found: "POST /api/items/found",
    },
    stats: {
      users: users.length,
      items: items.length,
      claims: claims.length,
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     🚀 LOST & FOUND API - RUNNING (No MongoDB)          ║
╠══════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                         ║
║  API:    http://localhost:${PORT}/api                    ║
║  Health: http://localhost:${PORT}/api/health             ║
╠══════════════════════════════════════════════════════════╣
║  📝 Using in-memory storage                             ║
║  ✅ No MongoDB required for testing                     ║
╠══════════════════════════════════════════════════════════╣
║  Test Commands:                                          ║
║  curl http://localhost:5000/api/health                  ║
║  curl -X POST http://localhost:5000/api/auth/register   ║
╚══════════════════════════════════════════════════════════╝
  `);
});
