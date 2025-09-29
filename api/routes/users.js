const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkAuth = require("../middleware/checkAuth");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/verification", checkAuth, userController.verifyToken);
router.get("/search", checkAuth, userController.searchUsers);
router.post("/follow/:id", checkAuth, userController.followUser);
router.post("/unfollow/:id", checkAuth, userController.unfollowUser);
router.get("/me", checkAuth, userController.me);
router.get("/followers", checkAuth, userController.getFollowers);
router.get("/following", checkAuth, userController.getFollowing);
router.post("/unfollow/:id", checkAuth, userController.unfollowUser);
router.put("/update-username", checkAuth, userController.updateUsername);
router.put("/update-password", checkAuth, userController.updatePassword);
module.exports = router;
