const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const Professional = require("../models/professional");

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

// Route to handle form submission
router.post("/apply", upload.fields([{ name: "profile-picture" }, { name: "certificates" }]), async (req, res) => {
  try {
    const { name, email, phone, service, experience, message, password } = req.body;
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
    res.status(500).json({ error: "Error submitting application", details: error.message });
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
  
      res.status(200).json({ message: "Login successful", professional });
    } catch (error) {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  });

module.exports = router;
