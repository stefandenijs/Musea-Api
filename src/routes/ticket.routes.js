const express = require("express");
const router = express.Router();

const Ticket = require("../models/ticket.model")();

const CrudController = require("../controllers/crudController");

const TicketCrudController = new CrudController(Ticket);
const ticketController = require("../controllers/ticketController");

const AuthController = require("../controllers/authController");
const AuthenticationController = new AuthController();

router.post(
    "/",
    AuthenticationController.validateToken,
    ticketController.create,
    ticketController.purchase
);
router.get(
    "/",
    AuthenticationController.validateToken,
    TicketCrudController.getAll
);
router.get(
    "/:id",
    AuthenticationController.validateToken,
    TicketCrudController.getOne
);
router.put(
    "/:id",
    AuthenticationController.validateToken,
    TicketCrudController.update
);

module.exports = router;