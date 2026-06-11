const { storage, getNextId } = require("../data/storage");
const { ITEM_STATUS, ITEM_CATEGORIES } = require("../config/constants");

class Item {
  constructor(data) {
    this.id = getNextId("item");
    this.type = data.type; // 'lost' or 'found'
    this.category = data.category;
    this.title = data.title;
    this.description = data.description;
    this.location = data.location;
    this.date = new Date(data.date);
    this.userId = data.userId;
    this.userName = data.userName;
    this.userEmail = data.userEmail;
    this.status = ITEM_STATUS.OPEN;
    this.privateDetails = data.privateDetails || {};
    this.createdAt = new Date();
  }

  static async create(itemData) {
    const item = new Item(itemData);
    storage.items.push(item);
    return item;
  }

  static findById(id) {
    return storage.items.find((i) => i.id === parseInt(id));
  }

  static findAll(filters = {}) {
    let items = [...storage.items];

    if (filters.type) {
      items = items.filter((i) => i.type === filters.type);
    }
    if (filters.category) {
      items = items.filter((i) => i.category === filters.category);
    }
    if (filters.status) {
      items = items.filter((i) => i.status === filters.status);
    }
    if (filters.userId) {
      items = items.filter((i) => i.userId === parseInt(filters.userId));
    }

    return items.sort((a, b) => b.createdAt - a.createdAt);
  }

  static findByUser(userId) {
    return storage.items.filter((i) => i.userId === parseInt(userId));
  }

  update(updates) {
    Object.assign(this, updates);
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      title: this.title,
      description: this.description,
      location: this.location,
      date: this.date,
      userId: this.userId,
      userName: this.userName,
      userEmail: this.userEmail,
      status: this.status,
      privateDetails: this.privateDetails,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Item;
