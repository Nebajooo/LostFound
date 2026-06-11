const Item = require("../models/Item.model");

// Report lost item
const reportLost = async (req, res) => {
  try {
    const { category, title, description, location, date, privateDetails } =
      req.body;

    const item = new Item({
      type: "lost",
      category,
      title,
      description,
      location,
      date,
      userId: req.user._id,
      privateDetails: privateDetails || {},
    });

    await item.save();
    await item.populate("userId", "name email");

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Report found item
const reportFound = async (req, res) => {
  try {
    const { category, title, description, location, date } = req.body;

    const item = new Item({
      type: "found",
      category,
      title,
      description,
      location,
      date,
      userId: req.user._id,
    });

    await item.save();
    await item.populate("userId", "name email");

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all items
const getAllItems = async (req, res) => {
  try {
    const { type, category, search } = req.query;
    let filter = { status: "open" };

    if (type) filter.type = type;
    if (category) filter.category = category;

    let query = Item.find(filter);

    if (search) {
      query = query.where("description").regex(new RegExp(search, "i"));
    }

    const items = await query
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single item
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "userId",
      "name email",
    );
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (
      item.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email");

    res.json({ success: true, item: updatedItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (
      item.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's items
const getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  reportLost,
  reportFound,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getUserItems,
};
