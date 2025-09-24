const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//new user
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

//login
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

//token verification
exports.verifyToken = (req, res, next) => {
  res.status(200).json({ message: "token verified" });
};

//search users
exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  const users = await User.find({ email: { $regex: q, $options: "i" } }); //nt cse sensitive
  res.status(200).json({ users });
};

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const userId = req.userData.userid; // logged-in user
    const targetId = req.params.id; // user to follow

    if (userId === targetId)
      return res.status(400).json({ message: "You cannot follow yourself" });

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (user.following.includes(targetId))
      return res.status(400).json({ message: "Already following this user" });

    user.following.push(targetId);
    targetUser.followers.push(userId);

    await user.save();
    await targetUser.save();

    res.status(200).json({ message: "User followed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const loggedInUserId = req.userData.userid;
    const unfollowId = req.params.id;

    // Remove from logged-in user's following list
    await User.findByIdAndUpdate(
      loggedInUserId,
      { $pull: { following: unfollowId } },
      { new: true }
    );

    // Remove logged-in user from target user's followers list
    await User.findByIdAndUpdate(
      unfollowId,
      { $pull: { followers: loggedInUserId } },
      { new: true }
    );

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logged-in user profile
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userid).select(
      "following email"
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userid).populate(
      "followers",
      "email"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ followers: user.followers });
  } catch (err) {
    console.error("Error fetching followers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userid).populate(
      "following",
      "email"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ following: user.following });
  } catch (err) {
    console.error("Error fetching following:", err);
    res.status(500).json({ message: "Server error" });
  }
};
