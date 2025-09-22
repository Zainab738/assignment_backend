const express = require("express");
const upload = require("../../config/multerCloudinary");
const postController = require("../controllers/postController");

const router = express.Router();

// Routes
router.post("/", upload.single("image"), postController.createPost);
router.delete("/:id", postController.deletePost);
router.patch("/:id", upload.single("image"), postController.updatePost);

module.exports = router;
