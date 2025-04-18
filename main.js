const express = require("express");
const path = require('path');
const multer = require('multer');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Professional = require('./models/professional');
const Booking = require('./models/Booking');
const { verifyToken, generateToken, JWT_SECRET } = require('./config/auth');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // For URL-encoded data
app.use(cookieParser()); // To handle cookies (JWT)
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)

// Set view engine and views directory
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

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

// Route files
const bookingRoutes = require('./routes/booking');
const professionalRoutes = require('./routes/professionalRoutes');
const dashboardRoutes = require("./routes/dashboard");
const contactRouter = require("./routes/contact");

// API Routes
app.use("/api", bookingRoutes);  // Mount at /api to handle /api/book directly
app.use("/api", professionalRoutes); // Mount professional routes at /api

// Professional Dashboard Routes - Mount at "/professional" path prefix
app.use("/professional", dashboardRoutes);

// Other View Routes
app.use(contactRouter);

// MongoDB connection with error handling
mongoose.connect("mongodb://localhost:27017/myDatabase", {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
    console.log("MongoDB Connected");
    // Start the server only after MongoDB connection is established
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
});

// Add error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't exit the process, just log the error
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Don't exit the process, just log the error
});

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model("User", userSchema);

// API Routes
app.get('/api/professional/bookings', verifyToken, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const bookings = await Booking.find({ professionalId: req.user.id });
        console.log('Fetched bookings for professional:', req.user.id, bookings);
        res.json({ success: true, bookings: bookings });
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ success: false, message: 'Error fetching bookings' });
    }
});

// Routes for views
app.get("/", (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.render("index", { user: null });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.render("index", { user: decoded });
    } catch (err) {
        res.clearCookie("token");
        return res.render("index", { user: null });
    }
});

// Add logout route
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

app.get('/about', (req, res) => {
    res.render("about", { user: req.user });
});

app.get('/FAQ', (req, res) => {
    res.render("FAQ", { user: req.user });
});

// Service Routes - Allow public access
app.get('/electrician', async (req, res) => {
    try {
        console.log('Fetching electricians...');
        const professionals = await Professional.find({ service: 'electrician' }).lean();
        console.log(`Found ${professionals.length} electricians`);
        
        const token = req.cookies.token;
        let user = null;
        
        if (token) {
            try {
                user = jwt.verify(token, JWT_SECRET);
                console.log('User authenticated:', user.email);
            } catch (err) {
                console.log('Token verification failed:', err.message);
                res.clearCookie("token");
            }
        }
        
        const professionalsList = Array.isArray(professionals) ? professionals : [];
        
        res.render("electrician", { 
            user: user,
            professionals: professionalsList,
            error: null
        });
    } catch (error) {
        console.error('Error in /electrician route:', error);
        res.status(500).render("electrician", { 
            user: null,
            professionals: [],
            error: 'Failed to load electrician profiles. Please try again later. If the problem persists, contact support.'
        });
    }
});

app.get('/carpenter', async (req, res) => {
    try {
        console.log('Fetching carpenters...');
        const professionals = await Professional.find({ service: 'carpenter' }).lean();
        console.log(`Found ${professionals.length} carpenters`);
        
        const token = req.cookies.token;
        let user = null;
        
        if (token) {
            try {
                user = jwt.verify(token, JWT_SECRET);
                console.log('User authenticated:', user.email);
            } catch (err) {
                console.log('Token verification failed:', err.message);
                res.clearCookie("token");
            }
        }
        
        const professionalsList = Array.isArray(professionals) ? professionals : [];
        
        res.render("carpenter", { 
            user: user,
            professionals: professionalsList,
            error: null
        });
    } catch (error) {
        console.error('Error in /carpenter route:', error);
        res.status(500).render("carpenter", { 
            user: null,
            professionals: [],
            error: 'Failed to load carpenter profiles. Please try again later. If the problem persists, contact support.'
        });
    }
});

app.get('/plumber', async (req, res) => {
    try {
        console.log('Fetching plumbers...');
        const professionals = await Professional.find({ service: 'plumber' }).lean();
        console.log(`Found ${professionals.length} plumbers`);
        
        const token = req.cookies.token;
        let user = null;
        
        if (token) {
            try {
                user = jwt.verify(token, JWT_SECRET);
                console.log('User authenticated:', user.email);
            } catch (err) {
                console.log('Token verification failed:', err.message);
                res.clearCookie("token");
            }
        }
        
        const professionalsList = Array.isArray(professionals) ? professionals : [];
        
        res.render("plumber", { 
            user: user,
            professionals: professionalsList,
            error: null
        });
    } catch (error) {
        console.error('Error in /plumber route:', error);
        res.status(500).render("plumber", { 
            user: null,
            professionals: [],
            error: 'Failed to load plumber profiles. Please try again later. If the problem persists, contact support.'
        });
    }
});

