const bcrypt = require("bcryptjs");
const { storage, getNextId } = require("../data/storage");

class User {
  constructor(data) {
    this.id = getNextId("user");
    this.name = data.name;
    this.email = data.email.toLowerCase();
    this.password = data.password;
    this.studentId = data.studentId;
    this.university = data.university;
    this.phone = data.phone || "";
    this.role = this.isAdminEmail(data.email) ? "admin" : "student";
    this.isVerified = false;
    this.createdAt = new Date();
  }

  isAdminEmail(email) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [
      "admin@lostfound.com",
    ];
    return adminEmails.includes(email);
  }

  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({ ...userData, password: hashedPassword });
    storage.users.push(user);
    return user;
  }

  static findByEmail(email) {
    return storage.users.find((u) => u.email === email.toLowerCase());
  }

  static findById(id) {
    return storage.users.find((u) => u.id === parseInt(id));
  }

  static findAll() {
    return storage.users;
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      studentId: this.studentId,
      university: this.university,
      phone: this.phone,
      role: this.role,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
    };
  }
}

module.exports = User;
