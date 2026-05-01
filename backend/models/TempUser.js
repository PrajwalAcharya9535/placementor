const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  otp: String,
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model("TempUser", tempUserSchema);