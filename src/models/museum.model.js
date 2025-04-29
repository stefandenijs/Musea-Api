const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const getModel = require("./model_cache");

const MuseumSchema = new Schema({
    name: {
        type: String,
        required: [true, "Museum name is required"],
        unique: [true, "Multiple museums can't have the same name"],
    },
    description: {
        type: String,
        required: [true, "A museum requires the city it is based in"],
    },
    city: {
        type: String,
        required: [true, "A museum requires the city it is based in"],
    },
    street: {
        type: String,
        required: [true, "A museum requires the street it is in"],
    },
    streetNumber: {
        type: Number,
        required: [true, "A museum must have a streetnumber"],
        validate: {
            validator: (streetNumber) => {
                return streetNumber > 0
            },
            message: "streetNumber should not be 0 or negative.",
        },
    },
    postalCode: {
        type: String,
        required: [
            true,
            "A museum requires the postal code it is registered under",
        ],
        match: [
            /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i,
            "Please use a valid postal code",
        ],
    },
    phoneNumber: {
        type: String,
        required: [true, "A museum requires the phone number to contact them"],
    },
    website: {
        type: String,
        required: [
            true,
            "A museum requires the website that is associated with it",
        ],
    },
    imgUrl: {
        type: String,
        required: [true, "A museum requires the image url to its photo"],
    },
});

MuseumSchema.pre("remove", function(next) {
    const Exhibition = mongoose.model("Exhibition");

    Exhibition.deleteMany({ museum: this._id }).then(() => next());
});

module.exports = getModel("Museum", MuseumSchema);