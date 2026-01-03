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
const dealerTransporter = require("../utils/mailer.js");
const MaterialModel = require("../Models/material.schema.js");

const loginDealer = async (req, res) => {
  try {
    let error = validate(req?.body);

    if (error.length >= 1)
      return res.status(400).json({ success: false, message: error[0].er });

    let { email, password } = req?.body || {};

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

      await sharp(buf)
        .resize(600, 600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(imgPath);

      let companyLogo = `https://gautamsolar.us/dealer_logo/${img}`;
      // let companyLogo = `http://localhost:1008/dealer_logo/${img}`;
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
    }

    const link = `https://dealer.gautamsolar.com/create-password/${token}`;
    // const link = `http://localhost:5173/create-password/${token}`;

    await dealerTransporter.sendMail({
      from: `Gautam Solar Account Activation ${process.env.DEALER_MAIL}`,
      to: email,
      subject: "Create Your Password to Activate Your Account",
      html: `
        <!DOCTYPE html>
      <html lang="en">
      <body style="margin:0; padding:0; background:#fafafa; font-family:Arial, sans-serif;">

        <div style="max-width:480px; margin:40px auto; background:#ffffff; border-radius:8px; padding:28px;">

          <h2 style="margin:0 0 10px; color:#111; font-size:20px; text-align:center;">
            Activate Your Account
          </h2>

          <p style="margin:0 0 20px; font-size:14px; color:#444; line-height:1.6;">
            You have been registered on the <strong>Gautam Solar Dealer Portal</strong>.  
            Please create your password to activate your account.
          </p>

          <div style="text-align:center; margin:25px 0;">
            <a href="${link}" target="_blank"
              style="background:#a20000; color:#fff; font-weight:bold; text-decoration:none;
                    padding:12px 26px; border-radius:6px; font-size:14px; display:inline-block;">
              Activate Account
            </a>
          </div>

          <p style="font-size:12px; color:#666; margin-top:20px; line-height:1.5;text-align:center">
            This link will expire in <strong>15 minutes</strong> for security purposes.
          </p>

          <hr style="border:none; border-top:1px solid #eee; margin:25px 0;" />
          <p style="text-align:center; font-size:11px; color:#999; margin:0;">
            © ${new Date().getFullYear()} Gautam Solar. All rights reserved.
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
    console.log(er?.message);
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

    console.log(findDealer);

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
      console.log(oldImgPath);
      await fsp.unlink(oldImgPath);

      let newImagePath = path.join(
        "Dealer_Logo",
        req.file.fieldname + "-" + Date.now() + ".webp"
      );

      console.log(newImagePath);
      // let companyLogo = `http://localhost:1008/dealer_logo/${
        let companyLogo = `https://gautamsolar.us/dealer_logo/${
        req.file.fieldname + "-" + Date.now() + ".webp"
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
    // let error = validate(req.body);

    // if (error.length >= 1) {
    //   return res.status(400).json({ success: false, message: error[0].er });
    // }

    let {
      dealerId,
      customerName,
      email,
      phone,
      rate,
      address,
      orderCapacity,
      termsAndConditions,
      components,
      tax,
    } = req.body;
    email = email.toLowerCase();
      
    tax=Number.parseFloat(tax);

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

    let names = components.map((item) => item.name);

    let findComponent = await MaterialModel.find({
      name: { $in: names },
    }).select("_id name");

    findComponent = names.map((item) =>
      findComponent.find((v) => v.name === item)
    );

    let finalComponent = components.map((item, idx) => {
      if (item.name === findComponent[idx]?.name) {
        return {
          mId: findComponent[idx]?._id,
          quantity: item.qty,
          isActive: true,
        };
      }
    });

    const price = (orderCapacity*1000) * rate;
    const gstAmt = (price*tax) / 100;
    const finalAmt = price + gstAmt;
 
    let createProposal = new ProposalModel({
      dealerId,
      customerId: createCustomer._id,
      rate: Number(rate),
      orderCapacity: Number(orderCapacity)*1000,
      termsAndConditions,
      material: finalComponent,
      price,
      gstAmt,
      finalPrice:finalAmt,
      tax:tax
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

const editProposal = async (req, res) => {
  try {
    // let { propId } = req.params;

    let {
      propId,
      name,
      email,
      phone,
      address,
      rate,
      orderCapacity,
      components,
      tax,
      termsAndConditions,
    } = req.body;

    orderCapacity=Number(orderCapacity);
    tax=Number.parseFloat(tax)
    rate=Number(rate)

    // return res.status(200).json({success:true,msg:"working"});

    if (!propId)
      return res.status(400).json({ success: false, message: "Id not found" });

    let Prop = await ProposalModel.findOne({ _id: propId }).populate(
      "customerId"
    );

    let customer = await CustomerModel.findOne({ _id: Prop?.customerId?._id });

    let customerUpdates = {};
    let propUpdates = {};

    if (name) {
      customerUpdates.name = name;
    }
    if (email) {
      // let emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // let check = emailRegexp.test(email);
      // if (!check)
      //   return res
      //     .status(400)
      //     .json({ success: false, message: "Email is not valid." });
      // let findEmail = await CustomerModel.findOne({ email });
      // if (findEmail)
      //   return res
      //     .status(409)
      //     .json({ success: false, message: "Email already exist" });
      customerUpdates.email = email;
    }
    if (phone) {
      // let mobileRegexp = /^[0-9]{10}$/;
      // let check = mobileRegexp.test(phone);
      // if (!check)
      //   return res
      //     .status(400)
      //     .json({ success: false, message: "Phone no. is not valid" });
      // let findPhone = await CustomerModel.findOne({ phone });
      // if (findPhone)
      //   return res
      //     .status(409)
      //     .json({ success: false, message: "Phone no. already exist" });
      customerUpdates.phone = phone;
    }
    if (address) {
      customerUpdates.address = address;
    }

    let names = components.map((item) => item.name.trim());

    let findComponent = await MaterialModel.find({
      name: { $in: names },
    }).select("_id name");

    findComponent = names.map((item) =>
      findComponent.find((v) => v.name.trim() === item.trim())
    );

    let finalComponent = components.map((item, idx) => {
      if (item.name === findComponent[idx]?.name) {
        return {
          mId: findComponent[idx]?._id,
          quantity: item.qty,
          isActive: true,
        };
      }
    });

    const price = orderCapacity*1000 * rate;
    const gstAmt = (price*tax) / 100;


     propUpdates.rate=rate;
     propUpdates.orderCapacity=orderCapacity*1000;
     propUpdates.termsAndConditions=termsAndConditions;

     propUpdates.tax=tax
     propUpdates.price=price

     propUpdates.gstAmt= (price*tax) / 100;
     propUpdates.finalPrice=price+gstAmt


    // if (rate) {
    //   propUpdates.rate = rate;
    // }
    // if (orderCapacity) {
    //   propUpdates.orderCapacity = orderCapacity * 1000;
    // }
    // if (termsAndConditions) {
    //   propUpdates.termsAndConditions = termsAndConditions;
    // }

    if (Object.keys(customerUpdates).length >= 1) {
      customer.set(customerUpdates);
      await customer.save();
    }

    propUpdates.material = finalComponent;

    if (Object.keys(propUpdates).length >= 1) {
      Prop.set(propUpdates);
      await Prop.save();
    }

    return res.status(200).json({ success: true, message: "Proposal Updated" });
  } catch (er) {
    return res
      .status(500)
      .json({ success: false, message: er?.message || "Internal Error" });
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
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customerId", "$$customerId"] },
              },
            },
            {
              $lookup: {
                from: "materials",
                localField: "material.mId",
                foreignField: "_id",
                as: "materialData",
              },
            },
            {
              $addFields: {
                material: {
                  $map: {
                    input: "$material",
                    as: "mat",
                    in: {
                      $mergeObjects: [
                        "$$mat",
                        {
                          materialData: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$materialData",
                                  as: "md",
                                  cond: { $eq: ["$$md._id", "$$mat.mId"] },
                                },
                              },
                              0,
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
            { $project: { materialData: 0 } },
          ],
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
        // `${Proposal?.customerId?.address} (order capacity-${apiData?.customer?.capacity})`,
        `Supply,Installation and Commissioning of ${
          apiData?.customer?.capacity?.split("watts")[0] / 1000
        } kw Solar Power Plant at (${Proposal?.customerId?.address})`,
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
    // const page7 = pdfDoc.getPages()[6];
    const page7 = pdfDoc.getPages()[6];

    //// if we are remove a page and add this page as place of old page use this
    // const pages = pdfDoc.getPages();
    // const oldPage5 = pages[6];
    // const { width, height } = oldPage5.getSize();
    // pdfDoc.removePage(5);
    // const page6 = pdfDoc.insertPage(5, [width, height]);

    //// if we are insert a page in any index of pdf use this
    const { width, height } = page1.getSize();
    const page6 = pdfDoc.insertPage(6, [width, height]);

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

    // // draw company info in page 7

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
      startX: 44,
      startY: height - 100,
      columns,
      rows,
      font: normal,
      fontBold: bold,
    });

    endY -= 20;

    // term and condtion
    page6.drawText("Terms & Conditions", {
      x: 30,
      y: 640,
      size: 16,
      font: bold,
      color: rgb(0.5, 0, 0),
    });

    page6.drawRectangle({
      x: 33,
      y: 655 - 16 - 4,
      width: 530,
      height: 1.5,
      color: rgb(0.5, 0, 0),
    });

    endY -= 25;
    let currentY = endY;
    const btMg = 50;
    let currentPage = page6;

    const terms = apiData?.termCondition;
    //  console.log("Term data : ",terms)
    terms.forEach((term, i) => {
      const paragraphs = term.split(/\n+/); // split on 1 or more newlines

      paragraphs.forEach((para, pIndex) => {
        // const prefix = pIndex === 0 ? `${i + 1}. ` : "";

        const lines = wrapText(para.trim(), normal, 12, width - 100);

        lines.forEach((line) => {
          if (currentY < btMg) {
            // currentPage = pdfDoc.addPage([width, height]);
            currentPage = pdfDoc.insertPage(7, [width, height]);
            currentY = height - 50;
          }

          currentPage.drawText(line, {
            x: 30,
            y: currentY - 20,
            size: 12,
            font: bold,
          });

          currentPage.drawRectangle({
            x: margin,
            y: margin,
            width: width - margin * 2,
            height: height - margin * 2,
            borderWidth: 1,
            borderColor: rgb(0.3, 0.3, 0.3),
          });

          currentY -= 16;

          // page6.drawText(line, {
          //   x: 50,
          //   y: endY,
          //   size: 12,
          //   font: bold,
          // });
          // endY -= 16;
        });
        currentY -= 10;

        // endY -= 10; // space between paragraphs
      });
    });

    // draw company info in page 7

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
  editProposal,
};
