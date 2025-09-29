const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoute = require("./api/routes/users");
const postRoute = require("./api/routes/posts");

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoute);
app.use("/posts", postRoute);

module.exports = app;
