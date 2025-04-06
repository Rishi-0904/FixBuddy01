const express = require("express");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

const router = express.Router();

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true }
});

const Contact = mongoose.model("Contact", contactSchema);

// Add GET route for contact page
router.get("/contact", (req, res) => {
  const token = req.cookies.token;
  let user = null;
  
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.clearCookie("token");
    }
  }
  
  res.render("contact", { user: user });
});

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;


  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving contact message", error: err.message });
  }
});

module.exports = router;
