const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  const adminEmail = "admin@lostfound.com";
  const existingAdmin = User.findByEmail(adminEmail);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      studentId: "ADMIN001",
      university: "University System",
      phone: "000-000-0000",
      role: "admin",
    });
    console.log("✅ Admin user created successfully!");
    console.log("   Email: admin@lostfound.com");
    console.log("   Password: admin123");
  } else {
    console.log("ℹ️ Admin user already exists");
  }
}

// Run seeder
seedAdmin();