app.get('/painter', async (req, res) => {
    try {
        console.log('Fetching painters...');
        const professionals = await Professional.find({ service: 'painter' }).lean();
        console.log(`Found ${professionals.length} painters`);
        
        const token = req.cookies.token;
        let user = null;
        
        if (token) {
            try {
                user = jwt.verify(token, JWT_SECRET);
                console.log('User authenticated:', user.email);
            } catch (err) {
                console.log('Token verification failed:', err.message);
                res.clearCookie("token");
            }
        }
        
        const professionalsList = Array.isArray(professionals) ? professionals : [];
        
        res.render("painter", { 
            user: user,
            professionals: professionalsList,
            error: null
        });
    } catch (error) {
        console.error('Error in /painter route:', error);
        res.status(500).render("painter", { 
            user: null,
            professionals: [],
            error: 'Failed to load painter profiles. Please try again later. If the problem persists, contact support.'
        });
    }
});

app.get('/gardener', async (req, res) => {
    try {
        console.log('Fetching gardeners...');
        const professionals = await Professional.find({ service: 'gardener' }).lean();
        console.log(`Found ${professionals.length} gardeners`);
        
        const token = req.cookies.token;
        let user = null;
        
        if (token) {
            try {
                user = jwt.verify(token, JWT_SECRET);
                console.log('User authenticated:', user.email);
            } catch (err) {
                console.log('Token verification failed:', err.message);
                res.clearCookie("token");
            }
        }
        
        const professionalsList = Array.isArray(professionals) ? professionals : [];
        
        res.render("gardener", { 
            user: user,
            professionals: professionalsList,
            error: null
        });
    } catch (error) {
        console.error('Error in /gardener route:', error);
        res.status(500).render("gardener", { 
            user: null,
            professionals: [],
            error: 'Failed to load gardener profiles. Please try again later. If the problem persists, contact support.'
        });
    }
});

app.get('/mover', async (req, res) => {
    try {
        console.log('Fetching movers...');
        const professionals = await Professional.find({ service: 'mover' }).lean();
        console.log(`Found ${professionals.length} movers`);
        
        const token = req.cookies.token;
        let user = null;
        
        if (token) {
            try {
                user = jwt.verify(token, JWT_SECRET);
                console.log('User authenticated:', user.email);
            } catch (err) {
                console.log('Token verification failed:', err.message);
                res.clearCookie("token");
            }
        }
        
        const professionalsList = Array.isArray(professionals) ? professionals : [];
        
        res.render("mover", { 
            user: user,
            professionals: professionalsList,
            error: null
        });
    } catch (error) {
        console.error('Error in /mover route:', error);
        res.status(500).render("mover", { 
            user: null,
            professionals: [],
            error: 'Failed to load mover profiles. Please try again later. If the problem persists, contact support.'
        });
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

// User login route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("User login attempt for email:", email);

        // Find the user in the database
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Login Failed: User not found");
            return res.render("login", { error: "Invalid email or password" });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Login Failed: Invalid password");
            return res.render("login", { error: "Invalid email or password" });
        }

        // Create token
        const token = generateToken({
            id: user._id,
            email: user.email,
            name: user.name,
            role: 'user' // Explicitly set role to 'user'
        });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log("User Login Successful!");
        res.redirect('/');
    } catch (err) {
        console.error("Login Error:", err);
        res.render("login", { error: "An error occurred while trying to log in. Please try again later." });
    }
});

// Sign-up routes
app.get("/sign-up", (req, res) => {
    res.render("sign-up", { error: null, success: null });
});

app.post("/sign-up", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("Sign-up attempt for email:", email);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Sign-up Failed: User already exists");
            return res.render("sign-up", { error: "Email already registered", success: null });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();
        console.log("User created successfully:", email);

        // Create token
        const token = generateToken({
            id: user._id,
            email: user.email,
            name: user.name,
            role: 'user' // Explicitly set role to 'user'
        });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.render("sign-up", { error: null, success: "Account created successfully! Redirecting to homepage..." });
        
        // JavaScript redirect will happen via the success message in the view
    } catch (err) {
        console.error("Sign-up Error:", err);
        res.render("sign-up", { error: "An error occurred while signing up. Please try again later.", success: null });
    }
});

app.get("/application", (req, res) => {
    res.render("application");
});

app.get("/prologin", (req, res) => {
    res.render("prologin", { error: null, success: null });
});

