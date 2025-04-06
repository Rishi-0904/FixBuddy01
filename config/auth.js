const jwt = require('jsonwebtoken');

const JWT_SECRET = "your_secret_key";
const TOKEN_EXPIRY = "24h";

const generateToken = (payload) => {
    try {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Failed to generate authentication token');
    }
};

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ error: "Please login to access this resource" });
            }
            return res.render("prologin", { error: "Login first!" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.clearCookie("token");
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ error: "Session expired. Please login again." });
        }
        return res.render("prologin", { error: "Invalid Token! Please login again." });
    }
};

module.exports = {
    JWT_SECRET,
    TOKEN_EXPIRY,
    generateToken,
    verifyToken
}; 