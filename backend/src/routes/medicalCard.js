const express = require("express");
const QRCode = require("qrcode");
const { pool } = require("../config/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/qr/:token", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fp.*,
        (SELECT json_agg(json_build_object(
          'medicine_name', mr.medicine_name,
          'dosage', mr.dosage,
          'frequency', mr.frequency
        )) FROM medicine_records mr WHERE mr.profile_id = fp.id AND mr.status = 'active') as medications
       FROM family_profiles fp
       WHERE fp.medical_card_token = $1`,
      [req.params.token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invalid medical card" });
    }

    const profile = result.rows[0];
    const cardData = {
      v: 1,
      token: profile.medical_card_token,
      name: profile.name,
      age: profile.age,
      blood: profile.blood_group,
      gender: profile.gender,
      conditions: (profile.conditions || []).filter(c => c !== "None known"),
      allergies: (profile.allergies || []).filter(a => a !== "None known"),
      medications: (profile.medications || []).map(m =>
        m.dosage ? `${m.medicine_name} ${m.dosage}` : m.medicine_name
      ),
      emergency: {
        name: profile.emergency_contact_name || "Not set",
        phone: profile.emergency_contact_phone || "Not set",
      },
    };

    res.json(cardData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch medical card" });
  }
});

router.get("/qr/:token/image", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fp.*,
        (SELECT json_agg(json_build_object(
          'medicine_name', mr.medicine_name,
          'dosage', mr.dosage,
          'frequency', mr.frequency
        )) FROM medicine_records mr WHERE mr.profile_id = fp.id AND mr.status = 'active') as medications
       FROM family_profiles fp
       WHERE fp.medical_card_token = $1`,
      [req.params.token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invalid medical card" });
    }

    const profile = result.rows[0];
    const cardData = {
      v: 1,
      token: profile.medical_card_token,
      name: profile.name,
      age: profile.age,
      blood: profile.blood_group,
      gender: profile.gender,
      conditions: (profile.conditions || []).filter(c => c !== "None known"),
      allergies: (profile.allergies || []).filter(a => a !== "None known"),
      medications: (profile.medications || []).map(m =>
        m.dosage ? `${m.medicine_name} ${m.dosage}` : m.medicine_name
      ),
      emergency: {
        name: profile.emergency_contact_name || "Not set",
        phone: profile.emergency_contact_phone || "Not set",
      },
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(cardData), {
      width: 400,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });

    res.json({ qr: qrDataUrl, card: cardData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

router.get("/profile/:profileId", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fp.*,
        (SELECT json_agg(json_build_object(
          'medicine_name', mr.medicine_name,
          'dosage', mr.dosage,
          'frequency', mr.frequency
        )) FROM medicine_records mr WHERE mr.profile_id = fp.id AND mr.status = 'active') as medications
       FROM family_profiles fp
       WHERE fp.id = $1`,
      [req.params.profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile = result.rows[0];
    const cardData = {
      v: 1,
      token: profile.medical_card_token,
      name: profile.name,
      age: profile.age,
      blood: profile.blood_group,
      gender: profile.gender,
      conditions: (profile.conditions || []).filter(c => c !== "None known"),
      allergies: (profile.allergies || []).filter(a => a !== "None known"),
      medications: (profile.medications || []).map(m =>
        m.dosage ? `${m.medicine_name} ${m.dosage}` : m.medicine_name
      ),
      emergency: {
        name: profile.emergency_contact_name || "Not set",
        phone: profile.emergency_contact_phone || "Not set",
      },
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(cardData), {
      width: 400,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });

    res.json({ qr: qrDataUrl, card: cardData, profileId: profile.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate medical card" });
  }
});

module.exports = router;
