const express = require("express");
const { pool } = require("../config/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/:profileId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM health_records
       WHERE profile_id = $1
       ORDER BY recorded_at DESC
       LIMIT 50`,
      [req.params.profileId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch health records" });
  }
});

router.post("/:profileId", async (req, res) => {
  const { heart_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_level, temperature, sleep_hours, steps } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO health_records
       (profile_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_level, temperature, sleep_hours, steps)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.params.profileId, heart_rate || null, blood_pressure_systolic || null, blood_pressure_diastolic || null, oxygen_level || null, temperature || null, sleep_hours || null, steps || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create health record" });
  }
});

module.exports = router;
