const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const getModel = require("./model_cache");

const FriendRequestSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "A friend request requires the user who send it"],
        autopopulate: {
            select: "_id firstName lastName email",
        },
    },
});

FriendRequestSchema.pre("remove", async function(next) {
    const User = mongoose.model("User");

    await User.updateMany({ friendRequests: this._id }, { $pull: { friendRequests: { $in: this._id } } }, { multi: true });

    next();
});

FriendRequestSchema.plugin(require("mongoose-autopopulate"));

module.exports = getModel("FriendRequest", FriendRequestSchema);