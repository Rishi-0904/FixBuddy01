const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const Professional = require("../models/professional");
const jwt = require("jsonwebtoken");

const cors = require("cors");

const router = express.Router();

router.use(cors());
router.use(express.json()); 
router.use(express.urlencoded({ extended: true }));


// Multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where files are stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
router.get('/professionals', async (req, res) => {
  const { service } = req.query; // Get the service from the query string

  try {
      // If 'service' is passed, filter professionals by the selected service
      let filter = {};
      if (service) {
          filter.service = service;  // Filter by the selected service (e.g., "electrician", "carpenter", etc.)
      }

      // Fetch professionals based on the filter
      const professionals = await Professional.find(filter);

      res.json(professionals); // Send back the professionals in the response
  } catch (err) {
      console.error("Error fetching professionals:", err);
      res.status(500).json({ error: "Error fetching professionals" });
  }
});
// Route to handle form submission
// Route to handle form submission
// Route to handle form submission
router.post("/apply", upload.fields([{ name: "profile-picture" }, { name: "certificates" }]), async (req, res) => {
  try {
    const { name, email, phone, service, experience, message, password } = req.body;

    // Check if email already exists in the database
    const existingProfessional = await Professional.findOne({ email });
    if (existingProfessional) {
      // If the email exists, send an error message back to the form
      return res.render('application', { 
        error: 'This email is already in use. Please use a different email.' 
      });
    }

    const profilePicture = req.files["profile-picture"] ? req.files["profile-picture"][0].path : null;
    const certificates = req.files["certificates"] ? req.files["certificates"][0].path : null;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new professional
    const newProfessional = new Professional({
      name,
      email,
      phone,
      service,
      experience,
      message,
      profilePicture,
      certificates,
      password: hashedPassword,
    });

    // Save to database
    await newProfessional.save();
    return res.redirect("/prologin");
  } catch (error) {
    console.error("Error submitting application:", error);
    // Send back the error message
    return res.render('application', {
      error: 'An unexpected error occurred. Please try again later.' 
    });
  }
});






  router.post("/submit-login", async (req, res) => {
    try {
      console.log("Received request body:", req.body); // ✅ Debugging step
  
      const { email, password } = req.body;
  
      // Check if professional exists
      const professional = await Professional.findOne({ email });
      if (!professional) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      // Compare hashed password
      const isMatch = await bcrypt.compare(password, professional.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      // Generate JWT Token
      const token = jwt.sign(
        { id: professional._id, email: professional.email },
        "secretkey",
        { expiresIn: "7d" } // Token valid for 7 days
      );
  
      // Set token in HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
      });
  
      // Send response with user data (excluding password)
    return res.redirect("/dashboard")

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  });
  
  module.exports = router;



module.exports = router;
