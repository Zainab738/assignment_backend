const mongoose = require("mongoose");
const Post = require("../models/posts");
const User = require("../models/user");
const cloudinary = require("../../config/cloudinary");

// CREATE Post
exports.createPost = async (req, res) => {
  try {
    let mediaUrl = null;
    let publicId = null;
    let mediaType = "image";

    if (req.file) {
      mediaUrl = req.file.path;
      publicId = req.file.filename;

      if (req.file.mimetype.startsWith("video/")) mediaType = "video";
    }

    const post = new Post({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      content: req.body.content,
      media: mediaUrl,
      mediaType: mediaType,
      publicId: publicId,
      user: req.userData.userid,
    });

    const savedPost = await post.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post: savedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Delete media from Cloudinary if exists
    if (post.publicId) {
      await cloudinary.uploader.destroy(post.publicId, {
        resource_type: post.mediaType,
      });
    }

    await Post.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE Post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.file) {
      if (post.publicId) {
        await cloudinary.uploader.destroy(post.publicId, {
          resource_type: post.mediaType,
        });
      }

      post.media = req.file.path;
      post.publicId = req.file.filename;
      post.mediaType = req.file.mimetype.startsWith("video/")
        ? "video"
        : "image";
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;

    const updatedPost = await post.save();
    res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Show all posts for logged-in user
exports.showPost = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userData.userid })
      .sort({ createdAt: -1 })
      .populate("user", "username email")
      .populate("comments.user", "username email");
    res.status(200).json({ message: "Posts fetched successfully", posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Show single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "email")
      .populate("comments.user", "email");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FEED posts for followed users
exports.feedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userid).select("following");
    if (!user) return res.status(404).json({ message: "User not found" });

    const followingIds = user.following || [];

    const posts = await Post.find({ user: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate("user", "username email")
      .populate("comments.user", "username email");

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TOGGLE LIKE
exports.like = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.userData.userid;

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes, liked: post.likes.includes(userId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD COMMENT
exports.comment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: req.userData.userid,
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.findById(req.params.id).populate(
      "comments.user",
      "username email"
    );

    res.json({ comments: populatedPost.comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
