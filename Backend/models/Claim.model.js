const { storage, getNextId } = require("../data/storage");
const { CLAIM_STATUS } = require("../config/constants");

class Claim {
  constructor(data) {
    this.id = getNextId("claim");
    this.itemId = data.itemId;
    this.claimantId = data.claimantId;
    this.claimantName = data.claimantName;
    this.claimantEmail = data.claimantEmail;
    this.answers = data.answers;
    this.score = data.score || 0;
    this.status = CLAIM_STATUS.PENDING;
    this.adminNotes = "";
    this.createdAt = new Date();
  }

  static async create(claimData) {
    const claim = new Claim(claimData);
    storage.claims.push(claim);
    return claim;
  }

  static findById(id) {
    return storage.claims.find((c) => c.id === parseInt(id));
  }

  static findAll(filters = {}) {
    let claims = [...storage.claims];

    if (filters.status) {
      claims = claims.filter((c) => c.status === filters.status);
    }
    if (filters.claimantId) {
      claims = claims.filter(
        (c) => c.claimantId === parseInt(filters.claimantId),
      );
    }
    if (filters.itemId) {
      claims = claims.filter((c) => c.itemId === parseInt(filters.itemId));
    }

    return claims.sort((a, b) => b.createdAt - a.createdAt);
  }

  static findByClaimant(claimantId) {
    return storage.claims.filter((c) => c.claimantId === parseInt(claimantId));
  }

  update(updates) {
    Object.assign(this, updates);
    if (
      updates.status === CLAIM_STATUS.APPROVED ||
      updates.status === CLAIM_STATUS.REJECTED
    ) {
      this.resolvedAt = new Date();
    }
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      claimantId: this.claimantId,
      claimantName: this.claimantName,
      claimantEmail: this.claimantEmail,
      answers: this.answers,
      score: this.score,
      status: this.status,
      adminNotes: this.adminNotes,
      createdAt: this.createdAt,
      resolvedAt: this.resolvedAt,
    };
  }
}

module.exports = Claim;
