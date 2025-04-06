const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Professional = require('../models/professional');

router.post('/bookings', async (req, res) => {
    try {
        const { 
            professionalId,
            professionalName,
            professionalEmail,
            serviceType,
            clientName, 
            clientEmail, 
            clientPhone, 
            serviceAddress, 
            preferredDate, 
            preferredTime, 
            serviceDescription
        } = req.body;

        // Validate required fields
        if (!professionalId || !professionalName || !professionalEmail || !serviceType || 
            !clientName || !clientEmail || !clientPhone || !serviceAddress || 
            !preferredDate || !preferredTime) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        // Validate date format and ensure it's not in the past
        const bookingDate = new Date(preferredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(bookingDate.getTime()) || bookingDate < today) {
            return res.status(400).json({ error: 'Please select a valid future date' });
        }

        // Find the professional
        const professional = await Professional.findById(professionalId);
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        // Create new booking
        const booking = new Booking({
            serviceType,
            professionalId,
            professionalName,
            professionalEmail,
            clientName,
            clientEmail,
            clientPhone,
            serviceAddress,
            preferredDate: bookingDate,
            preferredTime,
            serviceDescription: serviceDescription || '',
            status: 'pending'
        });

        await booking.save();
        console.log('Booking created successfully:', booking._id);
        res.json({ message: 'Booking successfully created!' });
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({ error: 'An error occurred while creating the booking. Please try again.' });
    }
});

module.exports = router;
