const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const aptitudeRoutes = require("./routes/aptitudeRoutes");

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/aptitude", aptitudeRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/placementor")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log(err));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});