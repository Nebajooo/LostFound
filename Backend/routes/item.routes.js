const express = require("express");
const {
  reportLost,
  reportFound,
  getAllItems,
  getItemById,
  getUserItems,
} = require("../controllers/item.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getAllItems);
router.get("/:id", getItemById);
router.get("/user/my-items", authMiddleware, getUserItems);
router.post("/lost", authMiddleware, reportLost);
router.post("/found", authMiddleware, reportFound);

module.exports = router;
