const { Router } = require("express");
const GaloSalesController = require("../../Controllers/Galo/Galosalescontroller/galosales.controller.js");
const galoSalesAuth = require("../../Middleware/galoSalesAuth.js");

// const adminAuth = require("../../Middleware/adminAuth.js");
// const allowRole = require("../../Middleware/allowRole.js");

const router = Router();

router.post("/login", GaloSalesController.galoSalesLogin);

// auth middleware
router.use(galoSalesAuth);

router.post("/logout", GaloSalesController.galoLogout);
router.post("/create-proposal", GaloSalesController.createGaloSalesProposal);
router.get("/get-proposals/:customerId", GaloSalesController.getGaloClientProposals);
router.delete("/delete-proposal/:propId", GaloSalesController.deleteGaloProposal);
router.put("/update-proposal", GaloSalesController.updateGaloSalesProposal);

router.post("/create-galoclient", GaloSalesController.createGaloClient);
router.get("/get-galoclient/:salesId", GaloSalesController.getGaloClient);
router.patch("/update-galoclient", GaloSalesController.updateGaloClient);

module.exports = router;
