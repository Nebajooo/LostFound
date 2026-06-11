const express = require("express");
const { findMatches } = require("../controllers/match.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/find/:itemId", authMiddleware, findMatches);

module.exports = router;
