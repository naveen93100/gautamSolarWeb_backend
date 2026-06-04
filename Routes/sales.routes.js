const { Router } = require("express");
const {
  createSalesPerson,
  getSalesPersonList,
  createClient,
  updateSalesAccount,
  toggleSalesStatus,
  salesLogin,
  logout,
  getClient,
  updateClient,
  createSalesProposal,
  getClientProposals,
  deleteProposal,
  updateSalesProposal,
} = require("../Controllers/Sales/sales.controller.js");
const salesAuth = require("../Middleware/salesAuth.js");
const adminAuth = require("../Middleware/adminAuth.js");
const allowRole = require("../Middleware/allowRole.js");

const router = Router();

router.post("/login", salesLogin);
router.post("/logout", logout);

//
router.use(salesAuth);
router.post("/create-proposal", createSalesProposal);
router.get("/get-proposals/:clientId", getClientProposals);
router.delete("/delete-proposal/:propId", deleteProposal);
router.put("/update-proposal", updateSalesProposal);

router.post("/create-client", createClient);
router.get("/get-client/:salesId", getClient);
router.patch("/update-client", updateClient);

// admin routes

router.get(
  "/",
  adminAuth,
  allowRole(["super_admin", "admin"]),
  getSalesPersonList,
);

router.post(
  "/create-account",
  adminAuth,
  allowRole(["super_admin", "admin"]),
  createSalesPerson,
);

router.patch(
  "/update-account",
  adminAuth,
  allowRole(["super_admin", "admin"]),
  updateSalesAccount,
);

router.post(
  "/toggle-account",
  adminAuth,
  allowRole(["super_admin", "admin"]),
  toggleSalesStatus,
);

// ---------------------------------
module.exports = router;
