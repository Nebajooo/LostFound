const Claim = require("../models/Claim.model");
const Item = require("../models/Item.model");

// Submit claim
const submitClaim = async (req, res) => {
  try {
    const { itemId, answers } = req.body;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.type !== "found") {
      return res.status(400).json({ error: "Can only claim found items" });
    }

    // Calculate score
    let score = 0;
    let totalWeight = 0;

    for (const [key, userAnswer] of Object.entries(answers)) {
      const expectedAnswer = item.privateDetails[key];
      if (expectedAnswer) {
        totalWeight += 10;
        if (userAnswer.toLowerCase() === expectedAnswer.toLowerCase()) {
          score += 10;
        }
      }
    }

    const confidenceScore = totalWeight > 0 ? (score / totalWeight) * 100 : 0;

    const claim = new Claim({
      itemId,
      claimantId: req.user._id,
      answers,
      score: confidenceScore,
      status: confidenceScore >= 70 ? "approved" : "pending",
    });

    await claim.save();

    res.status(201).json({
      success: true,
      claim,
      message:
        confidenceScore >= 70
          ? "Claim approved! Contact the finder."
          : "Claim submitted for review.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's claims
const getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate("itemId")
      .sort({ createdAt: -1 });
    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update claim status
const updateClaimStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const claim = await Claim.findById(req.params.id).populate("itemId");

    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    claim.status = status;
    if (adminNotes) claim.adminNotes = adminNotes;
    if (status === "completed" || status === "rejected") {
      claim.resolvedAt = new Date();
    }

    await claim.save();
    res.json({ success: true, claim });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitClaim, getUserClaims, updateClaimStatus };
