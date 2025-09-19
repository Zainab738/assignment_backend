const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./api/routes/users");
const cors = require("cors");
const app = express();

app.use(cors());
// MongoDB connection

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use("/route", userRoute);
module.exports = app;
