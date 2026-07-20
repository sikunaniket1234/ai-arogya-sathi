const express = require("express");
const { pool } = require("../config/database");

const router = express.Router();

router.get("/schemes", async (req, res) => {
  try {
    const { state, age, condition, type } = req.query;
    let query = "SELECT * FROM community_schemes WHERE is_active = TRUE";
    const params = [];
    let idx = 1;

    if (type) {
      query += ` AND scheme_type = $${idx++}`;
      params.push(type);
    }
    if (state) {
      query += ` AND ($${idx++} = ANY(states) OR states = '{}')`;
      params.push(state);
    }

    query += " ORDER BY name";
    const result = await pool.query(query, params);

    let schemes = result.rows;

    if (age || condition) {
      schemes = schemes.map(s => {
        let eligible = true;
        const reasons = [];
        const criteria = s.eligibility_criteria || {};

        if (criteria.min_age && age && Number(age) < criteria.min_age) {
          eligible = false;
          reasons.push(`Minimum age: ${criteria.min_age}`);
        }
        if (criteria.max_age && age && Number(age) > criteria.max_age) {
          eligible = false;
          reasons.push(`Maximum age: ${criteria.max_age}`);
        }
        if (criteria.conditions && condition) {
          const hasMatch = criteria.conditions.some(c =>
            condition.toLowerCase().includes(c.toLowerCase())
          );
          if (!hasMatch) {
            eligible = false;
            reasons.push(`Requires condition: ${criteria.conditions.join(", ")}`);
          }
        }

        return { ...s, eligible, eligibility_reasons: reasons };
      });
    }

    res.json(schemes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schemes" });
  }
});

router.get("/schemes/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM community_schemes WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Scheme not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch scheme" });
  }
});

router.get("/blood-banks", async (req, res) => {
  try {
    const { city, blood_type } = req.query;
    let query = "SELECT * FROM blood_banks WHERE 1=1";
    const params = [];
    let idx = 1;

    if (city) {
      query += ` AND LOWER(city) = LOWER($${idx++})`;
      params.push(city);
    }
    if (blood_type) {
      query += ` AND $${idx++} = ANY(blood_available)`;
      params.push(blood_type);
    }

    query += " ORDER BY name";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blood banks" });
  }
});

router.get("/blood-banks/nearby", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const maxRadius = radius || 50;
    const result = await pool.query(
      `SELECT *,
        (6371 * acos(
          cos(radians($1)) * cos(radians(lat)) *
          cos(radians(lng) - radians($2)) +
          sin(radians($1)) * sin(radians(lat))
        )) AS distance
       FROM blood_banks
       WHERE lat IS NOT NULL AND lng IS NOT NULL
       HAVING (6371 * acos(
          cos(radians($1)) * cos(radians(lat)) *
          cos(radians(lng) - radians($2)) +
          sin(radians($1)) * sin(radians(lat))
        )) < $3
       ORDER BY distance`,
      [lat, lng, maxRadius]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to find nearby blood banks" });
  }
});

router.get("/vaccination-camps", async (req, res) => {
  try {
    const { city, vaccine } = req.query;
    let query = "SELECT * FROM vaccination_camps WHERE camp_date >= CURRENT_DATE";
    const params = [];
    let idx = 1;

    if (city) {
      query += ` AND LOWER(city) = LOWER($${idx++})`;
      params.push(city);
    }
    if (vaccine) {
      query += ` AND $${idx++} = ANY(vaccines)`;
      params.push(vaccine);
    }

    query += " ORDER BY camp_date ASC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vaccination camps" });
  }
});

router.get("/outbreaks", async (req, res) => {
  try {
    const { state } = req.query;
    let query = "SELECT * FROM outbreak_alerts WHERE is_active = TRUE";
    const params = [];

    if (state) {
      query += " AND LOWER(region) LIKE LOWER($1)";
      params.push(`%${state}%`);
    }

    query += " ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch outbreak alerts" });
  }
});

module.exports = router;
