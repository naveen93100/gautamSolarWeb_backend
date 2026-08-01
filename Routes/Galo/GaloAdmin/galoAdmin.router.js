const express = require("express");
const router = express.Router();


const {
    // Panel
    createPanel,
    getPanel,
    updatePanel,
    togglePanel,

    // Technology
    createTechnology,
    getTechnology,
    updateTechnology,
    activeDisableTech,

    // Constructive
    createConstructive,
    getConstructive,
    updateConstructive,
    activeDisableConst,

    // Panel Watt
    panelWatt,
    getPanelWatt,
    togglePanelWatt,
    updatePanelWatt,

    // Admin Auth
    createAdmin,
    createSuperAdmin,
    toggleAdmin,
    getAdmin,
    loginAdmin,
    logoutAdmin,

    // Sales Person (already present)
    createGaloSalesPerson,
    updateGaloSalesAccount,
    getGaloSalesPersonList,
    toggleGaloSalesStatus,
} = require("../../../Controllers/Galo/Galoadmin/galoAdmin.controller");

const adminAuth = require("../../../Middleware/adminAuth");
const allowRole = require("../../../Middleware/allowRole");

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);

// router.use(adminAuth);
// router.use(allowRole(["super_admin", "admin"]));

// ---------- Panel ----------
router.get("/panel", getPanel);
router.post("/panel", createPanel);
router.put("/panel", updatePanel);
router.patch("/panel/toggle", togglePanel);

// ---------- Technology ----------
router.get("/technology", getTechnology);
router.post("/technology", createTechnology);
router.put("/technology", updateTechnology);
router.patch("/technology/toggle", activeDisableTech);

// ---------- Constructive ----------
router.get("/constructive", getConstructive);
router.post("/constructive", createConstructive);
router.put("/constructive", updateConstructive);
router.patch("/constructive/toggle", activeDisableConst);

// ---------- Panel Watt ----------
router.get("/panel-watt", getPanelWatt);
router.post("/panel-watt", panelWatt);
router.put("/panel-watt", updatePanelWatt);
router.patch("/panel-watt/toggle", togglePanelWatt);

// ---------- Admin Management ----------
router.get("/admin", getAdmin);
router.post("/admin", createAdmin);
router.post("/admin/super", createSuperAdmin);
router.patch("/admin/toggle", toggleAdmin);

// ---------- Sales Person (already defined) ----------
router.get("/sales", getGaloSalesPersonList);
router.post("/sales/create-account", createGaloSalesPerson);
router.patch("/sales/update-account", updateGaloSalesAccount);
router.patch("/sales/toggle-account", toggleGaloSalesStatus);

module.exports = router;
