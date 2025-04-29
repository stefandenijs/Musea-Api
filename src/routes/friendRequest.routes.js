const express = require("express");
const router = express.Router();

const friendRequestController = require("../controllers/friendRequestController");

const AuthController = require("../controllers/authController");
const AuthenticationController = new AuthController();

router.put(
    "/:id/accept/:reqId",
    AuthenticationController.validateToken,
    friendRequestController.acceptRequest
);
router.delete(
    "/:id/refuse/:reqId/",
    AuthenticationController.validateToken,
    friendRequestController.refuseRequest
);
router.post(
    "/:id",
    AuthenticationController.validateToken,
    friendRequestController.sendFriendRequest
);
router.delete("/:id/friend/:friendId",
    AuthenticationController.validateToken, friendRequestController.removeFriend);

module.exports = router;