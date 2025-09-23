const express = require("express");
const upload = require("../../config/multerCloudinary");
const postController = require("../controllers/postController");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

// Routes
router.post(
  "/create",
  upload.single("image"),
  checkAuth,
  postController.createPost
);
router.delete("/delete/:id", checkAuth, postController.deletePost);
router.patch(
  "/update/:id",
  checkAuth,
  upload.single("image"),
  postController.updatePost
);
router.get("/all", checkAuth, postController.showPost);
router.get("/:id", checkAuth, postController.getPostById);

module.exports = router;
