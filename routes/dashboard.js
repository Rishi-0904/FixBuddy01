const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Professional = require("../models/professional");
const Booking = require('../models/Booking');
const { verifyToken, requireProfessional } = require('../config/auth');

// Middleware
router.use(cookieParser());

// Only handle professional-specific dashboard routes in this file
// This will be mounted at /professional/dashboard
router.get('/professional/dashboard', [verifyToken, requireProfessional], async (req, res) => {
  try {
    const professional = await Professional.findById(req.user.id);
    if (!professional) {
      res.clearCookie("token");
      return res.render("prologin", { error: "Professional not found. Please login again." });
    }

    const bookings = await Booking.find({ professionalId: professional._id });
    console.log("Fetched bookings for professional:", professional.email, bookings.length);
    
    return res.render('dashboard', { 
      user: professional,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching professional dashboard data:', error);
    return res.render('dashboard', { 
      user: req.user,
      bookings: [],
      error: 'Error loading bookings. Please try again later.'
    });
  }
});

// API Routes
router.get('/api/professional/bookings', [verifyToken, requireProfessional], async (req, res) => {
  try {
    const bookings = await Booking.find({ professionalId: req.user.id });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching professional bookings:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.post('/api/bookings/:bookingId/status', [verifyToken, requireProfessional], async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find and update the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify that the booking belongs to the professional
    if (booking.professionalId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update the booking status
    booking.status = status;
    await booking.save();

    res.json({ success: true, message: `Booking ${status} successfully` });
  } catch (error) {
    console.error('Error updating booking status:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
