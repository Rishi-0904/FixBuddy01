const express = require("express");
const path = require('path');

const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(express.static("public"))
const cookieParser = require("cookie-parser"); 
const authenticateJWT = require("./middlewares/auth");
app.use(cors());

const PORT = 3000;


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());  // This should be before authenticateJWT
app.use(authenticateJWT);
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
    res.render("index",{ user: req.user })
})

app.get('/contact' , (req,res)=>{
    res.render("contact")
})

app.get("/login" , (req , res)=>{
    res.render("login")
})
app.get("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the JWT token cookie
    res.redirect("/"); // Redirect to homepage after logout
});
app.get('/application' , (req,res)=>{
    res.render("application",{ user: req.user })
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
app.get('/plumber' , (req,res)=>{
    res.render("plumber")
})
app.get('/cleaner' , (req,res)=>{
    res.render("cleaner")
})
app.get('/painter' , (req,res)=>{
    res.render("painter")
})
app.get('/gardener' , (req,res)=>{
    res.render("gardener")
})
app.get('/mover' , (req,res)=>{
    res.render("mover")
})
app.get('/repair' , (req,res)=>{
    res.render("repair")
})
app.get('/pestcontrol' , (req,res)=>{
    res.render("pestcontrol")
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

        // res.status(201).json({ message: "User registered successfully" });
        // alert("Signup Successful! Redirecting to Home Page...");
        // window.location.href = "/"; // Redirect to home page

        res.render("sign-up", { error: null, success: "Signup successful! Please log in to continue." });

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

        const token = jwt.sign({ id: user._id, email: user.email }, "secretKey", { expiresIn: "1h" });
        res.cookie('token', token, { httpOnly: true }); 
        return res.redirect("/");
        // res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
});



//  PROTECTED ROUTE 
app.get("/profile", authenticateJWT, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile fetched", user });
});
const contactRouter = require("./routes/contact");

app.use(contactRouter); // Mount the contact routes

// Starting the Server
app.listen(PORT, () => {
    console.log(`Server is running...`);
});
