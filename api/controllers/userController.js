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
      username: req.body.username,
      password: hash,
    });

    user
      .save()
      .then((user) => res.status(201).json({ message: "User created", user }))
      .catch((err) => res.status(500).json({ error: err }));
  });
};

//login
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user)
        return res.status(401).json({ message: "Wrong username or password" });

      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err || !result)
          return res
            .status(401)
            .json({ message: "Wrong username or password" });

        const token = jwt.sign(
          { email: user.email, userid: user._id, username: user.username },
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

// search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      username: { $regex: q, $options: "i" },
    }).select("username");

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ error: err.message });
  }
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
      "username email following"
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
// Update username
exports.updateUsername = async (req, res) => {
  try {
    const userId = req.userData.userid;
    const { username } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Username is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    ).select("username email");

    res.json({ message: "Username updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating username:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.userData.userid;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: err.message });
  }
};
