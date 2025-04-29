const User = require("../models/user.model")();
const Exhibition = require("../models/exhibition.model")();
const Ticket = require("../models/ticket.model")();

const neo = require("../../neo");

const errors = require("../errors");

async function create(req, res, next) {
    const entity = new Ticket(req.body);
    await entity.save();
    res.locals.entity = entity;
    next();
}

async function purchase(req, res, next) {
    const ticket = await Ticket.findById(res.locals.entity._id);

    if (!ticket) {
        throw new errors.EntityNotFoundError("No purchased ticket was found");
    }

    console.log(ticket.user._id);

    const user = await User.findById(ticket.user._id, "_id email", {
        autopopulate: false,
    });

    if (!user) {
        throw new errors.EntityNotFoundError(
            "A user is required for purchasing a ticket"
        );
    }

    if (req.userId !== user._id.toString()) {
        throw new errors.AuthorizationError("Requesting user is not the same as ticket owner");
    }

    const exhibition = await Exhibition.findById(
        ticket.exhibition._id,
        "_id name", { autopopulate: false }
    );

    if (!exhibition) {
        throw new errors.EntityNotFoundError(
            "An exhibition is required for purchasing a ticket"
        );
    }

    try {
        const session = neo.session();

        await session.run(neo.purchase, {
            exhibitionId: exhibition._id.toString(),
            userId: user._id.toString(),
        });

        session.close();

        res.status(201).json(res.locals.entity);
    } catch (err) {
        await Ticket.deleteOne({ _id: ticket._id });
        throw new errors.InternalServerError('Request could not be processed')
    }
}

module.exports = {
    create,
    purchase,
};