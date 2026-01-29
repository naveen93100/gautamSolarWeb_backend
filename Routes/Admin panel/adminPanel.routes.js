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
    loginAdmin
} = require("../../Controllers/proposalAdmin/adminPannel.controller.js")


// panel routes
panelRouter.post("/addPanel", createPanel)
panelRouter.get("/getPanel", getPanel)
panelRouter.put("/updatePanel", updatePanel)
panelRouter.put("/togglePanel", togglePanel)

// technology routes
panelRouter.post("/addTechnology", createTechnology)
panelRouter.get("/getTechnology", getTechnology)
panelRouter.put("/updateTechnology", updateTechnology)
panelRouter.put("/changeStatusTech", activeDisableTech)

// constructive routes
panelRouter.post("/createConstructive", createConstructive)
panelRouter.get("/getConstructive", getConstructive)
panelRouter.put("/updateConstructive", updateConstructive)
panelRouter.put("/changeStatusConst", activeDisableConst)

// admin
panelRouter.post("/createAdmin", createAdmin)
panelRouter.get("/getAdmin", getAdmin)
panelRouter.post("/loginAdmin", loginAdmin)

module.exports = panelRouter