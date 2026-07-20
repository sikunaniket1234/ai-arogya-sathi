const express = require("express");
const { pool } = require("../config/database");
const { authenticate } = require("../middleware/auth");
const { processSymptomQuery } = require("../services/aiReasoning");
const { findCachedResponse, storeInCache, getCacheStats } = require("../services/symptomCache");

const router = express.Router();
router.use(authenticate);

router.get("/cache/stats", async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cache stats" });
  }
});

router.get("/:profileId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sq.*, rl.response_content, rl.safety_score, rl.escalation_flag, rl.source
       FROM symptom_queries sq
       LEFT JOIN response_logs rl ON rl.query_id = sq.id
       WHERE sq.profile_id = $1
       ORDER BY sq.created_at DESC
       LIMIT 20`,
      [req.params.profileId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch symptom queries" });
  }
});

router.post("/:profileId", async (req, res) => {
  const { input_text, input_mode, language } = req.body;

  try {
    const profileResult = await pool.query(
      "SELECT * FROM family_profiles WHERE id = $1",
      [req.params.profileId]
    );
    const profile = profileResult.rows[0] || {};

    const cached = await findCachedResponse(input_text, language || 'en');

    let aiResponse;
    let fromCache = false;

    if (cached) {
      aiResponse = {
        response_content: cached.response_content,
        safety_score: cached.safety_score,
        escalation_flag: cached.escalation_flag,
        source: 'cache',
        severity: 'info',
        flags: [],
      };
      fromCache = true;
    } else {
      aiResponse = await processSymptomQuery(input_text, profile, language);
      await storeInCache(input_text, language || 'en', aiResponse);
    }

    const queryResult = await pool.query(
      `INSERT INTO symptom_queries (profile_id, input_text, input_mode, language)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.profileId, input_text, input_mode || "text", language || "en"]
    );
    const query = queryResult.rows[0];

    const logResult = await pool.query(
      `INSERT INTO response_logs (query_id, response_content, safety_score, escalation_flag, source)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [query.id, aiResponse.response_content, aiResponse.safety_score, aiResponse.escalation_flag, aiResponse.source]
    );

    res.status(201).json({
      query,
      response: logResult.rows[0],
      meta: {
        severity: aiResponse.severity,
        flags: aiResponse.flags,
        emergency_contacts: aiResponse.emergency_contacts || null,
        from_cache: fromCache,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process symptom query" });
  }
});

module.exports = router;
