const mongoose = require("mongoose");

const ProfessionalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  experience: { type: Number, required: true },
  message: { type: String },
  profilePicture: { type: String },
  certificates: { type: String },
  password: { type: String, required: true },
});

module.exports = mongoose.model("Professional", ProfessionalSchema);
