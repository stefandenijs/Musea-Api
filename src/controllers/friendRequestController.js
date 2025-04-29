const User = require("../models/user.model")();
const FriendRequest = require("../models/friendRequest.model")();

const neo = require("../../neo");

const errors = require("../errors");

async function sendFriendRequest(req, res) {
    if (!req.params.id) {
        throw new errors.BadRequestError("Request requires an id");
    }

    if (!req.body) {
        throw new errors.BadRequestError("Missing or malformed JSON body");
    }

    if (!req.body.senderId) {
        throw new errors.BadRequestError("JSON body missing userId from sender");
    }

    const userReceiver = await User.findById(req.params.id);

    if (!userReceiver) {
        throw new errors.EntityNotFoundError("Receiving user not found");
    }

    const userSender = await User.findById(req.body.senderId);

    if (!userSender) {
        throw new errors.EntityNotFoundError("Sending user not found");
    }

    if (req.userId !== userSender._id.toString()) {
        throw new errors.AuthorizationError("Requesting user is not sender");
    }

    const checkForRequest = await FriendRequest.findOne({
        sender: userSender.id,
    });

    if (checkForRequest) {
        throw new errors.EntityAlreadyExists(
            "A request has already been send to this user"
        );
    }

    if (
        userSender &&
        userReceiver &&
        userSender.friends.some(
            (f) => f._id.toString() === userReceiver._id.toString()
        )
    ) {
        throw new errors.EntityAlreadyExists("User is already a friend of sender");
    }

    const request = new FriendRequest({ sender: userSender._id });
    await request.save();

    userReceiver.friendRequests.push(request);
    await userReceiver.save();

    res.status(200).json(request);
}

async function acceptRequest(req, res) {
    if (!req.params.id) {
        throw new errors.BadRequestError("User id missing");
    }
    if (!req.params.reqId) {
        throw new errors.BadRequestError("Request id missing");
    }

    const user = await User.findById(req.params.id);
    const request = await FriendRequest.findById(req.params.reqId);

    if (!user) {
        throw new errors.EntityNotFoundError("User was not found");
    }

    if (req.userId !== user._id.toString()) {
        throw new errors.AuthorizationError("Requesting user is not receiver");
    }

    if (!request) {
        throw new errors.EntityNotFoundError("Request was not found");
    }

    const sender = await User.findById(request.sender._id);

    if (!sender) {
        throw new errors.EntityNotFoundError("User who send request was not found");
    }

    try {
        const session = neo.session();

        await session.run(neo.acceptRequest, {
            id: user._id.toString(),
            sendId: sender._id.toString(),
        });

        session.close();

        user.friends.push(sender);
        sender.friends.push(user);

        await user.save();
        await sender.save();

        await FriendRequest.findOneAndDelete(request._id);

        res.status(200).json(request._id.toString());
    } catch (err) {
        console.log(err);
        throw new errors.InternalServerError("Request could not be processed");
    }
}

async function refuseRequest(req, res) {
    if (!req.params.id) {
        throw new errors.BadRequestError("User id missing");
    }
    if (!req.params.reqId) {
        throw new errors.BadRequestError("Request id missing");
    }

    const user = await User.findById(req.params.id);
    const request = await FriendRequest.findById(req.params.reqId);

    if (!user) {
        throw new errors.EntityNotFoundError("User was not found");
    }

    if (req.userId !== user._id.toString()) {
        throw new errors.AuthorizationError("Requesting user is not receiver");
    }

    if (!request) {
        throw new errors.EntityNotFoundError("Request was not found");
    }

    const sender = await User.findById(request.sender._id);

    if (!sender) {
        throw new errors.EntityNotFoundError("User who send request was not found");
    }

    try {
        await request.delete();

        res.status(200).json({
            _id: request.id.toString(),
        });
    } catch (err) {
        console.log(err);
        throw new errors.InternalServerError("Request could not be processed");
    }
}

async function removeFriend(req, res) {
    if (!req.params.id) {
        throw new errors.BadRequestError("Request requires remover user id");
    }

    if (!req.params.friendId) {
        throw new errors.BadRequestError("Request requires friend user id");
    }

    const remover = await User.findById(req.params.id);

    if (!remover) {
        throw new errors.EntityNotFoundError("Remover user was not found");
    }

    if (req.userId !== remover._id.toString()) {
        throw new errors.AuthorizationError("Requesting user is not remover");
    }

    const removed = await User.findById(req.params.friendId);

    if (!removed) {
        throw new errors.EntityNotFoundError("Removed user was not found");
    }

    try {
        const session = neo.session();

        await session.run(neo.removeFriend, {
            id: remover._id.toString(),
            friendId: removed._id.toString(),
        });

        session.close();

        remover.friends.pull({ _id: removed._id });
        removed.friends.pull({ _id: remover._id });

        await remover.save();
        await removed.save();

        res.status(204).end();
    } catch (err) {
        console.log(err);
        throw new errors.InternalServerError("Request could not be processed");
    }
}

module.exports = {
    sendFriendRequest,
    acceptRequest,
    refuseRequest,
    removeFriend,
};