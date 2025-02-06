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
  const { email, password } = req.body;

  try {
    // First, check if the professional exists by their email
    const professional = await Professional.findOne({ email });

    if (!professional) {
      // If the professional is not found, return an error
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Now that we have the professional, compare the password
    const isMatch = await bcrypt.compare(password, professional.password);

    if (!isMatch) {
      // If the password doesn't match, return an error
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // If both checks pass, respond with a success message
    return res.json({ message: "Login successful" });

    // If you want to redirect the user after a successful login, you can do this:
    // return res.redirect("/dashboard");

  } catch (error) {
    console.error("Error during login:", error);
    // If something goes wrong, return a generic server error
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});


module.exports = router;
