const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getUserNotifications, markAsRead } = require("../services/notificationService");

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  const unreadOnly = req.query.unread === "true";
  const notifs = getUserNotifications(req.user.id, unreadOnly);
  res.json(notifs);
});

router.post("/:id/read", (req, res) => {
  const result = markAsRead(req.params.id);
  if (!result) {
    return res.status(404).json({ error: "Notification not found" });
  }
  res.json({ message: "Marked as read", notification: result });
});

module.exports = router;
