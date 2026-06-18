const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';

function authMiddleware(req, res, next) {
  const token = req.header('x-auth-token') || req.header('authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ mesaj: 'Erişim reddedildi. Giriş yapmalısınız.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mesaj: 'Geçersiz veya süresi dolmuş oturum.' });
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { authMiddleware, signToken, JWT_SECRET };
