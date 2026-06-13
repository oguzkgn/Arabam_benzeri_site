const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';

function authMiddleware(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ mesaj: 'Erişim reddedildi. Giriş yapmalısınız.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
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
