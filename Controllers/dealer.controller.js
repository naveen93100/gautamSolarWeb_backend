const path = require("path");
const DealerModel = require("../Models/dealer.schema.js");
const transporter = require("../utils/Transporter.js");
const { validate } = require("../utils/validateInput.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs").promises;
const sharp = require("sharp");
const CustomerModel = require("../Models/customer.schema.js");
const ProposalModel = require("../Models/proposal.schema.js");
const { default: mongoose } = require("mongoose");

const { PDFDocument, rgb } = require("pdf-lib");
const { drawCompanyInfo } = require("../utils/companyInfo.js");
const { drawCustomerInfo } = require("../utils/employeeInfo.js");
const { drawTable } = require("../utils/drawTable.js");
const { wrapText } = require("../utils/wraptext.js");
const { getFonts } = require("../cache/fontCache.js");
const { templatePdfBytes } = require("../cache/templateChache.js");

const loginDealer = async (req, res) => {
  try {
    let error = validate(req.body);

    if (error.length >= 1)
      return res.status(400).json({ success: false, message: error[0].er });

    let { email, password } = req.body;

    let findDealer = await DealerModel.findOne({ email }).select("+password");

    if (!findDealer)
      return res
        .status(404)
        .json({ success: false, message: "Dealer not found" });

    if (findDealer && !findDealer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is not activated yet.",
      });
    }

    let comparePass = await bcrypt.compare(password, findDealer.password);

    if (!comparePass)
      return res
        .status(401)
        .json({ success: false, message: "Invalid Email or Password" });

    let generatedToken = crypto.randomBytes(20).toString("hex");
    let tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    findDealer.token = generatedToken;
    findDealer.tokenExpiry = tokenExpiry;

    await findDealer.save();

    return res.status(200).json({
      success: true,
      message: "Login Successfull",
      token: generatedToken,
      data: {
        id: findDealer._id,
        firstName: findDealer.firstName,
        lastName: findDealer.lastName,
        email: findDealer.email,
        profileImg: findDealer.companyLogo,
        companyName: findDealer.companyName,
        address: findDealer.address,
        gstin: findDealer.gstin,
        contactNumber: findDealer.contactNumber,
      },
    });
  } catch (er) {
    return res
      .status(500)
      .json({ success: false, message: er?.message || "Internal Error" });
  }
};

