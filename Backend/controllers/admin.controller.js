const User = require("../models/User.model");
const Item = require("../models/Item.model");
const Claim = require("../models/Claim.model");
const { CLAIM_STATUS } = require("../config/constants");

const getPendingClaims = async (req, res) => {
  try {
    const pendingClaims = Claim.findAll({ status: CLAIM_STATUS.PENDING });

    // Populate item and claimant details
    const claimsWithDetails = pendingClaims.map((claim) => {
      const item = Item.findById(claim.itemId);
      const claimant = User.findById(claim.claimantId);
      return {
        ...claim.toJSON(),
        itemDetails: item ? item.toJSON() : null,
        claimantDetails: claimant ? claimant.toJSON() : null,
      };
    });

    res.json({ success: true, claims: claimsWithDetails });
  } catch (error) {
    console.error("Get pending claims error:", error);
    res.status(500).json({ error: error.message });
  }
};

const approveClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { adminNotes } = req.body;

    const claim = Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    const item = Item.findById(claim.itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Update claim
    claim.update({
      status: CLAIM_STATUS.APPROVED,
      adminNotes,
      approvedBy: req.user.name,
      resolvedAt: new Date(),
    });

    // Update item status
    item.update({ status: "resolved" });

    res.json({
      success: true,
      message: "Claim approved successfully",
      claim: claim.toJSON(),
    });
  } catch (error) {
    console.error("Approve claim error:", error);
    res.status(500).json({ error: error.message });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { adminNotes } = req.body;

    const claim = Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    claim.update({
      status: CLAIM_STATUS.REJECTED,
      adminNotes,
      rejectedBy: req.user.name,
      resolvedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Claim rejected",
      claim: claim.toJSON(),
    });
  } catch (error) {
    console.error("Reject claim error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const users = User.findAll();
    const items = Item.findAll();
    const claims = Claim.findAll();

    const stats = {
      totalUsers: users.length,
      totalItems: items.length,
      lostItems: items.filter((i) => i.type === "lost").length,
      foundItems: items.filter((i) => i.type === "found").length,
      resolvedItems: items.filter((i) => i.status === "resolved").length,
      pendingClaims: claims.filter((c) => c.status === "pending").length,
      approvedClaims: claims.filter((c) => c.status === "approved").length,
      rejectedClaims: claims.filter((c) => c.status === "rejected").length,
      recoveryRate:
        items.length > 0
          ? Math.round(
              (items.filter((i) => i.status === "resolved").length /
                items.length) *
                100,
            )
          : 0,
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPendingClaims, approveClaim, rejectClaim, getStats };
