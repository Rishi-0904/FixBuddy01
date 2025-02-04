const express = require("express");
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
app.use(express.static("public"))
const PORT = 3000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use((req, res, next) => {
    res.locals.user = null; // Initialize `user` property to avoid undefined error

    const token = req.cookies.token;
    
    if (token) {
        try {
            const decoded = jwt.verify(token, "sekurety");
            res.locals.user = decoded; // Attach user data to all views
        } catch (err) {
            console.error("JWT Verification Error:", err);
        }
    }
    
    next();
});


app.set("view engine" , "ejs")


// Connecting  to MongoDB
mongoose.connect("mongodb://localhost:27017/myDatabase", {
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));


// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String

});

const User = mongoose.model("User", userSchema);

app.get('/' , (req,res)=>{
    res.render("index")
})

app.get('/contact' , (req,res)=>{
    res.render("contact")
})

app.get("/login" , (req , res)=>{
    res.render("login")
})
app.get('/electrician' , (req,res)=>{
    res.render("electrician")
})
app.get('/carpenter' , (req,res)=>{
    res.render("carpenter")
})
app.get('/plumber' , (req,res)=>{
    res.render("plumber")
})

app.get('/sign-up' , (req,res)=>{
    res.render("sign-up")
})

app.post("/sign-up", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log(req.body); 

        if (!name || !email || !password ) {
            return  res.render("sign-up", { error: "All fields are required !!" });
        }


        // Checking if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.render("sign-up", { error: "Email already in use !!" });

        // Hashing passwords
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.render("sign-up", { error: null, success: "Signup successful! Redirecting..." });

    } catch (err) {
        res.status(500).json({ message: "Error signing up", error: err.message });
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log({email, password})

        const user = await User.findOne({ email });
        if (!user) return res.render("login", { error: "Invalid Username or Email !!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.render("login", { error: "Invalid Username or Email !!" });

        const token = jwt.sign({ id: user._id, email: user.email }, "sekurety" , { expiresIn: "1h" });
        
        res.cookie("token", token, { httpOnly: true }); 
        res.render( "login", { error :null , success: "Login successful !!" });
    } catch (err) {
        res.render("login", { error: err.message });
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("token"); // Remove token from cookies
    res.render("index" , {success: "Logged Out Successfully "}); // Redirect to home page after logout
});


const authenticateUser = (req, res, next) => {
res.locals.user = null; // Initialize `user` property to avoid undefined error

    const token = req.cookies.token ;

    
    if (!token) {
        return  res.render("login", { error: "Please login first !!" });
    }

    try {
        const decoded = jwt.verify(token, "sekurety" );
        req.user = decoded; // Attach user info to request
        res.local.user=decoded;
        next();
    } catch (error) {
        res.local.user=null;
        res.render("login", { error: "Please login first !!" });
    }
};

//  PROTECTED ROUTE 
app.get("/profile", authenticateUser, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return  res.render("/profile", { error: "No user found !!" });

    res.render("profile")
});

// Starting the Server
app.listen(PORT, () => {
    console.log(`Server is running...`);
});
