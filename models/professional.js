const mongoose = require('mongoose');

// Professional schema
const professionalSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    service: String,
    experience: Number,
    message: String,
    profilePicture: String, // Path to the uploaded file
    certificates: String,   // Path to the uploaded certificate file
    createdAt: { type: Date, default: Date.now }
});

// Export the Professional model
module.exports = mongoose.model('Professional', professionalSchema);
