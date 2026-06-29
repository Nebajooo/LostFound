const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// === MONGODB CONNECTION ===

const MONGODB_URI = "mongodb://localhost:27017/lostfound";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => {
    console.error(" MongoDB Connection Error:", err.message);
    console.log("\n Troubleshooting:");
    console.log("1. Make sure MongoDB is installed");
    console.log("2. Run: net start MongoDB (Windows)");
    console.log("3. Or use MongoDB Atlas cloud version\n");
  });

// === MONGOOSE SCHEMAS ======

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  studentId: { type: String, required: true },
  university: { type: String, required: true },
  phone: { type: String, default: "" },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

// Item Schema
const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ["lost", "found"], required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String },
  userEmail: { type: String },
  status: { type: String, default: "open" },
  privateDetails: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const Item = mongoose.model("Item", itemSchema);

// Claim Schema
const claimSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  claimantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  claimantName: { type: String },
  claimantEmail: { type: String },
  answers: { type: Object, required: true },
  score: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

const Claim = mongoose.model("Claim", claimSchema);

// === MIDDLEWARE ===
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, "secret123");
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// === HELPER FUNCTIONS ===
const calculateClaimScore = (answers, privateDetails) => {
  let score = 0;
  let total = 0;

  for (const [key, userAnswer] of Object.entries(answers)) {
    const expected = privateDetails[key];
    if (expected) {
      total += 10;
      if (userAnswer?.toLowerCase().trim() === expected.toLowerCase().trim()) {
        score += 10;
      }
    }
  }

  return total > 0 ? (score / total) * 100 : 0;
};

// ===CREATE DEFAULT ADMIN ===
const createDefaultAdmin = async () => {
  const adminExists = await User.findOne({ email: "admin@lostfound.com" });
  if (!adminExists) {
    const admin = new User({
      name: "System Administrator",
      email: "admin@lostfound.com",
      password: "admin123",
      studentId: "ADMIN001",
      university: "University System",
      phone: "000-000-0000",
      role: "admin",
    });
    await admin.save();
    console.log("\n Default Admin Created!");
    console.log("--------------------------------");
    console.log(" Email: admin@lostfound.com");
    console.log(" Password: admin123");
    console.log("---------------------------------\n");
  }
};

// === API ROUTES ===

