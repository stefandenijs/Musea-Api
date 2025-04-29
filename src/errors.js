class EntityNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "EntityNotFoundError";
    }
}

class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthorizationError";
    }
}

class EntityAlreadyExists extends Error {
    constructor(message) {
        super(message);
        this.name = "EntityAlreadyExists";
    }
}

class InternalServerError extends Error {
    constructor(message) {
        super(message);
        this.name = "InternalServerError";
    }
}

class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = "BadRequestError";
    }
}

function badRequest(err, req, res, next) {
    if (err.name === "BadRequestError") {
        res.status(400).json({
            message: err.message,
        });
    } else {
        next(err);
    }
}

function entityAlreadyExists(err, req, res, next) {
    if (err.name === "EntityAlreadyExists") {
        res.status(422).json({
            message: err.message,
        });
    } else {
        next(err);
    }
}

function duplicate(err, req, res, next) {
    if (err.name === "EntityAlreadyExists" || (err.name === 'MongoServerError' && err.code === 11000)) {
        res.status(409).json({
            message: err.message,
        });
    } else {
        next(err);
    }
}

function validation(err, req, res, next) {
    if (err.name === "ValidationError") {
        res.status(400).json({
            message: err.message,
        });
    } else {
        next(err);
    }
}

function cast(err, req, res, next) {
    if (err.name === "CastError") {
        res.status(400).json({
            message: `Invalid resource id: ${err.value}`,
            // message: err
        });
    } else {
        next(err);
    }
}

function authorization(err, req, res, next) {
    if (err.name === "AuthorizationError") {
        res.status(401).json({
            message: err.message,
        });
    } else {
        next(err);
    }
}

function entityNotFound(err, req, res, next) {
    if (err.name === "EntityNotFoundError") {
        res.status(404).json({
            message: err.message,
        });
    } else {
        next(err);
    }
}

function internalServerError(err, req, res, next) {
    if (err.name === "InternalServerError") {
        res.status(500).json({
            message: err.message,
        });
    } else {
        next(err);
    }
}

function mongo(err, req, res, next) {
    if (err.name === "MongoServerError") {
        res.status(500).json({
            message: err.message,
        });
    } else {
        next(err);
    }
}

module.exports = {
    EntityNotFoundError,
    AuthorizationError,
    EntityAlreadyExists,
    InternalServerError,
    BadRequestError,
    handlers: [
        badRequest,
        entityAlreadyExists,
        duplicate,
        validation,
        cast,
        authorization,
        entityNotFound,
        internalServerError,
        mongo,
    ],
};