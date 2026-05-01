const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const OTP = require("../models/OTP");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

// EMAIL CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= REGISTER - SEND OTP =================
router.post("/send-register-otp", async (req, res) => {
  const { email } = req.body;

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "User already exists" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.deleteMany({ email });

  await OTP.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Registration OTP",
    text: `Your OTP is ${otp}`
  });

  res.json({ message: "OTP sent" });
});

// ================= VERIFY REGISTER =================
router.post("/verify-register", async (req, res) => {
  const { name, email, otp, password } = req.body;

  const record = await OTP.findOne({ email, otp });

  if (!record)
    return res.status(400).json({ message: "Invalid OTP" });

  if (record.expiresAt < new Date())
    return res.status(400).json({ message: "OTP expired" });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ name, email, password: hashed });

  await OTP.deleteMany({ email });

  res.json({ message: "Registration successful" });
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

res.json({
  message: "Login successful",
  token,
  email: user.email,   // ✅ ADD THIS
  name: user.name      // optional
});
});



// ================= FORGOT PASSWORD (LINK SYSTEM) =================

router.post("/forgot-password", async (req, res) => {

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetExpire = Date.now() + 15 * 60 * 1000; // 15 min

  await user.save();

  const link = `http://localhost:3000/reset/${token}`;

try {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password",
    text: `Click this link to reset password: ${link}`
  });
} catch (err) {
  console.log(err);
  return res.status(500).json({ message: "Email failed" });
}

  res.json({ message: "Reset link sent" });
});

// ================= RESET PASSWORD =================
// ================= RESET PASSWORD (LINK SYSTEM) =================
router.post("/reset-password/:token", async (req, res) => {

  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetExpire: { $gt: Date.now() }
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired link" });

  // ❗ prevent same password reuse
  const same = await bcrypt.compare(newPassword, user.password);

  if (same)
    return res.status(400).json({ message: "Use different password" });

  user.password = await bcrypt.hash(newPassword, 10);

  user.resetToken = undefined;
  user.resetExpire = undefined;

  await user.save();

  res.json({ message: "Password updated successfully" });
});


const client = new OAuth2Client("844627102295-5vam3k5edk5l0ai5pe8l4ufl34g796pi.apps.googleusercontent.com");

router.post("/google-login", async (req, res) => {

  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: "844627102295-5vam3k5edk5l0ai5pe8l4ufl34g796pi.apps.googleusercontent.comYOUR_GOOGLE_CLIENT_ID",
  });

  const payload = ticket.getPayload();

  const { email, name } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: "google-auth" // dummy
    });
  }

  const jwtToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

res.json({
  token: jwtToken,
  email: user.email,   // ✅ ADD
  name: user.name
});
});

module.exports = router;