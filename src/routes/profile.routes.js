const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController")
const AuthenticationController = new AuthController();

const profileController = require("../controllers/profileController")

router.get("/", AuthenticationController.validateToken, profileController.getLoggedInUser);
router.put("/:id", AuthenticationController.validateToken, profileController.update);

module.exports = router;