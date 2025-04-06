const jwt = require('jsonwebtoken');

const JWT_SECRET = "your_secret_key";
const TOKEN_EXPIRY = "24h";

/**
 * Generates a JWT token for authentication
 * @param {Object} payload - User data to include in the token
 * @param {string} payload.email - User email
 * @param {string} payload.name - User name
 * @param {string} [payload.role] - User role ('user' or 'professional')
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    try {
        // Ensure the role is properly set
        if (!payload.role) {
            // Default to 'user' if no service is defined, otherwise 'professional'
            payload.role = payload.service ? 'professional' : 'user';
        }
        
        return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Failed to generate authentication token');
    }
};

/**
 * Middleware to verify JWT token from cookies
 * Sets req.user with the decoded token payload
 */
const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ error: "Please login to access this resource" });
            }
            
            // Determine which login page to show based on the URL path
            // If the URL is related to professional paths, show professional login
            if (req.originalUrl.startsWith('/professional') || req.originalUrl === '/dashboard' && req.query.type === 'professional') {
                return res.render("prologin", { error: "Login first!" });
            } else {
                // Default to regular user login for other paths
                return res.render("login", { error: "Please login to continue" });
            }
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Ensure the role is always set
        if (!decoded.role) {
            decoded.role = decoded.service ? 'professional' : 'user';
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.clearCookie("token");
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ error: "Session expired. Please login again." });
        }
        
        // Determine which login page to show based on the detected role or URL path
        const isProfessionalPath = req.originalUrl.startsWith('/professional') || 
                                   req.originalUrl === '/dashboard' && req.query.type === 'professional';
        
        if (isProfessionalPath) {
            return res.render("prologin", { error: "Invalid Token! Please login again." });
        } else {
            return res.render("login", { error: "Your session expired. Please login again." });
        }
    }
};

/**
 * Middleware to ensure the user is a professional
 * Must be used after verifyToken
 */
const requireProfessional = (req, res, next) => {
    if (req.user.role !== 'professional') {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({ error: "Access denied. Professionals only." });
        }
        return res.render("error", { 
            error: "Access Denied", 
            message: "This section is only available to service professionals."
        });
    }
    next();
};

/**
 * Middleware to ensure the user is a regular user (not a professional)
 * Must be used after verifyToken
 */
const requireUser = (req, res, next) => {
    if (req.user.role !== 'user') {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(403).json({ error: "Access denied. Regular users only." });
        }
        return res.render("error", { 
            error: "Access Denied", 
            message: "This section is only available to regular users."
        });
    }
    next();
};

module.exports = {
    JWT_SECRET,
    TOKEN_EXPIRY,
    generateToken,
    verifyToken,
    requireProfessional,
    requireUser
}; 