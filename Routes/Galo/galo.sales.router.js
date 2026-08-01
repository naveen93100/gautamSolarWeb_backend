const { Router } = require("express");
const {
    createGaloSalesPerson,
    getGaloSalesPersonList,
    createGaloClient,
    updateGaloSalesAccount,
    toggleGaloSalesStatus,
    galoSalesLogin,
    galoLogout,
    getGaloClient,
    updateGaloClient,
    createGaloSalesProposal,
    getGaloClientProposals,
    deleteGaloProposal,
    updateGaloSalesProposal,
} = require("../../Controllers/Galo/Galosalescontroller/galosales.controller.js");
const galoSalesAuth = require("../../Middleware/galoSalesAuth.js");

// const adminAuth = require("../../Middleware/adminAuth.js");
// const allowRole = require("../../Middleware/allowRole.js");

const router = Router();

router.post("/login", galoSalesLogin);
router.post("/logout", galoLogout);

//
router.post("/create-proposal", galoSalesAuth, createGaloSalesProposal);
router.get("/get-proposals/:customerId", galoSalesAuth, getGaloClientProposals);
router.delete("/delete-proposal/:propId", galoSalesAuth, deleteGaloProposal);
router.put("/update-proposal", galoSalesAuth, updateGaloSalesProposal);

router.post("/create-galoclient", galoSalesAuth, createGaloClient);
router.get("/get-galoclient/:salesId", galoSalesAuth, getGaloClient);
router.patch("/update-galoclient", galoSalesAuth, updateGaloClient);

// admin routes

// router.get(
//     "/",
//     adminAuth,
//     allowRole(["super_admin", "admin"]),
//     getGaloSalesPersonList,
// );

// router.post(
//     "/create-account",
//     adminAuth,
//     allowRole(["super_admin", "admin"]),
//     createGaloSalesPerson,
// );

// router.patch(
//     "/update-account",
//     adminAuth,
//     allowRole(["super_admin", "admin"]),
//     updateGaloSalesAccount,
// );

// router.post(
//     "/toggle-account",
//     adminAuth,
//     allowRole(["super_admin", "admin"]),
//     toggleGaloSalesStatus,
// );

module.exports = router;
