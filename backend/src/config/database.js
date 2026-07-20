const { Pool } = require("pg");

function buildConnectionString() {
  if (process.env.DATABASE_URL) {
    try {
      new URL(process.env.DATABASE_URL);
      return process.env.DATABASE_URL;
    } catch {
      const url = new URL(process.env.DATABASE_URL.replace(/^postgresql:\/\//, "http://"));
      url.username = decodeURIComponent(url.username);
      url.password = decodeURIComponent(url.password);
      return `postgresql://${encodeURIComponent(url.username)}:${encodeURIComponent(url.password)}@${url.hostname}:${url.port || 5432}${url.pathname}`;
    }
  }

  const password = encodeURIComponent(process.env.DB_PASSWORD || "");
  return `postgresql://${process.env.DB_USER}:${password}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;
}

const pool = new Pool({
  connectionString: buildConnectionString(),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = { pool };
