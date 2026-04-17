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

router.patch("/:id", upload.single("image"), updateDealerProfile);

router.post("/createPanelPropsal", generatePanelPropsal);
router.put("/updatePanelProposal", updatePanelPropsal);



// ---------------------------

router.post('/create-customer',createCustomer);

// create power plant proposal
router.post('/create-powerPlant-proposal',createProposal)

// get all proposal
router.get("/get-proposal", getProposal);
router.get("/get-customers", getCustomers);





module.exports = router;
