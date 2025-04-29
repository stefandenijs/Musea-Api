const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");

const AuthenticationController = new AuthController();

router.post("/login", AuthenticationController.login);
router.post("/register", AuthenticationController.register);

module.exports = router;