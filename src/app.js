const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("express-async-errors");

const app = express();

mongoose.Promise = global.Promise;

app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/authentication.routes");
const profileRoutes = require("./routes/profile.routes");
const friendRoutes = require("./routes/friendRequest.routes");
const userRoutes = require("./routes/user.routes");
const museumRoutes = require("./routes/museum.routes");
const exhibitionRoutes = require("./routes/exhibition.routes");
const recommenndationRoutes = require("./routes/recommendation.routes")
const ticketRoutes = require("./routes/ticket.routes");

const errors = require("./errors");

app.all("*", (req, res, next) => {
    const reqMethod = req.method;
    const reqUrl = req.url;
    console.log(`Endpoint called: ${reqMethod} ${reqUrl}`);
    next();
});

app.use("/api/authentication", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/request", friendRoutes);
app.use("/api/user", userRoutes);
app.use("/api/museum", museumRoutes);
app.use("/api/exhibition", exhibitionRoutes);
app.use("/api", recommenndationRoutes)
app.use("/api/ticket", ticketRoutes);

app.get("/", (req, res, next) => {
    res.status(200).send({ status: 200, message: "API Online" });
});

app.use("*", function(_, res) {
    res.status(404).end("Endpoint not found");
});

app.use("*", function(err, req, res, next) {
    console.error(`${err.name}: ${err.message}`);
    next(err);
});

app.use("*", errors.handlers);

module.exports = app;