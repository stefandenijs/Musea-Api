const neo = require("../../neo");

const Exhibition = require("../models/exhibition.model")();

async function getRecommendations(query, req, res) {
    console.log(req.params.id);

    const session = neo.session();

    const result = await session.run(query, {
        userId: req.params.id,
    });

    const exhibitionIds = result.records[0].get("exhibitionIds");

    session.close();

    const recommendations = await Exhibition.find({
        _id: { $in: exhibitionIds },
    }).limit(4);

    res.status(200).json(recommendations);
}

async function notBought(req, res) {
    await getRecommendations(neo.getNotBought, req, res);
}

async function visitedByFriends(req, res) {
    await getRecommendations(neo.visitedByFriends, req, res);
}

module.exports = {
    notBought,
    visitedByFriends,
};