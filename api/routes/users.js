const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkauth = require("../middleware/check-auth");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/verification", checkauth, userController.verifyToken);
router.get("/search", checkauth, userController.searchUsers);
router.post("/follow/:id", checkauth, userController.followUser);
router.post("/unfollow/:id", checkauth, userController.unfollowUser);
router.get("/me", checkauth, userController.me);
router.get("/followers", checkauth, userController.getFollowers);
router.get("/following", checkauth, userController.getFollowing);
router.post("/unfollow/:id", checkauth, userController.unfollowUser);

module.exports = router;
