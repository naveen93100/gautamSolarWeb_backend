const {
  loginDealer,
  registerDealer,
  createPassword,
  updateDealerProfile,
  createPropsal,
  getProposal,
  generateProposal,
} = require("../Controllers/dealer.controller.js");
const path=require('path');

const upload = require("../Middleware/multer.js");

const express = require("express");

const verifyToken = require("../Middleware/verifyToken.js");

const router = express.Router();

router.post("/login", loginDealer);

router.post("/register", upload.single("image"), registerDealer);

router.post("/create-password/:token", createPassword);

router.post("/create-propsal", verifyToken, createPropsal);

router.get("/get-proposal/:dealerId", verifyToken, getProposal);

router.get("/downloadPropsoal/:propId", verifyToken, generateProposal);

router.patch("/:id", verifyToken, upload.single("image"), updateDealerProfile);

router.get('/',(req,res)=>{
  const folder = path.join(__dirname,"Dealer_Logo");
  console.log(folder);
  return res.send("asdf");
   
})

module.exports = router;
