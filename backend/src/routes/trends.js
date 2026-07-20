const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getVitalTrends, getLatestVitals, getHealthScore, getVitalComparison, getAnomalies, getMedicineAdherenceTrend } = require("../services/trendService");

const router = express.Router();
router.use(authenticate);

router.get("/vitals/:profileId", async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  try {
    const trends = await getVitalTrends(req.params.profileId, days);
    const latest = await getLatestVitals(req.params.profileId);
    res.json({ trends, latest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vital trends" });
  }
});

router.get("/health-score/:profileId", async (req, res) => {
  try {
    const score = await getHealthScore(req.params.profileId);
    res.json(score);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate health score" });
  }
});

router.get("/comparison/:profileId", async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  try {
    const comparison = await getVitalComparison(req.params.profileId, days);
    res.json(comparison);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comparison" });
  }
});

router.get("/anomalies/:profileId", async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  try {
    const anomalies = await getAnomalies(req.params.profileId, days);
    res.json(anomalies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch anomalies" });
  }
});

router.get("/adherence/:profileId", async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  try {
    const trend = await getMedicineAdherenceTrend(req.params.profileId, days);
    res.json(trend);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch adherence trend" });
  }
});

module.exports = router;
