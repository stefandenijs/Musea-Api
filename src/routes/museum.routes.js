const express = require("express");
const router = express.Router();

const Museum = require("../models/museum.model")();

const CrudController = require("../controllers/crudController");

const MuseumCrudController = new CrudController(Museum);

const AuthController = require("../controllers/authController");
const AuthenticationController = new AuthController();

router.post(
    "/",
    AuthenticationController.validateToken,
    AuthenticationController.checkRole,
    MuseumCrudController.create
);
router.get("/", MuseumCrudController.getAll);
router.get("/:id", MuseumCrudController.getOne);
router.put(
    "/:id",
    AuthenticationController.validateToken,
    AuthenticationController.checkRole,
    MuseumCrudController.update
);
router.delete(
    "/:id",
    AuthenticationController.validateToken,
    AuthenticationController.checkRole,
    MuseumCrudController.delete
);

module.exports = router;