const express = require("express");
const {
  getPendingClaims,
  approveClaim,
  rejectClaim,
  getStats,
} = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/claims/pending", getPendingClaims);
router.put("/claims/:claimId/approve", approveClaim);
router.put("/claims/:claimId/reject", rejectClaim);
router.get("/stats", getStats);

module.exports = router;
