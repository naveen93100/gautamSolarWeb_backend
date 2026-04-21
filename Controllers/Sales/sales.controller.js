const { default: mongoose } = require("mongoose");
const Sales = require("../../Models/Sales/sales.schema");

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
      { $set: {isActive} },
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

const createClient = async (req, res) => {
  try {
    const { salesId, name, email, phone, address, companyName, gst } = req.body;

    if (!mongoose.isValidObjectId(salesId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing sales id" });
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
};
