const { default: mongoose } = require("mongoose");
const Sales = require("../../Models/Sales/sales.schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SalesCustomer = require("../../Models/Sales/sales.customer.schema");
const SalesPanel = require("../../Models/Sales/sales.panel.schema");
const {
  salesProposalSchema,
  createClientSchema,
  updateClientSchema,
  salesInverterProposalSchema,
  proposalSchema,
} = require("../../Validators/Sales.validator");
const Inverter = require("../../Models/AdminModel/InverterSchema");

const createSalesProposal = async (req, res) => {
  try {
    let validType = ["SOLAR", "INVERTER", "BOTH"];

    let { type } = req.body;

    if (!validType.includes(type))
      return res
        .status(400)
        .json({ success: false, message: "Invalid type." });

    if (type === "SOLAR") {
      const result = salesProposalSchema.safeParse(req.body);

      if (!result.success) {
        const message = [];
        result.error.issues.forEach((err) => {
          let v;
          if (err.path.length >= 2) {
            v = err.path[err.path.length - 1];
          } else {
            v = err.path.join(".");
          }
          message.push({ message: err.message });
        });

        return res.status(400).json({
          success: false,
          message,
        });
      }

      const {
        salesId,
        clientId,
        gst,
        termsAndConditions,
        selectedPanels,
      } = result.data;

      const wattIds = selectedPanels.map((p) => p.wattId);

      const uniqueWattIds = new Set(wattIds);
      if (wattIds.length !== uniqueWattIds.size) {
        return res.status(400).json({
          message: "Duplicate wattId found in selectedPanel",
        });
      }

      const finalPrice = selectedPanels.reduce((total, item) => {
        return (
          total +
          Number(item.totalPrice || 0) +
          Number(item.gstAmount || 0)
        );
      }, 0);

      const PanelPropsal = await SalesPanel.create({
        salesId,
        clientId,
        gst,
        termsAndConditions,
        selectedPanels,
        finalPrice,
      });

      return res.status(201).json({
        success: true,
        message: "Proposal Created!",
        data: PanelPropsal,
      });
    } else if (type === "INVERTER") {
      let result = salesInverterProposalSchema.safeParse(req.body);
      if (!result.success) {
        const message = [];
        result.error.issues.forEach((err) => {
          let v;
          if (err.path.length >= 2) {
            v = err.path[err.path.length - 1];
          } else {
            v = err.path.join(".");
          }
          message.push({ message: err.message });
        });
        console.log(message);
        console.log(result.data);
        return res
          .status(400)
          .json({ success: false, message: "something went wrong" });
      }

      let {
        salesId,
        clientId,
        inverterGst,
        termsAndConditions,
        selectedInverters,
      } = req.body;

      let inverterIds = [
        ...new Set(selectedInverters.map((i) => i.inverterId)),
      ];

      let inverter = await Inverter.find({
        _id: { $in: inverterIds },
        status: "active",
      }).select("_id capacities");

      let inverterLookup = new Map();

      for (let i of inverter) {
        inverterLookup.set(i._id.toString(), i.capacities);
      }

      let checkUniqueCapacity = new Set();

      // need to check if different inverter has same capacity
      for (let i of selectedInverters) {
        let capacities = inverterLookup.get(i.inverterId);

        if (!capacities.includes(i.capacity))
          return res.status(400).json({
            success: false,
            message: "Capacity not availabel for this inverter.",
          });

        if (checkUniqueCapacity.has(i.capacity))
          return res.status(400).json({
            success: false,
            message: "You cannot add Inverter with same Capacity.",
          });

        checkUniqueCapacity.add(i.capacity);
      }

      let finalPrice = selectedInverters.reduce(
        (acc, itr) => acc + itr.rate * itr.quantity,
        0,
      );
      finalPrice = finalPrice + (finalPrice * inverterGst) / 100;

      const subTotal = selectedInverters.reduce(
        (acc, itr) => acc + itr.totalPrice + itr.gstAmount,
        0,
      );

      if (finalPrice !== subTotal)
        return res
          .status(400)
          .json({ success: false, message: "Calculation mismatch." });

      const PanelPropsal = await SalesPanel.create({
        salesId,
        clientId,
        inverterGst,
        termsAndConditions,
        selectedInverters,
        finalPrice,
      });

      return res.status(201).json({
        success: true,
        message: "Proposal Created!",
        data: PanelPropsal,
      });
    } else if (type === "BOTH") {
      const solarResult = salesProposalSchema.safeParse(req.body);
      const inverterResult = salesInverterProposalSchema.safeParse(
        req.body,
      );

      if (!solarResult.success || !inverterResult.success) {
        const message = [];

        if (!solarResult.success) {
          solarResult.error.issues.forEach((err) => {
            message.push({ message: err.message });
          });
        }

        if (!inverterResult.success) {
          inverterResult.error.issues.forEach((err) => {
            message.push({ message: err.message });
          });
        }

        return res.status(400).json({
          success: false,
          message,
        });
      }

      // Both validations passed

      const {
        salesId,
        clientId,
        gst,
        inverterGst,
        termsAndConditions,
        selectedPanels,
        selectedInverters,
      } = req.body;

      // Solar Logic ------------------------

      const wattIds = selectedPanels.map((p) => p.wattId);

      if (wattIds.length !== new Set(wattIds).size) {
        return res.status(400).json({
          success: false,
          message: "Duplicate wattId found in selectedPanels.",
        });
      }

      const panelFinalPrice = selectedPanels.reduce(
        (total, item) =>
          total +
          Number(item.totalPrice || 0) +
          Number(item.gstAmount || 0),
        0,
      );

      // Inverter Logic ---------------------

      const inverterIds = [
        ...new Set(selectedInverters.map((i) => i.inverterId)),
      ];

      const inverter = await Inverter.find({
        _id: { $in: inverterIds },
        status: "active",
      }).select("_id capacities");

      const inverterLookup = new Map();

      inverter.forEach((i) => {
        inverterLookup.set(i._id.toString(), i.capacities);
      });

      for (const item of selectedInverters) {
        const capacities = inverterLookup.get(item.inverterId);

        if (!capacities.includes(item.capacity)) {
          return res.status(400).json({
            success: false,
            message: "Capacity not available for this inverter.",
          });
        }
      }

      let inverterFinalPrice = selectedInverters.reduce(
        (acc, itr) => acc + itr.rate * itr.quantity,
        0,
      );

      inverterFinalPrice += (inverterFinalPrice * inverterGst) / 100;

      const inverterSubTotal = selectedInverters.reduce(
        (acc, itr) => acc + itr.totalPrice + itr.gstAmount,
        0,
      );

      if (inverterFinalPrice !== inverterSubTotal) {
        return res.status(400).json({
          success: false,
          message: "Calculation mismatch.",
        });
      }

      // Total

      const finalPrice = panelFinalPrice + inverterFinalPrice;

      const proposal = await SalesPanel.create({
        salesId,
        clientId,
        gst,
        inverterGst,
        termsAndConditions,
        selectedPanels,
        selectedInverters,
        finalPrice,
      });

      return res.status(201).json({
        success: true,
        message: "Proposal Created!",
        data: proposal,
      });
    }
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const getClientProposals = async (req, res) => {
  try {
    const { clientId } = req.params;
    let { limit = 5, cursor } = req.query;
    limit = Number(limit);

    if (!mongoose.isValidObjectId(clientId))
      return res.status(400).json({
        success: false,
        message: "Invalid or missing ClientId",
      });

    let query = {};
    if (cursor) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) }
      query.clientId = clientId;
    }
    else {
      query.clientId = clientId
    }

    const proposal = await SalesPanel.find(query)
      .populate("clientId salesId")
      .populate([
        {
          path: "selectedPanels",
          populate: [
            { path: "wattId" },
            { path: "panelId" },
            { path: "constructiveId" },
            { path: "technologyId" },
          ],
        },
        { path: "selectedInverters", populate: { path: "inverterId" } },
      ])
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    let nextCursor = null;
    if (proposal.length === limit + 1) {
      nextCursor = proposal[proposal.length - 1]._id;
    }


    let data = proposal.map((item) => {
      let inverters = item?.selectedInverters || [];
      let panels = item?.selectedPanels || [];
      if (inverters.length > 0 && panels.length > 0) {
        return { ...item, type: "BOTH" };
      } else if (inverters.length > 0 && panels.length === 0) {
        return { ...item, type: "INVERTER" };
      } else {
        return { ...item, type: "SOLAR" };
      }
    });

    return res.status(200).json({ success: true, proposal:data, nextCursor });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const deleteProposal = async (req, res) => {
  try {
    const { propId } = req.params;

    if (!mongoose.isValidObjectId(propId))
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Proposal Id",
      });

    let deletedProposal = await SalesPanel.findByIdAndDelete(propId);

    if (!deletedProposal)
      return res
        .status(404)
        .json({ success: false, message: "Proposal Not found" });

    return res
      .status(200)
      .json({ success: true, message: "Proposal Deleted!" });
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const updateSalesProposal = async (req, res) => {
  try {
    let validType = ["SOLAR", "INVERTER", "BOTH"];

    let { type } = req.body;
    if (!validType.includes(type))
      return res
        .status(400)
        .json({ success: false, message: "Invalid type." });

    if (type === "SOLAR") {
      const result = salesProposalSchema.safeParse(req.body);

      if (!result.success) {
        const message = [];
        result.error.issues.forEach((err) => {
          message.push({ message: err.message });
        });

        return res.status(400).json({
          success: false,
          message,
        });
      }

      const { propId, gst, termsAndConditions, selectedPanels } =
        result.data;

      const wattIds = selectedPanels.map((p) => p.wattId);

      const uniqueWattIds = new Set(wattIds);
      if (wattIds.length !== uniqueWattIds.size) {
        return res.status(400).json({
          message: "Duplicate wattId found in selectedPanel",
        });
      }

      const finalPrice = selectedPanels.reduce((total, item) => {
        return (
          total +
          Number(item.totalPrice || 0) +
          Number(item.gstAmount || 0)
        );
      }, 0);

      const data = { finalPrice, ...result.data };

      let updatedProposal = await SalesPanel.findByIdAndUpdate(
        propId,
        { $set: data },
        { new: true },
      );

      if (!updatedProposal)
        return res
          .status(404)
          .json({ success: false, message: "Proposal not found!" });

      return res.status(200).json({
        success: true,
        message: "Proposal Updated successfully!",
        data: updatedProposal,
      });
    } else if (type === "INVERTER") {
      let result = salesInverterProposalSchema.safeParse(req.body);
      if (!result.success) {
        const message = [];
        result.error.issues.forEach((err) => {
          let v;
          if (err.path.length >= 2) {
            v = err.path[err.path.length - 1];
          } else {
            v = err.path.join(".");
          }
          message.push({ message: err.message });
        });
        console.log(message);
        console.log(result.data);
        return res
          .status(400)
          .json({ success: false, message: "something went wrong" });
      }

      let { propId, inverterGst, termsAndConditions, selectedInverters } =
        req.body;

      let inverterIds = [
        ...new Set(selectedInverters.map((i) => i.inverterId)),
      ];

      let inverter = await Inverter.find({
        _id: { $in: inverterIds },
        status: "active",
      }).select("_id capacities");

      let inverterLookup = new Map();

      for (let i of inverter) {
        inverterLookup.set(i._id.toString(), i.capacities);
      }

      for (let i of selectedInverters) {
        let capacities = inverterLookup.get(i.inverterId);

        if (!capacities.includes(i.capacity))
          return res.status(400).json({
            success: false,
            message: "Capacity not availabel for this inverter.",
          });
      }

      let finalPrice = selectedInverters.reduce(
        (acc, itr) => acc + itr.rate * itr.quantity,
        0,
      );
      finalPrice = finalPrice + (finalPrice * inverterGst) / 100;

      const subTotal = selectedInverters.reduce(
        (acc, itr) => acc + itr.totalPrice + itr.gstAmount,
        0,
      );

      if (finalPrice !== subTotal)
        return res
          .status(400)
          .json({ success: false, message: "Calculation mismatch." });

      let data = {
        inverterGst,
        termsAndConditions,
        selectedInverters,
        finalPrice,
      };

      const panelPropsal = await SalesPanel.findByIdAndUpdate(
        propId,
        { $set: data },
        { new: true },
      );

      if (!panelPropsal)
        return res
          .status(404)
          .json({ success: false, message: "Proposal not found." });

      return res.status(201).json({
        success: true,
        message: "Proposal Created!",
        data: panelPropsal,
      });
    } else if (type === "BOTH") {
      const solarResult = salesProposalSchema.safeParse(req.body);
      const inverterResult = salesInverterProposalSchema.safeParse(
        req.body,
      );

      if (!solarResult.success || !inverterResult.success) {
        const message = [];

        if (!solarResult.success) {
          solarResult.error.issues.forEach((err) => {
            message.push({ message: err.message });
          });
        }

        if (!inverterResult.success) {
          inverterResult.error.issues.forEach((err) => {
            message.push({ message: err.message });
          });
        }

        return res.status(400).json({
          success: false,
          message,
        });
      }

      // Both validations passed

      const {
        gst,
        inverterGst,
        termsAndConditions,
        selectedPanels,
        selectedInverters,
        propId,
      } = req.body;

      // Solar Logic ------------------------

      const wattIds = selectedPanels.map((p) => p.wattId);

      if (wattIds.length !== new Set(wattIds).size) {
        return res.status(400).json({
          success: false,
          message: "Duplicate wattId found in selectedPanels.",
        });
      }

      const panelFinalPrice = selectedPanels.reduce(
        (total, item) =>
          total +
          Number(item.totalPrice || 0) +
          Number(item.gstAmount || 0),
        0,
      );

      // Inverter Logic ---------------------

      const inverterIds = [
        ...new Set(selectedInverters.map((i) => i.inverterId)),
      ];

      const inverter = await Inverter.find({
        _id: { $in: inverterIds },
        status: "active",
      }).select("_id capacities");

      const inverterLookup = new Map();

      inverter.forEach((i) => {
        inverterLookup.set(i._id.toString(), i.capacities);
      });

      for (const item of selectedInverters) {
        const capacities = inverterLookup.get(item.inverterId);

        if (!capacities) {
          return res.status(400).json({
            success: false,
            message: "Invalid inverter.",
          });
        }

        if (!capacities.includes(item.capacity)) {
          return res.status(400).json({
            success: false,
            message: "Capacity not available for this inverter.",
          });
        }
      }

      let inverterFinalPrice = selectedInverters.reduce(
        (acc, itr) => acc + itr.rate * itr.quantity,
        0,
      );

      inverterFinalPrice += (inverterFinalPrice * inverterGst) / 100;

      const inverterSubTotal = selectedInverters.reduce(
        (acc, itr) => acc + itr.totalPrice + itr.gstAmount,
        0,
      );

      console.log(inverterSubTotal, inverterFinalPrice);

      // if (inverterFinalPrice !== inverterSubTotal) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Calculation mismatch.",
      //   });
      // }

      // Total

      const finalPrice = panelFinalPrice + inverterFinalPrice;
      let data = {
        gst,
        inverterGst,
        termsAndConditions,
        selectedPanels,
        selectedInverters,
        finalPrice,
      };

      const proposal = await SalesPanel.findByIdAndUpdate(
        propId,
        { $set: data },
        { new: true },
      );

      return res.status(201).json({
        success: true,
        message: "Proposal Created!",
        data: proposal,
      });
    }
  } catch (er) {
    return res.status(500).json({ success: false, message: er?.message });
  }
};

//

const salesLogin = async (req, res) => {
  try {
    let { userId, password } = req.body;

    if (!userId || !password)
      return res.status(400).json({
        success: false,
        message: "userId and Password not provided",
      });

    userId = userId.toUpperCase();

    const salesPerson = await Sales.findOne({ userId }).select("+password");

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
      { id: salesPerson._id, userId: salesPerson.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      data: {
        _id: salesPerson._id,
        name: salesPerson.name,
        userId: salesPerson.userId,
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
    // let { salesId, fullName, email, phone, address, companyName, gstin } =
    //   req.body;

    // if (!mongoose.isValidObjectId(salesId))
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Invalid or missing sales id" });

    // let data = {};
    // if (fullName && fullName.trim()) {
    //   data.fullName = fullName.trim();
    // }

    // if (email) {
    //   email = email.trim().toLowerCase();
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(email))
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "Invalid email Address!" });
    //   data.email = email;
    // }

    // if (address) {
    //   address = address.trim();
    //   data.address = address;
    // }

    // phone = (phone || "").replace(/\D/g, "");
    // gstin = (gstin || "").trim().toUpperCase();
    // companyName = (companyName || "").trim();

    // //    phone.replace(/\D/g, "");
    // //    gstin=gstin.trim().toUpperCase();
    // //    companyName=companyName.trim();

    // if (!phone || !companyName || !gstin)
    //   return res.status(400).json({
    //     success: false,
    //     message: "Phone,companyName and gstin is required!",
    //   });

    // let phoneRegex = /^[6-9]\d{9}$/;
    // let gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    // if (!phoneRegex.test(phone))
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Invalid phone number!" });
    // if (!gstRegex.test(gstin))
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Invalid gst number!" });

    // data.phone = phone;
    // data.gstin = gstin;
    // data.companyName = companyName;
    // data.salesPersonId = salesId;

    // if (!createCustomer)
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Error while saving data" });

    const result = createClientSchema.safeParse(req.body);

    if (!result.success) {
      const message = [];
      result.error.issues.forEach((err) => {
        message.push({ message: err.message });
      });

      return res.status(400).json({
        success: false,
        message,
      });
    }

    const { salesId, ...rest } = result.data;

    const data = {
      ...rest,
      salesPersonId: salesId,
    };

    const createCustomer = await SalesCustomer.create(data);

    return res.status(201).json({
      success: true,
      message: "Customer Created!",
      data: { ...createCustomer },
    });
  } catch (er) {
    if (er?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: [{ message: "Phone or Gstin Number already exist!" }],
      });
    }

    return res
      .status(500)
      .json({ success: false, message: [{ message: er?.message }] });
  }
};

