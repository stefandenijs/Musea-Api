const User = require("../models/user.model")();
const jwt = require("jsonwebtoken");
const jwtSecretKey = require("../config/config").jwtSecretKey;
const bcrypt = require("bcrypt");
const saltRounds = 10;

const errors = require("../errors");

class AuthController {
    login = async(req, res, next) => {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            throw new errors.EntityNotFoundError("No user was found on this email");
        } else {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (result) {
                    const payload = { _id: user._id, role: user.role };
                    res.status(200).json({
                        token: jwt.sign(payload, jwtSecretKey, { expiresIn: "24h" }),
                        _id: user._id
                    });
                } else {
                    next(new errors.AuthorizationError("Invalid login on email"));
                }
            });
        }
    };

    register = async(req, res, next) => {
        const checkForUser = await User.findOne({ email: req.body.email });

        if (checkForUser) {
            throw new errors.EntityAlreadyExists(
                "A user on this email already exists"
            );
        }

        bcrypt.hash(req.body.password, saltRounds, async(err, hash) => {
            if (hash) {
                req.body.password = hash;

                const user = new User(req.body);
                await user.save();

                const payload = { _id: user._id, role: user.role };

                res.status(200).json({
                    token: jwt.sign(payload, jwtSecretKey, { expiresIn: "24h" }),
                    _id: user._id
                });
            } else if (err) {
                next(err);
            }
        });
    };

    validateToken = async(req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.log("Authorization header missing!");
            throw new errors.AuthorizationError("Authorization header missing!");
        } else {
            const token = authHeader.substring(7, authHeader.length);

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    console.log("Authorization failure");
                    throw new errors.AuthorizationError("User is not authorized");
                } else {
                    req.userId = payload._id;
                    req.role = payload.role;
                    next();
                }
            });
        }
    };

    checkRole = async(req, res, next) => {
        if (req.role !== "admin" && req.role !== "staff") {
            throw new errors.AuthorizationError("User is not authorized");
        } else {
            next();
        }
    };

    checkAdmin = async(req, res, next) => {
        if (req.role !== "admin") {
            throw new errors.AuthorizationError("User is not authorized");
        } else {
            next();
        }
    };
}

module.exports = AuthController;