require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { pool } = require("./config/database");
const logger = require("./utils/logger");
const { apiLimiter, authLimiter, sanitizeInput, securityHeaders } = require("./middleware/security");
const { startReminderScheduler } = require("./services/notificationService");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profiles");
const healthRoutes = require("./routes/health");
const medicineRoutes = require("./routes/medicines");
const symptomRoutes = require("./routes/symptoms");
const reminderRoutes = require("./routes/reminders");
const emergencyRoutes = require("./routes/emergency");
const deviceRoutes = require("./routes/devices");
const trendRoutes = require("./routes/trends");
const notificationRoutes = require("./routes/notifications");
const medicalCardRoutes = require("./routes/medicalCard");
const communityRoutes = require("./routes/community");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.request(req, res, Date.now() - start);
  });
  next();
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
  } catch (err) {
    res.status(503).json({ status: "error", message: "Database unavailable" });
  }
});

app.get("/api/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not ready" });
  }
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profiles", apiLimiter, profileRoutes);
app.use("/api/health-records", apiLimiter, healthRoutes);
app.use("/api/medicines", apiLimiter, medicineRoutes);
app.use("/api/symptoms", apiLimiter, symptomRoutes);
app.use("/api/reminders", apiLimiter, reminderRoutes);
app.use("/api/emergency", apiLimiter, emergencyRoutes);
app.use("/api/devices", apiLimiter, deviceRoutes);
app.use("/api/trends", apiLimiter, trendRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/medical-card", apiLimiter, medicalCardRoutes);
app.use("/api/community", apiLimiter, communityRoutes);

app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  startReminderScheduler(60000);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", { reason: String(reason) });
});
