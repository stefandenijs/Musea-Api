const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController")
const AuthenticationController = new AuthController();

const recommendationController = require("../controllers/recommendationController");

router.get('/user/:id/recommendations/not-bought', AuthenticationController.validateToken, recommendationController.notBought)
router.get('/user/:id/recommendations/visited-by-friends', AuthenticationController.validateToken, recommendationController.visitedByFriends)

module.exports = router;