const User = require("../models/user.model")();
const FriendRequest = require("../models/friendRequest.model")();

const errors = require("../errors");

async function getLoggedInUser(req, res) {
    const user = await User.findById(req.userId).populate({
        path: "friendRequests",
        select: "sender",
    });
    res.status(200).send(user);
}

async function update(req, res) {
    if (!req.params.id) {
        throw new errors.EntityNotFoundError("Request is missing profile id");
    }

    if (!req.body) {
        throw new errors.EntityNotFoundError("Request is missing a body");
    }

    const checkForUser = await User.findOne({ email: req.body.email });

    if (checkForUser && req.params.id !== checkForUser._id.toString()) {
        throw new errors.EntityAlreadyExists("A user on this email already exists");
    }

    const checkIfuser = await User.findById(req.params.id);

    if (checkIfuser._id.toString() !== req.userId) {
        throw new errors.AuthorizationError(
            "Token id is not the same as profile id"
        );
    }

    await User.findByIdAndUpdate(req.params.id, req.body);
    res.status(204).end();
}

module.exports = {
    getLoggedInUser,
    update,
};