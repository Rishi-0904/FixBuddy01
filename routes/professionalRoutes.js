const express = require('express');
const Professional = require('../models/professional'); // Relative path to models/professional.js

const router = express.Router();

router.post('/', (req, res) => {
    const { name, email, phone, service, experience, message } = req.body;
    const profilePicture = req.files['profile-picture'] ? req.files['profile-picture'][0].path : '';
    const certificates = req.files['certificates'] ? req.files['certificates'][0].path : '';

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

    // Save the professional data to the database
    newProfessional.save()
        .then(() => {
            res.status(201).json({ message: "Application submitted successfully" });
        })
        .catch(err => {
            res.status(500).json({ message: "Error submitting application", error: err });
        });
});

module.exports = router;
router.get('/professionals', (req, res) => {
    Professional.find({ service: 'electrician' })  // Only fetch electricians
        .then(professionals => {
            res.json(professionals);  // Send the array of professionals as a JSON response
        })
        .catch(err => {
            res.status(500).json({ message: "Error fetching professionals", error: err });
        });
});
router.get('/professionals', (req, res) => {
    Professional.find()
        .then(professionals => {
            res.json(professionals);
        })
        .catch(err => {
            res.status(500).json({ message: "Error fetching professionals", error: err });
        });
});
