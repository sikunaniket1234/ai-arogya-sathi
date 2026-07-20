const { pool } = require("../config/database");

async function getVitalTrends(profileId, days = 30) {
  const result = await pool.query(`
    SELECT
      DATE(recorded_at) as date,
      AVG(heart_rate) as avg_heart_rate,
      MAX(heart_rate) as max_heart_rate,
      MIN(heart_rate) as min_heart_rate,
      AVG(blood_pressure_systolic) as avg_systolic,
      AVG(blood_pressure_diastolic) as avg_diastolic,
      AVG(oxygen_level) as avg_oxygen,
      AVG(temperature) as avg_temperature,
      AVG(sleep_hours) as avg_sleep,
      SUM(steps) as total_steps,
      COUNT(*) as readings
    FROM health_records
    WHERE profile_id = $1
    AND recorded_at >= NOW() - ($2 || ' days')::INTERVAL
    GROUP BY DATE(recorded_at)
    ORDER BY date ASC
  `, [profileId, String(days)]);
  return result.rows;
}

async function getLatestVitals(profileId) {
  const result = await pool.query(`
    SELECT * FROM health_records
    WHERE profile_id = $1
    ORDER BY recorded_at DESC
    LIMIT 1
  `, [profileId]);
  return result.rows[0] || null;
}

async function getHealthScore(profileId) {
  const result = await pool.query(`
    SELECT
      AVG(heart_rate) as avg_hr,
      AVG(blood_pressure_systolic) as avg_sys,
      AVG(blood_pressure_diastolic) as avg_dia,
      AVG(oxygen_level) as avg_o2,
      AVG(temperature) as avg_temp,
      SUM(steps) as total_steps,
      COUNT(*) as readings
    FROM health_records
    WHERE profile_id = $1
    AND recorded_at >= NOW() - INTERVAL '7 days'
  `, [profileId]);

  const row = result.rows[0];
  if (!row || !row.readings || Number(row.readings) === 0) {
    return { score: null, status: "no_data", issues: [], lastUpdated: null };
  }

  let score = 100;
  const issues = [];

  if (row.avg_hr) {
    const hr = Number(row.avg_hr);
    if (hr < 60 || hr > 100) {
      score -= 10;
      issues.push("Abnormal heart rate (avg " + hr.toFixed(0) + " bpm)");
    }
  }

  if (row.avg_sys) {
    const sys = Number(row.avg_sys);
    if (sys > 140 || sys < 90) {
      score -= 15;
      issues.push("Abnormal blood pressure (avg " + sys.toFixed(0) + "/" + Number(row.avg_dia).toFixed(0) + ")");
    }
  }

  if (row.avg_o2) {
    const o2 = Number(row.avg_o2);
    if (o2 < 95) {
      score -= 20;
      issues.push("Low oxygen level (avg " + o2.toFixed(1) + "%)");
    }
  }

  if (row.avg_temp) {
    const temp = Number(row.avg_temp);
    if (temp > 100.4) {
      score -= 10;
      issues.push("Elevated temperature (avg " + temp.toFixed(1) + "°F)");
    }
  }

  score = Math.max(0, Math.min(100, score));

  let status;
  if (score >= 80) status = "good";
  else if (score >= 60) status = "fair";
  else status = "needs_attention";

  const latest = await getLatestVitals(profileId);
  return { score, status, issues, lastUpdated: latest?.recorded_at || null };
}

async function getVitalComparison(profileId, days) {
  const half = Math.floor(days / 2);
  const result = await pool.query(`
    SELECT
      CASE WHEN recorded_at >= NOW() - ($2 || ' days')::INTERVAL THEN 'current' ELSE 'previous' END as period,
      AVG(heart_rate) as avg_hr,
      AVG(blood_pressure_systolic) as avg_sys,
      AVG(blood_pressure_diastolic) as avg_dia,
      AVG(oxygen_level) as avg_o2,
      AVG(temperature) as avg_temp,
      AVG(sleep_hours) as avg_sleep,
      SUM(steps) as total_steps,
      COUNT(*) as readings
    FROM health_records
    WHERE profile_id = $1
    AND recorded_at >= NOW() - ($3 || ' days')::INTERVAL
    GROUP BY period
  `, [profileId, String(half), String(days)]);

  const data = { current: null, previous: null };
  for (const row of result.rows) {
    data[row.period] = {
      avg_hr: row.avg_hr ? Number(Number(row.avg_hr).toFixed(1)) : null,
      avg_sys: row.avg_sys ? Number(Number(row.avg_sys).toFixed(1)) : null,
      avg_dia: row.avg_dia ? Number(Number(row.avg_dia).toFixed(1)) : null,
      avg_o2: row.avg_o2 ? Number(Number(row.avg_o2).toFixed(1)) : null,
      avg_temp: row.avg_temp ? Number(Number(row.avg_temp).toFixed(1)) : null,
      avg_sleep: row.avg_sleep ? Number(Number(row.avg_sleep).toFixed(1)) : null,
      total_steps: row.total_steps ? Number(row.total_steps) : null,
      readings: Number(row.readings),
    };
  }

  return data;
}

async function getAnomalies(profileId, days = 30) {
  const result = await pool.query(`
    SELECT DATE(recorded_at) as date, heart_rate, blood_pressure_systolic,
           blood_pressure_diastolic, oxygen_level, temperature, sleep_hours, steps
    FROM health_records
    WHERE profile_id = $1
    AND recorded_at >= NOW() - ($2 || ' days')::INTERVAL
    ORDER BY recorded_at DESC
  `, [profileId, String(days)]);

  const anomalies = [];
  for (const row of result.rows) {
    const flags = [];
    if (row.heart_rate && (row.heart_rate < 50 || row.heart_rate > 120))
      flags.push({ metric: 'Heart Rate', value: row.heart_rate, unit: 'bpm', level: 'high' });
    if (row.blood_pressure_systolic && (row.blood_pressure_systolic > 160 || row.blood_pressure_systolic < 80))
      flags.push({ metric: 'Blood Pressure', value: row.blood_pressure_systolic + '/' + row.blood_pressure_diastolic, unit: 'mmHg', level: 'high' });
    if (row.oxygen_level && row.oxygen_level < 92)
      flags.push({ metric: 'Oxygen Level', value: row.oxygen_level, unit: '%', level: 'high' });
    if (row.temperature && row.temperature > 101.5)
      flags.push({ metric: 'Temperature', value: row.temperature, unit: '°F', level: 'high' });
    if (row.sleep_hours && row.sleep_hours < 4)
      flags.push({ metric: 'Sleep', value: row.sleep_hours, unit: 'hrs', level: 'medium' });
    if (flags.length > 0) {
      anomalies.push({ date: row.date, flags });
    }
  }

  return anomalies.slice(0, 10);
}

async function getMedicineAdherenceTrend(profileId, days = 30) {
  const result = await pool.query(`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as taken,
      ROUND(
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::decimal /
        NULLIF(COUNT(*), 0) * 100, 1
      ) as adherence_percent
    FROM medicine_records
    WHERE profile_id = $1
    AND created_at >= NOW() - ($2 || ' days')::INTERVAL
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `, [profileId, String(days)]);
  return result.rows;
}

module.exports = { getVitalTrends, getLatestVitals, getHealthScore, getVitalComparison, getAnomalies, getMedicineAdherenceTrend };
