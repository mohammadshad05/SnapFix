const jwt = require('jsonwebtoken');
const JWT_SECRET = 'fixit_desk_jwt_secret_key_99';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: Malformed Token' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access Restricted to Admins only' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, JWT_SECRET };