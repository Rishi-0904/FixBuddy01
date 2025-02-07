// models/Booking.js
const mongoose = require('mongoose');

// Define the schema for the booking
const bookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  serviceName: { type: String, required: true },
  date: { type: Date, required: true },
  message: { type: String, required: false },
  professionalEmail: { type: String, required: true },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
