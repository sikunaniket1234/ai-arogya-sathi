const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getDueReminders, markDoseTaken, getAdherenceStats, getActiveMedicines } = require("../services/reminderService");

const router = express.Router();
router.use(authenticate);

router.get("/active/:profileId", async (req, res) => {
  try {
    const medicines = await getActiveMedicines(req.params.profileId);
    res.json(medicines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active medicines" });
  }
});

router.post("/take/:medicineId", async (req, res) => {
  try {
    const result = await markDoseTaken(req.params.medicineId);
    if (!result) {
      return res.status(404).json({ error: "Medicine not found" });
    }
    res.json({ message: "Dose marked as taken", medicine: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark dose" });
  }
});

router.get("/adherence/:profileId", async (req, res) => {
  try {
    const stats = await getAdherenceStats(req.params.profileId);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch adherence stats" });
  }
});

module.exports = router;
