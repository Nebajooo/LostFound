const Claim = require("../models/Claim.model");
const Item = require("../models/Item.model");
const User = require("../models/User.model");
const { calculateMatchScore } = require("../services/verification.service");
const { MATCH_THRESHOLDS, CLAIM_STATUS } = require("../config/constants");

const submitClaim = async (req, res) => {
  try {
    const { itemId, answers } = req.body;

    const item = Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.type !== "found") {
      return res.status(400).json({ error: "Can only claim found items" });
    }

    // Calculate verification score
    const score = calculateMatchScore(answers, item.privateDetails);

    // Determine status based on score
    let status = CLAIM_STATUS.PENDING;
    if (score >= MATCH_THRESHOLDS.AUTO_APPROVE) {
      status = CLAIM_STATUS.APPROVED;
    } else if (score < MATCH_THRESHOLDS.AUTO_REJECT) {
      status = CLAIM_STATUS.REJECTED;
    }

    const claim = await Claim.create({
      itemId: parseInt(itemId),
      claimantId: req.user.id,
      claimantName: req.user.name,
      claimantEmail: req.user.email,
      answers,
      score,
    });

    // If auto-approved, update item status
    if (status === CLAIM_STATUS.APPROVED) {
      item.update({ status: "resolved" });
    }

    res.status(201).json({
      success: true,
      claim: claim.toJSON(),
      message:
        status === CLAIM_STATUS.APPROVED
          ? "Claim approved! Please contact the finder to collect your item."
          : status === CLAIM_STATUS.REJECTED
            ? "Claim rejected. Insufficient verification."
            : "Claim submitted for review.",
    });
  } catch (error) {
    console.error("Submit claim error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUserClaims = async (req, res) => {
  try {
    const claims = Claim.findByClaimant(req.user.id);

    // Populate item details
    const claimsWithItems = claims.map((claim) => {
      const item = Item.findById(claim.itemId);
      return {
        ...claim.toJSON(),
        itemDetails: item ? item.toJSON() : null,
      };
    });

    res.json({ success: true, claims: claimsWithItems });
  } catch (error) {
    console.error("Get user claims error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitClaim, getUserClaims };
