const { Router } = require("express");
const {
  createSalesPerson,
  getSalesPersonList,
  createClient,
  updateSalesAccount,
} = require("../Controllers/Sales/sales.controller.js");

const router = Router();

router.get('/',getSalesPersonList); // need to add adminAuth middleware here 
router.post("/create-account", createSalesPerson);

router.patch("/update-account",updateSalesAccount);

router.post('/create-client',createClient);

module.exports = router;
