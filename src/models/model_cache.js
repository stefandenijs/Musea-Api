const mongoose = require("mongoose");

function getModel(modelName, modelSchema) {
    return () => {
        return mongoose.models[modelName] ?
            mongoose.model(modelName) :
            mongoose.model(modelName, modelSchema);
    };
}

module.exports = getModel;