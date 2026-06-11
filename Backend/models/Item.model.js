const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "phone",
        "wallet",
        "id_card",
        "keys",
        "laptop",
        "bag",
        "books",
        "other",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "matched", "resolved", "closed"],
      default: "open",
    },
    privateDetails: {
      type: Object,
      default: {},
    },
    matchedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  },
  {
    timestamps: true,
  },
);

// Create text index for search
itemSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Item", itemSchema);
