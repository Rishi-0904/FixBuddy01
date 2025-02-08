const jwt = require('jsonwebtoken');

// Secret key used for JWT verification
const JWT_SECRET = "secretkey";

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Set user data to req.user
    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

module.exports = { verifyToken };