const updateClient = async (req, res) => {
  try {
    // let {
    //   salesId,
    //   clientId,
    //   fullName,
    //   email,
    //   companyName,
    //   gstin,
    //   address,
    //   phone,
    // } = req.body;

    // if (
    //   !mongoose.isValidObjectId(salesId) ||
    //   !mongoose.isValidObjectId(clientId)
    // )
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid or missing salesId or clientId!",
    //   });

    // let data = {};

    // if (fullName && fullName.trim()) {
    //   data.fullName = fullName;
    // }

    // if (email) {
    //   email = email.trim().toLowerCase();
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(email))
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "Invalid email" });
    //   data.email = email;
    // }

    // if (address) {
    //   address = address.trim();
    //   data.address = address;
    // }

    // phone = (phone || "").replace(/\D/g, "");
    // gstin = (gstin || "").trim().toUpperCase();
    // companyName = (companyName || "").trim();

    // if (!phone || !gstin || !companyName)
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please Provide this field (phone,gstin,companyName)!",
    //   });

    // let phoneRegex = /^[6-9]\d{9}$/;
    // let gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    // if (!phoneRegex.test(phone) || !gstRegex.test(gstin))
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Invalid or Missing phone or gstin" });

    // data.phone = phone;
    // data.gstin = gstin;
    // data.companyName = companyName;

    let result = updateClientSchema.safeParse(req.body);

    if (!result.success) {
      const message = [];
      result.error.issues.forEach((err) => {
        message.push({ message: err.message });
      });

      return res.status(400).json({
        success: false,
        message,
      });
    }

    let { clientId, salesId, ...rest } = result.data;

    let updateClient = await SalesCustomer.findOneAndUpdate(
      { _id: clientId, salesPersonId: salesId },
      { $set: rest },
      { new: true },
    );

    return res
      .status(200)
      .json({ success: true, message: "Client Updated!" });
  } catch (er) {
    if (er?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: [
          {
            message:
              "Phone or Gstin Already exist!Use different one",
          },
        ],
      });
    }
    return res
      .status(500)
      .json({ success: false, message: [{ message: er?.message }] });
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
    let { name, phone, password } = req.body;

    if (!name || !phone || !password)
      return res.status(400).json({
        success: false,
        message: "Please fill required fields..",
      });

    name = name.trim();
    const phoneRegex = /^[6-9]\d{9}$/;
    const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

    if (!phoneRegex.test(phone))
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number!" });

    if (!nameRegex.test(name))
      return res
        .status(400)
        .json({ success: false, message: "Invalid name" });

    const newSalesPerson = await Sales.create({
      name,
      phone,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Account Created",
      data: {
        _id: newSalesPerson._id,
        name: newSalesPerson.name,
        phone: newSalesPerson.phone,
        isActive: newSalesPerson.isActive,
        userId: newSalesPerson.userId,
      },
    });
  } catch (er) {
    if (er?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "userId Or Phone already exists",
      });
    }
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const updateSalesAccount = async (req, res) => {
  try {
    let { salesId, name, phone } = req.body;

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
    return res
      .status(200)
      .json({ success: true, message: "Account Updated." });
  } catch (er) {
    if (er?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already exist",
      });
    }
    return res.status(500).json({ success: false, message: er?.message });
  }
};

const getSalesPersonList = async (req, res) => {
  try {
    let { pageNo } = req.query;
    const limit = 6;

    pageNo = parseInt(pageNo) || 1;
    const sales = await Sales.aggregate([
      {
        $facet: {
          totalRecord: [{ $count: "count" }],

          data: [
            { $sort: { _id: -1 } },
            { $skip: (pageNo - 1) * limit },
            { $limit: limit },

            {
              $lookup: {
                from: "salespanels",
                localField: "_id",
                foreignField: "salesId",
                as: "totalClient",
              },
            },

            {
              $addFields: {
                totalClient: {
                  $size: {
                    $ifNull: ["$totalClient", []],
                  },
                },
              },
            },

            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },

      {
        $project: {
          data: 1,

          totalRecord: {
            $ifNull: [
              { $arrayElemAt: ["$totalRecord.count", 0] },
              0,
            ],
          },
        },
      },

      {
        $addFields: {
          currentPage: pageNo,
          limit,

          hasNextPage: {
            $gt: ["$totalRecord", pageNo * limit],
          },
        },
      },
    ]);
    // console.log(sales)

    return res.status(200).json({ success: true, ...sales[0] });
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
  getClientProposals,
  deleteProposal,
  updateSalesProposal,
};
