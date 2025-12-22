const {
  loginDealer,
  registerDealer,
  createPassword,
  updateDealerProfile,
  createPropsal,
  getProposal,
  generateProposal,
} = require("../Controllers/dealer.controller.js");
const fs = require("fs");
const sharp = require("sharp");

const upload = require("../Middleware/multer.js");

const express = require("express");
const path = require("path");

const router = express.Router();

router.post("/login", loginDealer);

router.post("/register", upload.single("image"), registerDealer);

router.post("/create-password/:token", createPassword);

router.post("/create-propsal", createPropsal);

router.get("/get-proposal/:dealerId", getProposal);

// router.get("/generate-proposal/:proId", generateProposal);

router.patch("/:id", upload.single("image"), updateDealerProfile);

router.get("/downloadPropsoal", generateProposal);

// router.get("/image", upload.single("image"), async (req, res) => {
//   let folder = path.join("Dealer_Logo");

//   if (!fs.existsSync(folder)) {
//     fs.mkdirSync(folder, { recursive: true });
//   }

//   let imgPath = path.join(folder, req.file.fieldname + "-" + Date.now() + '.webp');

//   await sharp(req.file.buffer)
//     .resize(600, 600, {
//       fit: "inside",
//       withoutEnlargement: true,
//     })
//     .webp({ quality: 80 })
//     .toFile(imgPath);

//   return res.send("asdfasdf");
// });

module.exports = router;
