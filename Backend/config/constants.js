module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRE: "7d",
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "").split(","),

  ITEM_CATEGORIES: [
    "phone",
    "wallet",
    "id_card",
    "keys",
    "laptop",
    "bag",
    "books",
    "other",
  ],

  CLAIM_STATUS: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    COMPLETED: "completed",
  },

  ITEM_STATUS: {
    OPEN: "open",
    MATCHED: "matched",
    RESOLVED: "resolved",
    CLOSED: "closed",
  },

  MATCH_THRESHOLDS: {
    AUTO_APPROVE: 70,
    MANUAL_REVIEW: 50,
    AUTO_REJECT: 40,
  },
};
