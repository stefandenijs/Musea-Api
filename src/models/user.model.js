const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const neo = require("../../neo");
const getModel = require("./model_cache");

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "A user needs a first name"],
    },
    lastName: {
        type: String,
        required: [true, "A user needs a last name"],
    },
    email: {
        type: String,
        required: [true, "A user needs an email"],
        unique: [true, "The same email can't be used for multipe users"],
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please fill in a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "A user requires a password"],
    },
    gender: {
        type: String,
        required: [true, "Chosen gender is required for a user"],
    },
    birthDate: {
        type: Date,
        required: [true, "A user needs to have a birth date"],
        validate: {
            validator: (birthDate) => {
                return birthDate < Date.now();
            },
            message: "Date of birth cannot be in the future.",
        },
    },
    role: {
        type: String,
        required: [true, "A user needs a role"],
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
        autopopulate: { maxDepth: 1 },
    }, ],
    friendRequests: [{
        type: Schema.Types.ObjectId,
        ref: "FriendRequest",
    }, ],
});

UserSchema.set("toJSON", {
    transform: function(doc, ret, options) {
        delete ret.password;
        return ret;
    },
});

UserSchema.pre("remove", async function(next) {
    const FriendRequest = mongoose.model("FriendRequest");
    const Ticket = mongoose.model("Ticket");
    const User = mongoose.model("User");
    await FriendRequest.deleteMany({ _id: { $in: this.friendRequests } });
    await FriendRequest.deleteMany({ sender: this._id });
    await Ticket.deleteMany({ user: this._id });

    await User.updateMany({ friends: this }, { $pull: { friends: { $in: this._id } } }, { multi: true });

    const session = neo.session();

    await session.run(neo.dropNode, {
        id: this._id.toString(),
    });

    session.close();
    next();
});

UserSchema.plugin(require("mongoose-autopopulate"));

module.exports = getModel("User", UserSchema);