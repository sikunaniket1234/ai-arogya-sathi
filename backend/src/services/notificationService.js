const { pool } = require("../config/database");

const notifications = [];

async function createNotification(userId, type, title, message, data = {}) {
  const notification = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);
  return notification;
}

function getUserNotifications(userId, unreadOnly = false) {
  return notifications.filter(n => {
    if (n.userId !== userId) return false;
    if (unreadOnly && n.read) return false;
    return true;
  });
}

function markAsRead(notificationId) {
  const n = notifications.find(n => n.id === notificationId);
  if (n) n.read = true;
  return n;
}

async function checkMedicineReminders() {
  const result = await pool.query(`
    SELECT mr.*, fp.user_id, fp.name as patient_name
    FROM medicine_records mr
    JOIN family_profiles fp ON fp.id = mr.profile_id
    WHERE mr.status = 'active'
    AND mr.schedule_time IS NOT NULL
    AND EXTRACT(HOUR FROM mr.schedule_time) = EXTRACT(HOUR FROM CURRENT_TIME)
    AND EXTRACT(MINUTE FROM mr.schedule_time) = EXTRACT(MINUTE FROM CURRENT_TIME)
  `);

  for (const med of result.rows) {
    await createNotification(
      med.user_id,
      "medicine_reminder",
      "Medicine Reminder",
      `Time to give ${med.medicine_name} (${med.dosage}) to ${med.patient_name}`,
      { medicineId: med.id, profileId: med.profile_id }
    );
  }

  return result.rows.length;
}

function startReminderScheduler(intervalMs = 60000) {
  console.log(`Notification scheduler started (interval: ${intervalMs / 1000}s)`);
  return setInterval(async () => {
    try {
      const count = await checkMedicineReminders();
      if (count > 0) console.log(`Sent ${count} medicine reminders`);
    } catch (err) {
      console.error("Reminder scheduler error:", err);
    }
  }, intervalMs);
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  checkMedicineReminders,
  startReminderScheduler
};
