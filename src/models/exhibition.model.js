const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const neo = require("../../neo");
const getModel = require("./model_cache");

const ExhibitionSchema = new Schema({
    name: {
        type: String,
        required: [true, "Exhibition name is required"],
        unique: [true, "Multiple exhibitions can't have the same name"],
    },
    description: {
        type: String,
        required: [true, "An exhibition requires a description"],
    },
    theme: {
        type: String,
        required: [true, "An exhibition requires a theme"],
    },
    price: {
        type: Number,
        required: [true, "An exhibition requires an entry ticket price"],
        validate: {
            validator: (price) => {
                return price >= 0
            },
            message: "Price should be 0 or higher.",
        },
    },
    startDate: {
        type: Date,
        required: [true, "An exhibition requires a start date"],
    },
    endDate: {
        type: Date,
        required: [true, "An exhibition requires an end date"],
    },
    dayStartTime: {
        type: String,
        required: [true, "An exhibition requires the start time for days"],
    },
    dayEndTime: {
        type: String,
        required: [true, "An exhibition requires the end time for days"],
    },
    imgUrl: {
        type: String,
    },
    museum: {
        type: Schema.Types.ObjectId,
        ref: "Museum",
        required: [
            true,
            "An exhibition cannot exist without an existing museum that hosts it",
        ],
        autopopulate: {
            select: "_id name city street streetNumber postalCode",
        },
    },
});

ExhibitionSchema.pre("remove", async function(next) {
    const Ticket = mongoose.model("Ticket");

    Ticket.deleteMany({ exhibition: this._id })
        .then(() => {
            const session = neo.session();

            session.run(neo.deletePurchases, {
                exhibitionId: this._id.toString(),
            });

            session.close();
        })
        .then(() => next());
});

ExhibitionSchema.plugin(require("mongoose-autopopulate"));

module.exports = getModel("Exhibition", ExhibitionSchema);