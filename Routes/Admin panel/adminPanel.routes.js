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
    activeDisableConst
} = require("../../Controllers/proposalAdmin/adminPannel.controller.js")


panelRouter.post("/addPanel", createPanel)
panelRouter.get("/getPanel", getPanel)
panelRouter.put("/updatePanel", updatePanel)

panelRouter.post("/addTechnology", createTechnology)
panelRouter.get("/getTechnology", getTechnology)
panelRouter.put("/updateTechnology", updateTechnology)
panelRouter.put("/changeStatusTech", activeDisableTech)

panelRouter.post("/createConstructive", createConstructive)
panelRouter.get("/getConstructive", getConstructive)
panelRouter.put("/updateConstructive", updateConstructive)
panelRouter.put("/changeStatusConst", activeDisableConst)

module.exports = panelRouter