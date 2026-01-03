const updateDealerProfile = async (req, res) => {
  try {
    let { id } = req.params;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Id not Provided" });

    let updates = {};
    let isDealerExist = await DealerModel.findOne({ _id: id });

    if (!isDealerExist)
      return res
        .status(404)
        .json({ success: false, message: "Dealer not found" });

    Object.keys(req.body).forEach((v) => {
      updates[v] = req.body[v];
    });

    if (req.file) {
      let folder = path.join("Dealer_Logo");
      let oldImgName = isDealerExist.companyLogo.split("/").pop();

      console.log("Old Image Name: ", oldImgName);
      //let baseUrl = process.env.BASE_URL + "/" + folder + "/" + oldImgName;
      //console.log(baseUrl);
      let oldImgPath = path.join(__dirname, "..","..", folder, oldImgName);
      console.log(oldImgPath);
      try {
        // await fsp.unlink(oldImgPath);
        console.log("Unlink successfully");
      } catch (err) {
        if (err.code === "ENOENT") {
          console.log("Old image not found, skipping delete");
        } else {
          throw err;
        }
      }

      let newImagePath = path.join(
        "Dealer_Logo",
        req.file.fieldname + "-" + Date.now() + ".webp"
      );

      // console.log(newImagePath);
      // const baseUrl=  `${req.protocol}://${req.get("host")}`

      // let companyLogo = `http://localhost:1008/dealer_logo/${
      let companyLogo = `https://gautamsolar.us/Dealer_Logo/${
        req.file.fieldname + "-" + Date.now() + ".webp"
      }`;

      console.log(companyLogo);

      let buf = req.file.buffer;
      await sharp(buf)
        .resize(600, 600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(newImagePath);

      updates.companyLogo = companyLogo;
    }
    console.log("new image path ",newImagePath);

    console.log("Image updated ");

    let dealer = await DealerModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile Updated",
      data: {
        id: dealer._id,
        firstName: dealer.firstName,
        lastName: dealer.lastName,
        email: dealer.email,
        profileImg: dealer.companyLogo,
        companyName: dealer.companyName,
        address: dealer.address,
        gstin: dealer.gstin,
        contactNumber: dealer.contactNumber,
      },
    });
  } catch (er) {
    return res
      .status(500)
      .json({ success: false, message: er?.message || "Internal error" });
  }
};