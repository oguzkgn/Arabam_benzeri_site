function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'bilinmiyor';
  const [local, domain] = email.toLowerCase().split('@');
  if (!domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '-';
    console.log(
      `[HTTP] ${req.method} ${req.originalUrl} → ${res.statusCode} (${durationMs}ms) ip=${ip}`
    );
  });

  next();
}

function logAuth(action, details = {}) {
  const safe = { ...details };
  if (safe.email) safe.email = maskEmail(safe.email);
  console.log(`[AUTH] ${action}`, JSON.stringify(safe));
}

function logListing(action, details = {}) {
  console.log(`[ILAN] ${action}`, JSON.stringify(details));
}

module.exports = {
  requestLogger,
  logAuth,
  logListing,
  maskEmail
};
