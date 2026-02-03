const express = require("express");

const panelRouter = express.Router();
const { createPanel,
    getPanel,
    updatePanel,
    createTechnology,
    getTechnology,
    updateTechnology,
    createConstructive,
    getConstructive,
    updateConstructive,
    activeDisableTech,
    activeDisableConst,
    togglePanel,
    createAdmin,
    getAdmin,
    loginAdmin,
    logoutAdmin,
    adminDashBoardData
} = require("../../Controllers/proposalAdmin/adminPannel.controller.js");
const adminAuth = require("../../Middleware/adminAuth.js");


// panel routes
panelRouter.post("/addPanel", adminAuth, createPanel)
panelRouter.get("/getPanel", adminAuth, getPanel)
panelRouter.put("/updatePanel", adminAuth, updatePanel)
panelRouter.put("/togglePanel", adminAuth, togglePanel)

// technology routes
panelRouter.post("/addTechnology", adminAuth, createTechnology)
panelRouter.get("/getTechnology", adminAuth, getTechnology)
panelRouter.put("/updateTechnology", adminAuth, updateTechnology)
panelRouter.put("/changeStatusTech", adminAuth, activeDisableTech)

// constructive routes
panelRouter.post("/createConstructive", adminAuth, createConstructive)
panelRouter.get("/getConstructive", adminAuth, getConstructive)
panelRouter.put("/updateConstructive", adminAuth, updateConstructive)
panelRouter.put("/changeStatusConst", adminAuth, activeDisableConst)

// admin
panelRouter.post("/createAdmin", createAdmin)
panelRouter.get("/getAdmin", getAdmin)
panelRouter.post("/loginAdmin", loginAdmin)
panelRouter.get("/logoutAdmin", adminAuth, logoutAdmin)

// dashboard Data 
panelRouter.get("/adminDashBoardData", adminDashBoardData);

module.exports = panelRouter