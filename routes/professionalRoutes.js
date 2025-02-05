const express = require('express');
const Professional = require('../models/professional'); // Import the Professional model
const router = express.Router();

// Pre-filled Electricians
const preFilledElectricians = [
  { 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '123-456-7890', 
    service: 'Electrician', 
    experience: 5, 
    message: 'Experienced in residential and commercial electrical work.', 
    profilePicture: '/uploads/john.jpg', 
    rating: 4.5 // Ensure pre-filled data has a rating
  },
  { 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '987-654-3210', 
    service: 'Electrician', 
    experience: 3, 
    message: 'Specializes in troubleshooting and repair.', 
    profilePicture: '/uploads/jane.jpg', 
    rating: 4.8 // Ensure pre-filled data has a rating
  }
];

// Route to get all professionals
router.get('/professionals', (req, res) => {
    Professional.find()
      .then(professionals => {
        // Combine pre-filled electricians with the database records
        const combinedData = [...preFilledElectricians, ...professionals];

        // Log the combined data to check the structure
        console.log("Combined Data:", combinedData); // Log the data for debugging
  
        // Sort the combined data by rating in descending order
        combinedData.sort((a, b) => (b.rating || 0) - (a.rating || 0));  // Handle undefined ratings
    
        // Send the sorted data as a response
        res.json(combinedData);
      })
      .catch(err => {
        res.status(500).json({ message: "Error fetching professionals", error: err.message });
      });
});

module.exports = router;
