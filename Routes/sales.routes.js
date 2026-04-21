const { Router } = require("express");
const {
  createSalesPerson,
  getSalesPersonList,
  createClient,
  updateSalesAccount,
  toggleSalesStatus,
  salesLogin,
  logout,
} = require("../Controllers/Sales/sales.controller.js");

const router = Router();

router.post('/login',salesLogin);
router.post('/logout',logout);

router.post('/create-client',createClient);




// admin routes
router.get('/',getSalesPersonList); // need to add adminAuth middleware here 
router.post("/create-account", createSalesPerson);

router.patch("/update-account",updateSalesAccount);
router.post("/toggle-account",toggleSalesStatus);

// ---------------------------------
module.exports = router;
