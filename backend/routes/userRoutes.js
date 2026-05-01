const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const User = require("../models/User");

const {
  registerUser,
  loginUser,
  uploadResume,
  matchJobDescription
} = require("../controllers/userController");

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// UPLOAD RESUME
router.post("/upload/:id", upload.single("resume"), uploadResume);

//jod description
router.post("/match-job/:id", matchJobDescription);

// GET ALL USERS (Temporary for testing)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});
module.exports = router;