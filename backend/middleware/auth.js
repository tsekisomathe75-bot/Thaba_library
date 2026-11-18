const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in first' });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, membershipId: user.membership_id, role: user.role },
    SECRET,
    { expiresIn: '8h' }
  );
}

module.exports = { requireAuth, requireAdmin, signToken };
