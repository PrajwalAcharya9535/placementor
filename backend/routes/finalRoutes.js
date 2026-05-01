const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");

const {getFinalResult} = require("../controllers/finalController");

router.get("/final",protect,getFinalResult);

router.post("/complete", async (req, res) => {
  const { round, score } = req.body;

  // Example logic (adjust as per your schema)
  res.json({
    message: `${round} round completed`,
    score
  });
});

module.exports = router;