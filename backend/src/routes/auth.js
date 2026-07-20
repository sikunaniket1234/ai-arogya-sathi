const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { pool } = require("../config/database");

const router = express.Router();

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  "Chandigarh","Puducherry","Andaman and Nicobar Islands","Dadra and Nagar Haveli",
  "Daman and Diu","Lakshadweep"
];

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Full name is required")
      .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
      .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
      .matches(/[0-9]/).withMessage("Password must contain a number"),
    body("phone").matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit Indian phone number required"),
    body("dob").isISO8601().withMessage("Date of birth is required"),
    body("gender").isIn(["male", "female", "other"]).withMessage("Gender is required"),
    body("aadhaar").matches(/^\d{12}$/).withMessage("Aadhaar must be exactly 12 digits"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("district").trim().notEmpty().withMessage("District is required"),
    body("pin").matches(/^\d{6}$/).withMessage("Pin code must be exactly 6 digits"),
    body("blood_group").optional().isIn(["A+","A-","B+","B-","AB+","AB-","O+","O-"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, dob, gender, aadhaar, state, district, pin, blood_group, language_preference } = req.body;

    try {
      const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const phoneCheck = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
      if (phoneCheck.rows.length > 0) {
        return res.status(409).json({ error: "Phone number already registered" });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const aadhaar_last4 = aadhaar.slice(-4);

      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, phone, dob, gender, aadhaar_last4,
          address_state, address_district, address_pin, blood_group, language_preference, abha_created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
         RETURNING id, name, email, phone, dob, gender, address_state, address_district,
          address_pin, blood_group, language_preference, role, abha_created_at, created_at`,
        [name, email, password_hash, phone, dob, gender, aadhaar_last4,
         state, district, pin, blood_group || null, language_preference || "en"]
      );

      const user = result.rows[0];

      await pool.query(
        `INSERT INTO family_profiles (user_id, name, age, blood_group, gender, emergency_contact_name, emergency_contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, name.split(" ")[0], Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
         blood_group || null, gender, "Not set", "Not set"]
      );

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.status(201).json({ user, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      const { password_hash, aadhaar_last4, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

module.exports = router;
