const {
  loginDealer,
  registerDealer,
  createPassword,
  updateDealerProfile,
  createProposal,
  getProposal,
  generateProposal,
  editProposal,
  generatePanelPropsal,
  updatePanelPropsal,
  createCustomer,
  getCustomers,
  editCustomer,
  createPanelProposal,
  deleteProposal,
  editPowerPlant,
  editPanelProposal,
} = require("../Controllers/dealer.controller.js");
const path = require("path");

const upload = require("../Middleware/multer.js");

const express = require("express");

const verifyToken = require("../Middleware/verifyToken.js");

const router = express.Router();

router.post("/login", loginDealer);

router.post("/register", upload.single("image"), registerDealer);

router.post("/create-password/:token", createPassword);

// router.post("/create-propsal", verifyToken, createProposal);

router.patch("/edit-proposal", upload.none(), verifyToken, editProposal);

// router.get("/get-proposal/:dealerId", verifyToken, getProposal);

router.get("/downloadPropsoal/:propId", generateProposal);


router.post("/createPanelPropsal", generatePanelPropsal);
router.put("/updatePanelProposal", updatePanelPropsal);



// ---------------------------new 

router.post('/create-customer',createCustomer); // need to set token
router.patch('/edit-customer/:customerId',editCustomer) // need to set token


// create power plant proposal
router.post('/create-powerPlant-proposal',createProposal)  // need to set token

router.patch('/edit-powerplant-proposal',editPowerPlant);

router.post('/create-solarPanel-proposal',createPanelProposal);  // need to set token

router.put('/edit-solarPanel-proposal',editPanelProposal);

router.delete('/delete-proposal',deleteProposal) //need to set token


// get all proposal
router.get("/get-proposal", getProposal);  // need to set token
router.get("/get-customers", getCustomers);  // need to set token


router.patch("/:id", upload.single("image"), updateDealerProfile);






module.exports = router;
