const express = require("express");

const panelRouter = express.Router();
const { createPanel, getPanel, updatePanel } = require("../../Controllers/proposalAdmin/adminPannel.controller.js")


panelRouter.post("/addPanel", createPanel)
panelRouter.get("/getPanel", getPanel)
panelRouter.put("/updatePanel", updatePanel)

module.exports = panelRouter