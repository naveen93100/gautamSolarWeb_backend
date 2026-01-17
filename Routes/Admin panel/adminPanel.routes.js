const express = require("express");

const panelRouter = express.Router();
const { createPanel, getPanel, updatePanel, createTechnology, getTechnology, updateTechnology } = require("../../Controllers/proposalAdmin/adminPannel.controller.js")


panelRouter.post("/addPanel", createPanel)
panelRouter.get("/getPanel", getPanel)
panelRouter.put("/updatePanel", updatePanel)

panelRouter.post("/addTechnology", createTechnology)
panelRouter.get("/getTechnology", getTechnology)
panelRouter.put("/updateTechnology", updateTechnology)

module.exports = panelRouter