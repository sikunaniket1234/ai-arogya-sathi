const express = require("express");
const { body, validationResult } = require("express-validator");
const { pool } = require("../config/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/supported", (req, res) => {
  res.json({
    devices: [
      { type: "smartwatch", protocols: ["bluetooth", "wifi"], dataTypes: ["heart_rate", "steps", "sleep", "oxygen"] },
      { type: "blood_pressure_monitor", protocols: ["bluetooth", "manual"], dataTypes: ["systolic", "diastolic", "pulse"] },
      { type: "glucose_meter", protocols: ["bluetooth", "manual"], dataTypes: ["blood_glucose"] },
      { type: "pulse_oximeter", protocols: ["bluetooth", "manual"], dataTypes: ["oxygen_level", "pulse_rate"] },
      { type: "thermometer", protocols: ["bluetooth", "manual"], dataTypes: ["temperature"] },
      { type: "weight_scale", protocols: ["wifi", "manual"], dataTypes: ["weight", "bmi"] }
    ],
    integrationMethods: [
      { method: "manual_entry", description: "User manually enters vitals" },
      { method: "bluetooth_sync", description: "Direct BLE connection (mobile app)" },
      { method: "api_import", description: "Import via Health Connect / Google Fit API" },
      { method: "csv_upload", description: "Upload CSV with health data" }
    ]
  });
});

router.post("/sync/:profileId", async (req, res) => {
  const { device_type, data_points } = req.body;

  if (!device_type || !data_points || !Array.isArray(data_points)) {
    return res.status(400).json({ error: "device_type and data_points array required" });
  }

  try {
    if (device_type === 'google_fit' && data_points.length > 0) {
      const dates = [...new Set(data_points.map(p => (p.timestamp || new Date().toISOString()).split('T')[0]))];
      await pool.query(
        `DELETE FROM health_records WHERE profile_id = $1 AND device_type = $2 AND DATE(recorded_at) = ANY($3::date[])`,
        [req.params.profileId, device_type, dates]
      );
    }

    const inserted = [];
    for (const point of data_points) {
      const ts = point.timestamp || new Date().toISOString();
      const dateOnly = ts.split('T')[0];
      const result = await pool.query(
        `INSERT INTO health_records
         (profile_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_level, temperature, sleep_hours, steps, device_type, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          req.params.profileId,
          point.heart_rate || null,
          point.systolic || null,
          point.diastolic || null,
          point.oxygen_level || null,
          point.temperature || null,
          point.sleep_hours || null,
          point.steps || null,
          device_type,
          dateOnly
        ]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json({
      message: `Synced ${inserted.length} data points from ${device_type}`,
      records: inserted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sync device data" });
  }
});

router.post("/upload/:profileId", async (req, res) => {
  const { csv_data } = req.body;

  if (!csv_data) {
    return res.status(400).json({ error: "csv_data required" });
  }

  try {
    const lines = csv_data.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const inserted = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });

      const result = await pool.query(
        `INSERT INTO health_records
         (profile_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_level, temperature, sleep_hours, steps, device_type, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, CURRENT_TIMESTAMP))
         RETURNING *`,
        [
          req.params.profileId,
          row.heart_rate || null,
          row.systolic || row.blood_pressure_systolic || null,
          row.diastolic || row.blood_pressure_diastolic || null,
          row.oxygen_level || row.spo2 || null,
          row.temperature || null,
          row.sleep_hours || row.sleep || null,
          row.steps || null,
          "csv_import",
          row.timestamp || row.date || null
        ]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json({
      message: `Imported ${inserted.length} records from CSV`,
      records: inserted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse CSV data" });
  }
});

module.exports = router;
