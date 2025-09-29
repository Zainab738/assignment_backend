const express = require("express");
const upload = require("../../config/multerCloudinary");
const postController = require("../controllers/postController");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();

// Routes
router.post(
  "/create",
  upload.single("media"),
  checkAuth,
  postController.createPost
);
router.delete("/delete/:id", checkAuth, postController.deletePost);
router.patch(
  "/update/:id",
  checkAuth,
  upload.single("media"),
  postController.updatePost
);
router.get("/all", checkAuth, postController.showPost);
router.get("/feed", checkAuth, postController.feedPosts);
router.get("/:id", checkAuth, postController.getPostById);

router.post("/:id/like", checkAuth, postController.like);

router.post("/:id/comment", checkAuth, postController.comment);

module.exports = router;
