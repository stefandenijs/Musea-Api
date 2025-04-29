require("dotenv").config();

const connect = require("./connect");

const User = require("./src/models/user.model")();
const Museum = require("./src/models/museum.model")();
const Exhibition = require("./src/models/exhibition.model")();
const Ticket = require("./src/models/ticket.model")();
const FriendRequest = require("./src/models/friendRequest.model")();

const neo = require("./neo");

connect.mongo(process.env.MONGO_TEST_DB);
connect.neo(process.env.NEO4J_TEST_DB);

beforeEach(async() => {
    await Promise.all([
        User.deleteMany(),
        Museum.deleteMany(),
        Exhibition.deleteMany(),
        Ticket.deleteMany(),
        FriendRequest.deleteMany(),
    ]);

    const session = neo.session();
    await session.run(neo.dropAll);
    await session.close();
});