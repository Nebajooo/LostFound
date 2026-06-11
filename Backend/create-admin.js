const axios = require("axios");

async function createAdmin() {
  try {
    // Register admin user
    const registerRes = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        name: "System Administrator",
        email: "admin@lostfound.com",
        password: "admin123",
        studentId: "ADMIN001",
        university: "University System",
        phone: "000-000-0000",
      },
    );

    console.log("✅ Admin user created:", registerRes.data.user);

    // Login to get token
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@lostfound.com",
      password: "admin123",
    });

    console.log("✅ Admin logged in:", loginRes.data.user);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@lostfound.com");
    console.log("🔑 Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

createAdmin();
