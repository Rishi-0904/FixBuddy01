// middlewares/auth.js
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.cookies ? req.cookies.token : null;

    if (!token) {
        req.user = null; // No user if no token
        return next();   // Proceed without authentication
    }

    try {
        const decoded = jwt.verify(token, "secretKey"); // Verify the JWT token
        req.user = decoded; // Attach user info to the request
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        req.user = null; // Invalid token, set user as null
        next(); // Proceed without authentication
    }
};

module.exports = authenticateJWT;
