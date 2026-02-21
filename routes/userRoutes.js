const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

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


module.exports = router;