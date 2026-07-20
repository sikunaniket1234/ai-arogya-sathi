const express = require("express");
const { pool } = require("../config/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/:profileId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM medicine_records
       WHERE profile_id = $1
       ORDER BY created_at DESC`,
      [req.params.profileId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});

router.post("/:profileId", async (req, res) => {
  const { medicine_name, dosage, frequency, schedule_time, start_date, end_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO medicine_records
       (profile_id, medicine_name, dosage, frequency, schedule_time, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.params.profileId, medicine_name, dosage || null, frequency || null, schedule_time || null, start_date || null, end_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create medicine record" });
  }
});

router.put("/:id", async (req, res) => {
  const { medicine_name, dosage, frequency, schedule_time, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE medicine_records
       SET medicine_name = COALESCE($1, medicine_name), dosage = COALESCE($2, dosage),
           frequency = COALESCE($3, frequency), schedule_time = COALESCE($4, schedule_time),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [medicine_name, dosage, frequency, schedule_time, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update medicine" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM medicine_records WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }
    res.json({ message: "Medicine deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete medicine" });
  }
});

module.exports = router;
