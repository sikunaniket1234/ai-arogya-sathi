const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { pool } = require("../config/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM family_profiles WHERE user_id = $1 ORDER BY created_at",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM family_profiles WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("age").optional().isInt({ min: 0, max: 150 }),
    body("blood_group").optional().isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
    body("gender").optional().isIn(["male", "female", "other"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, blood_group, gender, conditions, allergies, emergency_contact_name, emergency_contact_phone } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO family_profiles
         (user_id, name, age, blood_group, gender, conditions, allergies, emergency_contact_name, emergency_contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [req.user.id, name, age || null, blood_group || null, gender || null, conditions || [], allergies || [], emergency_contact_name || null, emergency_contact_phone || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create profile" });
    }
  }
);

router.put("/:id", async (req, res) => {
  const { name, age, blood_group, gender, conditions, allergies, emergency_contact_name, emergency_contact_phone } = req.body;

  try {
    const result = await pool.query(
      `UPDATE family_profiles
       SET name = COALESCE($1, name), age = COALESCE($2, age), blood_group = COALESCE($3, blood_group),
           gender = COALESCE($4, gender), conditions = COALESCE($5, conditions), allergies = COALESCE($6, allergies),
           emergency_contact_name = COALESCE($7, emergency_contact_name), emergency_contact_phone = COALESCE($8, emergency_contact_phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [name, age, blood_group, gender, conditions, allergies, emergency_contact_name, emergency_contact_phone, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM family_profiles WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ message: "Profile deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

module.exports = router;
