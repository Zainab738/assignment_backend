const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: err });

    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: req.body.email,
      password: hash,
    });

    user
      .save()
      .then((user) => res.status(201).json({ message: "user created", user }))
      .catch((err) => res.status(500).json({ error: err }));
  });
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) return res.status(401).json({ message: "auth failed" });

      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err || !result)
          return res.status(401).json({ message: "auth failed" });

        const token = jwt.sign(
          { email: user.email, userid: user._id },
          process.env.JWT_KEY,
          { expiresIn: "1h" }
        );

        res.status(200).json({ message: "auth success", token });
      });
    })
    .catch((err) => res.status(500).json({ error: err }));
};

exports.verifyToken = (req, res, next) => {
  res.status(200).json({ message: "token verified" });
};
