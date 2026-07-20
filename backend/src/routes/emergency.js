const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getEmergencyData, getOfflineFirstAid } = require("../services/emergencyService");

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  const lang = req.query.lang || 'en';
  res.json(getEmergencyData(lang));
});

router.get("/first-aid", (req, res) => {
  const lang = req.query.lang || 'en';
  res.json(getOfflineFirstAid(lang));
});

module.exports = router;
