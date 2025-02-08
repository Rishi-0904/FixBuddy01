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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
router.get('/professionals', async (req, res) => {
  const { service } = req.query; 

  try {
      
      let filter = {};
      if (service) {
          filter.service = service;  
      }

      const professionals = await Professional.find(filter);

      res.json(professionals); 
  } catch (err) {
      console.error("Error fetching professionals:", err);
      res.status(500).json({ error: "Error fetching professionals" });
  }
});

router.post("/apply", upload.fields([{ name: "profile-picture" }, { name: "certificates" }]), async (req, res) => {
  try {
    const { name, email, phone, service, experience, message, password } = req.body;

    
    const existingProfessional = await Professional.findOne({ email });
    if (existingProfessional) {
      
      return res.render('application', { 
        error: 'This email is already in use. Please use a different email.' 
      });
    }

    const profilePicture = req.files["profile-picture"] ? req.files["profile-picture"][0].path : null;
    const certificates = req.files["certificates"] ? req.files["certificates"][0].path : null;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

  
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

    await newProfessional.save();
    return res.redirect("/prologin");
  } catch (error) {
    console.error("Error submitting application:", error);
   
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
  res.clearCookie("token");
  res.redirect("/");
});



module.exports = router;
