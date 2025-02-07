// const jwt = require("jsonwebtoken");
// const express = require("express");
// const router = express.Router();
// const Professional = require("../models/professional");

// router.use(express.json());
// const cookieParser = require("cookie-parser");
// router.use(cookieParser()); // Enable parsing cookies


// // Secret Key for JWT
// const JWT_SECRET = "secretkey"; // Keep this secret and store in environment variables

// const verifyToken = (req, res, next) => {
//   // Log the cookies for debugging
//   console.log("req.cookies:", req.cookies);

//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized: No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     console.log("Decoded token:", decoded); // Debug: check if { id, email } exist
//     req.user = decoded; // This should set req.user = { id: professional._id, email: ... }
//     next();
//   } catch (err) {
//     console.error("Token verification error:", err);
//     return res.status(403).json({ error: "Forbidden: Invalid token" });
//   }
// };

// module.exports = verifyToken;


// // Fetch user data from the backend
// fetch("http://localhost:5000/api/professionals/dashboard", {
//     method: "GET",
//     credentials: "include", // Ensure cookies are sent
//     headers: { "Content-Type": "application/json" }
// })
// .then(response => response.json())
// .then(data => { (req,res)=>{
//     if (data.error) {
//         console.log("User not found"); // ✅ Use console.log() instead
//         return res.status(404).json({ error: "User not found" });
//     }
//      else {
//         console.log("User Data:", data);

//         // Update profile section with API data
//         document.getElementById("worker-name").innerText = data.name;
//         document.getElementById("worker-service").innerText = data.service;
//         document.getElementById("worker-experience").innerText = data.experience;
//         document.getElementById("worker-email").innerText = data.email;

//         // Set profile picture (Fix path issue)
//         const profilePicPath = data.profilePicture.replace(/\\/g, "/"); // Fix Windows path issue
//         document.getElementById("worker-photo").src = `http://localhost:5000/${profilePicPath}`;
//     }
// }
// }) 
// .catch(error => console.error("Fetch error:", error));


// // Secure Dashboard Route
// router.get("/dashboard",verifyToken , async (req, res) => { // ✅ Properly defining `res`
//     try {
//         const user = await Professional.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }
//         // res.json(user);
//         return res.render("dashboard")
//     } catch (error) {
//         console.error("Fetch error:", error);
//         res.status(500).json({ error: "Server error", details: error.message });
//     }
// });


// module.exports = router;


// routes/dashboard.js
// const express = require("express");
// const router = express.Router();
// const cookieParser = require("cookie-parser");
// const jwt = require("jsonwebtoken");
// const Professional = require("../models/professional"); // Adjust path if needed

// // Use JSON body parser and cookie parser middleware on this router.
// router.use(express.json());
// router.use(cookieParser());

// // Secret Key for JWT (ideally, store this in an environment variable)
// const JWT_SECRET = "secretkey";

// // Middleware to verify JWT from cookies.
// const verifyToken = (req, res, next) => {
//   console.log("req.cookies:", req.cookies);
//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized: No token provided" });
//   }
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     console.log("Decoded token:", decoded);
//     req.user = decoded; // Expected to contain properties like { id, email }
//     next();
//   } catch (err) {
//     console.error("Token verification error:", err.message);
//     return res.status(403).json({ error: "Forbidden: Invalid token" });
//   }
// };

// // GET /api/professionals/dashboard
// // This route is protected by the verifyToken middleware.
// // const verifyToken = require('./middleware/verifyToken'); // Ensure this path is correct

// router.get('/dashboard', verifyToken, async (req, res) => {
//   try {
//     const user = await Professional.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     // Render the dashboard view with user data
//     res.render('dashboard', { user });
//   } catch (error) {
//     console.error('Fetch error:', error);
//     res.status(500).json({ error: 'Server error', details: error.message });
//   }
// });


// module.exports = router;
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Professional = require("../models/professional"); // Import Professional model
const Booking = require('../models/Booking'); // Import Booking model

// Middleware to verify JWT from cookies
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    // return res.status(401).json({ error: "Unauthorized: No token provided" });
    return res.render("prologin", { error: "login first !!" });
  }
  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded; // This will have the user details like { id: user._id }
    next();
  } catch (err) {
    // return res.status(403).json({ error: "Forbidden: Invalid token" });
    return res.render("prologin", { error: "Invalid Token !!" }); 

  }
};

// GET route to fetch dashboard data, including user and bookings
// GET route to fetch dashboard data, including user and bookings
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await Professional.findById(req.user.id); // Get the user by ID from the JWT
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const bookings = await Booking.find({ professionalEmail: user.email }); // Get bookings for the user
    console.log("Fetched bookings:", bookings); 
    // Render the dashboard page with user and booking data
    // If there are no bookings, an empty array will be passed, and it will be handled on the frontend.
    res.render('dashboard', { user, bookings });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});







module.exports = router;