// Health check
app.get("/api/health", async (req, res) => {
  const userCount = await User.countDocuments();
  const itemCount = await Item.countDocuments();
  const claimCount = await Claim.countDocuments();

  res.json({
    status: "OK",
    mongodb:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    stats: {
      users: userCount,
      items: itemCount,
      claims: claimCount,
    },
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, studentId, university, phone } = req.body;

    if (!name || !email || !password || !studentId || !university) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = new User({
      name,
      email,
      password,
      studentId,
      university,
      phone,
      role: email === "admin@lostfound.com" ? "admin" : "student",
    });

    await user.save();
    const token = jwt.sign({ id: user._id }, "secret123");

    res.status(201).json({
      user: { id: user._id, name, email, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, "secret123");

    res.json({
      user: {
        id: user._id,
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

// Report Lost Item
app.post("/api/items/lost", authMiddleware, async (req, res) => {
  try {
    const { category, title, description, location, date, privateDetails } =
      req.body;

    console.log("Received lost item request:", req.body);

    const item = new Item({
      type: "lost",
      category,
      title,
      description,
      location,
      date: new Date(date),
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      privateDetails: privateDetails || {},
    });

    await item.save();
    console.log("Lost item saved:", item);

    res.status(201).json(item);
  } catch (error) {
    console.error("Report lost error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Report Found Item
app.post("/api/items/found", authMiddleware, async (req, res) => {
  try {
    const { category, title, description, location, date } = req.body;

    console.log("Received found item request:", req.body);

    const item = new Item({
      type: "found",
      category,
      title,
      description,
      location,
      date: new Date(date),
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
    });

    await item.save();
    console.log("Found item saved:", item);

    res.status(201).json(item);
  } catch (error) {
    console.error("Report found error:", error);
    res.status(500).json({ error: error.message });
  }
});
// Get all items
app.get("/api/items", async (req, res) => {
  try {
    const { type, category } = req.query;
    let filter = { status: "open" };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const items = await Item.find(filter).sort({ createdAt: -1 }).limit(50);

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single item
app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's items
app.get("/api/users/items", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit claim
app.post("/api/claims", authMiddleware, async (req, res) => {
  try {
    const { itemId, answers } = req.body;
    const item = await Item.findById(itemId);

    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.type !== "found")
      return res.status(400).json({ error: "Can only claim found items" });

    const score = calculateClaimScore(answers, item.privateDetails);
    let status = "pending";

    if (score >= 70) {
      status = "approved";
      item.status = "resolved";
      await item.save();
    } else if (score < 40) {
      status = "rejected";
    }

    const claim = new Claim({
      itemId: item._id,
      claimantId: req.user._id,
      claimantName: req.user.name,
      claimantEmail: req.user.email,
      answers,
      score,
      status,
      resolvedAt: status !== "pending" ? new Date() : null,
    });

    await claim.save();

    res.status(201).json({
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

// Get user's claims
app.get("/api/users/claims", authMiddleware, async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate("itemId")
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ADMIN ROUTES ===

// Get pending claims
app.get(
  "/api/admin/claims/pending",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const claims = await Claim.find({ status: "pending" })
        .populate("itemId")
        .populate("claimantId", "name email studentId")
        .sort({ createdAt: -1 });
      res.json({ success: true, claims });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Approve claim
app.put(
  "/api/admin/claims/:claimId/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.claimId);
      if (!claim) return res.status(404).json({ error: "Claim not found" });

      claim.status = "approved";
      claim.resolvedAt = new Date();
      claim.adminNotes = req.body.adminNotes || "Approved by admin";
      await claim.save();

      const item = await Item.findById(claim.itemId);
      if (item) {
        item.status = "resolved";
        await item.save();
      }

      res.json({ success: true, message: "Claim approved" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Reject claim
app.put(
  "/api/admin/claims/:claimId/reject",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.claimId);
      if (!claim) return res.status(404).json({ error: "Claim not found" });

      claim.status = "rejected";
      claim.resolvedAt = new Date();
      claim.adminNotes = req.body.adminNotes || "Rejected by admin";
      await claim.save();

      res.json({ success: true, message: "Claim rejected" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get admin stats
app.get(
  "/api/admin/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalItems = await Item.countDocuments();
      const lostItems = await Item.countDocuments({ type: "lost" });
      const foundItems = await Item.countDocuments({ type: "found" });
      const resolvedItems = await Item.countDocuments({ status: "resolved" });
      const pendingClaims = await Claim.countDocuments({ status: "pending" });
      const approvedClaims = await Claim.countDocuments({ status: "approved" });
      const rejectedClaims = await Claim.countDocuments({ status: "rejected" });

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalItems,
          lostItems,
          foundItems,
          resolvedItems,
          pendingClaims,
          approvedClaims,
          rejectedClaims,
          recoveryRate: totalItems
            ? Math.round((resolvedItems / totalItems) * 100)
            : 0,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Lost & Found Platform API",
    version: "2.0.0",
    database:
      mongoose.connection.readyState === 1
        ? "MongoDB Connected"
        : "MongoDB Disconnected",
    endpoints: {
      health: "GET /api/health",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      items: "GET /api/items",
      lost: "POST /api/items/lost",
      found: "POST /api/items/found",
      admin: "GET /api/admin/stats",
    },
  });
});

// ==== START SERVER ===
const PORT = 5000;

// Initialize database and create admin
const initDatabase = async () => {
  await createDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`
|---------------------------------------------------------------|
|                                                               |
|     LOST & FOUND PLATFORM BACKEND                             |
|                                                               |
|     Server: http://localhost:${PORT}                          |
|     API:    http://localhost:${PORT}/api                      |
|     Health: http://localhost:${PORT}/api/health               |
|                                                               |
|═══════════════════════════════════════════════════════════════|
|                                                               |
|    Database: MongoDB                                          |
|    Status: ${mongoose.connection.readyState === 1 ? "Connected " : "Disconnected "}       |
|                                                               |
|-----------------------------------------------------------------|
    `);
  });
};

// Wait for MongoDB connection before starting
mongoose.connection.on("connected", () => {
  console.log(" MongoDB Connection Established");
  initDatabase();
});

mongoose.connection.on("error", (err) => {
  console.error(" MongoDB Connection Error:", err.message);
  console.log(
    "\nStarting server without MongoDB (using in-memory would go here)\n",
  );
  // Still start the server but with warning
  initDatabase();
});

// If MongoDB is already connected
if (mongoose.connection.readyState === 1) {
  initDatabase();
} else {
  // Wait for connection
  setTimeout(() => {
    if (mongoose.connection.readyState !== 1) {
      console.log(" MongoDB not connected. Starting server anyway...");
      initDatabase();
    }
  }, 5000);
}
