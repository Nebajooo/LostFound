const express = require("express");
const {
  submitClaim,
  getUserClaims,
} = require("../controllers/claim.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, submitClaim);
router.get("/my-claims", authMiddleware, getUserClaims);

module.exports = router;
