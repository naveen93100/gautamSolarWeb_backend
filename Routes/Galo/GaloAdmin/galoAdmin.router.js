const express = require("express");

const router = express.Router();

const {
    createGaloSalesPerson,
    getGaloSalesPersonList,
    updateGaloSalesAccount,
    toggleGaloSalesStatus,
} = require("../../../Controllers/Galo/Galoadmin/galoAdmin.controller");

const adminAuth = require("../../../Middleware/adminAuth");
const allowRole = require("../../../Middleware/allowRole");

router.use(adminAuth);
router.use(allowRole(["super_admin", "admin"]));

router.get("/", getGaloSalesPersonList);

router.post("/create-account", createGaloSalesPerson);

router.patch("/update-account", updateGaloSalesAccount);

router.post("/toggle-account", toggleGaloSalesStatus);

module.exports = router;
