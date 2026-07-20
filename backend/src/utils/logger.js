const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

class Logger {
  constructor(level = 'info') {
    this.level = LOG_LEVELS[level] ?? 2;
  }

  format(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    });
  }

  error(message, meta) {
    if (this.level >= 0) console.error(this.format('error', message, meta));
  }

  warn(message, meta) {
    if (this.level >= 1) console.warn(this.format('warn', message, meta));
  }

  info(message, meta) {
    if (this.level >= 2) console.log(this.format('info', message, meta));
  }

  debug(message, meta) {
    if (this.level >= 3) console.log(this.format('debug', message, meta));
  }

  request(req, res, duration) {
    this.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id
    });
  }
}

module.exports = new Logger(process.env.LOG_LEVEL || 'info');
