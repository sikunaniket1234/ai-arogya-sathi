require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

async function seed() {
  const users = [
    { name: "Rajesh Kumar", email: "rajesh@demo.com", password: "demo123", phone: "+919876543210", language: "en" },
    { name: "Priya Sharma", email: "priya@demo.com", password: "demo123", phone: "+919876543211", language: "hi" },
    { name: "Savitri Devi", email: "savitri@demo.com", password: "demo123", phone: "+919876543212", language: "hi" },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, language_preference)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [u.name, u.email, hash, u.phone, u.language]
    );

    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [u.email]);
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;

      await pool.query(
        `INSERT INTO family_profiles (user_id, name, age, blood_group, gender, conditions, allergies, emergency_contact_name, emergency_contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [userId, u.name.split(" ")[0], u.name === "Savitri Devi" ? 67 : u.name === "Priya Sharma" ? 22 : 48,
         u.name === "Savitri Devi" ? "A+" : u.name === "Priya Sharma" ? "O+" : "B+",
         u.name === "Priya Sharma" ? "female" : "male",
         u.name === "Savitri Devi" ? ["High blood pressure", "Diabetes"] : ["None known"],
         u.name === "Priya Sharma" ? ["Pollen"] : u.name === "Savitri Devi" ? ["Penicillin"] : ["None known"],
         "Family Contact", "+919876543299"]
      );
    }
  }

  console.log("Seed completed!");
  console.log("\nDemo accounts:");
  console.log("  rajesh@demo.com  / demo123");
  console.log("  priya@demo.com   / demo123");
  console.log("  savitri@demo.com / demo123");

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
