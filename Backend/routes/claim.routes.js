const express = require("express");
const {
  submitClaim,
  getUserClaims,
  updateClaimStatus,
} = require("../controllers/claim.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, submitClaim);
router.get("/my-claims", authMiddleware, getUserClaims);
router.put("/:id/status", authMiddleware, updateClaimStatus);

module.exports = router;
