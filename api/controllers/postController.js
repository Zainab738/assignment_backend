const mongoose = require("mongoose");
const Post = require("../models/posts");
const cloudinary = require("../../config/cloudinary");

// CREATE Post
exports.createPost = (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null; // handle optional image
    const publicId = req.file ? req.file.filename : null;

    const post = new Post({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      content: req.body.content,
      image: imageUrl,
      publicId: publicId,
      user: req.userData.userid, // <-- use user ID from token
    });

    post
      .save()
      .then((savedPost) => {
        res.status(201).json({
          message: "Post created successfully",
          post: savedPost,
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE Post
exports.deletePost = (req, res) => {
  const postId = req.params.id;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      cloudinary.uploader.destroy(post.publicId, (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ error: "Failed to delete image from Cloudinary" });
        }

        Post.deleteOne({ _id: postId })
          .then(() => {
            res.status(200).json({
              message: "Post and image deleted successfully",
            });
          })
          .catch((err) => {
            res.status(500).json({ error: err.message });
          });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// UPDATE Post
exports.updatePost = (req, res) => {
  const postId = req.params.id;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (req.file) {
        cloudinary.uploader.destroy(post.publicId, (error, result) => {
          if (error) {
            return res
              .status(500)
              .json({ error: "Failed to delete old image from Cloudinary" });
          }

          post.title = req.body.title || post.title;
          post.content = req.body.content || post.content;
          post.image = req.file.path;
          post.publicId = req.file.filename;

          return post.save().then((updatedPost) => {
            res.status(200).json({
              message: "Post updated successfully",
              post: updatedPost,
            });
          });
        });
      } else {
        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;

        return post.save().then((updatedPost) => {
          res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost,
          });
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Show all posts for logged-in user
exports.showPost = (req, res) => {
  Post.find({ user: req.userData.userid }) // fetch only this user's posts
    .then((posts) => {
      res.status(200).json({
        message: "Posts fetched successfully",
        posts: posts,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Show single post by ID
exports.getPostById = (req, res) => {
  const postId = req.params.id;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json(post);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};
