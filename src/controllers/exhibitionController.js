const User = require("../models/user.model")();
const Exhibition = require("../models/exhibition.model")();
const Ticket = require("../models/ticket.model")();

const neo = require("../../neo");

const errors = require("../errors");

async function purchase(req, res) {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new errors.EntityNotFoundError("No purchased ticket was found");
    }

    console.log(ticket.user._id);

    const user = await User.findById(ticket.user._id, "_id email", {
        autopopulate: false,
    });

    console.log(user);
    if (!user) {
        throw new errors.EntityNotFoundError(
            "A user is required for purchasing a ticket"
        );
    }

    const exhibition = await Exhibition.findById(
        ticket.exhibition._id,
        "_id name", { autopopulate: false }
    );

    console.log(exhibition);
    if (!exhibition) {
        throw new errors.EntityNotFoundError(
            "An exhibition is required for purchasing a ticket"
        );
    }

    const session = neo.session();

    await session.run(neo.purchase, {
        exhibitionId: exhibition._id.toString(),
        userId: user._id.toString(),
    });

    session.close();

    res.status(201).end();
}

async function deletePurchases(req, res, next) {
    if (!req.params.id) {
        throw new errors.EntityNotFoundError(
            "Deleting a exhibition requires an id"
        );
    }

    const exhibition = await Exhibition.findById(req.params.id, "_id");

    const session = neo.session();

    await session.run(neo.deletePurchases, {
        exhibitionId: exhibition._id.toString(),
    });

    session.close();
    next();
}

async function getMostRecent(req, res) {
    const entities = await Exhibition.find({
            endDate: {
                $gte: new Date(),
            },
        })
        .sort("-startDate")
        .limit(4);
    res.status(200).send(entities);
}

module.exports = {
    purchase,
    deletePurchases,
    getMostRecent,
};