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

const router = Router();


// 
router.post("/create-proposal",createSalesProposal);
router.get("/get-proposals/:clientId",salesAuth,getClientProposals)
router.delete('/delete-proposal/:propId',deleteProposal);
router.put("/update-proposal",updateSalesProposal)
// 
router.post('/login',salesLogin);
router.post('/logout',logout);
// need to create a auth middleware to check if sales person is login or not

router.post('/create-client',createClient);
router.get("/get-client/:salesId",getClient);
router.patch('/update-client',updateClient);




// admin routes
router.get('/',getSalesPersonList); // need to add adminAuth middleware here 
router.post("/create-account", createSalesPerson);

router.patch("/update-account",updateSalesAccount);
router.post("/toggle-account",toggleSalesStatus);

// ---------------------------------
module.exports = router;
