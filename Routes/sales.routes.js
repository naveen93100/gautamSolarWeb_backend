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
} = require("../Controllers/Sales/sales.controller.js");

const router = Router();

router.post('/login',salesLogin);
router.post('/logout',logout);
// need to create a auth middleware to check if sales person is login or not

router.post('/create-client',createClient);
router.get("/get-client/:salesId",getClient);




// admin routes
router.get('/',getSalesPersonList); // need to add adminAuth middleware here 
router.post("/create-account", createSalesPerson);

router.patch("/update-account",updateSalesAccount);
router.post("/toggle-account",toggleSalesStatus);

// ---------------------------------
module.exports = router;
