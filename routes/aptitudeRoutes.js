const express = require("express");
const router = express.Router();

const {
  getAptitudeQuestions,
  submitAptitudeTest
} = require("../controllers/aptitudeController");

router.get("/questions", getAptitudeQuestions);
router.post("/submit", submitAptitudeTest);

module.exports = router;