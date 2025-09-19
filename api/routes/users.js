const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //hash paswrds
const jwt = require("jsonwebtoken");
const checkauth = require("../middleware/check-auth");

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then((user) => {
          res.status(201).json({ message: "user created", user: user });
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    }
  });
});
console.log("JWT_KEY:", process.env.JWT_KEY);

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({ message: "auth failed" });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err || !result) {
          // if bcrypt throws error OR password doesn’t match
          return res.status(401).json({ message: "auth failed" });
        }

        // password matched
        const token = jwt.sign(
          {
            email: user[0].email,
            userid: user[0]._id,
          },
          process.env.JWT_KEY, // private key
          {
            expiresIn: "1h",
          }
        );

        return res.status(200).json({
          message: "auth success",
          token: token,
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/verification", checkauth, (req, res, next) => {
  res.status(200).json({ message: "token verified " });
});

module.exports = router;
