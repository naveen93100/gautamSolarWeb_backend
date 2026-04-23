const { default: mongoose } = require("mongoose");
const Sales = require("../../Models/Sales/sales.schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SalesCustomer = require("../../Models/Sales/sales.customer.schema");
const SalesPanel=require("../../Models/Sales/sales.panel.schema");

const createSalesProposal = async (req, res) => {
  try {
    let { salesId, clientId, gst, termsAndConditions, selectedPanels } =
      req.body;

    if (
      !mongoose.isValidObjectId(salesId) ||
      !mongoose.isValidObjectId(clientId)
    )
      return res.status(400).json({
        success: false,
        message: "Invalid or missing sales or client Id",
      });

    if (typeof gst !== "number")
      return res.status(400).json({ success: false, message: "Invalid Gst!" });

    let numericGst = Number.parseFloat(gst);

    if (
      !numericGst ||
      !termsAndConditions ||
      !Array.isArray(selectedPanels) ||
      selectedPanels.length === 0
    )
      return res.status(400).json({
        success: false,
        message:
          "GST , terms & conditions, and at least one selected panel are required.",
      });

    for (const panel of selectedPanels) {
      if (
        !mongoose.Types.ObjectId.isValid(
          panel.panelId ||
            !mongoose.Types.ObjectId.isValid(panel.technologyId) ||
            !mongoose.Types.ObjectId.isValid(panel.constructiveId) ||
            !mongoose.Types.ObjectId.isValid(panel.wattId),
        )
      ) {
        return res.status(400).json({
          message: "Invalid ObjectId in selectedPanel",
        });
      }
    }

    // here check first if salesPerson and client exist 
      
    const wattIds = selectedPanels.map((p) => p.wattId);

    const uniqueWattIds = new Set(wattIds);
    if (wattIds.length !== uniqueWattIds.size) {
      return res.status(400).json({
        message: "Duplicate wattId found in selectedPanel",
      });
    }


     const finalPrice = selectedPanels.reduce((total, item) => {
          return total + Number(item.totalPrice || 0) + Number(item.gstAmount || 0);
        }, 0);
    
        const PanelPropsal = await SalesPanel.create({
          salesId,
          clientId,
          gst,
          termsAndConditions,
          selectedPanels,
          finalPrice,
        });

        return res.status(201).json({success:true,message:"Proposal Created!",data:PanelPropsal});

  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const getClientProposals=async(req,res)=>{
   try {
     const {clientId}=req.params;

     if(!mongoose.isValidObjectId(clientId)) return res.status(400).json({success:false,message:"Invalid or missing ClientId"});

     const proposal=await SalesPanel.find({clientId}).populate('clientId salesId').populate({path:'selectedPanels',populate:[
        {path:"wattId"},
        {path:"panelId"},
        {path:"constructiveId"},
        {path:"technologyId"},
     ]});

     return res.status(200).json({success:true,data:proposal});


   } catch (er) {
      return res.status(500).json({success:false,message:er?.message});
   }
}

//

const salesLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and Password not provided" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email))
      return res.status(400).json({ success: "Invalid email type!" });

    const salesPerson = await Sales.findOne({ email }).select("+password");

    if (!salesPerson)
      return res
        .status(404)
        .json({ success: false, message: "Account Not found!" });

    if (!salesPerson.isActive)
      return res
        .status(400)
        .json({ success: false, message: "Account is De-Activated" });

    let comparePass = await bcrypt.compare(password, salesPerson.password);

    if (!comparePass)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    let token = jwt.sign(
      { id: salesPerson._id, email: salesPerson.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      data: {
        _id: salesPerson._id,
        name: salesPerson.name,
        email: salesPerson.email,
        phone: salesPerson.phone,
      },
      token,
    });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      // maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ success: false, message: "Logout successfully!" });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const createClient = async (req, res) => {
  try {
    let { salesId, fullName, email, phone, address, companyName, gstin } =
      req.body;

    if (!mongoose.isValidObjectId(salesId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing sales id" });

    let data = {};
    if (fullName && fullName.trim()) {
      data.fullName = fullName.trim();
    }

    if (email) {
      email = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        return res
          .status(400)
          .json({ success: false, message: "Invalid email Address!" });
      data.email = email;
    }

    if (address) {
      address = address.trim();
      data.address = address;
    }

    phone = (phone || "").replace(/\D/g, "");
    gstin = (gstin || "").trim().toUpperCase();
    companyName = (companyName || "").trim();

    //    phone.replace(/\D/g, "");
    //    gstin=gstin.trim().toUpperCase();
    //    companyName=companyName.trim();

    if (!phone || !companyName || !gstin)
      return res.status(400).json({
        success: false,
        message: "Phone,companyName and gstin is required!",
      });

    let phoneRegex = /^[6-9]\d{9}$/;
    let gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!phoneRegex.test(phone))
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number!" });
    if (!gstRegex.test(gstin))
      return res
        .status(400)
        .json({ success: false, message: "Invalid gst number!" });

    data.phone = phone;
    data.gstin = gstin;
    data.companyName = companyName;
    data.salesPersonId = salesId;

    const createCustomer = await SalesCustomer.create(data);

    if (!createCustomer)
      return res
        .status(400)
        .json({ success: false, message: "Error while saving data" });
    return res.status(201).json({
      success: true,
      message: "Customer Created!",
      data: { ...createCustomer },
    });
  } catch (er) {
    if (er?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone or Gstin Number already exist!",
      });
    }

    return res.status(500).json({ success: false, message: er?.message });
  }
};

const updateClient = async (req, res) => {
  try {
    let {
      salesId,
      clientId,
      fullName,
      email,
      companyName,
      gstin,
      address,
      phone,
    } = req.body;

    if (
      !mongoose.isValidObjectId(salesId) ||
      !mongoose.isValidObjectId(clientId)
    )
      return res.status(400).json({
        success: false,
        message: "Invalid or missing salesId or clientId!",
      });

    let data = {};

    if (fullName && fullName.trim()) {
      data.fullName = fullName;
    }
    //  required phone,gstin,companyName

    if (email) {
      email = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        return res
          .status(400)
          .json({ success: false, message: "Invalid email" });
      data.email = email;
    }

    if (address) {
      address = address.trim();
      data.address = address;
    }

    phone = (phone || "").replace(/\D/g, "");
    gstin = (gstin || "").trim().toUpperCase();
    companyName = (companyName || "").trim();

    if (!phone || !gstin || !companyName)
      return res.status(400).json({
        success: false,
        message: "Please Provide this field (phone,gstin,companyName)!",
      });

    let phoneRegex = /^[6-9]\d{9}$/;
    let gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!phoneRegex.test(phone) || !gstRegex.test(gstin))
      return res
        .status(400)
        .json({ success: false, message: "Invalid or Missing phone or gstin" });

    data.phone = phone;
    data.gstin = gstin;
    data.companyName = companyName;

    let updateClient = await SalesCustomer.findOneAndUpdate(
      { _id: clientId, salesPersonId: salesId },
      { $set: data },
      { new: true },
    );

    return res.status(200).json({ success: true, message: "Client Updated!" });
  } catch (er) {
    if (er?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone and Gstin Already exist!Use different one",
      });
    }
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const getClient = async (req, res) => {
  try {
    const { salesId } = req.params;
    if (!mongoose.isValidObjectId(salesId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing Id" });

    let sales = await SalesCustomer.find({ salesPersonId: salesId });
    return res.status(200).json({ success: true, sales });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

// admin functions
const createSalesPerson = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
      return res
        .status(400)
        .json({ success: false, message: "Please fill required fields.." });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(email) || !phoneRegex.test(phone))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Phone address!" });

    const newSalesPerson = await Sales.create({
      name,
      email,
      phone,
      password,
    });

    return res.status(201).json({ success: true, message: "Account Created" });
  } catch (er) {
    if (er?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email Or Phone already exists" });
    }
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const updateSalesAccount = async (req, res) => {
  try {
    let { salesId, name, email, phone } = req.body;

    if (!mongoose.isValidObjectId(salesId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing Id." });
    let salesAccount = await Sales.findOne({ _id: salesId });

    if (!salesAccount)
      return res
        .status(404)
        .json({ success: false, message: "Account not found!" });

    let newData = {};

    if (name && name.trim()) {
      newData.name = name.trim();
    }

    if (email) {
      email = email.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      if (email !== salesAccount.email) {
        newData.email = email;
      }
    }

    if (phone) {
      phone = phone.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Phone number!" });
      }
      if (phone !== salesAccount.phone) {
        newData.phone = phone;
      }
    }

    if (Object.keys(newData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No Changes provided!" });
    }

    await Sales.findByIdAndUpdate(salesId, { $set: newData });
    return res.status(200).json({ success: true, message: "Account Updated." });
  } catch (er) {
    if (er?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Email or phone already exist" });
    }
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const getSalesPersonList = async (req, res) => {
  try {
    const sales = await Sales.find({});

    return res.status(200).json({ success: true, data: sales });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const toggleSalesStatus = async (req, res) => {
  try {
    const { salesId, isActive } = req.body;

    if (!mongoose.isValidObjectId(salesId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing Id" });

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    let sales = await Sales.findOneAndUpdate(
      { _id: salesId },
      { $set: { isActive } },
      { new: true },
    );

    if (!sales) {
      return res.status(404).json({
        success: false,
        message: "Sales person not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Account ${isActive === true ? "Activated" : "De-Activated"}`,
    });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

// ------------------------

module.exports = {
  createSalesPerson,
  getSalesPersonList,
  createClient,
  updateSalesAccount,
  toggleSalesStatus,
  salesLogin,
  logout,
  getClient,
  updateClient,
  createSalesProposal,
  getClientProposals
};
