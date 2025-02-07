const express = require("express");
const path = require('path');
const multer = require('multer');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Professional = require('./models/professional');
const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // For URL-encoded data
app.use(cookieParser()); // To handle cookies (JWT)
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)

// Route files
const bookingRoutes = require('./routes/booking');
const professionalRoutes = require('./routes/professionalRoutes');
const dashboardRoutes = require("./routes/dashboard");
const contactRouter = require("./routes/contact");
const authenticateJWT = require("./middlewares/auth"); // JWT Auth Middleware

// Set view engine
app.set("view engine", "ejs");

const { verifyToken } = require('./middlewares/auth');



// Static file serving
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

// File upload configuration using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(bookingRoutes);  // This will call the correct router defined in booking.js

// Routes Setup
app.use("/api/professionals", dashboardRoutes);
app.use("/api/professionals", professionalRoutes);
app.use(bookingRoutes); // Use booking routes after all middleware
app.use(contactRouter); // Use contact routes
app.use(professionalRoutes);
app.use(dashboardRoutes);

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/myDatabase")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model("User", userSchema);

// Routes for views
app.get('/', (req, res) => {
    res.render("index", { user: req.user });
});
app.get('/electrician',verifyToken, (req, res) => {
    res.render("electrician", { user: req.user });
});
app.get('/carpenter',verifyToken, (req, res) => {
    res.render("carpenter", { user: req.user });
});
app.get('/plumber',verifyToken, (req, res) => {
    res.render("plumber", { user: req.user });
});
app.get('/painter',verifyToken, (req, res) => {
    res.render("painter", { user: req.user });
});
app.get('/gardener',verifyToken, (req, res) => {
    res.render("gardener", { user: req.user });
});
app.get('/gardener',verifyToken, (req, res) => {
    res.render("gardener", { user: req.user });
});
app.get('/mover', verifyToken , (req, res) => {
    res.render("mover", { user: req.user });
});

app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/application", (req, res) => {
    res.render("application");
});
app.get("/prologin", (req, res) => {
    res.render("prologin");
});
app.get("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the JWT token cookie
    res.redirect("/"); // Redirect to homepage after logout
});

// Other routes (examples)
app.get('/contact', (req, res) => {
    res.render("contact");
});
app.get('/sign-up', (req, res) => {
    res.render("sign-up");
});

// Sign-up and Login Routes
app.post("/sign-up", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.render("sign-up", { error: "All fields are required !!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.render("sign-up", { error: "Email already in use !!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.render("sign-up", { error: null, success: "Signup successful! Please log in to continue." });
    } catch (err) {
        res.status(500).json({ message: "Error signing up", error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.render("login", { error: "Invalid Username or Email !!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.render("login", { error: "Invalid Username or Email !!" });

        const token = jwt.sign({ id: user._id, email: user.email }, "secretKey", { expiresIn: "1h" });
        res.cookie('token', token, { httpOnly: true }); // Set the JWT token in the cookie
        return res.redirect("/"); // Redirect after login
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
});

// Protected Route Example
// app.get("/profile", authenticateJWT, async (req, res) => {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ message: "Profile fetched", user });
// });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong!' });
});
app.get('/dashboard', (req, res) => {
    const user = req.user; // Get the user from the session or JWT
  
    // Fetch bookings for the user
    Booking.find({ professionalId: user._id })
      .then(bookings => {
        res.render('dashboard', { user: user, bookings: bookings });
      })
      .catch(err => {
        console.error(err);
        res.render('dashboard', { user: user, bookings: [] });
      });
  });
// Starting the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
