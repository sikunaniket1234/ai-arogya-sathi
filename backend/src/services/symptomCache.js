const { pool } = require('../config/database');

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function findCachedResponse(inputText, language) {
  const normalized = normalizeText(inputText);
  const lang = language || 'en';

  try {
    const result = await pool.query(
      `SELECT *,
        similarity(normalized_input, $1) AS sim
       FROM symptom_cache
       WHERE language = $2
         AND similarity(normalized_input, $1) > 0.55
       ORDER BY sim DESC
       LIMIT 1`,
      [normalized, lang]
    );

    if (result.rows.length > 0) {
      const cached = result.rows[0];
      await pool.query(
        'UPDATE symptom_cache SET hit_count = hit_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [cached.id]
      );
      return {
        response_content: cached.response_content,
        safety_score: cached.safety_score,
        escalation_flag: cached.escalation_flag,
        source: 'cache',
        hit_count: cached.hit_count + 1,
        original_query: cached.original_input,
      };
    }
  } catch (err) {
    console.error('Cache lookup error:', err.message);
  }
  return null;
}

async function storeInCache(inputText, language, response) {
  const normalized = normalizeText(inputText);
  const lang = language || 'en';

  try {
    await pool.query(
      `INSERT INTO symptom_cache (normalized_input, original_input, language, response_content, safety_score, escalation_flag, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING`,
      [normalized, inputText, lang, response.response_content, response.safety_score, response.escalation_flag, response.source]
    );
  } catch (err) {
    console.error('Cache store error:', err.message);
  }
}

async function getCacheStats() {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) AS total_entries,
        COALESCE(SUM(hit_count), 0) AS total_hits,
        COALESCE(ROUND(AVG(hit_count), 1), 0) AS avg_hits
       FROM symptom_cache`
    );
    return result.rows[0];
  } catch (err) {
    return { total_entries: 0, total_hits: 0, avg_hits: 0 };
  }
}

module.exports = { findCachedResponse, storeInCache, getCacheStats };
