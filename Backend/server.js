const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory database
const users = [];
const items = [];
const claims = [];

// Create default admin
const createDefaultAdmin = async () => {
  const adminExists = users.find((u) => u.email === "admin@lostfound.com");
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    users.push({
      id: 1,
      name: "System Administrator",
      email: "admin@lostfound.com",
      password: hashedPassword,
      studentId: "ADMIN001",
      university: "University System",
      role: "admin",
      createdAt: new Date(),
    });
    console.log("\n✅ Admin Created: admin@lostfound.com / admin123\n");
  }
};

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, "secret123");
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Helper: Calculate claim score
const calculateScore = (answers, privateDetails) => {
  let score = 0,
    total = 0;
  for (const [key, answer] of Object.entries(answers)) {
    if (privateDetails[key]) {
      total += 10;
      if (
        answer?.toLowerCase().trim() ===
        privateDetails[key].toLowerCase().trim()
      ) {
        score += 10;
      }
    }
  }
  return total > 0 ? (score / total) * 100 : 0;
};

// ========== PUBLIC ROUTES ==========
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    users: users.length,
    items: items.length,
    claims: claims.length,
  });
});

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, studentId, university, phone } = req.body;

    if (!name || !email || !password || !studentId || !university) {
      return res.status(400).json({ error: "All fields required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be 6+ characters" });
    }
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      studentId,
      university,
      phone: phone || "",
      role: email === "admin@lostfound.com" ? "admin" : "student",
      createdAt: new Date(),
    };
    users.push(user);

    const token = jwt.sign({ id: user.id }, "secret123");
    res
      .status(201)
      .json({ user: { id: user.id, name, email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, "secret123");
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
    res.status(500).json({ error: error.message });
  }
});

// ========== ITEM ROUTES ==========
app.post("/api/items/lost", authMiddleware, (req, res) => {
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
      date: new Date(date),
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      status: "open",
      privateDetails: privateDetails || {},
      createdAt: new Date(),
    };
    items.push(item);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/items/found", authMiddleware, (req, res) => {
  try {
    const { category, title, description, location, date } = req.body;
    const item = {
      id: items.length + 1,
      type: "found",
      category,
      title,
      description,
      location,
      date: new Date(date),
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      status: "open",
      privateDetails: {},
      createdAt: new Date(),
    };
    items.push(item);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/items", (req, res) => {
  try {
    let filtered = items.filter((i) => i.status === "open");
    if (req.query.type)
      filtered = filtered.filter((i) => i.type === req.query.type);
    if (req.query.category)
      filtered = filtered.filter((i) => i.category === req.query.category);
    res.json(filtered.slice(0, 50));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

app.get("/api/users/items", authMiddleware, (req, res) => {
  res.json(items.filter((i) => i.userId === req.user.id));
});

// ========== CLAIM ROUTES ==========
app.post("/api/claims", authMiddleware, (req, res) => {
  try {
    const { itemId, answers } = req.body;
    const item = items.find((i) => i.id === parseInt(itemId));
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.type !== "found")
      return res.status(400).json({ error: "Can only claim found items" });

    const score = calculateScore(answers, item.privateDetails);
    let status = "pending";
    if (score >= 70) {
      status = "approved";
      item.status = "resolved";
    } else if (score < 40) status = "rejected";

    const claim = {
      id: claims.length + 1,
      itemId: item.id,
      claimantId: req.user.id,
      claimantName: req.user.name,
      claimantEmail: req.user.email,
      answers,
      score,
      status,
      createdAt: new Date(),
    };
    claims.push(claim);
    res
      .status(201)
      .json({
        claim,
        message:
          status === "approved"
            ? "Claim approved!"
            : "Claim submitted for review",
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/claims", authMiddleware, (req, res) => {
  res.json(claims.filter((c) => c.claimantId === req.user.id));
});

// ========== ADMIN ROUTES ==========
app.get(
  "/api/admin/claims/pending",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    const pending = claims
      .filter((c) => c.status === "pending")
      .map((claim) => {
        const item = items.find((i) => i.id === claim.itemId);
        return { ...claim, itemDetails: item };
      });
    res.json({ success: true, claims: pending });
  },
);

app.put(
  "/api/admin/claims/:claimId/approve",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    const claim = claims.find((c) => c.id === parseInt(req.params.claimId));
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    claim.status = "approved";
    const item = items.find((i) => i.id === claim.itemId);
    if (item) item.status = "resolved";
    res.json({ success: true, message: "Claim approved" });
  },
);

app.put(
  "/api/admin/claims/:claimId/reject",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    const claim = claims.find((c) => c.id === parseInt(req.params.claimId));
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    claim.status = "rejected";
    claim.adminNotes = req.body.adminNotes || "Rejected by admin";
    res.json({ success: true, message: "Claim rejected" });
  },
);

app.get("/api/admin/stats", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalItems: items.length,
      lostItems: items.filter((i) => i.type === "lost").length,
      foundItems: items.filter((i) => i.type === "found").length,
      resolvedItems: items.filter((i) => i.status === "resolved").length,
      pendingClaims: claims.filter((c) => c.status === "pending").length,
      approvedClaims: claims.filter((c) => c.status === "approved").length,
      rejectedClaims: claims.filter((c) => c.status === "rejected").length,
      recoveryRate: items.length
        ? Math.round(
            (items.filter((i) => i.status === "resolved").length /
              items.length) *
              100,
          )
        : 0,
    },
  });
});

// Root
app.get("/", (req, res) => {
  res.json({
    name: "Lost & Found API",
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/auth/register",
      "/api/auth/login",
      "/api/items",
    ],
  });
});

// Start server
const PORT = 5000;
createDefaultAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Admin: admin@lostfound.com / admin123\n`);
  });
});
