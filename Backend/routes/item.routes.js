const express = require("express");
const {
  reportLost,
  reportFound,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getUserItems,
} = require("../controllers/item.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getAllItems);
router.get("/user/my-items", authMiddleware, getUserItems);
router.get("/:id", getItemById);
router.post("/lost", authMiddleware, reportLost);
router.post("/found", authMiddleware, reportFound);
router.put("/:id", authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);

module.exports = router;
