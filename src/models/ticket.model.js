const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const getModel = require("./model_cache");

const TicketSchema = new Schema({
    dateOfPurchase: {
        type: Date,
        default: new Date(),
        required: [true, "A ticket requires the date it was purchased"],
    },
    status: {
        type: String,
        required: [
            true,
            "A ticket requires its current state. This can be cancelled, refunded, completed, etc",
        ],
    },
    priceAtPurchase: {
        type: Number,
        required: [
            true,
            "A ticket requires the price it was bought with at the time",
        ],
    },
    exhibition: {
        type: Schema.Types.ObjectId,
        ref: "Exhibition",
        required: [true, "A ticket requires the exhibition it was bought for"],
        autopopulate: {
            select: "_id name startDate endDate dayStartTime dayEndTime price",
        },
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "A ticket requires the user that bought it"],
    },
});

TicketSchema.plugin(require("mongoose-autopopulate"));

module.exports = getModel("Ticket", TicketSchema);