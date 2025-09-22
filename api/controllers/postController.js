const mongoose = require("mongoose");
const Post = require("../models/posts");
const cloudinary = require("../../config/cloudinary");

// CREATE Post
exports.createPost = (req, res) => {
  const imageUrl = req.file.path; // Cloudinary URL
  const publicId = req.file.filename; // Cloudinary public_id

  const post = new Post({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    content: req.body.content,
    image: imageUrl,
    publicId: publicId,
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
