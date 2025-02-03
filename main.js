const express = require("express");
const path = require('path');

const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(express.static("public"))

app.use(cors());

const PORT = 3000;


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

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


app.get('/sign-up' , (req,res)=>{
    res.render("sign-up")
})

app.post("/sign-up", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log(req.body); 

        if (!name || !email || !password ) {
            return res.status(400).json({ message: "All fields are required" });
        }


        // Checking if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already in use" });

        // Hashing passwords
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error signing up", error: err.message });
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log({email, password})

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id, email: user.email }, "secretKey", { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
});

const authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], "secretKey"); 
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid token" });
    }
};

//  PROTECTED ROUTE 
app.get("/profile", authenticateJWT, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile fetched", user });
});

// Starting the Server
app.listen(PORT, () => {
    console.log(`Server is running...`);
});
