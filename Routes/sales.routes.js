const { Router } = require("express");
const {
  createSalesPerson,
  getSalesPersonList,
  createClient,
} = require("../Controllers/Sales/sales.controller.js");

const router = Router();

router.get('/',getSalesPersonList); // need to add adminAuth middleware here 
router.post("/create-account", createSalesPerson);

router.post('/create-client',createClient);

module.exports = router;
