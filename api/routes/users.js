const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const checkauth = require("../middleware/check-auth");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/verification", checkauth, userController.verifyToken);

module.exports = router;
