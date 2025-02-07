// const jwt = require('jsonwebtoken');

// // Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//   const token = req.header('Authorization').replace('Bearer ', '');
//   if (!token) {
//     return res.render("prologin", { error: "login first !!" });

//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
//     req.user = decoded; // Attach the decoded user data to request object
//     next();
//   } catch (err) {
//     return res.render("prologin", { error: "Invalid Token !!" });

//   }
// };

// module.exports = { verifyToken };


const jwt = require('jsonwebtoken');

// Middleware to verify JWT token from cookies
const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Fetch token from cookies

  if (!token) {
    return res.render("login", { error: "Login first !!" });
  }

  try {
    const decoded = jwt.verify(token, "secretKey"); // Verify token
    req.user = decoded; // Attach decoded user data to request object
    next();
  } catch (err) {
    res.clearCookie("token"); // Clear invalid token
    return res.render("login", { error: "Invalid Token !!" });
  }
};

module.exports = { verifyToken };
