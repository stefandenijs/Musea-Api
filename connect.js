const mongoose = require("mongoose");
const neo_driver = require("./neo");

const options = {
    useNewUrlParser: true,
};

async function mongo(dbName) {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${dbName}`, options);
    } catch (err) {
        console.error(err);
    }
}

function neo(dbName) {
    try {
        neo_driver.connect(dbName);
        console.log(`connection to NEO DB ${dbName} established`);
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    mongo,
    neo,
};