// Professional signup route
app.post("/application", upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'certificates', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, email, phone, service, experience, message, password } = req.body;
        console.log("Signup attempt for email:", email);

        // Check if professional already exists
        const existingProfessional = await Professional.findOne({ email });
        if (existingProfessional) {
            console.log("Signup Failed: Professional already exists");
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new professional
        const professional = new Professional({
            name,
            email,
            phone,
            service,
            experience,
            message,
            certificates: req.files['certificates'] ? `/uploads/${req.files['certificates'][0].filename}` : null,
            password: hashedPassword,
            profilePicture: req.files['profilePicture'] ? `/uploads/${req.files['profilePicture'][0].filename}` : '/images/default.jpg'
        });

        await professional.save();
        console.log("Professional created successfully:", email);

        // Create token
        const token = generateToken({
            id: professional._id,
            email: professional.email,
            name: professional.name,
            service: professional.service,
            experience: professional.experience,
            profilePicture: professional.profilePicture,
            role: 'professional' // Explicitly set role to 'professional'
        });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({ 
            success: true, 
            message: "Professional registered successfully", 
            redirect: "/dashboard?type=professional" 
        });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ 
            error: "An error occurred while registering. Please try again later." 
        });
    }
});

// Professional login route
app.post("/prologin", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for email:", email);

        const professional = await Professional.findOne({ email });
        if (!professional) {
            console.log("Login Failed: Professional not found");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, professional.password);
        if (!isMatch) {
            console.log("Login Failed: Invalid password");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Create token with all required user data
        const token = generateToken({
            id: professional._id,
            email: professional.email,
            name: professional.name,
            service: professional.service,
            experience: professional.experience,
            profilePicture: professional.profilePicture || '/images/default.jpg',
            role: 'professional' // Explicitly set role to 'professional'
        });
        
        // Set cookie with token
        res.cookie('token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log("Login Successful!");
        res.status(200).json({ success: true, message: "Login successful", redirect: "/dashboard" });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "An error occurred while trying to log in. Please try again later." });
    }
});

// Dashboard route
app.get('/dashboard', verifyToken, async (req, res) => {
  try {
    console.log('Dashboard route - User data:', {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    });
    
    // Check if the user is a professional or regular user
    if (req.user.role === 'professional') {
      console.log('Rendering professional dashboard');
      // For professionals - fetch bookings where they are the professional
      const bookings = await Booking.find({ professionalId: req.user.id })
        .sort({ updatedAt: -1 }) // Sort by latest updated first
        .lean();

      console.log(`Found ${bookings ? bookings.length : 0} bookings for professional`);

      return res.render('dashboard', { 
        user: req.user,
        bookings: bookings || []
      });
    } else {
      console.log('Rendering user dashboard');
      // For regular users - fetch bookings where they are the client
      const bookings = await Booking.find({ clientEmail: req.user.email })
        .sort({ updatedAt: -1 }) // Sort by latest updated first
        .lean();

      console.log(`Found ${bookings ? bookings.length : 0} bookings for user`);

      return res.render('user-dashboard', { 
        user: req.user,
        bookings: bookings || [],
        prologin: false
      });
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { 
      error: 'Failed to load dashboard', 
      message: 'An error occurred while loading your dashboard. Please try again later.' 
    });
  }
});

// Routes for professionals to accept or reject bookings
app.post('/api/bookings/:id/accept', verifyToken, async (req, res) => {
  try {
    // Verify the user is a professional
    if (req.user.role !== 'professional') {
      return res.status(403).json({ error: 'Only professionals can accept bookings' });
    }

    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify the professional is assigned to this booking
    if (booking.professionalId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to accept this booking' });
    }

    booking.status = 'accepted';
    booking.updatedAt = new Date();
    await booking.save();

    res.json({ success: true, message: 'Booking accepted successfully' });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ error: 'Failed to accept booking. Please try again.' });
  }
});

app.post('/api/bookings/:id/reject', verifyToken, async (req, res) => {
  try {
    // Verify the user is a professional
    if (req.user.role !== 'professional') {
      return res.status(403).json({ error: 'Only professionals can reject bookings' });
    }

    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify the professional is assigned to this booking
    if (booking.professionalId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to reject this booking' });
    }

    booking.status = 'rejected';
    booking.updatedAt = new Date();
    await booking.save();

    res.json({ success: true, message: 'Booking rejected successfully' });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ error: 'Failed to reject booking. Please try again.' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        res.status(500).json({ success: false, message: 'Something went wrong!' });
    } else {
        res.status(500).render('error', { message: 'Something went wrong!' });
    }
});
