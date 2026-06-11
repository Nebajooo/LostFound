const Item = require("../models/Item.model");
const { calculateMatchScore } = require("../utils/helpers");

// Find matches for an item
const findMatches = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const oppositeType = item.type === "lost" ? "found" : "lost";

    const potentialMatches = await Item.find({
      type: oppositeType,
      category: item.category,
      status: "open",
      _id: { $ne: item._id },
    }).limit(20);

    const matches = potentialMatches
      .map((match) => ({
        item: match,
        score: calculateMatchScore(item, match),
      }))
      .filter((m) => m.score > 40);

    matches.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      matches: matches.slice(0, 10),
      total: matches.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { findMatches };
