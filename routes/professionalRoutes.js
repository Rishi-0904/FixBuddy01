const express = require('express');
const multer = require('multer');
const path = require('path');
const Professional = require('../models/professional'); // Import the Professional model
const router = express.Router();

// Set up file upload with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// POST route for submitting a job application
router.post('/submit-job-application', upload.fields([{ name: 'profile-picture' }, { name: 'certificates' }]), (req, res) => {
    const { name, email, phone, service, experience, message } = req.body;
    const profilePicture = req.files['profile-picture'] ? req.files['profile-picture'][0].path : '';
    const certificates = req.files['certificates'] ? req.files['certificates'][0].path : '';

    if (!name || !email || !phone || !service || !experience || !message) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new professional entry
    const newProfessional = new Professional({
        name,
        email,
        phone,
        service,
        experience,
        message,
        profilePicture,
        certificates
    });

    // Save the new professional entry to the database
    newProfessional.save()
        .then(() => {
            res.status(201).json({ message: "Job application submitted successfully!" });
        })
        .catch(err => {
            res.status(500).json({ message: "Error submitting job application", error: err.message });
        });
});

module.exports = router;
