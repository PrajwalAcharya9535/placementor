const mongoose = require("mongoose");
const Question = require("./models/Question");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const count = await Question.countDocuments();

    console.log("🔥 Total Questions:", count);

    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });