const { pool } = require('../config/database');

async function getDueReminders() {
  const result = await pool.query(`
    SELECT mr.*, fp.name as patient_name, fp.user_id, u.email, u.phone
    FROM medicine_records mr
    JOIN family_profiles fp ON fp.id = mr.profile_id
    JOIN users u ON u.id = fp.user_id
    WHERE mr.status = 'active'
    AND mr.schedule_time IS NOT NULL
    AND mr.start_date <= CURRENT_DATE
    AND (mr.end_date IS NULL OR mr.end_date >= CURRENT_DATE)
  `);
  return result.rows;
}

async function markDoseTaken(medicineId) {
  const result = await pool.query(
    `UPDATE medicine_records
     SET status = 'completed'
     WHERE id = $1
     RETURNING *`,
    [medicineId]
  );
  return result.rows[0];
}

async function getAdherenceStats(profileId) {
  const result = await pool.query(`
    SELECT
      medicine_name,
      COUNT(*) as total_doses,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as taken_doses,
      ROUND(
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::decimal /
        NULLIF(COUNT(*), 0) * 100, 1
      ) as adherence_percent
    FROM medicine_records
    WHERE profile_id = $1
    GROUP BY medicine_name
  `, [profileId]);
  return result.rows;
}

async function getActiveMedicines(profileId) {
  const result = await pool.query(
    `SELECT * FROM medicine_records
     WHERE profile_id = $1 AND status = 'active'
     ORDER BY schedule_time`,
    [profileId]
  );
  return result.rows;
}

module.exports = { getDueReminders, markDoseTaken, getAdherenceStats, getActiveMedicines };
