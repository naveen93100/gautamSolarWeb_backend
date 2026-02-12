const {
  loginDealer,
  registerDealer,
  createPassword,
  updateDealerProfile,
  createPropsal,
  getProposal,
  generateProposal,
  editProposal,
  generatePanelPropsal,
  updatePanelPropsal
} = require("../Controllers/dealer.controller.js");
const path = require("path");

const upload = require("../Middleware/multer.js");

const express = require("express");

const verifyToken = require("../Middleware/verifyToken.js");

const router = express.Router();

router.post("/login", loginDealer);

router.post("/register", upload.single("image"), registerDealer);

router.post("/create-password/:token", createPassword);

router.post("/create-propsal", verifyToken, createPropsal);

router.patch('/edit-proposal', upload.none(), verifyToken, editProposal);

router.get("/get-proposal/:dealerId", verifyToken, getProposal);

router.get("/downloadPropsoal/:propId", generateProposal);

router.patch("/:id", upload.single("image"), updateDealerProfile);

router.post("/createPanelPropsal", generatePanelPropsal)
router.put("/updatePanelProposal", updatePanelPropsal)



module.exports = router;
