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
    adminDashBoardData,
    panelWatt,
    getPanelWatt,
    togglePanelWatt,
    updatePanelWatt,
    ExcelDownload,
    getCustomerData,
    toggleAdmin
} = require("../../Controllers/proposalAdmin/adminPannel.controller.js");
const adminAuth = require("../../Middleware/adminAuth.js");
const uploadImgPath = require("../../Middleware/panalImgWattMulter.js");
const allowRole = require("../../Middleware/allowRole.js");


// panel routes
panelRouter.post("/addPanel", adminAuth, createPanel)
panelRouter.get("/getPanel", getPanel)
panelRouter.put("/updatePanel", adminAuth, updatePanel)
panelRouter.put("/togglePanel", adminAuth, togglePanel)

// technology routes
panelRouter.post("/addTechnology", adminAuth, createTechnology)
panelRouter.get("/getTechnology", getTechnology)
panelRouter.put("/updateTechnology", adminAuth, updateTechnology)
panelRouter.put("/changeStatusTech", adminAuth, activeDisableTech)

// constructive routes
panelRouter.post("/createConstructive", adminAuth, createConstructive)
panelRouter.get("/getConstructive", getConstructive)
panelRouter.put("/updateConstructive", adminAuth, updateConstructive)
panelRouter.put("/changeStatusConst", adminAuth, activeDisableConst)


// panel Watt

panelRouter.post("/createPanelWatt", adminAuth, uploadImgPath.array("imgWatt", 2), panelWatt)
panelRouter.get("/getPanelWatt", getPanelWatt)
panelRouter.put("/togglePanelWatt", adminAuth, togglePanelWatt)
panelRouter.put("/updatePanelWatt", adminAuth, uploadImgPath.array("imgWatt", 2), updatePanelWatt)


// admin
panelRouter.post("/createAdmin",adminAuth,allowRole(['super_admin']), createAdmin);
panelRouter.post('/toggle-admin',adminAuth,allowRole(['super_admin'],toggleAdmin));

panelRouter.get("/getAdmin",adminAuth,allowRole(['super_admin']),getAdmin)
panelRouter.post("/loginAdmin", loginAdmin)
panelRouter.get("/logoutAdmin", adminAuth, logoutAdmin)

// dashboard Data 
panelRouter.get("/adminDashBoardData", adminDashBoardData);
panelRouter.get('/excel-download', adminAuth, ExcelDownload);
panelRouter.get('/getCustomerData', adminAuth, getCustomerData);

panelRouter.get('/excel-download',adminAuth,ExcelDownload);

module.exports = panelRouter