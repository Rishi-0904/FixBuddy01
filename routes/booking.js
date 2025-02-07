// routes/booking.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');  // Adjust the path accordingly
router.get('/book', (req, res) => {
    res.send('Booking Page');
  });
// Define the booking route
router.post('/api/book', (req, res) => {
  const { clientName, clientEmail, serviceName, date, message, professionalEmail } = req.body;

  // Validate required fields
  if (!clientName || !clientEmail || !serviceName || !date || !professionalEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Create a new booking object
  const booking = new Booking({
    clientName,
    clientEmail,
    serviceName,
    date,
    message,
    professionalEmail,
    status: 'pending', // Default status
  });

  // Save the booking to the database
  booking.save()
    .then(() => {
      res.json({ message: 'Booking successfully created!' });
    })
    .catch(err => {
      console.error('Error saving booking:', err);
      res.status(500).json({ error: 'Error saving booking' });
    });
});

module.exports = router;  // Ensure this line is present
