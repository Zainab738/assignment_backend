const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // Cloudinary URL
  publicId: { type: String },
});

module.exports = mongoose.model("Post", postSchema);
