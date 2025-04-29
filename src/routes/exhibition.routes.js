const express = require("express");
const router = express.Router();

const Exhibition = require("../models/exhibition.model")();

const CrudController = require("../controllers/crudController");

const ExhibitionCrudController = new CrudController(Exhibition);
const exhibitionController = require("../controllers/exhibitionController");

const AuthController = require("../controllers/authController");
const AuthenticationController = new AuthController();

router.post(
    "/",
    AuthenticationController.validateToken,
    AuthenticationController.checkRole,
    ExhibitionCrudController.create
);
router.get("/", ExhibitionCrudController.getAll);
router.get("/recent", exhibitionController.getMostRecent);
router.get("/:id", ExhibitionCrudController.getOne);
router.put(
    "/:id",
    AuthenticationController.validateToken,
    AuthenticationController.checkRole,
    ExhibitionCrudController.update
);
router.delete(
    "/:id",
    AuthenticationController.validateToken,
    AuthenticationController.checkRole,
    exhibitionController.deletePurchases,
    ExhibitionCrudController.delete
);

// neo4j
// router.post("/:id/purchase", AuthenticationController.validateToken, exhibitionController.purchase);

module.exports = router;