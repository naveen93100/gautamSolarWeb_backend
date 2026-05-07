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

//
router.post("/create-proposal", salesAuth, createSalesProposal);
router.get("/get-proposals/:clientId", salesAuth, getClientProposals);
router.delete("/delete-proposal/:propId", salesAuth, deleteProposal);
router.put("/update-proposal", salesAuth, updateSalesProposal);
//
router.post("/login", salesLogin);
router.post("/logout", logout);

// need to create a auth middleware to check if sales person is login or not

router.post("/create-client", salesAuth, createClient);
router.get("/get-client/:salesId", salesAuth, getClient);
router.patch("/update-client", salesAuth, updateClient);

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
