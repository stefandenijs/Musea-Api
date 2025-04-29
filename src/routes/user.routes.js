const express = require("express");
const router = express.Router();

const User = require("../models/user.model")();

const CrudController = require("../controllers/crudController");

const UserCrudController = new CrudController(User);

const AuthController = require("../controllers/authController");
const AuthenticationController = new AuthController();

router.post(
    "/",
    AuthenticationController.validateToken,
    AuthenticationController.checkAdmin,
    UserCrudController.create
);
router.get("/", UserCrudController.getAll);
router.get("/:id", UserCrudController.getOne);
router.put(
    "/:id",
    AuthenticationController.validateToken,
    AuthenticationController.checkAdmin,
    UserCrudController.update
);
router.delete(
    "/:id",
    AuthenticationController.validateToken,
    AuthenticationController.checkAdmin,
    UserCrudController.delete
);

module.exports = router;