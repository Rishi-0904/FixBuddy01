const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const Professional = require("../models/professional");
const jwt = require("jsonwebtoken");

const cors = require("cors");
const { verifyToken } = require('../middlewares/verifyToken');


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






// router.post("/submit-login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//       console.log("Received Email:", email);
//       console.log("Received Password:", password);

//       // Find the user in the database
//       const user = await Professional.findOne({ email });

//       if (!user) {
//           console.log("Login Failed: User not found");
//           return res.status(401).json({ error: "Invalid email or password" });
//       }

//       // Compare the provided password with the hashed password in the database
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (!isMatch) {
//           console.log("Login Failed: Incorrect password");
//           return res.status(401).json({ error: "Invalid email or password" });
//       }

//       console.log("Login Successful!");

//       // Generate a JWT token (Optional but recommended for authentication)
//       const token = jwt.sign({ id: user._id, email: user.email }, "your_secret_key", {
//           expiresIn: "1h",
//       });

//       return res.status(200).json({ message: "Login successful", redirect: "/dashboard", token });
//   } catch (error) {
//       console.error("Error during login:", error);
//       return res.status(500).json({ error: "Server error. Please try again later." });
//   }
// });


const cookieParser = require("cookie-parser");

// Use cookie parser middleware
router.use(cookieParser());

router.post("/submit-login", async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("Received Email:", email);
        console.log("Received Password:", password);

        // Find the user in the database
        const user = await Professional.findOne({ email });

        if (!user) {
            console.log("Login Failed: User not found");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("Login Failed: Incorrect password");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        console.log("Login Successful!");

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, "secretkey", {
            expiresIn: "7d",
        });

        // Set the token in an HTTP-only cookie (secure in production)
        res.cookie("token", token, {
            httpOnly: true, // Prevents JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 3600000, // 1 hour
            sameSite: "Strict", // Protects against CSRF attacks
        });

        return res.status(200).json({ message: "Login successful", redirect: "/dashboard" });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ error: "Server error. Please try again later." });
    }
});

router.post('/bookings', verifyToken, async (req, res) => {
  const { clientName, clientEmail, serviceName, date, message } = req.body;

  try {
    const newBooking = new Booking({
      professionalId: req.user.id,  // Retrieve professional's id from the verified token
      clientName,
      clientEmail,
      serviceName,
      date,
      message,
    });

    await newBooking.save();
    res.status(200).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.get("/prologout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
  res.redirect("/");
});



module.exports = router;
