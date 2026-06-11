const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/profile", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { phone, university } = req.body;
    const updates = {};
    if (phone) updates.phone = phone;
    if (university) updates.university = university;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
