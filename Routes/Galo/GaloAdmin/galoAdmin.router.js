const express = require("express");
const router = express.Router();


const adminController = require("../../../Controllers/Galo/Galoadmin/galoAdmin.controller");

const adminAuth = require("../../../Middleware/adminAuth");
const allowRole = require("../../../Middleware/allowRole");

router.post("/login", adminController.loginAdmin);
router.post("/logout", adminController.logoutAdmin);

// router.use(adminController.adminAuth);
// router.use(allowRole(["super_admin", "adminadminController."]));

// ---------- Panel ----------
router.get("/panel", adminController.getPanel);
router.post("/panel", adminController.createPanel);
router.put("/panel", adminController.updatePanel);
router.patch("/panel/toggle", adminController.togglePanel);

// ---------- Technology ----------
router.get("/technology", adminController.getTechnology);
router.post("/technology", adminController.createTechnology);
router.put("/technology", adminController.updateTechnology);
router.patch("/technology/toggle", adminController.activeDisableTech);

// ---------- Constructive ----------
router.get("/constructive", adminController.getConstructive);
router.post("/constructive", adminController.createConstructive);
router.put("/constructive", adminController.updateConstructive);
router.patch("/constructive/toggle", adminController.activeDisableConst);

// ---------- Panel Watt ----------
router.get("/panel-watt", adminController.getPanelWatt);
router.post("/panel-watt", adminController.panelWatt);
router.put("/panel-watt", adminController.updatePanelWatt);
router.patch("/panel-watt/toggle", adminController.togglePanelWatt);

// ---------- Admin Management ----------
router.get("/admin", adminController.getAdmin);
router.post("/admin", adminController.createAdmin);
router.post("/admin/super", adminController.createSuperAdmin);
router.patch("/admin/toggle", adminController.toggleAdmin);

// ---------- Sales Person (already defined) ----------
router.get("/sales", adminController.getGaloSalesPersonList);
router.post("/sales/create-account", adminController.createGaloSalesPerson);
router.patch("/sales/update-account", adminController.updateGaloSalesAccount);
router.patch("/sales/toggle-account", adminController.toggleGaloSalesStatus);

// ---------- Inverter ----------
router.post("/inverter", adminController.createInverter);
router.get("/inverter", adminController.getInverter);
router.put("/inverter", adminController.updateInverter);
router.patch("/inverter/toggle", adminController.toggleInverter);

module.exports = router;