const registerDealer = async (req, res) => {
  try {
    let error = validate(req.body);

    if (error.length >= 1) {
      return res.status(400).json({ success: false, message: error[0].er });
    }

    let {
      firstName,
      lastName,
      email,
      gstin,
      companyName,
      contactNumber,
      address,
    } = req.body;

    contactNumber = Number(contactNumber);

    let conditions = [];
    if (email) conditions.push({ email });
    if (contactNumber) conditions.push({ contactNumber });
    if (gstin) conditions.push({ gstin });

    let isDealerExist = await DealerModel.findOne({
      $or: conditions,
    });

    const folder = path.join("Dealer_Logo");

    // check if dealer already exist and is active
    if (isDealerExist && isDealerExist.isActive)
      return res
        .status(409)
        .json({ success: false, message: "Dealer Already Exist" });

    // generate a token
    let token = crypto.randomBytes(20).toString("hex");

    //  check if dealer already exist but is not active
    if (isDealerExist && !isDealerExist.isActive) {
      isDealerExist.token = token;
      isDealerExist.tokenExpiry = new Date(Date.now() + 15 * 60000);
      await isDealerExist.save();
    }
    //  create fresh dealer
    else {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      let img = req.file.fieldname + "-" + Date.now() + ".webp";
      let imgPath = path.join(folder, img);

      let buf = req.file.buffer;
      let companyLogo = `http://localhost:1008/dealer_logo/${img}`;

      //
      await DealerModel.create({
        firstName,
        lastName,
        email,
        gstin,
        companyName,
        companyLogo,
        contactNumber,
        address,
        token,
        tokenExpiry: new Date(Date.now() + 15 * 60000),
      });

      await sharp(buf)
        .resize(600, 600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(imgPath);
    }

    const link = `http://localhost:5173/create-password/${token}`;

    // send create passsword link to dealer email to activate account

    await transporter.sendMail({
      from: "gautamsolar.vidoes01@gmail.com",
      to: "udamandi82@gmail.com",
      subject: "Create Your Password",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

        <div style="max-width:500px; margin:40px auto; background-color:#ffffff;
                    padding:30px; border-radius:8px; text-align:center;">

          <h2 style="color:#111827; margin-bottom:10px;">
            Welcome to Your App 👋
          </h2>

          <p style="color:#4b5563; font-size:14px; line-height:1.6;">
            Click the button below to create your password and activate your account.
          </p>

          <a href="${link}"
             style="display:inline-block; margin-top:20px; padding:12px 24px;
                    background-color:#4f46e5; color:#ffffff; text-decoration:none;
                    border-radius:6px; font-weight:bold; font-size:14px;">
            Create Password
          </a>

          <p style="margin-top:30px; font-size:12px; color:#6b7280;">
            If you did not request this, please ignore this email.
          </p>

        </div>

      </body>
      </html>
    `,
    });

    return res.status(200).json({
      success: true,
      message:
        "Registered successfully. Check your email to activate your account and create your password.",
    });
  } catch (er) {
    console.log(er);
    return res
      .status(500)
      .json({ success: false, message: er?.message || "Internal Error" });
  }
};

const createPassword = async (req, res) => {
  try {
    let { token } = req.params;
    let { password } = req.body;

    if (!token)
      return res.status(400).json({
        success: false,
        message: "Verification token is missing",
      });

    let findDealer = await DealerModel.findOne({
      token,
      tokenExpiry: { $gte: Date.now() },
    });

    if (!findDealer)
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired.",
      });
    let hashPass = await bcrypt.hash(password, 10);

    findDealer.isActive = true;
    findDealer.token = null;
    findDealer.tokenExpiry = null;
    findDealer.password = hashPass;

    await findDealer.save();

    return res
      .status(200)
      .json({ success: true, message: "Account activated Please Login" });
  } catch (er) {
    return res.status(500).json({
      success: false,
      message: er?.message || "Internal server error",
    });
  }
};

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
      let folder = path.join("Dealer_logo");
      let oldImgName = isDealerExist.companyLogo.split("/").pop();

      let oldImgPath = path.join(__dirname, "..", folder, oldImgName);
      await fsp.unlink(oldImgPath);

      let newImagePath = path.join(
        "Dealer_Logo",
        req.file.fieldname + "-" + Date.now() + ".webp"
      );

      let companyLogo = `http://localhost:1008/dealer_logo/${req.file.fieldname + "-" + Date.now() + ".webp"
        }`;

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

const createPropsal = async (req, res) => {
  try {
    let error = validate(req.body);

    if (error.length >= 1) {
      return res.status(400).json({ success: false, message: error[0].er });
    }

    let {
      dealerId,
      customerName,
      email,
      phone,
      rate,
      address,
      orderCapacity,
      termsAndConditions,
    } = req.body;
    email = email.toLowerCase();

    let findCustomer = await CustomerModel.findOne({ email });

    if (findCustomer)
      return res
        .status(409)
        .json({ success: false, message: "Email already Exist" });

    //first create customer

    let createCustomer = await CustomerModel.create({
      dealerId,
      name: customerName,
      email,
      phone,
      address,
    });

    //  create propsal

    let createProposal = new ProposalModel({
      dealerId,
      customerId: createCustomer._id,
      rate: Number(rate),
      orderCapacity: Number(orderCapacity) * 1000,
      termsAndConditions,
    });

    await createProposal.save();
    await createProposal.populate("customerId");

    return res
      .status(200)
      .json({ success: true, message: "Proposal Created ", createProposal });
  } catch (er) {
    return res
      .status(500)
      .json({ success: false, message: er.message || "Internal Error" });
  }
};

const getProposal = async (req, res) => {
  try {
    let { dealerId } = req.params;

    if (!dealerId)
      return res
        .status(400)
        .json({ success: false, message: "Dealer Id not found" });

    let customersProposal = await CustomerModel.aggregate([
      { $match: { dealerId: new mongoose.Types.ObjectId(dealerId) } },
      {
        $lookup: {
          from: "proposals",
          localField: "_id",
          foreignField: "customerId",
          as: "proposalsData",
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return res.status(200).json({ success: true, customersProposal });
  } catch (er) {
    return res
      .status(500)
      .json({ success: false, message: er.message || "Internal Error" });
  }
};

const generateProposal = async (req, res) => {
  try {
    let { propId } = req.params;

    let Proposal = await ProposalModel.findOne({ _id: propId }).populate(
      "dealerId customerId"
    );

    // const apiData = req.body;
    const apiData = {
      company: {
        name: Proposal?.dealerId?.companyName,
        address: Proposal?.dealerId?.address,
        phone: Proposal?.dealerId?.contactNumber.toString(),
        email: Proposal?.dealerId?.email,
        logo: Proposal?.dealerId?.companyLogo,
      },
      customer: {
        name: Proposal?.customerId?.name,
        mobile: Proposal?.customerId?.phone.toString(),
        email: Proposal?.customerId?.email,
        capacity: Proposal?.orderCapacity.toString() + " watts",
      },
      termCondition: [Proposal?.termsAndConditions],
    };

    const rows = [
      [
        "1.",
        `${Proposal?.customerId?.address} !!!! and the order capacity  is ${apiData?.customer?.capacity}`,
        `${(Proposal?.rate).toString()} Rs/watts`,
        `${(Proposal?.price).toString()} Rs`,
        // Proposal?.price+"rs",
      ],
      ["", "", "Tax (5%)", `${(Proposal?.gstAmt).toString()} Rs`],
      ["", "", "Total Amount", `${(Proposal?.finalPrice).toString()} Rs`],
    ];

    const pdfDoc = await PDFDocument.load(templatePdfBytes);
    const { normal, bold } = await getFonts(pdfDoc);
    const margin = 15;
    const page1 = pdfDoc.getPages()[0];

    const page7 = pdfDoc.getPages()[6];

    //// if we are remove a page and add this page as place of old page use this
    const pages = pdfDoc.getPages();
    const oldPage5 = pages[5];
    const { width, height } = oldPage5.getSize();
    pdfDoc.removePage(5);
    const page6 = pdfDoc.insertPage(5, [width, height]);

    //// if we are insert a page in any index of pdf use this
    // const { width, height } = page1.getSize();
    // const page6 = pdfDoc.insertPage(7, [width, height]);

    // draw company info in page 1
    await drawCompanyInfo({
      pdfDoc,
      page: page1,
      apiData,
      font: bold,
      normalFont: normal,
      logo: Proposal?.dealerId?.companyLogo,
      // logoBytes,
    });

    // employee details
    drawCustomerInfo({
      page: page1,
      customer: apiData.customer,
      font: normal,
    });

    // draw company info in page 7

    await drawCompanyInfo({
      pdfDoc,
      page: page7,
      apiData,
      font: bold,
      normalFont: normal,
      logo: Proposal?.dealerId?.companyLogo,
    });

    // draw table
    const columns = [
      { title: "S.No", width: 50 },
      { title: "Customer Address and order Capacity", width: 260 },
      { title: "Unit Price", width: 120 },
      { title: "Total Price", width: 120 },
    ];

    page6.drawRectangle({
      x: margin,
      y: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      borderWidth: 1,
      borderColor: rgb(0.3, 0.3, 0.3),
    });

    page6.drawRectangle({
      x: 40,
      y: height - 80,
      width: width - 80,
      height: 40,
      color: rgb(0.75, 0.05, 0.05),
    });

    page6.drawText("Price of Solar Power Plant", {
      x: 170,
      y: height - 65,
      size: 18,
      font: bold,
      color: rgb(1, 1, 1),
    });

    let endY = drawTable({
      page: page6,
      startX: 50,
      startY: height - 120,
      columns,
      rows,
      font: normal,
      fontBold: bold,
    });

    endY -= 20;

    // term and condtion
    page6.drawText("Terms & Conditions", {
      x: 50,
      y: endY,
      size: 16,
      font: bold,
      color: rgb(0.5, 0, 0),
    });

    endY -= 25;

    const terms = apiData?.termCondition;
    //  console.log("Term data : ",terms)
    terms.forEach((term, i) => {
      const paragraphs = term.split(/\n+/); // split on 1 or more newlines

      paragraphs.forEach((para, pIndex) => {
        const prefix = pIndex === 0 ? `${i + 1}. ` : "";

        const lines = wrapText(prefix + para.trim(), normal, 12, width - 100);

        lines.forEach((line) => {
          page6.drawText(line, {
            x: 50,
            y: endY,
            size: 12,
            font: bold,
          });
          endY -= 16;
        });

        endY -= 10; // space between paragraphs
      });
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=proposal.pdf");
    res.setHeader("Content-Length", buffer.length);
    // res.send(Buffer.from(pdfBytes));
    res.end(buffer);
    // return res.status(200).json({success:true,message:"working"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF generation failed" });
  }
};

module.exports = {
  loginDealer,
  registerDealer,
  createPassword,
  updateDealerProfile,
  createPropsal,
  getProposal,
  generateProposal,
};
